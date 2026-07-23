/**
 * @fileoverview Settings page — privacy controls, IBM Granite config, and data management.
 * Moon Phases design system: #212A31 / #2E3944 / #124E66 / #748D92 / #D3D9D4
 */

import React, { useState } from 'react';

// ─── Moon Phases tokens ────────────────────────────────────────────────────────
const MP = {
  surface:  '#212A31',
  elevated: '#2E3944',
  teal:     '#2A9FBF',
  tealDark: '#124E66',
  text:     '#D3D9D4',
  textSoft: '#A8B2B7',
  muted:    '#748D92',
  border:   '#374654',
  success:  '#4CC38A',
  error:    '#E07070',
  warning:  '#E8C547',
  ibm:      '#7EB8D4',
} as const;

// ─── Toggle Component ─────────────────────────────────────────────────────────

function SettingToggle({
  label, description, value, onChange, icon,
}: {
  label: string; description: string; value: boolean;
  onChange: (v: boolean) => void; icon?: string;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b last:border-0"
      style={{ borderColor: MP.border }}>
      <div className="flex-1 mr-8">
        <div className="font-medium text-sm flex items-center gap-2" style={{ color: MP.text }}>
          {icon && <span>{icon}</span>}
          {label}
        </div>
        <div className="text-xs mt-0.5 leading-relaxed max-w-md" style={{ color: MP.muted }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-label={`Toggle ${label}`}
        aria-pressed={value}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          background:       value ? MP.teal : MP.elevated,
          border:           `1px solid ${value ? MP.teal : MP.border}`,
          boxShadow:        value ? `0 0 8px ${MP.teal}50` : 'none',
          ['--tw-ring-color' as string]: MP.teal,
        }}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SettingSection({
  title, subtitle, icon, children, accent = MP.teal,
}: {
  title: string; subtitle: string; icon: React.ReactNode;
  children: React.ReactNode; accent?: string;
}) {
  return (
    <div className="ca-card overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center gap-3"
        style={{ background: `${accent}08`, borderColor: MP.border }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}20`, color: accent }}>
          {icon}
        </div>
        <div>
          <div className="font-bold text-sm" style={{ color: MP.text }}>{title}</div>
          <div className="text-xs" style={{ color: MP.muted }}>{subtitle}</div>
        </div>
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [settings, setSettings] = useState({
    localDataOnly:           true,
    encryptLedger:           true,
    autoTrackOnOpen:         false,
    shareAIAssistDetails:    true,
    includeDetectorInReport: true,
    allowTelemetry:          false,
    notifyOnReport:          true,
    darkMode:                true,
  });

  const [granite, setGranite] = useState({
    model:     'ibm/granite-3-8b-instruct',
    apiKey:    '',
    projectId: '',
    url:       'https://us-south.ml.cloud.ibm.com',
  });

  const [testing,    setTesting]    = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [saved,      setSaved]      = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const set = (key: keyof typeof settings) => (v: boolean) =>
    setSettings(prev => ({ ...prev, [key]: v }));

  const handleTestConnection = async () => {
    setTesting('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'}/health`);
      setTesting(res.ok ? 'success' : 'error');
    } catch {
      setTesting('error');
    }
    setTimeout(() => setTesting('idle'), 3000);
  };

  const handleSaveConfig = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = () => {
    const data = JSON.stringify({ settings, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'creative-alibi-data.json';
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  };

  return (
    <div className="ca-page max-w-3xl">
      <div>
        <h1 className="text-2xl font-black" style={{ color: MP.text }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: MP.muted }}>Configure privacy, integrations, and report behavior</p>
      </div>

      <div className="space-y-6">

        {/* ── Privacy & Data ────────────────────────────────────────────── */}
        <SettingSection
          title="Privacy & Data"
          subtitle="Control what is stored and how it's protected"
          accent={MP.success}
          icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" /></svg>}>
          <SettingToggle icon="🏠" label="Local-first data storage"
            description="Keep all Process Ledger data on your device only. Nothing is sent to servers without your explicit action."
            value={settings.localDataOnly} onChange={set('localDataOnly')} />
          <SettingToggle icon="🔐" label="Encrypt Process Ledger"
            description="Encrypt the local Process Ledger data at rest using AES-256."
            value={settings.encryptLedger} onChange={set('encryptLedger')} />
          <SettingToggle icon="⚡" label="Auto-start tracking on document open"
            description="Automatically begin behavioral tracking when you open a document in Word."
            value={settings.autoTrackOnOpen} onChange={set('autoTrackOnOpen')} />
          <SettingToggle icon="📊" label="Allow anonymous usage analytics"
            description="Send anonymized usage data to help improve Creative Alibi. No personal data or document content is ever shared."
            value={settings.allowTelemetry} onChange={set('allowTelemetry')} />
        </SettingSection>

        {/* ── Report Content ─────────────────────────────────────────── */}
        <SettingSection
          title="Report Content"
          subtitle="Control what appears in Authenticity Reports"
          accent={MP.teal}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}>
          <SettingToggle icon="🤖" label="Include AI assist details in report"
            description="Show detailed IBM Granite AI Partner interaction log in the Authenticity Report."
            value={settings.shareAIAssistDetails} onChange={set('shareAIAssistDetails')} />
          <SettingToggle icon="🔍" label="Include AI-likelihood signal"
            description="Include the ai-text-detector estimate in the report. This is informational only — it does not affect eligibility."
            value={settings.includeDetectorInReport} onChange={set('includeDetectorInReport')} />
          <SettingToggle icon="🔔" label="Notify when report is ready"
            description="Show a notification when a new Authenticity Report has been generated for a completed session."
            value={settings.notifyOnReport} onChange={set('notifyOnReport')} />
        </SettingSection>

        {/* ── IBM Granite Configuration ──────────────────────────────── */}
        <SettingSection
          title="IBM Granite Integration"
          subtitle="Configure your watsonx.ai connection"
          accent={MP.ibm}
          icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>}>
          <div className="py-5 space-y-4">

            {/* Model selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: MP.muted }}>
                Model
              </label>
              <select className="ca-input text-sm" value={granite.model}
                onChange={e => setGranite(g => ({ ...g, model: e.target.value }))}>
                <option value="ibm/granite-3-8b-instruct">ibm/granite-3-8b-instruct (Default — balanced)</option>
                <option value="ibm/granite-4-h-small">ibm/granite-4-h-small (Faster, lighter)</option>
                <option value="ibm/granite-3-2b-instruct">ibm/granite-3-2b-instruct (Compact)</option>
              </select>
            </div>

            {/* watsonx.ai URL */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: MP.muted }}>
                watsonx.ai URL
              </label>
              <input type="text" className="ca-input text-sm font-mono" value={granite.url}
                onChange={e => setGranite(g => ({ ...g, url: e.target.value }))} />
            </div>

            {/* API Key */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: MP.muted }}>
                API Key
              </label>
              <input type="password" className="ca-input text-sm" placeholder="••••••••••••••••••••"
                value={granite.apiKey} onChange={e => setGranite(g => ({ ...g, apiKey: e.target.value }))} />
            </div>

            {/* Project ID */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: MP.muted }}>
                Project ID
              </label>
              <input type="text" className="ca-input text-sm font-mono"
                placeholder="e.g. e01b788d-e87c-4982-9d14-b971e45d601d"
                value={granite.projectId} onChange={e => setGranite(g => ({ ...g, projectId: e.target.value }))} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={handleTestConnection} disabled={testing === 'loading'}
                className="ca-btn-secondary inline-flex items-center gap-2 text-sm px-4 py-2"
                style={testing === 'success' ? { borderColor: `${MP.success}50`, color: MP.success }
                  : testing === 'error'   ? { borderColor: `${MP.error}50`,   color: MP.error   }
                  : {}}>
                {testing === 'loading' ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12c0-4.97-4.03-9-9-9" /></svg>Testing…</>
                ) : testing === 'success' ? '✓ Connected!'
                  : testing === 'error'   ? '✗ Failed'
                  : '🔌 Test Connection'}
              </button>
              <button onClick={handleSaveConfig} className="ca-btn-primary inline-flex items-center gap-2 text-sm px-5 py-2">
                {saved ? '✓ Saved!' : '💾 Save Configuration'}
              </button>
            </div>
          </div>
        </SettingSection>

        {/* ── App Preferences ────────────────────────────────────────── */}
        <SettingSection
          title="App Preferences"
          subtitle="Display and interface settings"
          accent={MP.textSoft}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" /></svg>}>
          <SettingToggle icon="🌙" label="Moon Phases dark mode"
            description="Use the Moon Phases deep-dark theme. Recommended for extended writing sessions — WCAG AA compliant."
            value={settings.darkMode} onChange={set('darkMode')} />
        </SettingSection>

        {/* ── Data Management ─────────────────────────────────────────── */}
        <div className="ca-card p-6 border" style={{ borderColor: `${MP.error}25` }}>
          <h3 className="font-bold flex items-center gap-2 mb-1" style={{ color: MP.error }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Data Management
          </h3>
          <p className="text-xs mb-5 leading-relaxed" style={{ color: MP.muted }}>
            These actions affect your local data. Export your data first before clearing anything.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleExportData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
              style={{ borderColor: `${MP.success}35`, color: MP.success }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${MP.success}15`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              {exportDone ? '✓ Exported!' : '📥 Export All Data'}
            </button>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
              style={{ borderColor: `${MP.error}35`, color: MP.error }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${MP.error}15`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              onClick={() => {
                if (window.confirm('Are you sure? This will permanently delete all sessions and reports from local storage.')) {
                  localStorage.clear();
                  alert('All local data cleared.');
                }
              }}>
              🗑 Clear All Local Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
