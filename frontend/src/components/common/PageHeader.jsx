import React from 'react';

/**
 * PageHeader Component
 * Standardizes the top section of each view.
 * 
 * @param {string} title - The main title of the page
 * @param {string|React.ReactNode} description - Optional subtitle or stats
 * @param {React.ReactNode} actions - Optional buttons or controls on the right
 */
export default function PageHeader({ title, description, actions, style = {} }) {
  return (
    <div className="page-header" style={{ marginBottom: '30px', alignItems: 'flex-start', ...style }}>
      <div>
        <h1 className="page-title" style={{ marginBottom: description ? '8px' : 0 }}>{title}</h1>
        {description && (
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
