import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * FormInput Component
 * Standardized input with icon support and debouncing.
 */
export default function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon: Icon,
  debounceMs = 0,
  onClear,
  error,
  style = {},
  className = '',
  containerStyle = {},
  ...props
}) {
  const [localValue, setLocalValue] = useState(value || '');

  // Gestione Debouncing
  useEffect(() => {
    if (debounceMs > 0) {
      const handler = setTimeout(() => {
        if (localValue !== value) {
          onChange(localValue);
        }
      }, debounceMs);
      return () => clearTimeout(handler);
    }
  }, [localValue, debounceMs]);

  // Sincronizzazione se il valore cambia esternamente
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    if (debounceMs === 0) {
      onChange(newVal);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    if (onClear) onClear();
  };

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
        <input
          type={type}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`text-input ${className}`}
          style={{
            width: '100%',
            paddingLeft: Icon ? '40px' : '12px',
            paddingRight: onClear ? '40px' : '12px',
            borderColor: error ? 'var(--accent-red)' : undefined,
            height: '42px',
            ...style
          }}
          {...props}
        />
        {onClear && localValue && (
          <X
            size={16}
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          />
        )}
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>{error}</span>}
    </div>
  );
}
