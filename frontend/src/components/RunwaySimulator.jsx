import { useState, useEffect } from 'react';
import { Shield, ToggleLeft, ToggleRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function RunwaySimulator() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [excludedTags, setExcludedTags] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/tag-stats/runway`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  const toggleTag = (tagId) => {
    setExcludedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  // Calcolo: quanto risparmio escludendo i tag selezionati
  const savedPerMonth = data.tags
    .filter(t => excludedTags.includes(t.id))
    .reduce((sum, t) => sum + t.avgMonthly, 0);

  const adjustedMonthly = Math.max(data.avgMonthlyTotal - savedPerMonth, 1);
  const adjustedRunway = data.currentBalance / adjustedMonthly;
  const baseRunway = data.baselineRunway;
  const gainedMonths = adjustedRunway - baseRunway;

  // Colore indicatore
  const runwayColor = adjustedRunway >= 12 ? '#34d399' : adjustedRunway >= 6 ? '#fbbf24' : '#fb7185';

  const styles = {
    section: {
      marginTop: '30px',
      marginBottom: '30px',
      padding: '28px',
      borderRadius: '20px',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.4)',
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
    },
    title: {
      display: 'flex', alignItems: 'center', gap: '10px',
      fontSize: '1.1em', fontWeight: '700', color: 'white', margin: 0
    },
    heroGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px', marginBottom: '28px'
    },
    heroCard: (bg) => ({
      padding: '20px', borderRadius: '16px',
      background: bg, border: '1px solid rgba(255,255,255,0.06)'
    }),
    heroLabel: {
      fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
      color: '#94a3b8', fontWeight: '700', marginBottom: '6px'
    },
    heroValue: (color) => ({
      fontSize: '28px', fontWeight: '900', color: color || 'white', margin: 0
    }),
    tagRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px', borderRadius: '12px', marginBottom: '6px',
      transition: 'all 0.2s ease', cursor: 'pointer'
    },
    tagLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    tagDot: (color) => ({
      width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color
    }),
    tagName: { fontWeight: '600', fontSize: '13px' },
    tagRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    tagAmount: { fontSize: '13px', fontWeight: '700', color: '#fb7185' },
    barContainer: {
      marginTop: '24px', padding: '20px', borderRadius: '16px',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
    }
  };

  // Barra visiva mesi
  const maxMonths = Math.max(adjustedRunway, 24);
  const barWidth = Math.min((adjustedRunway / maxMonths) * 100, 100);
  const baseBarWidth = Math.min((baseRunway / maxMonths) * 100, 100);

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <Shield size={22} color={runwayColor} />
          Simulatore di Autonomia Finanziaria
        </h3>
        <span style={{ fontSize: '11px', color: '#64748b' }}>
          Basato sulle spese medie degli ultimi 6 mesi
        </span>
      </div>

      {/* Hero Cards */}
      <div style={styles.heroGrid}>
        <div style={styles.heroCard('linear-gradient(135deg, #1e293b, #0f172a)')}>
          <p style={styles.heroLabel}>Liquidità Attuale</p>
          <p style={styles.heroValue('white')}>
            € {data.currentBalance.toLocaleString('it-IT')}
          </p>
        </div>
        <div style={styles.heroCard('linear-gradient(135deg, #1e293b, #0f172a)')}>
          <p style={styles.heroLabel}>Spesa Media / Mese</p>
          <p style={styles.heroValue('#fb7185')}>
            € {Math.round(adjustedMonthly).toLocaleString('it-IT')}
          </p>
          {savedPerMonth > 0 && (
            <p style={{ fontSize: '10px', color: '#34d399', margin: '4px 0 0' }}>
              -€ {Math.round(savedPerMonth).toLocaleString('it-IT')} risparmiati
            </p>
          )}
        </div>
        <div style={styles.heroCard(`linear-gradient(135deg, ${runwayColor}15, ${runwayColor}05)`)}>
          <p style={styles.heroLabel}>Mesi di Autonomia</p>
          <p style={styles.heroValue(runwayColor)}>
            {adjustedRunway.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>mesi</span>
          </p>
          {gainedMonths > 0.1 && (
            <p style={{ fontSize: '10px', color: '#34d399', margin: '4px 0 0' }}>
              +{gainedMonths.toFixed(1)} mesi guadagnati
            </p>
          )}
        </div>
        <div style={styles.heroCard('linear-gradient(135deg, #1e293b, #0f172a)')}>
          <p style={styles.heroLabel}>Scenario Base</p>
          <p style={styles.heroValue('#94a3b8')}>
            {baseRunway.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>mesi</span>
          </p>
          <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0' }}>
            Con tutte le spese
          </p>
        </div>
      </div>

      {/* Barra Visiva */}
      <div style={styles.barContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>AUTONOMIA</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {adjustedRunway >= 12 ? '✅ Oltre 1 anno' : adjustedRunway >= 6 ? '⚠️ 6+ mesi' : '🚨 Meno di 6 mesi'}
          </span>
        </div>
        <div style={{ position: 'relative', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Barra base (grigia) */}
          <div style={{
            position: 'absolute', height: '100%', width: `${baseBarWidth}%`,
            background: 'rgba(148,163,184,0.15)', borderRadius: '10px', transition: 'width 0.5s ease'
          }} />
          {/* Barra attuale */}
          <div style={{
            position: 'absolute', height: '100%', width: `${barWidth}%`,
            background: `linear-gradient(90deg, ${runwayColor}88, ${runwayColor})`,
            borderRadius: '10px', transition: 'width 0.5s ease',
            boxShadow: `0 0 15px ${runwayColor}44`
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '10px', color: '#475569' }}>0</span>
          <span style={{ fontSize: '10px', color: '#475569' }}>{Math.ceil(maxMonths)} mesi</span>
        </div>
      </div>

      {/* Lista Tag con Toggle */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Disattiva spese per simulare
          </h4>
          {excludedTags.length > 0 && (
            <button
              onClick={() => setExcludedTags([])}
              style={{
                background: 'rgba(251,113,133,0.1)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.2)',
                padding: '4px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: '600'
              }}
            >
              Ripristina tutto
            </button>
          )}
        </div>

        {data.tags.map(tag => {
          const isExcluded = excludedTags.includes(tag.id);
          return (
            <div
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              style={{
                ...styles.tagRow,
                background: isExcluded ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isExcluded ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)'}`,
                opacity: isExcluded ? 0.7 : 1
              }}
            >
              <div style={styles.tagLeft}>
                {isExcluded
                  ? <ToggleRight size={22} color="#34d399" />
                  : <ToggleLeft size={22} color="#475569" />
                }
                <div style={styles.tagDot(tag.color)} />
                <span style={{
                  ...styles.tagName,
                  color: isExcluded ? '#64748b' : 'white',
                  textDecoration: isExcluded ? 'line-through' : 'none'
                }}>
                  #{tag.name}
                </span>
                {tag.description && (
                  <span style={{ fontSize: '11px', color: '#475569' }}>
                    {tag.description}
                  </span>
                )}
              </div>
              <div style={styles.tagRight}>
                <span style={{
                  ...styles.tagAmount,
                  color: isExcluded ? '#34d399' : '#fb7185'
                }}>
                  {isExcluded ? '✓ Escluso' : `€ ${Math.round(tag.avgMonthly).toLocaleString('it-IT')}/mese`}
                </span>
              </div>
            </div>
          );
        })}

        {data.tags.length === 0 && (
          <p style={{ textAlign: 'center', color: '#475569', padding: '30px', fontSize: '14px' }}>
            Nessun tag con spese negli ultimi 6 mesi.
          </p>
        )}
      </div>
    </section>
  );
}
