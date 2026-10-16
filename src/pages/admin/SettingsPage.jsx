import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, ShieldCheck, Database, HardDrive, Globe } from 'lucide-react';
import BlueprintWrapper from '../../components/BlueprintWrapper';
import api from '../../api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'SMRIKAAM Technologies',
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
      <div className="border-b border-[#E5E5E5] pb-6">
        <div className="font-mono text-xs text-[#666666] uppercase tracking-widest mb-1 font-semibold">
          SYSTEM CONFIGURATION
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#111111]">
          SITE &amp; ADMIN SETTINGS
        </h1>
      </div>

      {success && (
        <div className="p-3 bg-[#F7F7F7] border-l-4 border-[#111111] border border-[#E5E5E5] text-[#111111] font-mono text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#111111]" />
          <span>System settings updated successfully.</span>
        </div>
      )}

      {/* System Status Architecture Box */}
      <div className="bg-white border border-[#E5E5E5] p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#111111] font-bold uppercase">
          <ShieldCheck className="w-4 h-4" /> CENTRAL ARCHITECTURE STATUS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[#333333] pt-2 border-t border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#111111]" />
            <div>
              <span className="text-[#666666] block text-[10px]">DATABASE ENGINE</span>
              <strong className="text-[#111111]">PostgreSQL (Primary + Local Sync)</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#111111]" />
            <div>
              <span className="text-[#666666] block text-[10px]">STORAGE</span>
              <strong className="text-[#111111]">Server Filesystem (/uploads)</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#111111]" />
            <div>
              <span className="text-[#666666] block text-[10px]">API ENGINE</span>
              <strong className="text-[#111111]">Express API + JWT Auth</strong>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white border border-[#E5E5E5] p-6 space-y-4">
          <h3 className="font-mono text-sm font-bold uppercase text-[#111111] mb-4 border-b border-[#E5E5E5] pb-2">
            General Site Information
          </h3>

          <div>
            <label className="block text-xs font-mono uppercase text-[#333333] mb-1 font-semibold">
              Organization Name
            </label>
            <input
              type="text"
              value={settings.siteName || ''}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#333333] mb-1 font-semibold">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#333333] mb-1 font-semibold">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings.contactPhone || ''}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#333333] mb-1 font-semibold">
              Headquarters Location
            </label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="text-xs font-bold py-2.5 px-6 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'SAVING...' : 'SAVE SETTINGS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
