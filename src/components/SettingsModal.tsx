import React, { useState } from 'react';
import { X, Monitor, Moon, RefreshCw, Server, Check, Clock, Palette } from 'lucide-react';
import { SettingsConfig, MacSystemSpecs, ClockStyle } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SettingsConfig;
  onSaveConfig: (newConfig: SettingsConfig) => void;
  macSpecs: MacSystemSpecs;
  onReconnectMac: () => void;
}

const CLOCK_COLOR_OPTIONS = [
  { name: 'Warm Amber', hex: '#E0A84E' },
  { name: 'Sunset Coral', hex: '#fb7185' },
  { name: 'Lavender Violet', hex: '#c084fc' },
  { name: 'Soft Emerald', hex: '#69C58A' },
  { name: 'Polar White', hex: '#F1F3F4' },
  { name: 'Electric Cyan', hex: '#38bdf8' }
];

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
  const [selectedClockStyle, setSelectedClockStyle] = useState<ClockStyle>(config.clockStyle || 'curvy-apple');
  const [selectedClockColor, setSelectedClockColor] = useState(config.clockColor || '#E0A84E');

  const handleSave = () => {
    onSaveConfig({
      ...config,
      macHostIp,
      macPort,
      nightMode,
      enableHaptics,
      clockStyle: selectedClockStyle,
      clockColor: selectedClockColor
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Server style={{ width: '22px', height: '22px', color: selectedClockColor }} />
            <div>
              <div className="modal-title">Settings & Customization</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Configure Apple StandBy Clock, Colors & Mac Companion Server</div>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* Apple StandBy Clock Preferences */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px', color: '#F1F3F4' }}>
              <Clock style={{ width: '18px', height: '18px', color: selectedClockColor }} />
              <span>Apple StandBy Clock Design</span>
            </div>

            <div className="form-group">
              <label className="form-label">Clock Face Design</label>
              <select
                className="form-select"
                value={selectedClockStyle}
                onChange={(e) => setSelectedClockStyle(e.target.value as ClockStyle)}
                style={{ borderRadius: '14px', background: '#202428', border: '1px solid #2A2F34', color: '#F1F3F4', padding: '10px 14px' }}
              >
                <option value="curvy-apple"> Apple iOS 17 Curvy Organic Serif</option>
                <option value="pill-blocks"> Apple Translucent Pill Capsules</option>
                <option value="minimal-hero"> Apple StandBy Hero Clock</option>
                <option value="playful-colors"> Apple Playful Color Blocks</option>
                <option value="stacked"> Apple Stacked Big Numerals</option>
                <option value="world"> Apple Dual Time World Clock</option>
              </select>
            </div>

            {/* Clock Color Swatches */}
            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette style={{ width: '14px', height: '14px', color: selectedClockColor }} />
                <span>Clock Accent Color</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                {CLOCK_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedClockColor(c.hex)}
                    title={c.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: c.hex,
                      border: selectedClockColor === c.hex ? '3px solid #ffffff' : '2px solid transparent',
                      boxShadow: selectedClockColor === c.hex ? `0 0 12px ${c.hex}` : 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.15s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mac Integration Group */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                <Monitor style={{ width: '18px', height: '18px', color: selectedClockColor }} />
                <span>Mac Companion Server IP</span>
              </div>
              <span className="badge-pill" style={{ background: macSpecs.isConnected ? 'rgba(105, 197, 138, 0.2)' : 'rgba(224, 168, 78, 0.2)', color: macSpecs.isConnected ? '#69C58A' : '#E0A84E' }}>
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
                  placeholder="e.g. 192.168.0.110"
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
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Run <code style={{ color: selectedClockColor }}>Start-The-Slate-Mac-Server.command</code></span>
              <button onClick={onReconnectMac} className="glass-pill-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                <RefreshCw style={{ width: '14px', height: '14px' }} />
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {/* Preferences Group */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>Display & Vibes</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Moon style={{ width: '18px', height: '18px', color: '#D96C6C' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>StandBy Night Red Mode</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Low-light ambient red filter</div>
                </div>
              </div>

              <button
                onClick={() => setNightMode(!nightMode)}
                className="glass-pill-btn"
                style={{ background: nightMode ? '#D96C6C' : 'rgba(255,255,255,0.1)' }}
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
          <button onClick={handleSave} className="glass-pill-btn" style={{ background: selectedClockColor, color: '#0D0F10', borderColor: selectedClockColor, fontWeight: 800 }}>
            <Check style={{ width: '16px', height: '16px' }} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
