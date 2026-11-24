import React, { useState } from 'react';
import { ProteinEntry, CreateProteinEntryDTO, DietPreference } from '../types/protein';
import { PROTEIN_PRESETS } from '../constants/presets';
import { presetsForDiet } from '../logic/proteinLogic';

interface ProteinCardProps {
  today: string;
  totalGrams: number;
  goalGrams: number;
  remainingGrams: number;
  progress: number;
  todayEntries: ProteinEntry[];
  dietPreference?: DietPreference;
  onUpdateDietPreference?: (diet: DietPreference) => Promise<void>;
  onAddEntry: (dto: CreateProteinEntryDTO) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onOpenSettings: () => void;
}

export const ProteinCard: React.FC<ProteinCardProps> = ({
  today,
  totalGrams,
  goalGrams,
  remainingGrams,
  progress,
  todayEntries,
  dietPreference = 'veg',
  onUpdateDietPreference,
  onAddEntry,
  onDeleteEntry,
  onOpenSettings,
}) => {
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customGrams, setCustomGrams] = useState('');

  const fillPercent = Math.min(100, Math.max(0, progress));
  const visiblePresets = presetsForDiet(PROTEIN_PRESETS, dietPreference);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const grams = parseFloat(customGrams);
    const label = customLabel.trim();
    if (!label || isNaN(grams) || grams <= 0) return;
    await onAddEntry({ date: today, grams, label });
    setCustomLabel('');
    setCustomGrams('');
    setShowCustom(false);
  };

  return (
    <section className="block" aria-labelledby="pro">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 id="pro" style={{ margin: 0 }}>Protein</h2>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Protein settings"
          style={{
            border: 0,
            background: 'none',
            color: 'var(--ink)',
            font: '600 13px "Hanken Grotesk", sans-serif',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Settings
        </button>
      </div>

      <div className="protein" style={{ marginTop: '14px' }}>
        <div className="bottle" role="img" aria-label={`${fillPercent} percent full`}>
          <div className="fill" style={{ height: `${fillPercent}%` }}></div>
        </div>
        <div>
          <div className="big">{totalGrams} g</div>
          <div className="sub">
            of {goalGrams} g · {remainingGrams > 0 ? `${remainingGrams} g to go` : 'Goal reached!'}
          </div>
        </div>
      </div>

      {/* Diet Preference Segmented Control */}
      <div
        role="group"
        aria-label="Diet preference filter"
        style={{
          display: 'inline-flex',
          gap: '2px',
          padding: '2px',
          border: '1.5px solid var(--ink)',
          borderRadius: '4px',
          background: 'var(--paper)',
          marginTop: '12px',
        }}
      >
        {(
          [
            { value: 'veg', label: 'Veg' },
            { value: 'egg', label: 'Eggetarian' },
            { value: 'non-veg', label: 'Non-veg' },
          ] as const
        ).map((opt) => {
          const isActive = dietPreference === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onUpdateDietPreference?.(opt.value)}
              aria-pressed={isActive}
              style={{
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: '"Hanken Grotesk", sans-serif',
                cursor: 'pointer',
                background: isActive ? 'var(--ink)' : 'transparent',
                color: isActive ? 'var(--paper)' : 'var(--ink)',
                minHeight: '32px',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Preset Chips */}
      <div className="chips" style={{ marginTop: '10px' }}>
        {visiblePresets.map((p) => (
          <button
            key={p.id}
            type="button"
            className="chip"
            onClick={() => onAddEntry({ date: today, grams: p.grams, label: p.label })}
            aria-label={`Add ${p.label} ${p.grams}g`}
          >
            {p.label} {p.grams}g
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '8px' }}>
        <p className="sub" style={{ margin: 0 }}>Preset values are approximate.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            style={{
              border: 0,
              background: 'none',
              color: 'var(--ink)',
              font: '600 13px "Hanken Grotesk", sans-serif',
              cursor: 'pointer',
              padding: '4px 6px',
            }}
          >
            {showCustom ? 'Close' : '+ Custom'}
          </button>
          <button
            type="button"
            onClick={() => setIsLogOpen(!isLogOpen)}
            style={{
              border: 0,
              background: 'none',
              color: 'var(--ink)',
              font: '600 13px "Hanken Grotesk", sans-serif',
              cursor: 'pointer',
              padding: '4px 6px',
            }}
            aria-expanded={isLogOpen}
          >
            {isLogOpen ? 'Hide Log' : `Log (${todayEntries.length})`}
          </button>
        </div>
      </div>

      {showCustom && (
        <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input
            type="text"
            placeholder="Food name"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            required
            style={{
              flex: 1,
              padding: '6px 10px',
              border: '2px solid var(--ink)',
              borderRadius: '4px',
              background: 'var(--surface)',
              color: 'var(--text)',
              font: '14px "Hanken Grotesk", sans-serif',
            }}
          />
          <input
            type="number"
            step="0.5"
            placeholder="g"
            value={customGrams}
            onChange={(e) => setCustomGrams(e.target.value)}
            required
            style={{
              width: '64px',
              padding: '6px 8px',
              border: '2px solid var(--ink)',
              borderRadius: '4px',
              background: 'var(--surface)',
              color: 'var(--text)',
              font: '14px "Hanken Grotesk", sans-serif',
            }}
          />
          <button
            type="submit"
            className="chip active"
            style={{ minHeight: '38px', padding: '0 12px', fontSize: '13px' }}
          >
            Add
          </button>
        </form>
      )}

      {isLogOpen && (
        <ul className="ledger" style={{ marginTop: '14px' }}>
          {todayEntries.map((entry) => (
            <li key={entry.id}>
              <span>{entry.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{entry.grams}g</span>
                <button
                  type="button"
                  onClick={() => onDeleteEntry(entry.id)}
                  aria-label={`Delete ${entry.label}`}
                  style={{
                    border: 0,
                    background: 'none',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
          {todayEntries.length === 0 && (
            <li style={{ color: 'var(--muted)', fontSize: '13.5px' }}>No entries logged today.</li>
          )}
        </ul>
      )}
    </section>
  );
};
