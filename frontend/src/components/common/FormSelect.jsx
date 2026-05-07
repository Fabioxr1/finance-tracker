import React from 'react';

/**
 * FormSelect Component
 * Standardized select with icon support.
 */
export default function FormSelect({
  label,
  value,
  onChange,
  options = [],
  icon: Icon,
  placeholder,
  error,
  style = {},
  className = '',
  containerStyle = {},
  ...props
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, ...containerStyle }}>
      {label && <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-secondary)',
              pointerEvents: 'none'
            }} 
          />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`year-selector ${className}`}
          style={{
            width: '100%',
            paddingLeft: Icon ? '40px' : '12px',
            borderColor: error ? 'var(--accent-red)' : undefined,
            height: '42px',
            appearance: 'none',
            ...style
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Freccia personalizzata per il select */}
        <div style={{ 
          position: 'absolute', 
          right: '12px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          pointerEvents: 'none',
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '5px solid var(--text-secondary)',
          opacity: 0.5
        }}></div>
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>{error}</span>}
    </div>
  );
}
