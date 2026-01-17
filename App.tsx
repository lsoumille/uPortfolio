
import React, { useState, useEffect } from 'react';
import { 
  ClientProfile, 
  LifeGoal, 
  CurrentAsset, 
  Debt,
  RiskProfile, 
  AnalysisResponse 
} from './types';
import { generatePortfolios } from './services/geminiService';
import { PortfolioCard } from './components/PortfolioCard';

const PREDEFINED_GOALS = [
  { title: "Retraite sereine", horizon: 25, targetAmount: 500000, icon: "👴" },
  { title: "Achat Résidence Principale", horizon: 5, targetAmount: 150000, icon: "🏠" },
  { title: "Études des enfants", horizon: 15, targetAmount: 80000, icon: "🎓" },
  { title: "Épargne de précaution", horizon: 0, targetAmount: 30000, icon: "🛡️" },
  { title: "Investissement Locatif", horizon: 8, targetAmount: 100000, icon: "🏢" },
  { title: "Tour du monde", horizon: 3, targetAmount: 50000, icon: "🌍" },
];

const RISK_LEVELS = [
  { 
    score: 2, 
    label: 'Prudent', 
    icon: '🛡️', 
    color: 'emerald',
    description: "Protection du capital avant tout. Idéal pour des projets à court terme ou une aversion forte à la perte.",
    implication: "Rendement visé : 2-4% / Volatilité faible"
  },
  { 
    score: 5, 
    label: 'Equilibré', 
    icon: '⚖️', 
    color: 'brand-gold',
    description: "Le juste milieu entre sécurité et croissance. Accepte des fluctuations modérées pour une performance durable.",
    implication: "Rendement visé : 5-7% / Volatilité moyenne"
  },
  { 
    score: 9, 
    label: 'Dynamique', 
    icon: '🚀', 
    color: 'brand-navy',
    description: "Recherche de performance maximale. Accepte des pertes latentes importantes pour un potentiel de gain élevé.",
    implication: "Rendement visé : 8%+ / Volatilité élevée"
  }
];

const LOADING_MESSAGES = [
  "Analyse de votre patrimoine net...",
  "Calcul des projections actuarielles à 10 ans...",
  "Sélection des meilleures enveloppes fiscales (PEA, PER, AV)...",
  "Optimisation de l'allocation d'actifs par l'IA...",
  "Vérification de la faisabilité de vos projets de vie...",
  "Finalisation de votre audit personnalisé..."
];

const App: React.FC = () => {
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  
  const [profile, setProfile] = useState<ClientProfile>({
    firstName: '', age: 40, profession: '', taxBracket: 30, monthlyIncome: 5000, monthlySavings: 1000
  });
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [assets, setAssets] = useState<CurrentAsset[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [risk, setRisk] = useState<RiskProfile>({ score: 5, label: 'Equilibré', description: '' });
  
  const [results, setResults] = useState<AnalysisResponse | null>(null);

  // Cycle through loading messages
  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAddGoal = (template?: typeof PREDEFINED_GOALS[0]) => {
    setGoals([...goals, { 
      id: Date.now().toString(), 
      title: template?.title || '', 
      horizon: template?.horizon || 10, 
      targetAmount: template?.targetAmount || 100000 
    }]);
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleAddAsset = () => {
    setAssets([...assets, { id: Date.now().toString(), type: 'Obligations / Fonds Euros', value: 0, description: '' }]);
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleAddDebt = () => {
    setDebts([...debts, { id: Date.now().toString(), type: 'Immobilier', remainingCapital: 0, monthlyPayment: 0, interestRate: 1.5 }]);
  };

  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setStep(5);
    try {
      const data = await generatePortfolios(profile, goals, assets, debts, risk);
      setResults(data);
      // Trouve l'index du portefeuille le plus proche du profil choisi
      const mainIdx = data.portfolios.findIndex(p => p.name.toLowerCase().includes(risk.label.toLowerCase()));
      setActiveTab(mainIdx !== -1 ? mainIdx : 1);
    } catch (err) {
      console.error(err);
      alert("Une erreur technique est survenue. L'IA a peut-être pris trop de temps. Veuillez réessayer.");
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = (id: string, field: keyof LifeGoal, val: any) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: val } : g));
  };

  const updateAsset = (id: string, field: keyof CurrentAsset, val: any) => {
    setAssets(assets.map(a => a.id === id ? { ...a, [field]: val } : a));
  };

  const updateDebt = (id: string, field: keyof Debt, val: any) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: val } : d));
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-navy selection:bg-brand-gold/20 flex flex-col">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-brand-gold/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-12 h-12 navy-gradient rounded-xl flex items-center justify-center text-brand-gold font-serif text-2xl font-bold shadow-xl shadow-brand-navy/10 transition-transform group-hover:scale-105 border border-brand-gold/20">uP</div>
            <div>
              <span className="text-2xl font-serif font-black text-brand-navy tracking-tight">uPortfolio</span>
              <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] -mt-1">by L'Ingé Patrimoine</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full border border-brand-navy/5">
              <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Ingénierie IA Cognitive</span>
            </div>
            <div className="flex items-center gap-4 pl-8 border-l border-brand-gold/20">
              <div className="text-right">
                <p className="text-xs font-black text-brand-navy">Cabinet L'Ingé Patrimoine</p>
                <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider">Expert Conseil</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-brand-gold border-2 border-brand-gold/20 font-bold">IP</div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col">
        {step < 5 && (
          <div className="max-w-4xl mx-auto w-full">
            {/* Elegant Stepper */}
            <div className="relative mb-24 px-4">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[85%] h-[1px] bg-brand-gold/20 -z-0"></div>
              <div 
                className="absolute top-6 left-[7.5%] h-[1px] bg-brand-gold -z-0 transition-all duration-1000 ease-in-out shadow-[0_0_8px_rgba(197,160,89,0.5)]"
                style={{ width: `${step * 21.25}%` }}
              ></div>
              
              <div className="flex justify-between items-start relative z-10">
                {['Profil', 'Objectifs', 'Actifs', 'Passif', 'Risque'].map((label, s) => (
                  <div key={s} className="flex flex-col items-center gap-5 group flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border ${
                      step === s ? 'bg-brand-navy text-brand-gold shadow-2xl shadow-brand-navy/20 scale-125 border-brand-gold/30' : 
                      step > s ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/10 border-transparent' : 'bg-white text-slate-300 border-slate-100 group-hover:border-brand-gold/30'
                    }`}>
                      {step > s ? '✓' : s + 1}
                    </div>
                    <div className="text-center">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 block ${step === s ? 'text-brand-navy font-black' : 'text-slate-400 font-bold'}`}>
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl shadow-brand-navy/5 p-12 border border-brand-gold/10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl"></div>
              
              {step === 0 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <header>
                    <h2 className="text-4xl font-serif font-black text-brand-navy tracking-tight">Audit d'Identité</h2>
                    <p className="text-slate-500 mt-3 font-medium text-lg italic">Bases fondamentales de votre structure patrimoniale.</p>
                  </header>
                  <div className="grid grid-cols-1 gap-8 pt-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Prénom de l'investisseur</label>
                      <input className="w-full px-6 py-5 rounded-2xl border border-brand-gold/10 bg-brand-cream/30 font-medium transition-all text-xl focus:bg-white focus:ring-4 focus:ring-brand-gold/5 outline-none" 
                        placeholder="Ex: Jean-Baptiste" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Âge actuel</label>
                      <input type="number" className="w-full px-6 py-5 rounded-2xl border border-brand-gold/10 bg-brand-cream/30 font-bold transition-all text-xl focus:bg-white outline-none" 
                        value={profile.age} onChange={e => setProfile({...profile, age: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Tranche d'Imposition (TMI)</label>
                      <select className="w-full px-6 py-5 rounded-2xl border border-brand-gold/10 bg-brand-cream/30 font-bold transition-all appearance-none cursor-pointer text-xl focus:bg-white outline-none" 
                        value={profile.taxBracket} onChange={e => setProfile({...profile, taxBracket: parseInt(e.target.value)})}>
                        <option value={0}>Non imposable (0%)</option>
                        <option value={11}>Tranche 11%</option>
                        <option value={30}>Tranche 30%</option>
                        <option value={41}>Tranche 41%</option>
                        <option value={45}>Tranche 45%</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Activité Professionnelle</label>
                      <input className="w-full px-6 py-5 rounded-2xl border border-brand-gold/10 bg-brand-cream/30 font-medium transition-all text-xl focus:bg-white outline-none" 
                        placeholder="Ex: Ingénieur, Chef d'entreprise" value={profile.profession} onChange={e => setProfile({...profile, profession: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Revenus Disponibles (€/mois)</label>
                      <div className="relative">
                        <input type="number" className="w-full px-6 py-5 pr-14 rounded-2xl border border-brand-gold/10 bg-brand-cream/30 font-black transition-all text-2xl focus:bg-white text-brand-navy outline-none" 
                          value={profile.monthlyIncome} onChange={e => setProfile({...profile, monthlyIncome: parseInt(e.target.value)})} />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-gold font-bold">€</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Effort d'Épargne Ciblé (€/mois)</label>
                      <div className="relative">
                        <input type="number" className="w-full px-6 py-5 pr-14 rounded-2xl border border-brand-gold/10 bg-brand-cream/30 font-black transition-all text-2xl focus:bg-white text-brand-gold outline-none" 
                          value={profile.monthlySavings} onChange={e => setProfile({...profile, monthlySavings: parseInt(e.target.value)})} />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-gold font-bold">€</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h2 className="text-4xl font-serif font-black text-brand-navy tracking-tight">Projets & Ambitions</h2>
                      <p className="text-slate-500 mt-3 font-medium text-lg italic">Définition de vos priorités temporelles et financières.</p>
                    </div>
                    <button onClick={() => handleAddGoal()} className="px-8 py-4 navy-gradient text-brand-gold rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl shadow-brand-navy/10 transition-all active:scale-95 border border-brand-gold/20">
                      + Créer un Objectif
                    </button>
                  </header>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Configurations de référence</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {PREDEFINED_GOALS.map((template) => (
                        <button 
                          key={template.title}
                          onClick={() => handleAddGoal(template)}
                          className="flex items-center gap-4 p-5 bg-white border border-brand-gold/10 rounded-[1.5rem] text-sm font-bold hover:border-brand-gold hover:text-brand-gold hover:shadow-2xl hover:shadow-brand-gold/5 transition-all text-left group"
                        >
                          <span className="text-2xl bg-brand-cream w-12 h-12 flex items-center justify-center rounded-xl shadow-inner group-hover:scale-110 transition-transform">{template.icon}</span>
                          <span className="leading-tight text-brand-navy group-hover:text-brand-gold">{template.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                    {goals.map(g => (
                      <div key={g.id} className="p-7 border border-brand-gold/10 rounded-[2.5rem] bg-brand-cream/20 flex flex-wrap md:flex-nowrap gap-8 items-end group relative transition-all hover:bg-white hover:shadow-2xl hover:shadow-brand-navy/5">
                        <button onClick={() => handleRemoveGoal(g.id)} className="absolute -top-3 -right-3 w-10 h-10 bg-white text-red-500 border border-brand-gold/10 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">✕</button>
                        <div className="flex-1 min-w-[200px] space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Désignation du projet</label>
                          <input className="w-full px-5 py-4 bg-white rounded-2xl border border-brand-gold/10 outline-none font-black text-brand-navy text-lg focus:border-brand-gold" 
                            value={g.title} onChange={e => updateGoal(g.id, 'title', e.target.value)} />
                        </div>
                        <div className="w-32 shrink-0 space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Horizon (ans)</label>
                          <input type="number" className="w-full px-5 py-4 bg-white rounded-2xl border border-brand-gold/10 outline-none font-black text-brand-navy text-lg focus:border-brand-gold" 
                            value={g.horizon} onChange={e => updateGoal(g.id, 'horizon', parseInt(e.target.value))} />
                        </div>
                        <div className="w-44 shrink-0 space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Montant Cible</label>
                          <div className="relative">
                            <input type="number" className="w-full px-5 py-4 pr-10 bg-white rounded-2xl border border-brand-gold/10 outline-none font-black text-brand-gold text-xl focus:border-brand-gold" 
                              value={g.targetAmount} onChange={e => updateGoal(g.id, 'targetAmount', parseInt(e.target.value))} />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-slate-300 font-black">€</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {goals.length === 0 && (
                      <div className="text-center py-24 border-2 border-dashed border-brand-gold/10 rounded-[3rem] bg-brand-cream/10">
                        <p className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px]">Définissez vos ambitions</p>
                        <p className="text-slate-400 mt-3 text-sm font-medium italic">Sélectionnez un modèle ci-dessus pour lancer l'audit.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <header className="flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-serif font-black text-brand-navy tracking-tight">Actifs & Patrimoine</h2>
                      <p className="text-slate-500 mt-3 font-medium text-lg italic">Inventaire des ressources capitalisées existantes.</p>
                    </div>
                    <button onClick={handleAddAsset} className="px-8 py-4 gold-gradient text-brand-navy rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl shadow-brand-gold/20 transition-all active:scale-95 border border-brand-navy/10">
                      + Nouvel Actif
                    </button>
                  </header>
                  <div className="space-y-5 max-h-[480px] overflow-y-auto pr-3 custom-scrollbar">
                    {assets.map(a => (
                      <div key={a.id} className="p-8 border border-brand-gold/10 rounded-[2.5rem] bg-brand-cream/20 grid grid-cols-1 md:grid-cols-3 gap-8 group relative hover:bg-white hover:shadow-2xl hover:shadow-brand-navy/5 transition-all">
                        <button onClick={() => handleRemoveAsset(a.id)} className="absolute -top-3 -right-3 w-10 h-10 bg-white text-red-500 border border-brand-gold/10 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">✕</button>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Classe d'actif</label>
                          <select className="w-full px-5 py-4 bg-white rounded-2xl border border-brand-gold/10 outline-none font-black text-brand-navy cursor-pointer focus:border-brand-gold" 
                            value={a.type} onChange={e => updateAsset(a.id, 'type', e.target.value)}>
                            <option>Actions (PEA/CTO)</option>
                            <option>Immobilier Direct</option>
                            <option>Private Equity</option>
                            <option>Obligations / Fonds Euros</option>
                            <option>Livrets / Cash</option>
                            <option>Crypto-actifs / Or</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Valeur de Marché (€)</label>
                          <input type="number" className="w-full px-5 py-4 bg-white rounded-2xl border border-brand-gold/10 outline-none font-black text-brand-navy text-xl focus:border-brand-gold" 
                            value={a.value} onChange={e => updateAsset(a.id, 'value', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Précisions Stratégiques</label>
                          <input className="w-full px-5 py-4 bg-white rounded-2xl border border-brand-gold/10 outline-none font-medium placeholder:text-slate-300 focus:border-brand-gold" 
                            placeholder="Désignation du bien ou contrat" value={a.description} onChange={e => updateAsset(a.id, 'description', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    {assets.length === 0 && <p className="text-center py-24 text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] bg-brand-cream/10 rounded-[3rem]">Aucun actif répertorié</p>}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <header className="flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-serif font-black text-brand-navy tracking-tight">Engagements & Passif</h2>
                      <p className="text-slate-500 mt-3 font-medium text-lg italic">Analyse critique de l'endettement et de la solvabilité.</p>
                    </div>
                    <button onClick={handleAddDebt} className="px-8 py-4 bg-red-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-950 transition-all active:scale-95 border border-white/10">
                      + Déclarer un Prêt
                    </button>
                  </header>
                  <div className="space-y-5 max-h-[480px] overflow-y-auto pr-3 custom-scrollbar">
                    {debts.map(d => (
                      <div key={d.id} className="p-8 border border-brand-gold/10 rounded-[2.5rem] bg-brand-cream/20 grid grid-cols-2 md:grid-cols-4 gap-8 group relative hover:bg-white hover:shadow-2xl hover:shadow-brand-navy/5 transition-all">
                        <button onClick={() => handleRemoveDebt(d.id)} className="absolute -top-3 -right-3 w-10 h-10 bg-white text-red-500 border border-brand-gold/10 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">✕</button>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Type de Crédit</label>
                          <select className="w-full px-5 py-4 bg-white rounded-2xl border border-brand-gold/10 outline-none font-black text-brand-navy text-sm focus:border-brand-gold" 
                            value={d.type} onChange={e => updateDebt(d.id, 'type', e.target.value)}>
                            <option>Immobilier</option>
                            <option>In Fine / Lombard</option>
                            <option>Prêt Relais</option>
                            <option>Professionnel</option>
                            <option>Consommation</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Capital Restant Dû</label>
                          <input type="number" className="w-full px-5 py-4 bg-white rounded-2xl border border-brand-gold/10 outline-none font-black text-red-700 text-lg focus:border-brand-gold" 
                            value={d.remainingCapital} onChange={e => updateDebt(d.id, 'remainingCapital', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Mensualité (ADI inc.)</label>
                          <input type="number" className="w-full px-5 py-4 bg-white rounded-2xl border border-brand-gold/10 outline-none font-black text-brand-navy text-lg focus:border-brand-gold" 
                            value={d.monthlyPayment} onChange={e => updateDebt(d.id, 'monthlyPayment', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Taux Nominal (%)</label>
                          <input type="number" step="0.01" className="w-full px-5 py-4 bg-white rounded-2xl border border-brand-gold/10 outline-none font-black text-brand-navy text-lg focus:border-brand-gold" 
                            value={d.interestRate} onChange={e => updateDebt(d.id, 'interestRate', parseFloat(e.target.value))} />
                        </div>
                      </div>
                    ))}
                    {debts.length === 0 && <p className="text-center py-24 text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] bg-brand-cream/10 rounded-[3rem]">Absence de dette déclarée</p>}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <header>
                    <h2 className="text-4xl font-serif font-black text-brand-navy tracking-tight">Appétence & Profiling</h2>
                    <p className="text-slate-500 mt-3 font-medium text-lg italic">Détermination de votre seuil psychologique de tolérance à la volatilité.</p>
                  </header>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {RISK_LEVELS.map((level) => (
                      <button 
                        key={level.label}
                        onClick={() => setRisk({ ...risk, score: level.score, label: level.label })}
                        className={`p-10 rounded-[3rem] border-2 text-left transition-all duration-700 relative flex flex-col gap-8 ${
                          risk.label === level.label 
                            ? `border-brand-gold bg-brand-cream shadow-2xl shadow-brand-gold/10 ring-8 ring-brand-gold/5`
                            : 'border-slate-100 hover:border-brand-gold/30 bg-white hover:shadow-2xl hover:shadow-brand-navy/5'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-brand-gold/20 ${
                          risk.label === level.label ? `navy-gradient text-brand-gold` : 'bg-brand-cream/50 text-slate-400'
                        }`}>
                          {level.icon}
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-2xl font-serif font-black text-brand-navy tracking-tight">{level.label}</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{level.description}</p>
                        </div>

                        <div className={`mt-auto pt-6 border-t ${risk.label === level.label ? `border-brand-gold/30` : 'border-slate-100'}`}>
                           <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                             risk.label === level.label ? `text-brand-gold` : 'text-slate-400'
                           }`}>
                             {level.implication}
                           </p>
                        </div>

                        {risk.label === level.label && (
                          <div className={`absolute top-8 right-8 w-8 h-8 rounded-full bg-brand-navy text-brand-gold flex items-center justify-center text-xs font-black shadow-2xl border border-brand-gold/30`}>
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="bg-brand-navy rounded-[3rem] p-10 border border-brand-gold/20 shadow-2xl shadow-brand-navy/20">
                    <div className="flex justify-between items-end mb-10">
                       <label className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] ml-1">Ajustement Chirurgical du Score</label>
                       <span className="text-3xl font-serif font-black text-brand-gold tracking-tight">{risk.score} <span className="text-slate-500 text-sm italic">/ 10</span></span>
                    </div>
                    <div className="relative px-2">
                        <input 
                          type="range" 
                          min="1" max="10" 
                          className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-gold"
                          value={risk.score} 
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            let lbl = 'Equilibré';
                            if (val <= 3) lbl = 'Prudent';
                            if (val >= 8) lbl = 'Dynamique';
                            setRisk({ ...risk, score: val, label: lbl });
                          }}
                        />
                        <div className="absolute top-0 left-0 w-full flex justify-between pointer-events-none -mt-8">
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                <div key={n} className="w-px h-2 bg-slate-700"></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between mt-6">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Protection Intégrale</span>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Exposition Maximale</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Bar */}
              <div className="flex justify-between mt-20 pt-12 border-t border-brand-gold/10">
                <button disabled={step === 0} onClick={() => setStep(step - 1)} 
                  className="px-10 py-5 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] hover:text-brand-navy disabled:opacity-0 transition-all active:scale-95">
                  ← Retour
                </button>
                {step < 4 ? (
                  <button onClick={() => setStep(step + 1)} 
                    className="px-16 py-6 navy-gradient text-brand-gold rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:shadow-2xl shadow-brand-navy/20 transition-all active:scale-95 border border-brand-gold/20">
                    Étape Suivante →
                  </button>
                ) : (
                  <button onClick={handleGenerate} 
                    className="px-20 py-7 gold-gradient text-brand-navy rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[11px] hover:shadow-2xl shadow-brand-gold/30 transition-all active:scale-95 border border-brand-navy/10 flex items-center gap-3">
                    Générer l'Audit IA 
                    <span className="text-lg">✨</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-16 animate-in fade-in zoom-in-95 duration-1000">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-8 border-b border-brand-gold/10 pb-12">
              <div className="space-y-4">
                <button onClick={() => setStep(0)} className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] flex items-center gap-3 hover:translate-x-[-8px] transition-transform">
                  <span>←</span> Recommencer l'Audit
                </button>
                <h2 className="text-5xl font-serif font-black text-brand-navy tracking-tight">Votre Audit Stratégique</h2>
                <p className="text-slate-500 font-medium text-xl italic max-w-2xl">Préconisations exclusives • Cabinet L'Ingé Patrimoine</p>
              </div>
              <div className="flex gap-6 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-8 py-4 bg-white border border-brand-gold/20 rounded-2xl font-black text-brand-navy text-[10px] uppercase tracking-widest hover:bg-brand-cream transition-all shadow-xl shadow-brand-navy/5">Rapport PDF Complet</button>
                <button className="flex-1 md:flex-none px-10 py-4 navy-gradient text-brand-gold rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-2xl shadow-brand-navy/20 transition-all active:scale-95 border border-brand-gold/20">Acter la Stratégie</button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-12 text-center">
                <div className="relative">
                   <div className="w-36 h-36 border-[16px] border-brand-gold/5 rounded-full"></div>
                   <div className="absolute top-0 left-0 w-36 h-36 border-[16px] border-brand-gold border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(197,160,89,0.2)]"></div>
                   <div className="absolute inset-0 flex items-center justify-center font-serif text-brand-gold font-bold text-2xl">uP</div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-3xl font-serif font-black text-brand-navy tracking-tight leading-snug">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </h3>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map(i => <div key={i} className="w-2.5 h-2.5 bg-brand-gold rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>)}
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] pt-4">Veuillez patienter quelques instants, nos algorithmes sécurisés travaillent pour vous.</p>
                </div>
              </div>
            ) : results ? (
              <div className="space-y-24 pb-20">
                 {/* Summary Section Redesign */}
                 <div className="navy-gradient text-white p-12 md:p-20 rounded-[4rem] relative overflow-hidden shadow-2xl border border-brand-gold/20">
                    <div className="relative z-10 space-y-12">
                      <div className="space-y-6 max-w-4xl">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-gold/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold border border-brand-gold/20">
                          Synthèse de l'Ingénieur Conseil
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight">Vision Patrimoniale à 10 ans</h3>
                        <p className="text-slate-300 leading-relaxed text-xl font-medium italic opacity-90">{results.summary}</p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 items-center pt-8 border-t border-brand-gold/10 overflow-x-auto pb-4 custom-scrollbar">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold whitespace-nowrap">Choisir une stratégie :</span>
                        <div className="flex gap-4">
                          {results.portfolios.map((p, idx) => (
                             <button 
                              key={p.name}
                              onClick={() => setActiveTab(idx)}
                              className={`px-8 py-4 rounded-full border transition-all text-sm font-black whitespace-nowrap ${
                                activeTab === idx ? 'bg-brand-gold text-brand-navy border-brand-gold shadow-lg' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                              }`}
                             >
                                {p.name} (+{p.expectedReturn}%)
                             </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[120px]"></div>
                 </div>

                 {/* Pedagogical Header for Results */}
                 <div className="max-w-3xl space-y-4">
                    <h3 className="text-4xl font-serif font-black text-brand-navy tracking-tight">Focus : Stratégie {results.portfolios[activeTab].name}</h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed italic">
                      "Une approche {results.portfolios[activeTab].riskLevel.toLowerCase()} privilégiant la sélection de actifs de haute qualité."
                    </p>
                 </div>

                 {/* Focus view of the selected model - REDESIGNED GRID */}
                 <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                    {/* Main Card Col */}
                    <div className="xl:col-span-5 animate-in fade-in slide-in-from-left-8 duration-1000">
                       <PortfolioCard 
                          portfolio={results.portfolios[activeTab]} 
                          isMain={true} 
                        />
                    </div>
                    
                    {/* Insights Col */}
                    <div className="xl:col-span-7 space-y-10 py-4 animate-in fade-in slide-in-from-right-8 duration-1000">
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-10 bg-white border border-brand-gold/10 rounded-[3rem] shadow-sm space-y-6 relative overflow-hidden group hover:shadow-xl transition-shadow">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl translate-x-12 -translate-y-12"></div>
                             <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] relative z-10">Capital Projeté (10 ans)</p>
                             <div className="flex items-baseline gap-3 relative z-10">
                                <span className="text-5xl font-serif font-black text-brand-navy tracking-tighter">
                                   {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(results.portfolios[activeTab].projectedValue10y || 0)}
                                </span>
                             </div>
                             <p className="text-[11px] text-slate-400 font-bold leading-relaxed relative z-10">
                                Ce montant inclut vos versements mensuels de {profile.monthlySavings}€ et la capitalisation des intérêts composés à {results.portfolios[activeTab].expectedReturn}% par an.
                             </p>
                          </div>
                          
                          <div className="p-10 navy-gradient text-white rounded-[3rem] shadow-xl space-y-8 border border-brand-gold/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                             <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-gold/5 rounded-full blur-3xl translate-x-16 translate-y-16"></div>
                             <div className="flex items-center justify-between relative z-10">
                                <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">Facteurs de Succès</p>
                                <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">🛡️</div>
                             </div>
                             <ul className="space-y-5 relative z-10">
                                {results.portfolios[activeTab].diversificationHighlights.map((h, i) => (
                                   <li key={i} className="flex gap-4 items-start">
                                      <div className="w-2 h-2 rounded-full bg-brand-gold mt-1.5 shrink-0 shadow-[0_0_8px_#c5a059]"></div>
                                      <span className="text-sm font-bold text-slate-200 leading-snug">{h}</span>
                                   </li>
                                ))}
                             </ul>
                          </div>
                       </div>

                       {/* Attainability Detail - More visual */}
                       <div className="space-y-6 pt-6">
                          <h4 className="text-[11px] font-black text-brand-gold uppercase tracking-[0.4em] px-4">Audit de faisabilité des projets</h4>
                          <div className="grid grid-cols-1 gap-4">
                             {results.portfolios[activeTab].attainability.map((item, i) => (
                                <div key={i} className="p-8 bg-white border border-brand-gold/5 rounded-[2.5rem] flex flex-col md:flex-row gap-6 md:items-center justify-between hover:border-brand-gold/20 transition-all">
                                   <div className="flex gap-5 items-center">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-sm ${
                                         item.status === 'Atteignable' ? 'bg-emerald-50 text-emerald-600' :
                                         item.status === 'Partiel' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                      }`}>
                                         {item.status === 'Atteignable' ? '✓' : item.status === 'Partiel' ? '~' : '!'}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-brand-navy uppercase tracking-tight">{item.goalTitle}</p>
                                         <p className="text-xs text-slate-400 font-bold">{item.status}</p>
                                      </div>
                                   </div>
                                   <div className="md:max-w-md">
                                      <p className="text-[13px] text-slate-500 font-medium italic leading-relaxed">"{item.analysis}"</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>

                       {/* Expert Commentary */}
                       <div className="p-10 bg-brand-cream/50 border border-brand-gold/10 rounded-[3rem] space-y-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-brand-gold font-bold text-xs">IP</div>
                             <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Le mot de l'Ingénieur Patrimonial</p>
                          </div>
                          <p className="text-lg font-serif italic text-brand-navy leading-relaxed opacity-80">
                             {results.portfolios[activeTab].analysis}
                          </p>
                       </div>

                    </div>
                 </div>
              </div>
            ) : (
              <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-brand-gold/20">
                <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">Anomalie lors du traitement</p>
                <button onClick={() => setStep(0)} className="mt-8 text-brand-gold font-black uppercase tracking-widest text-[10px] hover:underline underline-offset-8">Réinitialiser l'Audit</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-brand-gold/10 bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="w-10 h-10 navy-gradient rounded-lg flex items-center justify-center text-brand-gold font-serif font-black text-lg">uP</div>
            <span className="text-xl font-serif font-black text-brand-navy tracking-tighter">uPortfolio</span>
          </div>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.5em] text-center">Solution d'Ingénierie Patrimoniale Agréée • Cabinet L'Ingé Patrimoine © 2025</p>
          <div className="flex gap-10">
            <a href="#" className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-gold transition-colors">Mentions Légales</a>
            <a href="#" className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-gold transition-colors">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
