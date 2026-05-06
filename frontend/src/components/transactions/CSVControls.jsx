import { Download, Upload, DownloadCloud } from 'lucide-react';
import '../../index.css';

export default function CSVControls({ onImportClick, onExportClick, fileInputRef, onFileChange }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <a 
        href="/modello_transazioni.csv" 
        className="btn-outline" 
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85em' }}
        download
      >
        <Download size={16} /> Modello CSV
      </a>

      <button 
        onClick={onExportClick}
        className="btn-outline" 
        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85em' }}
      >
        <DownloadCloud size={16} /> Esporta CSV
      </button>

      <button 
        onClick={onImportClick}
        className="btn-primary" 
        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85em' }}
      >
        <Upload size={16} /> Importa CSV
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        style={{ display: 'none' }} 
        accept=".csv" 
      />
    </div>
  );
}
