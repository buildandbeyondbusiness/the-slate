import React, { useState } from 'react';
import { X, Monitor, Wifi, Moon, Volume2, RefreshCw, Server, Check } from 'lucide-react';
import { SettingsConfig, MacSystemSpecs } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SettingsConfig;
  onSaveConfig: (newConfig: SettingsConfig) => void;
  macSpecs: MacSystemSpecs;
  onReconnectMac: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  macSpecs,
  onReconnectMac,
}) => {
  if (!isOpen) return null;

  const [macHostIp, setMacHostIp] = useState(config.macHostIp);
  const [macPort, setMacPort] = useState(config.macPort);
  const [nightMode, setNightMode] = useState(config.nightMode);
  const [enableHaptics, setEnableHaptics] = useState(config.enableHaptics);

  const handleSave = () => {
    onSaveConfig({
      ...config,
      macHostIp,
      macPort,
      nightMode,
      enableHaptics,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-lg p-6 bg-slate-900/90 border border-white/20 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Settings & Mac Integration</h2>
              <p className="text-xs text-slate-400">Configure Mac Companion Server & StandBy preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6">
          
          {/* Mac IP & Connection Section */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-white">Mac Companion Server IP</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${macSpecs.isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {macSpecs.isConnected ? 'Connected' : 'Offline / Simulated'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Mac IP Address</label>
                <input
                  type="text"
                  value={macHostIp}
                  onChange={(e) => setMacHostIp(e.target.value)}
                  placeholder="e.g. 192.168.1.15 or localhost"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Port</label>
                <input
                  type="number"
                  value={macPort}
                  onChange={(e) => setMacPort(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">Run <code className="text-sky-300">npm run companion</code> on your Mac</p>
              <button
                onClick={onReconnectMac}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {/* StandBy Preferences */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Display & Vibes</h3>
            
            {/* Night Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Moon className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="text-sm font-semibold text-white block">StandBy Night Red Mode</span>
                  <span className="text-xs text-slate-400 block">Low ambient lighting red tint filter</span>
                </div>
              </div>
              <button
                onClick={() => setNightMode(!nightMode)}
                className={`w-12 h-6 rounded-full transition-colors p-1 ${nightMode ? 'bg-rose-500' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${nightMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Haptic / Click Animations */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-sm font-semibold text-white block">Button Press Haptics</span>
                  <span className="text-xs text-slate-400 block">Spring animations and tap feedback</span>
                </div>
              </div>
              <button
                onClick={() => setEnableHaptics(!enableHaptics)}
                className={`w-12 h-6 rounded-full transition-colors p-1 ${enableHaptics ? 'bg-emerald-500' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enableHaptics ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>

      </div>
    </div>
  );
};
