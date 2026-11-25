import React from 'react';
import { Link } from 'react-router-dom';

/* TODO: Legal text must be reviewed by the owner before launch. */

export const PrivacyPolicy: React.FC = () => {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'support@campuscompass.app';

  return (
    <div className="wrap" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px 64px' }}>
      <p className="date">Last updated: November 24, 2026</p>
      <h1 style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: '32px', color: 'var(--ink)', margin: '0 0 24px' }}>
        Privacy Policy
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
            1. Overview
          </h2>
          <p style={{ margin: 0 }}>
            Campus Compass is a daily planner designed for college students. We respect your privacy. This policy outlines what data is stored, where it goes, and how you retain full control over it.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            2. Local-First Storage on Your Device
          </h2>
          <p style={{ margin: 0 }}>
            All your daily productivity data is stored directly in your web browser using local storage (window.localStorage). We do not operate user accounts, passwords, or cloud database profiles. Your data remains on your physical device at all times.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            3. What Data Is Collected and Stored
          </h2>
          <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
            <li><strong>Tasks:</strong> Titles, categories (study, gym, skincare, chore, other), priorities (1 to 3), due dates, recurrence rules, and completion logs.</li>
            <li><strong>Protein Tracker:</strong> Body weight, daily protein goals, timestamped entries with gram amounts, and meal descriptions.</li>
            <li><strong>Expense Tracker:</strong> Dates, integer amounts in paise, spending categories, notes, and monthly budget limits.</li>
            <li><strong>Assistant Settings:</strong> Preferred wake name, voice response toggle, and speech recognition language preference.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            4. Analytics, Cookies, and Advertising
          </h2>
          <p style={{ margin: 0 }}>
            Campus Compass does not run third-party tracking scripts, analytics trackers, or display advertisements. We do not sell, rent, or monetize personal user data.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            5. Hosting and Server Infrastructure
          </h2>
          <p style={{ margin: 0 }}>
            The application is delivered via static edge hosting. As with standard web servers, the hosting infrastructure may record basic network metadata in ephemeral access logs, including your IP address, browser type, and request timestamps, strictly for security and operational reliability.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            6. Conversational AI Assistant
          </h2>
          <p style={{ margin: 0 }}>
            If you choose to use the conversational assistant feature, your spoken or typed message is transmitted securely to our serverless parsing endpoint (/api/parse). When configured, assistant messages are sent to Google's Gemini API strictly to extract structured actions (tasks, expenses, protein). The provider does not use your requests to train public models. If no remote provider key is set, processing happens entirely within deterministic local heuristics. No audio recordings are permanently stored.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            7. How to Delete Your Data
          </h2>
          <p style={{ margin: 0 }}>
            Because data lives exclusively in your browser, you have absolute control over deletion:
          </p>
          <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
            <li>Use the <strong>"Clear all data"</strong> button located in the footer of any screen to immediately wipe all local records.</li>
            <li>Alternatively, clear your browser site storage and cache via your browser preferences.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            8. Contact Information
          </h2>
          <p style={{ margin: 0 }}>
            If you have questions or concerns regarding this policy, contact us at:{' '}
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
