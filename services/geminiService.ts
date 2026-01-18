
import { GoogleGenAI, Type } from "@google/genai";
import { ClientProfile, LifeGoal, CurrentAsset, RiskProfile, AnalysisResponse, Debt } from "../types";

export const generatePortfolios = async (
  profile: ClientProfile,
  goals: LifeGoal[],
  assets: CurrentAsset[],
  debts: Debt[],
  risk: RiskProfile,
  additionalContext: string
): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const totalCurrentCapital = assets.reduce((sum, a) => sum + a.value, 0);
  const totalRemainingDebt = debts.reduce((sum, d) => sum + d.remainingCapital, 0);
  const netWealth = totalCurrentCapital - totalRemainingDebt;
  const annualSavings = profile.monthlySavings * 12;

  const prompt = `
    En tant qu'Ingénieur Patrimonial expert pour le cabinet "L'Ingé Patrimoine", produisez un audit stratégique complet.
    
    ### PROFIL CLIENT
    - Investisseur : ${profile.firstName} (${profile.age} ans)
    - Patrimoine Net Actuel : ${netWealth.toLocaleString()}€
    - Capacité d'Épargne Annuelle : ${annualSavings.toLocaleString()}€
    - Profil de Risque Cible : ${risk.label} (Score ${risk.score}/10)
    - TMI : ${profile.taxBracket}%

    ### CONTEXTE ET OBJECTIFS
    Context : ${additionalContext || "Standard"}
    Objectifs : ${goals.map(g => `${g.title} (${g.targetAmount}€ à ${g.horizon} ans)`).join(', ')}

    ### VOTRE MISSION
    Générez 3 portefeuilles : Prudent, Équilibré, Dynamique.
    
    ### RÈGLES DE COHÉRENCE MATHÉMATIQUE (CRITIQUE)
    1. UNITÉS DES VALEURS : 
       - expectedReturn : DOIT être un nombre représentant le pourcentage direct (ex: 7.5 pour 7.5%). NE PAS RENVOYER 0.075.
       - volatility : DOIT être un nombre représentant le pourcentage direct (ex: 12 pour 12%). NE PAS RENVOYER 0.12.
    
    2. COHÉRENCE RENDEMENT / VOLATILITÉ :
       - Prudent: Rendement 2.5 à 4.0 / Volatilité 4.0 à 6.0.
       - Équilibré: Rendement 5.0 à 7.5 / Volatilité 10.0 à 14.0.
       - Dynamique: Rendement 8.0 à 12.0 / Volatilité 18.0 à 25.0.
    
    3. CALCUL DE PROJECTION 10 ANS (V10) :
       Utilisez strictement la formule : V10 = [Patrimoine_Net * (1 + r)^10] + [Épargne_Annuelle * (((1 + r)^10 - 1) / r)].
       Où 'r' est le taux annuel (ex: 0.05 pour 5%).
       Le résultat doit être cohérent avec le patrimoine net de départ (${netWealth}€) et l'épargne (${annualSavings}€/an).
    
    ### FORMAT DE RÉPONSE
    JSON pur uniquement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 15000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            portfolios: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  expectedReturn: { 
                    type: Type.NUMBER, 
                    description: "Taux de rendement en pourcentage (ex: 7.5 pour 7.5%)." 
                  },
                  volatility: { 
                    type: Type.NUMBER, 
                    description: "Volatilité en pourcentage (ex: 12 pour 12%)." 
                  },
                  projectedValue10y: { type: Type.NUMBER },
                  qualityScore: { type: Type.NUMBER },
                  diversificationHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedWrappers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  allocation: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        percentage: { type: Type.NUMBER },
                        reason: { type: Type.STRING, description: "Justification du poids." },
                        examples: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    }
                  },
                  attainability: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        goalTitle: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['Atteignable', 'Partiel', 'Difficile'] },
                        analysis: { type: Type.STRING }
                      }
                    }
                  },
                  analysis: { type: Type.STRING }
                },
                required: ["name", "expectedReturn", "volatility", "allocation", "projectedValue10y", "attainability", "recommendedWrappers"]
              }
            }
          },
          required: ["summary", "portfolios"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Erreur de génération");
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson) as AnalysisResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
