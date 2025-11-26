'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker so install prompts become available
 * and offline caching can run. Safe to include globally; it no-ops
 * where unsupported.
 */
export function PwaInit() {
  useEffect(() => {
    const supportsServiceWorker = typeof window !== 'undefined' && 'serviceWorker' in navigator;
    if (!supportsServiceWorker) return;

    const isLocalhost = window.location.hostname === 'localhost';
    const isHttps = window.location.protocol === 'https:';
    if (!isLocalhost && !isHttps) return;

    navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => console.error('Service worker registration failed', error));
  }, []);

  return null;
}

