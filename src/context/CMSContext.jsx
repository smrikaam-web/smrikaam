import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const CMSContext = createContext(null);

export function CMSProvider({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [services, setServices] = useState([]);
  const [accelerators, setAccelerators] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [staffing, setStaffing] = useState([]);
  const [locations, setLocations] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Public fetch helper (queries /api/{resource} - returns ONLY published items)
  const fetchPublic = useCallback(async (resource, params = {}) => {
    try {
      const res = await api.get(`/${resource}`, { params });
      return res.data || [];
    } catch (err) {
      console.warn(`CMS: Failed to fetch public ${resource}`, err);
      return [];
    }
  }, []);

  // Public fetch single item (returns 404/null if trashed/draft/archived/not-found)
  const fetchPublicItem = useCallback(async (resource, idOrSlug) => {
    try {
      const res = await api.get(`/${resource}/${idOrSlug}`);
      return res.data || null;
    } catch (err) {
      return null;
    }
  }, []);

  // Load all published collections on mount and on every admin mutation
  useEffect(() => {
    let isMounted = true;
    async function loadAllPublished() {
      try {
        const [srvRes, accRes, indRes, csRes, postRes, repRes, staffRes, locRes, setRes] = await Promise.allSettled([
          api.get('/services'),
          api.get('/accelerators'),
          api.get('/industries'),
          api.get('/case-studies'),
          api.get('/posts'),
          api.get('/reports'),
          api.get('/staffing'),
          api.get('/locations'),
          api.get('/settings')
        ]);

        if (isMounted) {
          if (srvRes.status === 'fulfilled' && Array.isArray(srvRes.value.data)) {
            setServices(srvRes.value.data);
          }
          if (accRes.status === 'fulfilled' && Array.isArray(accRes.value.data)) {
            setAccelerators(accRes.value.data);
          }
          if (indRes.status === 'fulfilled' && Array.isArray(indRes.value.data)) {
            setIndustries(indRes.value.data);
          }
          if (csRes.status === 'fulfilled' && Array.isArray(csRes.value.data)) {
            setCaseStudies(csRes.value.data);
          }
          if (postRes.status === 'fulfilled' && Array.isArray(postRes.value.data)) {
            setPosts(postRes.value.data);
          }
          if (repRes.status === 'fulfilled' && Array.isArray(repRes.value.data)) {
            setReports(repRes.value.data);
          }
          if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value.data)) {
            setStaffing(staffRes.value.data);
          }
          if (locRes.status === 'fulfilled' && Array.isArray(locRes.value.data)) {
            setLocations(locRes.value.data);
          }
          if (setRes.status === 'fulfilled' && setRes.value.data) {
            setSettings(setRes.value.data);
          }
          setIsLoaded(true);
        }
      } catch (err) {
        console.warn('CMSProvider: Error loading published data', err);
        if (isMounted) setIsLoaded(true);
      }
    }

    loadAllPublished();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Admin fetch helper (queries /api/{resource}/admin/all)
  const fetchAdmin = useCallback(async (resource, params = {}) => {
    try {
      const res = await api.get(`/${resource}/admin/all`, { params });
      return res.data || [];
    } catch (err) {
      console.warn(`CMS: Failed to fetch admin ${resource}`, err);
      return [];
    }
  }, []);

  // Admin Create
  const createItem = useCallback(async (resource, data) => {
    const res = await api.post(`/${resource}/admin`, data);
    refresh();
    return res.data;
  }, [refresh]);

  // Admin Update
  const updateItem = useCallback(async (resource, id, data) => {
    const res = await api.put(`/${resource}/admin/${id}`, data);
    refresh();
    return res.data;
  }, [refresh]);

  // Admin Status Change
  const updateStatus = useCallback(async (resource, id, status) => {
    const res = await api.patch(`/${resource}/admin/${id}/status`, { status });
    refresh();
    return res.data;
  }, [refresh]);

  // Admin Delete (soft or permanent)
  const deleteItem = useCallback(async (resource, id, permanent = false) => {
    const res = await api.delete(`/${resource}/admin/${id}${permanent ? '?permanent=true' : ''}`);
    refresh();
    return res.data;
  }, [refresh]);

  // Admin Restore
  const restoreItem = useCallback(async (resource, id) => {
    const res = await api.post(`/${resource}/admin/${id}/restore`);
    refresh();
    return res.data;
  }, [refresh]);

  // Admin Bulk Action
  const bulkAction = useCallback(async (resource, ids, action) => {
    const res = await api.post(`/${resource}/admin/bulk`, { ids, action });
    refresh();
    return res.data;
  }, [refresh]);

  // Media Upload
  const uploadMedia = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    refresh();
    return res.data;
  }, [refresh]);

  // DOCX Import
  const importDocx = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/import-docx', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    refresh();
    return res.data;
  }, [refresh]);

  // PDF Upload
  const uploadPdf = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    refresh();
    return res.data;
  }, [refresh]);

  const value = {
    refreshTrigger,
    refresh,
    services,
    accelerators,
    industries,
    caseStudies,
    posts,
    reports,
    staffing,
    locations,
    settings,
    isLoaded,
    fetchPublic,
    fetchPublicItem,
    fetchAdmin,
    createItem,
    updateItem,
    updateStatus,
    deleteItem,
    restoreItem,
    bulkAction,
    uploadMedia,
    importDocx,
    uploadPdf
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}

