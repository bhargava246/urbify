// @ts-nocheck
"use client";
/**
 * DashboardProvider — wraps portal pages with AppDataContext
 * so useAppData() works when pages are accessed directly by URL
 * (not through UrbifyApp's SPA routing).
 */
import React, { useState, useEffect } from 'react';
import { AppDataContext } from './_shared';
import { authFetch } from '@/lib/authFetch';

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);

  // Boot: restore auth from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('urb_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const user = parsed?.data ?? parsed;
        setAuthUser(user);
      }
    } catch {}

    // Listen for auth changes (login/logout in same tab)
    const sync = () => {
      try {
        const stored = localStorage.getItem('urb_user');
        if (stored) { const p = JSON.parse(stored); setAuthUser(p?.data ?? p); }
        else setAuthUser(null);
      } catch {}
    };
    window.addEventListener('urbify:auth', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('urbify:auth', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Fetch shortlists when authUser is set
  useEffect(() => {
    if (!authUser) return;
    authFetch('/api/v1/search/shortlist')
      .then(r => r.ok ? r.json() : null)
      .then(raw => {
        const items = Array.isArray(raw) ? raw : (raw?.data || []);
        setShortlistIds(items.map((i: any) => i.listingId || i.id));
      })
      .catch(() => {});
  }, [authUser]);

  const refreshAuth = async () => {
    try {
      const res = await authFetch('/api/v1/users/me');
      if (res.ok) {
        const raw = await res.json();
        const user = raw?.data ?? raw;
        localStorage.setItem('urb_user', JSON.stringify(user));
        setAuthUser(user);
      }
    } catch {}
  };

  const doLogout = async () => {
    const token = localStorage.getItem('urb_access');
    if (token) {
      try { await fetch('/api/v1/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
    }
    localStorage.removeItem('urb_access');
    localStorage.removeItem('urb_refresh');
    localStorage.removeItem('urb_user');
    setAuthUser(null);
    window.location.href = '/';
  };

  const ctx = {
    listings,
    cities: [],
    shortlistIds,
    addShortlist: async (id: string) => setShortlistIds(s => s.includes(id) ? s : [...s, id]),
    removeShortlist: async (id: string) => setShortlistIds(s => s.filter(x => x !== id)),
    isLoadingListings: false,
    isLoadingCities: false,
    authUser,
    refreshAuth,
    doLogout,
  };

  return (
    <AppDataContext.Provider value={ctx}>
      {children}
    </AppDataContext.Provider>
  );
}
