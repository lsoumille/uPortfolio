
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

const ASSET_TYPES = [
  "Actions (PEA/CTO)",
  "Immobilier Direct",
  "SCPI / Pierre Papier",
  "Private Equity",
  "Obligations / Fonds Euros",
  "Livrets / Cash",
  "Crypto-actifs / Or",
  "Autre"
];

const DEBT_TYPES = [
  "Immobilier (Résidence)",
  "Immobilier (Locatif)",
  "In Fine / Lombard",
  "Prêt Relais",
  "Professionnel",
  "Consommation"
];

const RISK_LEVELS = [
  { 
    score: 2, 
    label: 'Prudent', 
    icon: '🛡️', 
    description: "Priorité absolue à la sécurité du capital. Horizon de placement court ou besoin de liquidité immédiate.",
    implication: "Aversion forte à la volatilité."
  },
  { 
    score: 5, 
    label: 'Equilibré', 
    icon: '⚖️', 
    description: "Recherche de croissance modérée avec une acceptation des fluctuations de marché à moyen terme.",
    implication: "Mix entre actifs sécurisés et dynamiques."
  },
  { 
    score: 9, 
    label: 'Dynamique', 
    icon: '🚀', 
    description: "Recherche de performance maximale. Capacité à supporter des baisses temporaires importantes pour un gain futur.",
    implication: "Horizon long terme (8 ans +)."
  }
];

const LOADING_MESSAGES = [
  "Analyse de votre patrimoine net...",
  "Calcul des projections actuarielles à 10 ans...",
  "Sélection des meilleures enveloppes fiscales...",
  "Optimisation de l'allocation d'actifs par l'IA...",
  "Vérification de la faisabilité de vos projets...",
  "Finalisation de votre audit personnalisé..."
];

const App: React.FC = () => {
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState(1);
  
  const [profile, setProfile] = useState<ClientProfile>({
    firstName: '', age: 40, profession: '', taxBracket: 30, monthlyIncome: 5000, monthlySavings: 1000
  });
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [assets, setAssets] = useState<CurrentAsset[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [risk, setRisk] = useState<RiskProfile>({ score: 5, label: 'Equilibré', description: '' });
  const [additionalContext, setAdditionalContext] = useState('');
  
  const [results, setResults] = useState<AnalysisResponse | null>(null);

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
    setAssets([...assets, { id: Date.now().toString(), type: ASSET_TYPES[0], value: 0, description: '' }]);
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleAddDebt = () => {
    setDebts([...debts, { id: Date.now().toString(), type: DEBT_TYPES[0], remainingCapital: 0, monthlyPayment: 0, interestRate: 1.5 }]);
  };

  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setStep(5);
    try {
      const data = await generatePortfolios(profile, goals, assets, debts, risk, additionalContext);
      setResults(data);
      const mainIdx = data.portfolios.findIndex(p => p.name.toLowerCase().includes(risk.label.toLowerCase()));
      setActiveTab(mainIdx !== -1 ? mainIdx : 1);
    } catch (err) {
      console.error(err);
      alert("Erreur de génération. Veuillez réessayer.");
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
    <div className="min-h-screen bg-brand-light text-brand-primary selection:bg-brand-accent/20 flex flex-col">
      {/* Navbar */}
      <nav className="bg-brand-primary/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center text-brand-primary font-heading text-2xl font-black border border-white/20">uP</div>
            <div>
              <span className="text-2xl font-heading font-black text-white tracking-tight">uPortfolio</span>
              <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] -mt-1">L'Ingé Patrimoine</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-brand-primary border-2 border-white/20 font-black">IP</div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col">
        {step < 5 && (
          <div className="max-w-4xl mx-auto w-full">
            {/* Stepper */}
            <div className="relative mb-24 px-4">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[85%] h-[1px] bg-brand-primary/10 -z-0"></div>
              <div 
                className="absolute top-6 left-[7.5%] h-[1px] bg-brand-accent -z-0 transition-all duration-1000 shadow-[0_0_12px_#00D9FF]"
                style={{ width: `${step * 21.25}%` }}
              ></div>
              <div className="flex justify-between items-start relative z-10">
                {['Profil', 'Objectifs', 'Actifs', 'Passif', 'Risque'].map((label, s) => (
                  <div key={s} className="flex flex-col items-center gap-5 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${
                      step === s ? 'bg-brand-primary text-brand-accent scale-125 border-brand-accent/30' : 
                      step > s ? 'bg-brand-accent text-brand-primary border-transparent' : 'bg-white text-slate-300 border-slate-100'
                    }`}>
                      {step > s ? '✓' : s + 1}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${step === s ? 'text-brand-primary' : 'text-slate-400'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100">
              
              {step === 0 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <header>
                    <h2 className="text-4xl font-heading font-black text-brand-primary tracking-tight">Audit d'Identité</h2>
                    <p className="text-brand-muted mt-2 font-medium italic">Structure fondamentale de votre foyer.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-60">Prénom</label>
                      <input className="w-full px-6 py-5 rounded-2xl border border-slate-200 bg-slate-50 font-medium text-xl outline-none focus:border-brand-accent" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-60">Âge</label>
                      <input type="number" className="w-full px-6 py-5 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-xl outline-none focus:border-brand-accent" value={profile.age} onChange={e => setProfile({...profile, age: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-60">TMI (%)</label>
                      <select className="w-full px-6 py-5 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-xl outline-none focus:border-brand-accent" value={profile.taxBracket} onChange={e => setProfile({...profile, taxBracket: parseInt(e.target.value)})}>
                        {[0, 11, 30, 41, 45].map(v => <option key={v} value={v}>{v}%</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-60">Épargne Mensuelle (€)</label>
                      <input type="number" className="w-full px-6 py-5 rounded-2xl border border-slate-200 bg-slate-50 font-black text-2xl text-brand-accentdark outline-none focus:border-brand-accent" value={profile.monthlySavings} onChange={e => setProfile({...profile, monthlySavings: parseInt(e.target.value)})} />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <header className="flex justify-between items-center">
                    <h2 className="text-4xl font-heading font-black text-brand-primary tracking-tight">Objectifs</h2>
                    <button onClick={() => handleAddGoal()} className="px-6 py-3 primary-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest">+ Ajouter</button>
                  </header>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {PREDEFINED_GOALS.map((template) => (
                      <button key={template.title} onClick={() => handleAddGoal(template)} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:border-brand-accent transition-all">
                        <span className="text-xl block mb-2">{template.icon}</span>
                        <span className="text-[10px] font-black uppercase text-brand-primary">{template.title}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {goals.map(g => (
                      <div key={g.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap gap-6 items-end relative group">
                        <button onClick={() => handleRemoveGoal(g.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">✕</button>
                        <div className="flex-1 min-w-[150px] space-y-2">
                          <label className="text-[9px] font-black text-brand-primary opacity-50 uppercase tracking-widest">Titre du projet</label>
                          <input className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-accent font-bold" value={g.title} onChange={e => updateGoal(g.id, 'title', e.target.value)} />
                        </div>
                        <div className="w-24 space-y-2">
                          <label className="text-[9px] font-black text-brand-primary opacity-50 uppercase tracking-widest">Horizon (ans)</label>
                          <input type="number" className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-accent font-bold" value={g.horizon} onChange={e => updateGoal(g.id, 'horizon', parseInt(e.target.value))} />
                        </div>
                        <div className="w-32 space-y-2">
                          <label className="text-[9px] font-black text-brand-primary opacity-50 uppercase tracking-widest">Cible (€)</label>
                          <input type="number" className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-accent font-black text-brand-accentdark" value={g.targetAmount} onChange={e => updateGoal(g.id, 'targetAmount', parseInt(e.target.value))} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <header className="flex justify-between items-center">
                    <div>
                      <h2 className="text-4xl font-heading font-black text-brand-primary tracking-tight">Actifs</h2>
                      <p className="text-brand-muted mt-1 font-medium italic">Inventaire détaillé de vos ressources.</p>
                    </div>
                    <button onClick={handleAddAsset} className="px-6 py-3 primary-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest">+ Ajouter</button>
                  </header>
                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                    {assets.map(a => (
                      <div key={a.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 relative group hover:bg-white hover:shadow-lg transition-all">
                        <button onClick={() => handleRemoveAsset(a.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">✕</button>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black opacity-50 uppercase tracking-widest">Classe d'actif</label>
                          <select className="w-full p-3 rounded-lg border border-slate-200 outline-none font-bold text-brand-primary bg-white" value={a.type} onChange={e => updateAsset(a.id, 'type', e.target.value)}>
                            {ASSET_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black opacity-50 uppercase tracking-widest">Valeur Actuelle (€)</label>
                          <input type="number" className="w-full p-3 rounded-lg border border-slate-200 outline-none font-black text-brand-primary text-lg" value={a.value} onChange={e => updateAsset(a.id, 'value', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black opacity-50 uppercase tracking-widest">Désignation / Contrat</label>
                          <input className="w-full p-3 rounded-lg border border-slate-200 outline-none" placeholder="Ex: PEA Boursorama, Appartement Lyon..." value={a.description} onChange={e => updateAsset(a.id, 'description', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    {assets.length === 0 && <p className="text-center py-20 text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] bg-slate-50 rounded-[1.5rem]">Aucun actif répertorié</p>}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <header className="flex justify-between items-center">
                    <div>
                      <h2 className="text-4xl font-heading font-black text-brand-primary tracking-tight">Passif</h2>
                      <p className="text-brand-muted mt-1 font-medium italic">Analyse de vos engagements financiers.</p>
                    </div>
                    <button onClick={handleAddDebt} className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">+ Nouveau Prêt</button>
                  </header>
                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                    {debts.map(d => (
                      <div key={d.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 relative group hover:bg-white hover:shadow-lg transition-all">
                        <button onClick={() => handleRemoveDebt(d.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black opacity-50 uppercase tracking-widest">Type de Prêt</label>
                          <select className="w-full p-3 rounded-lg border border-slate-200 outline-none font-bold text-sm bg-white" value={d.type} onChange={e => updateDebt(d.id, 'type', e.target.value)}>
                            {DEBT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black opacity-50 uppercase tracking-widest">Cap. Restant Dû (€)</label>
                          <input type="number" className="w-full p-3 rounded-lg border border-slate-200 outline-none font-bold text-red-600" value={d.remainingCapital} onChange={e => updateDebt(d.id, 'remainingCapital', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black opacity-50 uppercase tracking-widest">Mensualité (€)</label>
                          <input type="number" className="w-full p-3 rounded-lg border border-slate-200 outline-none" value={d.monthlyPayment} onChange={e => updateDebt(d.id, 'monthlyPayment', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black opacity-50 uppercase tracking-widest">Taux Nominal (%)</label>
                          <input type="number" step="0.01" className="w-full p-3 rounded-lg border border-slate-200 outline-none" value={d.interestRate} onChange={e => updateDebt(d.id, 'interestRate', parseFloat(e.target.value))} />
                        </div>
                      </div>
                    ))}
                    {debts.length === 0 && <p className="text-center py-20 text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] bg-slate-50 rounded-[1.5rem]">Pas d'endettement déclaré</p>}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <header>
                    <h2 className="text-4xl font-heading font-black text-brand-primary tracking-tight">Profil d'Investisseur</h2>
                    <p className="text-brand-muted mt-1 font-medium italic">Sélectionnez le comportement qui vous ressemble.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {RISK_LEVELS.map((level) => (
                      <button key={level.label} onClick={() => setRisk({ ...risk, score: level.score, label: level.label })} className={`p-8 rounded-3xl border-2 text-left transition-all relative flex flex-col gap-6 ${risk.label === level.label ? 'border-brand-accent bg-brand-light shadow-xl' : 'border-slate-100 bg-white hover:border-brand-accent/30'}`}>
                        <div className="flex justify-between items-start">
                          <span className="text-4xl block">{level.icon}</span>
                          {risk.label === level.label && <div className="text-brand-accent text-xl font-black">✓</div>}
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-heading font-black text-brand-primary">{level.label}</h4>
                          <p className="text-[11px] text-brand-muted font-medium leading-relaxed">{level.description}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                          <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest opacity-40">{level.implication}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] opacity-60">Instructions Spécifiques & Contexte Additionnel</label>
                    <textarea className="w-full p-6 rounded-2xl border border-slate-200 bg-slate-50 min-h-[140px] outline-none focus:border-brand-accent resize-none text-sm font-medium" placeholder="Ex: Priorité à l'écologie (ISR), aversion pour l'immobilier, anticipation d'un héritage..." value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-between mt-16 pt-8 border-t border-slate-100">
                <button disabled={step === 0} onClick={() => setStep(step - 1)} className="px-8 py-4 text-brand-muted font-black uppercase text-[10px] tracking-widest disabled:opacity-0 transition-all hover:text-brand-primary">← Retour</button>
                {step < 4 ? (
                  <button onClick={() => setStep(step + 1)} className="px-12 py-4 primary-gradient text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Étape Suivante →</button>
                ) : (
                  <button onClick={handleGenerate} className="px-12 py-5 accent-gradient text-brand-primary rounded-xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-brand-accent/20 active:scale-95 transition-all flex items-center gap-2">Générer l'Audit ⚡</button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700 pb-20">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-8 text-center">
                <div className="w-24 h-24 border-[12px] border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></div>
                <h3 className="text-2xl font-heading font-black text-brand-primary">{LOADING_MESSAGES[loadingMsgIdx]}</h3>
                <div className="flex gap-2">
                   {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>)}
                </div>
              </div>
            ) : results ? (
              <div className="space-y-16">
                {/* Results Summary Box */}
                <div className="primary-gradient p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6">
                      <div className="inline-block px-4 py-1.5 bg-brand-accent/10 border border-brand-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-accent">Synthèse Stratégique du Cabinet</div>
                      <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight">Audit {profile.firstName}</h2>
                      <p className="text-slate-300 text-lg leading-relaxed italic font-medium">{results.summary}</p>
                    </div>
                    <div className="lg:col-span-5 flex flex-col gap-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-2">Architectures de placement :</p>
                       <div className="grid grid-cols-1 gap-3">
                          {results.portfolios.map((p, idx) => (
                             <button key={p.name} onClick={() => setActiveTab(idx)} className={`w-full p-5 rounded-2xl border transition-all text-left flex justify-between items-center ${activeTab === idx ? 'bg-brand-accent text-brand-primary border-brand-accent shadow-lg scale-[1.02]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                                <div>
                                   <span className="text-[9px] font-black uppercase tracking-widest block opacity-60 mb-1">{p.riskLevel}</span>
                                   <span className="text-sm font-black uppercase">{p.name}</span>
                                </div>
                                <span className="text-xl font-heading font-black">+{p.expectedReturn}%</span>
                             </button>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                   <PortfolioCard portfolio={results.portfolios[activeTab]} isMain={true} />
                   
                   <div className="space-y-8 h-full flex flex-col">
                      <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex-1 flex flex-col">
                         <h4 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] opacity-40 mb-8">Thèse d'investissement IA</h4>
                         <p className="text-xl font-heading font-bold italic text-brand-primary leading-relaxed opacity-80 border-l-4 border-brand-accent pl-6 mb-12 flex-1">
                            {results.portfolios[activeTab].analysis}
                         </p>
                         
                         <div className="space-y-6 pt-6 border-t border-slate-50">
                            <h4 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] opacity-40 mb-4">Analyse de Faisabilité</h4>
                            <div className="space-y-4">
                              {results.portfolios[activeTab].attainability.map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:bg-white hover:shadow-lg">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${item.status === 'Atteignable' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Partiel' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                      {item.status === 'Atteignable' ? '✓' : item.status === 'Partiel' ? '~' : '!'}
                                   </div>
                                   <div className="flex-1">
                                      <p className="text-xs font-black text-brand-primary uppercase tracking-tight">{item.goalTitle}</p>
                                      <p className="text-[11px] text-brand-muted font-bold italic mt-1 leading-snug">{item.analysis}</p>
                                   </div>
                                </div>
                              ))}
                            </div>
                         </div>
                      </div>

                      <div className="p-10 primary-gradient text-white rounded-[2.5rem] shadow-xl">
                         <h4 className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-6">Atouts Clés</h4>
                         <ul className="space-y-4">
                            {results.portfolios[activeTab].diversificationHighlights.map((h, i) => (
                               <li key={i} className="flex gap-4 items-start text-sm font-bold text-slate-200">
                                  <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0"></div>
                                  {h}
                               </li>
                            ))}
                         </ul>
                      </div>
                      
                      <button onClick={() => setStep(0)} className="w-full py-5 border-2 border-brand-primary/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary hover:bg-brand-primary hover:text-white transition-all">
                        Modifier l'Audit et Reparamétrer
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-40">
                <p className="text-brand-muted">Une erreur s'est produite.</p>
                <button onClick={() => setStep(0)} className="mt-4 px-8 py-3 bg-brand-primary text-white rounded-xl">Retour</button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-auto bg-brand-primary py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-brand-primary font-heading font-black text-sm">uP</div>
            <span className="text-lg font-heading font-black text-white tracking-tighter">uPortfolio</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Cabinet L'Ingé Patrimoine © 2025 • Expert en Ingénierie Digitale</p>
          <div className="flex gap-8 opacity-40">
             <span className="text-[9px] font-black text-white uppercase tracking-widest cursor-pointer hover:text-brand-accent">Mentions Légales</span>
             <span className="text-[9px] font-black text-white uppercase tracking-widest cursor-pointer hover:text-brand-accent">RGPD</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
