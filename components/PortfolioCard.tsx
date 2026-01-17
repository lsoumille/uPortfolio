
import React from 'react';
import { Portfolio } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0f172a', '#c5a059', '#10b981', '#1e293b', '#ef4444', '#8b5cf6'];

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

  return (
    <div className={`flex flex-col h-full bg-white rounded-[3.5rem] shadow-sm border transition-all duration-700 overflow-hidden group ${
      isMain ? 'ring-2 ring-brand-gold border-brand-gold/20 shadow-2xl shadow-brand-gold/10' : 'border-slate-100'
    } hover:shadow-2xl hover:shadow-brand-navy/5`}>
      
      {/* 1. Header & Projections */}
      <div className={`p-10 border-b border-brand-gold/5 ${isMain ? 'bg-brand-cream/40' : 'bg-slate-50/10'}`}>
        <div className="flex justify-between items-start gap-4 mb-8">
          <h3 className="text-3xl font-serif font-black text-brand-navy tracking-tight leading-none">{portfolio.name}</h3>
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            portfolio.riskLevel.toLowerCase().includes('dynamique') ? 'bg-red-50 text-red-700 border-red-100' :
            portfolio.riskLevel.toLowerCase().includes('équilibré') ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' :
            'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {portfolio.riskLevel}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-8 mb-10">
          <div>
            <p className="text-[10px] text-brand-gold font-black uppercase tracking-[0.2em] mb-2">Performance</p>
            <p className="text-4xl font-serif font-black text-emerald-700 tracking-tight">+{portfolio.expectedReturn}%</p>
          </div>
          <div className="h-12 w-px bg-brand-gold/20"></div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Risque Volatilité</p>
            <p className="text-4xl font-serif font-black text-brand-navy tracking-tight">{portfolio.volatility}%</p>
          </div>
        </div>

        <div className="navy-gradient rounded-[2rem] p-8 text-white relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 border border-brand-gold/20 shadow-xl shadow-brand-navy/10">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-2">Capital Final Estimé (10 ans)</p>
            <p className="text-3xl font-serif font-black tracking-tight">{portfolio.projectedValue10y ? formatCurrency(portfolio.projectedValue10y) : '---'}</p>
          </div>
          <div className="absolute top-0 right-0 p-6 opacity-30">
             <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse shadow-[0_0_12px_#c5a059]"></div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="p-10 space-y-12 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* 2. ENVELOPPES FISCALES */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-brand-gold uppercase tracking-[0.3em] px-2">Structuration d'Enveloppe</h4>
          <div className="grid grid-cols-1 gap-3">
            {portfolio.recommendedWrappers.map((w, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-brand-cream/50 border border-brand-gold/10 rounded-2xl group/item hover:bg-white hover:border-brand-gold/30 transition-all">
                <div className="w-8 h-8 rounded-xl navy-gradient flex items-center justify-center text-[11px] text-brand-gold font-black border border-brand-gold/20">
                  {idx + 1}
                </div>
                <span className="text-xs font-black text-brand-navy tracking-tight">{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. ALLOCATION D'ACTIFS */}
        <div className="space-y-6">
          <h4 className="text-[11px] font-black text-brand-gold uppercase tracking-[0.3em] px-2">Allocation d'Actifs</h4>
          
          <div className="flex flex-col gap-10">
            <div className="w-full h-36 bg-brand-cream/30 rounded-[2.5rem] p-4 border border-brand-gold/5 flex items-center justify-center shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData} 
                    innerRadius={35} 
                    outerRadius={55} 
                    paddingAngle={4} 
                    dataKey="value" 
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-5">
              {portfolio.allocation.map((item, idx) => (
                <div key={idx} className="group/alloc">
                  <div className="flex justify-between items-end mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-[12px] font-black text-brand-navy tracking-tight">{item.category}</span>
                    </div>
                    <span className="text-[12px] font-black text-brand-navy">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1 bg-brand-cream rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ 
                        width: `${item.percentage}%`, 
                        backgroundColor: COLORS[idx % COLORS.length] 
                      }}
                    ></div>
                  </div>
                  {item.examples && item.examples.length > 0 && (
                    <p className="text-[10px] text-slate-400 mt-2 ml-6 font-medium leading-relaxed italic opacity-0 group-hover/alloc:opacity-100 transition-opacity duration-300">
                      Séléction : {item.examples.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Faisabilité des Projets */}
        <div className="space-y-5 pt-4 border-t border-brand-gold/5">
           <h4 className="text-[11px] font-black text-brand-gold uppercase tracking-[0.3em] px-2">Réalisation des Objectifs</h4>
           <div className="space-y-4">
             {portfolio.attainability.map((item, i) => (
               <div key={i} className="p-6 bg-brand-cream/30 border border-brand-gold/10 rounded-[2rem] flex gap-5 items-start transition-all hover:bg-white hover:shadow-xl hover:shadow-brand-gold/5">
                 <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-md border ${
                   item.status === 'Atteignable' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                   item.status === 'Partiel' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                 }`}>
                   {item.status === 'Atteignable' ? '✓' : item.status === 'Partiel' ? '~' : '!'}
                 </div>
                 <div className="space-y-2 flex-1">
                   <div className="flex items-center justify-between">
                     <span className="text-[12px] font-black text-brand-navy uppercase tracking-tight">{item.goalTitle}</span>
                     <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        item.status === 'Atteignable' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        item.status === 'Partiel' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'
                     }`}>{item.status}</span>
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed font-bold italic opacity-80 leading-snug">{item.analysis}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* 5. Qualité & Sélection Section */}
        <div className="p-8 navy-gradient rounded-[2.5rem] border border-brand-gold/20 space-y-6 shadow-2xl shadow-brand-navy/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <h4 className="text-[11px] font-black text-brand-gold uppercase tracking-[0.3em] leading-none">Indice de Qualité (Quality)</h4>
            <div className="px-3 py-1.5 bg-brand-gold rounded-lg text-brand-navy text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(197,160,89,0.3)]">
              {portfolio.qualityScore}/100
            </div>
          </div>
          <div className="space-y-3.5 relative z-10">
            {portfolio.diversificationHighlights.map((point, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 shadow-[0_0_8px_#c5a059]"></div>
                <p className="text-[12px] font-bold text-slate-300 leading-relaxed tracking-tight">{point}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-2 border-t border-white/5 relative z-10">
             <p className="text-[10px] text-brand-gold font-black uppercase tracking-[0.4em] mb-2.5">Thèse d'Investissement</p>
             <p className="text-[12px] text-slate-400 italic leading-relaxed font-medium">"{portfolio.analysis}"</p>
          </div>
        </div>
      </div>
      
      {/* 6. Footer CTA */}
      <div className="p-10 bg-brand-cream/50 border-t border-brand-gold/10">
        <button className="w-full py-6 navy-gradient text-brand-gold rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] hover:shadow-2xl shadow-brand-navy/20 transition-all active:scale-[0.98] border border-brand-gold/20 flex items-center justify-center gap-3">
          Signer la Lettre de Mission
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
};
