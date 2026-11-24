import React from 'react';
import { Link } from 'react-router-dom';

/* TODO: Legal text must be reviewed by the owner before launch. */

export const TermsOfService: React.FC = () => {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'support@campuscompass.app';

  return (
    <div className="wrap" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px 64px' }}>
      <p className="date">Last updated: November 24, 2026</p>
      <h1 style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: '32px', color: 'var(--ink)', margin: '0 0 24px' }}>
        Terms of Service
      </h1>

      <div
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--ink)',
          borderRadius: '4px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--text)',
        }}
      >
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            1. Nature of the Application
          </h2>
          <p style={{ margin: 0 }}>
            Campus Compass is a context-aware daily planning application built to assist students in coordinating academic study blocks, workouts, daily protein intake, and personal expense budgets in a single prioritized agenda.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            2. "As Is" Provision and Disclaimer of Warranties
          </h2>
          <p style={{ margin: 0 }}>
            The application is provided strictly on an "as is" and "as available" basis, without express or implied warranties of any kind. While we design for high reliability and local data integrity, we do not warrant that operation will be uninterrupted, error-free, or compatible with all third-party browser configurations.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            3. Algorithmic Planning Nudges are Not Professional Advice
          </h2>
          <p style={{ margin: 0 }}>
            All suggestions, reminders, protein calculations, and budget warnings are deterministic planning nudges derived from rules and user-entered values. They do not constitute medical, dietary, nutritional, legal, or financial advice. You are solely responsible for your own health, academic scheduling, and financial decisions.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            4. Acceptable Use
          </h2>
          <p style={{ margin: 0 }}>
            You agree to use Campus Compass for lawful personal productivity purposes. You must not attempt to disrupt or flood serverless endpoints, perform denial-of-service attempts, or inject malicious payloads into parsing services.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            5. Modifications to Terms
          </h2>
          <p style={{ margin: 0 }}>
            We may update these terms occasionally. Any modifications will be posted directly to this /terms page with a revised "Last updated" date. Continued use of Campus Compass following such updates constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            6. Contact
          </h2>
          <p style={{ margin: 0 }}>
            For inquiries regarding these terms, contact us at:{' '}
            <a href={`mailto:${contactEmail}`} style={{ color: 'var(--ink)', fontWeight: 600 }}>
              {contactEmail}
            </a>.
          </p>
        </section>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 16px',
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '14px',
            minHeight: '44px',
          }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
