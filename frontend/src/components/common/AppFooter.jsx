import React from 'react';
import { Heart, Code, Coffee } from 'lucide-react';

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      marginTop: 'auto',
      padding: '20px 0',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'var(--text-secondary)',
      fontSize: '0.85rem',
      flexWrap: 'wrap',
      gap: '15px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>© {currentYear} <strong>Finance Tracker</strong></span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>v2.1.0 Premium</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Made with <Heart size={14} style={{ color: 'var(--accent-red)' }} fill="var(--accent-red)" /> for Fabio
        </div>
        <a 
          href="https://github.com/Fabioxr1" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit', textDecoration: 'none', opacity: 0.8 }}
        >
          <Code size={14} /> GitHub
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
          <Coffee size={14} /> Buy me a coffee
        </div>
      </div>
    </footer>
  );
}
