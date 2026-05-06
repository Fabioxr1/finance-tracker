export default function TransactionPagination({ pagination, setPage }) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
        Pagina {pagination.page} di {pagination.totalPages} ({pagination.total} transazioni totali)
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setPage(Math.max(1, pagination.page - 1))}
          disabled={pagination.page === 1}
          className="year-selector"
          style={{ cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1 }}
        >
          Precedente
        </button>
        <button 
          onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}
          disabled={pagination.page === pagination.totalPages}
          className="year-selector"
          style={{ cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.totalPages ? 0.5 : 1 }}
        >
          Successiva
        </button>
      </div>
    </div>
  );
}
