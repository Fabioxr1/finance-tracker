import React from 'react';

/**
 * ActionCard - Componente card universale per il progetto.
 * Gestisce sia card statistiche che card operative con pulsanti.
 */
export default function ActionCard({
  title,
  subtitle,
  icon: Icon,
  amount,
  amountClassName = '',
  amountLabel = '',
  accentColor,
  accentSide = 'top', // 'top' o 'left'
  isActive = true,
  actions,
  children,
  className = '',
  onClick,
  style = {},
  iconStyle = {},
  amountStyle = {}
}) {
  const cardStyles = {
    ...style,
    ...(accentColor ? { 
      [accentSide === 'top' ? 'borderTop' : 'borderLeft']: `4px solid ${accentColor}` 
    } : {}),
    opacity: isActive ? 1 : 0.7,
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative'
  };

  return (
    <div 
      className={`card ${!isActive ? 'inactive' : ''} ${className}`} 
      style={cardStyles}
      onClick={onClick}
    >
      <div className="card-header" style={{ marginBottom: (amount || children) ? '15px' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {Icon && (
            <div style={{ 
              background: accentColor ? `${accentColor}15` : 'rgba(255,255,255,0.05)', 
              padding: '8px', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={20} color={accentColor || 'var(--text-secondary)'} style={iconStyle} />
            </div>
          )}
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
            {subtitle && <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>{subtitle}</p>}
          </div>
        </div>
      </div>

      {amount !== undefined && (
        <div style={{ marginBottom: children ? '15px' : 0 }}>
          <div className={`card-value ${amountClassName}`} style={{ fontSize: '1.6rem', ...amountStyle }}>
            {amount}
          </div>
          {amountLabel && <div className="card-subtitle">{amountLabel}</div>}
        </div>
      )}

      {children && (
        <div className="card-body" style={{ flex: 1 }}>
          {children}
        </div>
      )}

      {actions && (
        <div className="card-footer" style={{ 
          marginTop: 'auto', 
          paddingTop: '15px', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {actions}
        </div>
      )}
    </div>
  );
}
