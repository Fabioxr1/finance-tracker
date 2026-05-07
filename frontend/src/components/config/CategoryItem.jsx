import React, { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import AppButton from '../common/AppButton';

export default function CategoryItem({ category, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCat, setEditedCat] = useState({ ...category });

  const handleSave = async () => {
    if (!editedCat.name) return;
    const success = await onUpdate(category.id, editedCat);
    if (success) setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCat({ ...category });
    setIsEditing(false);
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 16px', 
        background: isEditing ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-hover)', 
        borderRadius: '12px',
        border: `1px solid ${isEditing ? 'var(--accent-blue)' : 'transparent'}`,
        transition: 'all 0.2s ease',
        marginBottom: '8px'
      }}
    >
      {isEditing ? (
        <div style={{ display: 'flex', gap: '10px', flex: 1, alignItems: 'center' }}>
          <FormSelect 
            value={editedCat.type}
            onChange={(val) => setEditedCat({ ...editedCat, type: val })}
            options={[
              { value: 'expense', label: 'Spesa' },
              { value: 'income', label: 'Entrata' }
            ]}
            style={{ width: '120px' }}
          />
          <FormInput 
            value={editedCat.name}
            onChange={(val) => setEditedCat({ ...editedCat, name: val })}
            placeholder="Nome categoria"
            containerStyle={{ flex: 1 }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <AppButton variant="success" onClick={handleSave} icon={Check} style={{ padding: '8px' }} />
            <AppButton variant="outline" onClick={handleCancel} icon={X} style={{ padding: '8px' }} />
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: category.type === 'expense' ? 'var(--accent-red)' : 'var(--accent-green)' 
              }} 
            />
            <span style={{ fontWeight: '500' }}>{category.name}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Modifica"
            >
               <Edit2 size={16} />
            </button>
            <button 
              onClick={() => onDelete(category.id)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Elimina"
            >
               <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
