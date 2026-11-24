import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="wrap" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '32px 20px' }}>
      <h1
        style={{
          fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
          fontSize: '36px',
          fontWeight: 800,
          color: 'var(--ink)',
          margin: '0 0 12px',
        }}
      >
        Page Not Found
      </h1>
      <p style={{ fontSize: '16px', color: 'var(--muted)', margin: '0 0 24px' }}>
        The page you requested does not exist.
      </p>
      <div>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 20px',
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '15px',
            minHeight: '44px',
          }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
