export default function InstallmentTagSelector({ formData, availableTags = [], onToggleTag }) {
  return (
    <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
      <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
        Tag Predefiniti (verranno applicati a ogni rata):
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {availableTags.map(tag => {
          const isSelected = formData.tags?.includes(tag.id);
          return (
            <span 
              key={tag.id}
              onClick={() => onToggleTag(tag.id)}
              title={tag.description}
              style={{
                padding: '5px 12px',
                borderRadius: '15px',
                fontSize: '0.75em',
                cursor: 'pointer',
                border: `1px solid ${tag.color}`,
                background: isSelected ? tag.color : 'transparent',
                color: isSelected ? 'white' : tag.color,
                transition: 'all 0.2s',
                fontWeight: '600',
                opacity: isSelected ? 1 : 0.6
              }}
            >
              #{tag.name}
            </span>
          );
        })}
        {availableTags.length === 0 && (
          <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Nessun tag disponibile.
          </span>
        )}
      </div>
    </div>
  );
}
