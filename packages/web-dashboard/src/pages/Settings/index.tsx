/**
 * @fileoverview Settings page — privacy controls and integration settings.
 */

import React, { useState } from 'react';

function SettingToggle({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-alibi-border last:border-0">
      <div className="flex-1 mr-8">
        <div className="font-medium text-alibi-text text-sm">{label}</div>
        <div className="text-xs text-alibi-text-muted mt-0.5 leading-relaxed">{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none ${value ? 'bg-alibi-violet' : 'bg-alibi-bg-elevated'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState({
    localDataOnly: true,
    encryptLedger: true,
    autoTrackOnOpen: false,
    shareAIAssistDetails: true,
    includeDetectorInReport: true,
    allowTelemetry: false,
  });

  const set = (key: keyof typeof settings) => (v: boolean) =>
    setSettings(prev => ({ ...prev, [key]: v }));

  return (
    <div className="ca-page max-w-2xl">
      <h2 className="ca-page-title">Settings</h2>

      <div className="space-y-6">
        {/* Privacy */}
        <div className="ca-card p-6">
          <h3 className="font-semibold text-alibi-text mb-1 flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-alibi-emerald">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
            </svg>
            Privacy & Data
          </h3>
          <p className="text-xs text-alibi-text-muted mb-4">Control what is stored and what is shared</p>
          <SettingToggle label="Local-first data storage" description="Keep all Process Ledger data on your device only. Nothing is sent to servers without your explicit action." value={settings.localDataOnly} onChange={set('localDataOnly')} />
          <SettingToggle label="Encrypt Process Ledger" description="Encrypt the local Process Ledger data at rest using AES-256." value={settings.encryptLedger} onChange={set('encryptLedger')} />
          <SettingToggle label="Auto-start tracking on document open" description="Automatically begin behavioral tracking when you open a document in Word." value={settings.autoTrackOnOpen} onChange={set('autoTrackOnOpen')} />
        </div>

        {/* Report Content */}
        <div className="ca-card p-6">
          <h3 className="font-semibold text-alibi-text mb-1">Report Content</h3>
          <p className="text-xs text-alibi-text-muted mb-4">Control what appears in your Authenticity Reports</p>
          <SettingToggle label="Include AI assist details in report" description="Show detailed AI Creative Partner interaction log in the Authenticity Report." value={settings.shareAIAssistDetails} onChange={set('shareAIAssistDetails')} />
          <SettingToggle label="Include AI-likelihood signal" description="Include the desklib/ai-text-detector-v1.01 estimate in the report. This is informational only — it does not affect eligibility." value={settings.includeDetectorInReport} onChange={set('includeDetectorInReport')} />
        </div>

        {/* IBM Granite Configuration */}
        <div className="ca-card p-6">
          <h3 className="font-semibold text-alibi-text mb-1 flex items-center gap-2">
            <span className="ca-badge-ibm">IBM</span>
            Granite Integration
          </h3>
          <p className="text-xs text-alibi-text-muted mb-4">Configure your IBM watsonx.ai connection</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-alibi-text-muted uppercase tracking-wider block mb-1.5">Model</label>
              <select className="ca-input text-sm">
                <option value="ibm/granite-3-3b-instruct">ibm/granite-3-3b-instruct (Recommended — fast)</option>
                <option value="ibm/granite-3-8b-instruct">ibm/granite-3-8b-instruct (More capable)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-alibi-text-muted uppercase tracking-wider block mb-1.5">watsonx.ai API Key</label>
              <input type="password" className="ca-input text-sm" placeholder="••••••••••••••••••••" />
            </div>
            <div>
              <label className="text-xs font-medium text-alibi-text-muted uppercase tracking-wider block mb-1.5">Project ID</label>
              <input type="text" className="ca-input text-sm" placeholder="Enter your watsonx.ai Project ID" />
            </div>
            <button className="ca-btn-primary text-sm">Save Configuration</button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="ca-card p-6 border-alibi-error/20">
          <h3 className="font-semibold text-alibi-error mb-1">Data Management</h3>
          <p className="text-xs text-alibi-text-muted mb-4">Irreversible actions — proceed with caution</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border border-alibi-error/30 text-alibi-error text-sm hover:bg-alibi-error/10 transition-all">
              Export All Data
            </button>
            <button className="px-4 py-2 rounded-xl border border-alibi-error/30 text-alibi-error text-sm hover:bg-alibi-error/10 transition-all">
              Delete All Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
