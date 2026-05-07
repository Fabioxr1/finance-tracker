import { useState, useEffect } from 'react';
import { Shield, ToggleLeft, ToggleRight, Wallet, TrendingDown, Clock, Activity, RotateCcw } from 'lucide-react';
import PageHeader from './common/PageHeader';
import ActionCard from './common/ActionCard';
import AppButton from './common/AppButton';

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
    <section className="card" style={{ padding: '24px', marginBottom: '30px' }}>
      <PageHeader 
        title="Simulatore di Autonomia Finanziaria"
        icon={Shield}
        description="Basato sulle spese medie degli ultimi 6 mesi. Escludi i tag per simulare scenari di risparmio."
        style={{ marginBottom: '24px' }}
      />

      {/* Hero Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <ActionCard 
          title="Liquidità Attuale"
          icon={Wallet}
          accentColor="var(--accent-blue)"
          amount={`€ ${data.currentBalance.toLocaleString('it-IT')}`}
          style={{ marginBottom: 0 }}
        />
        <ActionCard 
          title="Spesa Media / Mese"
          icon={TrendingDown}
          accentColor="var(--accent-red)"
          amount={`€ ${Math.round(adjustedMonthly).toLocaleString('it-IT')}`}
          subtitle={savedPerMonth > 0 ? `-€ ${Math.round(savedPerMonth).toLocaleString('it-IT')} risparmiati` : undefined}
          style={{ marginBottom: 0 }}
        />
        <ActionCard 
          title="Mesi di Autonomia"
          icon={Clock}
          accentColor={runwayColor}
          amount={`${adjustedRunway.toFixed(1)} mesi`}
          subtitle={gainedMonths > 0.1 ? `+${gainedMonths.toFixed(1)} mesi guadagnati` : undefined}
          style={{ marginBottom: 0 }}
        />
        <ActionCard 
          title="Scenario Base"
          icon={Activity}
          accentColor="var(--text-secondary)"
          amount={`${baseRunway.toFixed(1)} mesi`}
          subtitle="Con tutte le spese"
          style={{ marginBottom: 0 }}
        />
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
          <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>
            Disattiva spese per simulare
          </h4>
          {excludedTags.length > 0 && (
            <AppButton 
              variant="danger" 
              onClick={() => setExcludedTags([])} 
              icon={RotateCcw}
              style={{ padding: '4px 12px', fontSize: '11px' }}
            >
              Ripristina tutto
            </AppButton>
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
