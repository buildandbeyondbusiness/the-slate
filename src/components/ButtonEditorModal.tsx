import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Command } from 'lucide-react';
import { StreamDeckCard, ActionCategory } from '../types';

interface ButtonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: StreamDeckCard;
  onSave: (card: StreamDeckCard) => void;
  onDelete?: (id: string) => void;
}

const AVAILABLE_ICONS = ['Code', 'Terminal', 'Globe', 'Palette', 'Lock', 'VolumeX', 'PlayCircle', 'Layers', 'Command'];
const ACCENT_COLORS = ['#38bdf8', '#818cf8', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#a855f7'];

export const ButtonEditorModal: React.FC<ButtonEditorModalProps> = ({
  isOpen,
  onClose,
  cardToEdit,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [targetAppOrCommand, setTargetAppOrCommand] = useState('');
  const [iconName, setIconName] = useState('Code');
  const [category, setCategory] = useState<ActionCategory>('app');
  const [accentColor, setAccentColor] = useState('#38bdf8');

  useEffect(() => {
    if (cardToEdit) {
      setTitle(cardToEdit.title);
      setSubtitle(cardToEdit.subtitle);
      setTargetAppOrCommand(cardToEdit.targetAppOrCommand);
      setIconName(cardToEdit.iconName);
      setCategory(cardToEdit.category);
      setAccentColor(cardToEdit.accentColor);
    } else {
      setTitle('');
      setSubtitle('');
      setTargetAppOrCommand('');
      setIconName('Code');
      setCategory('app');
      setAccentColor('#38bdf8');
    }
  }, [cardToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: cardToEdit ? cardToEdit.id : `card_${Date.now()}`,
      title: title || 'Shortcut',
      subtitle: subtitle || 'Launch Mac Action',
      targetAppOrCommand: targetAppOrCommand || 'Visual Studio Code',
      iconName,
      category,
      accentColor,
      badgeText: category.toUpperCase()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-md p-6 bg-slate-900/90 border border-white/20 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <h2 className="text-lg font-bold text-white">
            {cardToEdit ? 'Edit Mac Shortcut' : 'Add New Stream Deck Shortcut'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Button Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VS Code, Spotify, Lock Mac"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Code Editor, Music Player"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Target App / Command */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Mac App Name or Macro</label>
            <input
              type="text"
              required
              value={targetAppOrCommand}
              onChange={(e) => setTargetAppOrCommand(e.target.value)}
              placeholder="e.g. Visual Studio Code, Spotify, LockMac, MuteMic"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ActionCategory)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
            >
              <option value="app">Mac Application</option>
              <option value="macro">System Macro</option>
              <option value="system">System Hardware</option>
              <option value="media">Media Control</option>
            </select>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Accent Color</label>
            <div className="flex items-center gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${accentColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {cardToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => { onDelete(cardToEdit.id); onClose(); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-bold transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition"
              >
                <Check className="w-4 h-4" />
                <span>Save Button</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
