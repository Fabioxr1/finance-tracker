import { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Car, 
  Settings,
  PieChart,
  ListOrdered,
  Database,
  Menu,
  X,
  CalendarClock,
  Repeat,
  Tag,
  BarChart3,
  CalendarRange
} from 'lucide-react';
import './index.css';
import DashboardView from './components/DashboardView';
import AccountsView from './components/AccountsView';
import TransactionsView from './components/TransactionsView';
import InvestmentsView from './components/InvestmentsView';
import ConfigView from './components/ConfigView';
import InstallmentsView from './components/InstallmentsView';
import SqlConsoleView from './components/SqlConsoleView';
import DeadlinesView from './components/DeadlinesView';
import SubscriptionsView from './components/SubscriptionsView';
import TagsView from './components/TagsView';
import TagStats from './components/TagStats';
import MonthlyAnalysisView from './components/MonthlyAnalysisView';
import AppFooter from './components/common/AppFooter';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    closeSidebar();
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="sidebar-logo">
          <PieChart color="#2f81f7" />
          <span>Finance Tracker</span>
        </div>
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo desktop-only">
          <PieChart color="#2f81f7" />
          <span>Finance Tracker</span>
        </div>
        
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div className={`nav-item ${activeTab === 'analisi-mensile' ? 'active' : ''}`} onClick={() => handleTabChange('analisi-mensile')}>
            <CalendarRange size={20} /> Analisi Mensile
          </div>
          <div className={`nav-item ${activeTab === 'conti' ? 'active' : ''}`} onClick={() => handleTabChange('conti')}>
            <Wallet size={20} /> Conti & Carte
          </div>
          <div className={`nav-item ${activeTab === 'transazioni' ? 'active' : ''}`} onClick={() => handleTabChange('transazioni')}>
            <ListOrdered size={20} /> Transazioni
          </div>
          <div className={`nav-item ${activeTab === 'scadenze' ? 'active' : ''}`} onClick={() => handleTabChange('scadenze')}>
            <CalendarClock size={20} /> Scadenze
          </div>
          <div className={`nav-item ${activeTab === 'abbonamenti' ? 'active' : ''}`} onClick={() => handleTabChange('abbonamenti')}>
            <Repeat size={20} /> Abbonamenti
          </div>
          <div className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => handleTabChange('tags')}>
            <Tag size={20} /> Gestione Tag
          </div>
          <div className={`nav-item ${activeTab === 'analisi-tag' ? 'active' : ''}`} onClick={() => handleTabChange('analisi-tag')}>
            <BarChart3 size={20} /> Analisi Tag
          </div>
          <div className={`nav-item ${activeTab === 'investimenti' ? 'active' : ''}`} onClick={() => handleTabChange('investimenti')}>
            <TrendingUp size={20} /> Investimenti
          </div>
          <div className={`nav-item ${activeTab === 'rate' ? 'active' : ''}`} onClick={() => handleTabChange('rate')}>
            <Car size={20} /> Rate & Finanziamenti
          </div>
          <div className={`nav-item ${activeTab === 'console' ? 'active' : ''}`} onClick={() => handleTabChange('console')}>
            <Database size={20} /> Console SQL
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div className={`nav-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => handleTabChange('config')}>
              <Settings size={20} /> Configurazione
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'analisi-mensile' && <MonthlyAnalysisView />}
        {activeTab === 'conti' && <AccountsView />}
        {activeTab === 'transazioni' && <TransactionsView />}
        {activeTab === 'scadenze' && <DeadlinesView />}
        {activeTab === 'investimenti' && <InvestmentsView />}
        {activeTab === 'rate' && <InstallmentsView />}
        {activeTab === 'abbonamenti' && <SubscriptionsView />}
        {activeTab === 'tags' && <TagsView />}
        {activeTab === 'analisi-tag' && <TagStats />}
        {activeTab === 'console' && <SqlConsoleView />}
        {activeTab === 'config' && <ConfigView />}
        
        <AppFooter />
      </main>
    </div>
  );
}

export default App;
