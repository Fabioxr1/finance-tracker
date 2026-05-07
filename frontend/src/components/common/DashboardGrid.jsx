/**
 * Componente contenitore standard per la griglia della dashboard.
 * Utilizza le impostazioni CSS globali (.dashboard-grid).
 */
export default function DashboardGrid({ 
  children, 
  className = '', 
  isFullWidth = false,
  style = {} 
}) {
  const combinedStyle = {
    ...(isFullWidth ? { gridTemplateColumns: '1fr' } : {}),
    ...style
  };

  return (
    <div className={`dashboard-grid ${className}`} style={combinedStyle}>
      {children}
    </div>
  );
}
