import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, ShieldCheck, Database, HardDrive, Globe } from 'lucide-react';
import BlueprintWrapper from '../../components/BlueprintWrapper';
import api from '../../api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'SMRIKAAM Technologies LLP',
    contactEmail: 'contact@smrikaam.com',
    contactPhone: '+91-9150684601',
    address: 'Coimbatore, Tamil Nadu, India'
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/settings');
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.error('Error loading settings', err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.put('/settings', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[rgba(255,255,255,0.15)] pb-6">
        <div className="font-mono text-xs text-[#4fd1c5] uppercase tracking-widest mb-1">
          SYSTEM CONFIGURATION
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase text-[#f4f4f4]">
          SITE &amp; ADMIN SETTINGS
        </h1>
      </div>

      {success && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500 text-emerald-200 font-mono text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>System settings updated successfully.</span>
        </div>
      )}

      {/* System Status Architecture Box */}
      <BlueprintWrapper dark className="bg-[#141924] border border-[rgba(255,255,255,0.15)] p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#4fd1c5] font-bold uppercase">
          <ShieldCheck className="w-4 h-4" /> CENTRAL ARCHITECTURE STATUS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-300 pt-2 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#4fd1c5]" />
            <div>
              <span className="text-gray-400 block text-[10px]">DATABASE ENGINE</span>
              <strong className="text-white">PostgreSQL (Primary + Local Sync)</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#4fd1c5]" />
            <div>
              <span className="text-gray-400 block text-[10px]">STORAGE</span>
              <strong className="text-white">Server Filesystem (/uploads)</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#4fd1c5]" />
            <div>
              <span className="text-gray-400 block text-[10px]">API ENGINE</span>
              <strong className="text-white">Express API + JWT Auth</strong>
            </div>
          </div>
        </div>
      </BlueprintWrapper>

      <form onSubmit={handleSave} className="space-y-4">
        <BlueprintWrapper dark className="bg-[#141924] border border-[rgba(255,255,255,0.15)] p-6 space-y-4">
          <h3 className="font-mono text-sm font-bold uppercase text-white mb-4 border-b border-[rgba(255,255,255,0.1)] pb-2">
            General Site Information
          </h3>

          <div>
            <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={settings.siteName || ''}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings.contactPhone || ''}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1">
              Headquarters Location
            </label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-white text-xs"
            />
          </div>
        </BlueprintWrapper>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary text-xs font-bold flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'SAVING...' : 'SAVE SETTINGS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
