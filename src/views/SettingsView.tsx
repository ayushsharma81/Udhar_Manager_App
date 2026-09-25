import React, { useState } from 'react';
import { Moon, Sun, Lock, ShieldCheck, Download, Upload, RefreshCw, Trash2, Code2, Terminal, MessageSquare, Plus, Check, ChevronRight, AlertTriangle } from 'lucide-react';
import { MessageTemplate } from '../types';
import { StorageService } from '../utils/storage';

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  hasPin: boolean;
  onSetPin: (pin: string | null) => void;
  templates: MessageTemplate[];
  onUpdateTemplates: (templates: MessageTemplate[]) => void;
  onResetData: () => void;
  onClearData: () => void;
  onOpenSourceInspector: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDarkMode,
  onToggleDarkMode,
  hasPin,
  onSetPin,
  templates,
  onUpdateTemplates,
  onResetData,
  onClearData,
  onOpenSourceInspector,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Template editor modal state
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplText, setTplText] = useState('');
  const [tplLang, setTplLang] = useState<'ENGLISH' | 'HINDI' | 'HINGLISH'>('ENGLISH');

  const handleExportBackup = () => {
    const json = StorageService.exportFullBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UdharManager_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importFullBackupJson(content);
      if (success) {
        setImportFeedback('Backup successfully restored! Refreshing data...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setImportFeedback('Failed to import backup: Invalid JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  const handleSavePin = () => {
    if (pinInput.length === 4) {
      onSetPin(pinInput);
      setShowPinDialog(false);
      setPinInput('');
    }
  };

  const handleRemovePin = () => {
    onSetPin(null);
    setShowPinDialog(false);
    setPinInput('');
  };

  const handleSaveTemplate = () => {
    if (!tplName || !tplText) return;
    if (editingTemplate) {
      const updated = templates.map((t) =>
        t.id === editingTemplate.id
          ? { ...t, name: tplName, template: tplText, language: tplLang }
          : t
      );
      onUpdateTemplates(updated);
    } else {
      const newTpl: MessageTemplate = {
        id: `tpl-${Date.now()}`,
        name: tplName,
        language: tplLang,
        template: tplText,
        isDefault: false,
        createdAt: Date.now(),
      };
      onUpdateTemplates([...templates, newTpl]);
    }
    setEditingTemplate(null);
    setTplName('');
    setTplText('');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-24">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Settings</h2>
        <p className="text-xs text-neutral-400">Security, templates, backup & Android source</p>
      </div>

      {/* Android Native Project & APK Build Banner */}
      <div className="p-4 rounded-3xl bg-emerald-950/40 border border-emerald-700/50 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Terminal size={12} />
              Android Studio Project
            </span>
            <h3 className="text-sm font-bold text-white">Native Kotlin + Compose Build</h3>
            <p className="text-xs text-neutral-300">
              Run <code className="px-1.5 py-0.5 rounded bg-black/40 text-emerald-400 font-mono text-[11px]">./gradlew assembleDebug</code> to generate installable APK.
            </p>
          </div>
          <button
            onClick={onOpenSourceInspector}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow transition-colors"
          >
            <Code2 size={14} />
            <span>View Source</span>
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div
        className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Security & Privacy
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Lock size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">4-Digit App PIN Lock</div>
              <div className="text-xs text-neutral-400">
                {hasPin ? 'PIN protection is active' : 'No PIN set (anyone can view)'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPinDialog(true)}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold"
          >
            {hasPin ? 'Change / Remove' : 'Enable PIN'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">Biometrics (Fingerprint)</div>
              <div className="text-xs text-neutral-400">Use Android BiometricPrompt</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-400">Available</span>
        </div>
      </div>

      {/* Appearance */}
      <div
        className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Display Theme
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div>
              <div className="text-sm font-semibold">Dark Theme (Material 3)</div>
              <div className="text-xs text-neutral-400">
                {isDarkMode ? 'AMOLED dark mode active' : 'Light mode active'}
              </div>
            </div>
          </div>

          <button
            onClick={onToggleDarkMode}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              isDarkMode ? 'bg-emerald-600' : 'bg-neutral-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SMS Reminder Message Templates */}
      <div
        className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            SMS Message Templates ({templates.length})
          </h3>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setTplName('');
              setTplText('Hi {name}, reminder that ₹{amount} is pending. Please settle by {due_date}. Thanks!');
              setTplLang('ENGLISH');
            }}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Plus size={13} />
            <span>New Template</span>
          </button>
        </div>

        <div className="space-y-2">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200">{tpl.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-neutral-800 text-emerald-400">
                  {tpl.language}
                </span>
              </div>
              <p className="text-neutral-400 font-mono text-[11px] leading-relaxed line-clamp-2">
                {tpl.template}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Data, Backup & Reset */}
      <div
        className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Data, Backup & Restore
        </h3>

        {importFeedback && (
          <div className="mb-3 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs">
            {importFeedback}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleExportBackup}
            className="w-full p-3 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 flex items-center justify-between text-xs font-semibold transition-colors"
          >
            <div className="flex items-center gap-2">
              <Download size={16} className="text-emerald-400" />
              <span>Export Full JSON Backup</span>
            </div>
            <ChevronRight size={14} className="text-neutral-500" />
          </button>

          <label className="w-full p-3 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-blue-400" />
              <span>Import JSON Backup</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <ChevronRight size={14} className="text-neutral-500" />
          </label>

          <button
            onClick={onResetData}
            className="w-full p-3 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 flex items-center justify-between text-xs font-semibold transition-colors"
          >
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-amber-400" />
              <span>Reset to Sample Test Data (Rahul, Amit, Rohit)</span>
            </div>
            <ChevronRight size={14} className="text-neutral-500" />
          </button>

          <button
            onClick={onClearData}
            className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 flex items-center justify-between text-xs font-semibold text-rose-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trash2 size={16} />
              <span>Clear All Ledger Data</span>
            </div>
            <ChevronRight size={14} className="text-rose-400" />
          </button>
        </div>
      </div>

      {/* PIN Dialog */}
      {showPinDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xs rounded-3xl p-5 bg-[#181A20] border border-neutral-800 text-neutral-100 space-y-4">
            <h3 className="font-bold text-base">Configure Security PIN</h3>
            <p className="text-xs text-neutral-400">Enter a 4-digit numeric code</p>

            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-2xl font-mono tracking-widest p-2 rounded-xl bg-neutral-900 border border-neutral-700"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={handleSavePin}
                disabled={pinInput.length !== 4}
                className="flex-1 py-2 rounded-xl bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs"
              >
                Save PIN
              </button>
              {hasPin && (
                <button
                  onClick={handleRemovePin}
                  className="py-2 px-3 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => setShowPinDialog(false)}
                className="py-2 px-3 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
