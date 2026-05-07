import React from 'react';

/**
 * AppButton Component
 * Standardized button with various styles.
 */
export default function AppButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon: Icon, 
  disabled = false, 
  loading = false,
  className = '',
  style = {},
  title = '',
  type = 'button'
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--accent-blue)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(47, 129, 247, 0.2)'
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)'
        };
      case 'danger':
        return {
          background: 'rgba(248, 81, 73, 0.1)',
          color: 'var(--accent-red)',
          border: '1px solid rgba(248, 81, 73, 0.2)'
        };
      case 'success':
        return {
          background: 'rgba(63, 185, 80, 0.1)',
          color: 'var(--accent-green)',
          border: '1px solid rgba(63, 185, 80, 0.2)'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: 'none'
        };
      default:
        return {};
    }
  };

  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled || loading ? 0.6 : 1,
    ...getVariantStyles(),
    ...style
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`app-button ${variant} ${className}`}
      style={baseStyles}
      title={title}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.filter = 'brightness(1.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.filter = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {loading ? (
        <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
      ) : (
        Icon && <Icon size={18} />
      )}
      {children}
    </button>
  );
}
