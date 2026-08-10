import React, { useState } from 'react';
import { X, Monitor, Moon, Volume2, RefreshCw, Server, Check } from 'lucide-react';
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
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Server style={{ width: '22px', height: '22px', color: '#38bdf8' }} />
            <div>
              <div className="modal-title">Settings & Mac Integration</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Configure Mac Companion Server & StandBy preferences</div>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Mac Integration Group */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                <Monitor style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
                <span>Mac Companion Server IP</span>
              </div>
              <span className="badge-pill" style={{ background: macSpecs.isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: macSpecs.isConnected ? '#10b981' : '#f59e0b' }}>
                {macSpecs.isConnected ? 'Connected' : 'Offline / Simulated'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Mac IP Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={macHostIp}
                  onChange={(e) => setMacHostIp(e.target.value)}
                  placeholder="e.g. 192.168.1.15 or localhost"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Port</label>
                <input
                  type="number"
                  className="form-input"
                  value={macPort}
                  onChange={(e) => setMacPort(Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Run <code style={{ color: '#38bdf8' }}>npm run companion</code> on Mac</span>
              <button onClick={onReconnectMac} className="glass-pill-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                <RefreshCw style={{ width: '14px', height: '14px' }} />
                <span>Test</span>
              </button>
            </div>
          </div>

          {/* Preferences Group */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>Display & Vibes</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Moon style={{ width: '18px', height: '18px', color: '#f43f5e' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>StandBy Night Red Mode</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Low-light ambient red tint filter</div>
                </div>
              </div>

              <button
                onClick={() => setNightMode(!nightMode)}
                className="glass-pill-btn"
                style={{ background: nightMode ? '#f43f5e' : 'rgba(255,255,255,0.1)' }}
              >
                <span>{nightMode ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-actions">
          <button onClick={onClose} className="glass-pill-btn" style={{ background: 'transparent', borderColor: 'transparent' }}>
            Cancel
          </button>
          <button onClick={handleSave} className="glass-pill-btn" style={{ background: '#38bdf8', color: '#ffffff', borderColor: '#38bdf8' }}>
            <Check style={{ width: '16px', height: '16px' }} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
