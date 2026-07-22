/**
 * @fileoverview Creative Alibi Word Add-in entry point.
 * Bootstraps React after Office.js initializes.
 * In-browser (non-Office) dev mode: mounts directly without Office.onReady guard.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

/* global Office */

function mountApp() {
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element not found');
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Office.js loaded → use proper onReady guard
if (typeof Office !== 'undefined' && Office.onReady) {
  Office.onReady((info) => {
    // Mount in Word task pane OR in any browser preview
    if (
      info.host === Office.HostType.Word ||
      info.host === null ||           // Office Online in browser
      info.platform === null          // Direct browser visit (dev)
    ) {
      mountApp();
    }
  });
} else {
  // No Office.js at all (pure browser dev) — mount immediately
  mountApp();
}
