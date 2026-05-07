/**
 * Componente comune per le griglie della dashboard.
 * Gestisce il layout responsive grid-template-columns in base alla larghezza minima specificata.
 */
export default function DashboardGrid({ 
  children, 
  minWidth = '250px', 
  className = '', 
  style = {},
  gap = '20px',
  marginBottom = '30px'
}) {
  const combinedStyle = {
    display: 'grid',
    gap,
    marginBottom,
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
    ...style
  };

  return (
    <div 
      className={`dashboard-grid ${className}`} 
      style={combinedStyle}
    >
      {children}
    </div>
  );
}
