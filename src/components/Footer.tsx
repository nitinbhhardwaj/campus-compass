import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onClearAllData?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onClearAllData }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'support@campuscompass.app';

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      if (onClearAllData) {
        onClearAllData();
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <footer
      style={{
        marginTop: '48px',
        paddingTop: '24px',
        paddingBottom: '32px',
        borderTop: '2px solid var(--line)',
        color: 'var(--muted)',
        fontSize: '13px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/"
            style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}
          >
            Dashboard
          </Link>
          <span>•</span>
          <Link
            to="/privacy"
            style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}
          >
            Privacy Policy
          </Link>
          <span>•</span>
          <Link
            to="/terms"
            style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}
          >
            Terms of Service
          </Link>
          <span>•</span>
          <a
            href={`mailto:${contactEmail}`}
            style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}
          >
            {contactEmail}
          </a>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--danger)',
              borderRadius: '4px',
              background: 'transparent',
              color: 'var(--danger)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Clear all data
          </button>
        </div>
      </div>

      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(15, 20, 38, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-data-title"
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--ink)',
              borderRadius: '4px',
              padding: '20px',
              maxWidth: '400px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="clear-data-title"
              style={{
                fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--ink)',
                margin: '0 0 8px 0',
              }}
            >
              Clear all saved data?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              This will permanently delete all tasks, protein entries, expenses, and assistant settings stored in this browser. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'var(--danger)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Yes, delete everything
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
