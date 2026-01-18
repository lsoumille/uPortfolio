
import React from 'react';
import { Portfolio } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0A2540', '#00D9FF', '#10b981', '#6C757D', '#ef4444', '#00A3FF'];

interface Props {
  portfolio: Portfolio;
  isMain?: boolean;
}

export const PortfolioCard: React.FC<Props> = ({ portfolio, isMain }) => {
  const chartData = portfolio.allocation.map(a => ({
    name: a.category,
    value: a.percentage
  }));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  // Helper pour s'assurer que si l'IA renvoie par erreur 0.05 au lieu de 5, on corrige l'affichage
  // Mais ici on fait confiance au nouveau prompt strict.
  const displayReturn = portfolio.expectedReturn;
  const displayVolatility = portfolio.volatility;

  return (
    <div className={`flex flex-col w-full bg-white rounded-[2.5rem] shadow-sm border transition-all duration-500 overflow-hidden group ${
      isMain ? 'ring-2 ring-brand-accent border-brand-accent/20 shadow-2xl' : 'border-slate-100 shadow-lg'
    }`}>
      
      {/* Header & Metrics */}
      <div className={`p-8 border-b border-slate-100 ${isMain ? 'bg-brand-light/50' : 'bg-slate-50/10'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-heading font-black text-brand-primary tracking-tight">{portfolio.name}</h3>
          <div className="px-3 py-1 bg-brand-primary/5 border border-brand-primary/10 rounded-full text-[10px] font-black text-brand-primary uppercase tracking-tighter">
            PROFIL {portfolio.riskLevel}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <p className="text-[9px] text-emerald-700 font-black uppercase tracking-widest mb-1">Rendement Cible</p>
            <p className="text-2xl font-heading font-black text-emerald-600">+{displayReturn}%<span className="text-[10px] ml-1 opacity-50 font-sans">/an</span></p>
            <p className="text-[8px] text-emerald-600/60 font-medium italic mt-1">Projection annuelle brute</p>
          </div>
          <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
            <p className="text-[9px] text-brand-muted font-black uppercase tracking-widest mb-1">Volatilité Est.</p>
            <p className="text-2xl font-heading font-black text-brand-primary">{displayVolatility}%</p>
            <p className="text-[8px] text-brand-muted/60 font-medium italic mt-1">Écart-type historique cible</p>
          </div>
        </div>

        <div className="primary-gradient rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-accent mb-1 opacity-80">Capital Estimé (10 ans)</p>
          <p className="text-3xl font-heading font-black tracking-tight">{portfolio.projectedValue10y ? formatCurrency(portfolio.projectedValue10y) : '---'}</p>
          <div className="absolute top-4 right-4 w-2 h-2 bg-brand-accent rounded-full animate-pulse"></div>
          <p className="text-[9px] text-white/40 mt-2 font-medium">Basé sur une capitalisation annuelle composée.</p>
        </div>
      </div>

      <div className="p-8 space-y-10 flex-1">
        
        {/* Allocation Détaillée */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-50">Allocation Cible</h4>
            <div className="w-16 h-16 shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={20} outerRadius={30} paddingAngle={2} dataKey="value" stroke="none">
                    {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-6">
            {portfolio.allocation.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-xs font-black text-brand-primary uppercase tracking-tight">{item.category}</span>
                  </div>
                  <span className="text-xs font-black text-brand-primary">{item.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}></div>
                </div>
                {item.reason && (
                  <p className="text-[10px] text-brand-muted leading-relaxed italic mt-1 font-medium bg-slate-50/50 p-2 rounded-lg">
                    {item.reason}
                  </p>
                )}
                {item.examples && item.examples.length > 0 && (
                   <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.examples.map((ex, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded-md border border-slate-200">
                          {ex}
                        </span>
                      ))}
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wrappers */}
        <div className="space-y-3 pt-4 border-t border-slate-50">
          <h4 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-50">Enveloppes Préconisées</h4>
          <div className="flex flex-wrap gap-2">
            {portfolio.recommendedWrappers.map((w, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-brand-primary/5 text-brand-primary text-[10px] font-black rounded-xl border border-brand-primary/10">
                {w}
              </span>
            ))}
          </div>
        </div>

      </div>
      
      {/* Footer CTA */}
      <div className="p-8 bg-slate-50/50 border-t border-slate-100 mt-auto">
        <button className="w-full py-5 primary-gradient text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:shadow-xl transition-all active:scale-[0.98]">
          Générer la Lettre de Mission
        </button>
      </div>
    </div>
  );
};
