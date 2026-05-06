import { useState, useEffect } from 'react';
import { Plus, ArrowRight, Settings } from 'lucide-react';

// Componenti Rate
import InstallmentStats from './installments/InstallmentStats';
import InstallmentCard from './installments/InstallmentCard';
import InstallmentForm from './installments/InstallmentForm';
import InstallmentPayModal from './installments/InstallmentPayModal';

import '../index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function InstallmentsView() {
  const [installments, setInstallments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInst, setSelectedInst] = useState(null);
  
  const [newInst, setNewInst] = useState({
    name: '',
    description: '',
    total_amount: '',
    monthly_amount: '',
    total_installments: 0,
    paid_installments: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    account_id: '',
    search_keyword: '',
    tags: []
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category_id: ''
  });

  const fetchData = async () => {
    try {
      const [instRes, accRes, catRes, tagRes] = await Promise.all([
        fetch(`${API_URL}/installments`).then(r => r.json()),
        fetch(`${API_URL}/accounts`).then(r => r.json()),
        fetch(`${API_URL}/categories`).then(r => r.json()),
        fetch(`${API_URL}/tags`).then(r => r.json())
      ]);
      setInstallments(instRes);
      setAccounts(accRes);
      setAvailableTags(tagRes);
      const expenseCats = catRes.filter(c => c.type === 'expense');
      setCategories(expenseCats);
      
      if (accRes.length > 0 && !newInst.account_id) {
        setNewInst(prev => ({ ...prev, account_id: accRes[0].id }));
      }
      
      if (expenseCats.length > 0) {
        setPaymentData(prev => ({ ...prev, category_id: expenseCats[0].id }));
      }
    } catch (err) {
      console.error("Errore caricamento:", err);
    }
  };

  const calculateInstallments = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
    return Math.max(0, months);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addInstallment = async (e) => {
    e.preventDefault();
    try {
      const finalInst = {
        ...newInst,
        total_installments: calculateInstallments(newInst.start_date, newInst.end_date)
      };
      const res = await fetch(`${API_URL}/installments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalInst)
      });
      if (!res.ok) throw new Error("Errore aggiunta finanziamento");
      setShowAddModal(false);
      resetNewInst();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateInstallment = async (e) => {
    e.preventDefault();
    try {
      const finalInst = {
        ...selectedInst,
        total_installments: calculateInstallments(selectedInst.start_date, selectedInst.end_date)
      };
      const res = await fetch(`${API_URL}/installments/${selectedInst.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalInst)
      });
      if (!res.ok) throw new Error("Errore aggiornamento finanziamento");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteInstallment = async (id) => {
    if (!window.confirm("Vuoi eliminare questo finanziamento?")) return;
    try {
      const res = await fetch(`${API_URL}/installments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Errore eliminazione finanziamento");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openPayModal = (inst) => {
    setSelectedInst(inst);
    setPaymentData({
      ...paymentData,
      amount: inst.monthly_amount,
      date: new Date().toISOString().split('T')[0],
      description: `Rata ${inst.name}`
    });
    setShowPayModal(true);
  };

  const openEditModal = (inst) => {
    setSelectedInst({
      ...inst,
      start_date: inst.start_date ? new Date(inst.start_date).toISOString().split('T')[0] : '',
      end_date: inst.end_date ? new Date(inst.end_date).toISOString().split('T')[0] : '',
      tags: inst.tags || []
    });
    setShowEditModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/installments/${selectedInst.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (!res.ok) throw new Error("Errore pagamento rata");
      setShowPayModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetNewInst = () => {
    setNewInst({
      name: '',
      description: '',
      total_amount: '',
      monthly_amount: '',
      total_installments: 0,
      paid_installments: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      account_id: accounts.length > 0 ? accounts[0].id : '',
      search_keyword: '',
      tags: []
    });
  };

  const toggleTag = (tagId, isEditing = false) => {
    const setter = isEditing ? setSelectedInst : setNewInst;
    
    setter(prev => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tagId)
        ? currentTags.filter(id => id !== tagId)
        : [...currentTags, tagId];
      return { ...prev, tags: newTags };
    });
  };

  const totalResidual = installments.reduce((acc, curr) => acc + Number(curr.remainingAmount), 0);
  const totalMonthly = installments.reduce((acc, curr) => acc + Number(curr.monthly_amount), 0);
  const freedomDate = installments.length > 0 
    ? installments.reduce((max, curr) => curr.estimatedEndDate > max ? curr.estimatedEndDate : max, installments[0].estimatedEndDate)
    : null;

  const monthsLabels = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'];
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="investments-container">
      {/* PAGE HEADER */}
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Rate & Finanziamenti</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Gestione debiti e scadenze mensili</p>
        </div>
        <button className="add-title-btn" onClick={() => setShowAddModal(true)} style={{ padding: '12px 24px', fontSize: '1em' }}>
          <Plus size={20} /> Nuovo Finanziamento
        </button>
      </div>

      {/* RIEPILOGO STATISTICHE */}
      <InstallmentStats 
        totalDebt={totalResidual} 
        monthlyCommitment={totalMonthly} 
        activeCount={installments.length} 
        freedomDate={freedomDate}
      />

      {/* LISTA FINANZIAMENTI */}
      <div className="card" style={{ padding: '30px', background: 'var(--bg-card)' }}>
        <h3 className="card-title" style={{ fontSize: '1.4em', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowRight size={24} color="var(--accent-blue)" /> I tuoi Finanziamenti Attivi
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
          {installments.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1', padding: '60px', border: '2px dashed var(--border-color)', borderRadius: '15px' }}>
              <Settings size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
              <p style={{ fontSize: '1.2em' }}>Nessun finanziamento registrato.</p>
              <button onClick={() => setShowAddModal(true)} style={{ color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: '10px' }}>Aggiungine uno ora</button>
            </div>
          ) : (
            installments.map(inst => (
              <InstallmentCard 
                key={inst.id} 
                inst={inst} 
                onPay={openPayModal} 
                onEdit={openEditModal} 
                onDelete={deleteInstallment}
                monthsLabels={monthsLabels}
                currentMonth={currentMonth}
              />
            ))
          )}
        </div>
      </div>

      {/* MODALI */}
      {showAddModal && (
        <InstallmentForm 
          formData={newInst} 
          onChange={setNewInst} 
          onSubmit={addInstallment} 
          onCancel={() => setShowAddModal(false)} 
          accounts={accounts}
          availableTags={availableTags}
          onToggleTag={(id) => toggleTag(id, false)}
        />
      )}

      {showEditModal && (
        <InstallmentForm 
          formData={selectedInst} 
          onChange={setSelectedInst} 
          onSubmit={updateInstallment} 
          onCancel={() => setShowEditModal(false)} 
          isEditing 
          accounts={accounts}
          availableTags={availableTags}
          onToggleTag={(id) => toggleTag(id, true)}
        />
      )}

      {showPayModal && (
        <InstallmentPayModal 
          selectedInst={selectedInst} 
          paymentData={paymentData} 
          categories={categories} 
          onPayment={handlePayment} 
          onClose={() => setShowPayModal(false)}
          setPaymentData={setPaymentData}
        />
      )}
    </div>
  );
}
