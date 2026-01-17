
import { GoogleGenAI, Type } from "@google/genai";
import { ClientProfile, LifeGoal, CurrentAsset, RiskProfile, AnalysisResponse, Debt } from "../types";

export const generatePortfolios = async (
  profile: ClientProfile,
  goals: LifeGoal[],
  assets: CurrentAsset[],
  debts: Debt[],
  risk: RiskProfile
): Promise<AnalysisResponse> => {
  // Initialisation à chaque appel pour garantir l'utilisation de la clé la plus récente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const totalCurrentCapital = assets.reduce((sum, a) => sum + a.value, 0);
  const totalRemainingDebt = debts.reduce((sum, d) => sum + d.remainingCapital, 0);
  const netWealth = totalCurrentCapital - totalRemainingDebt;
  const annualSavings = profile.monthlySavings * 12;

  const prompt = `
    En tant qu'Ingénieur Patrimonial expert pour le cabinet "L'Ingé Patrimoine", votre mission est de produire un audit stratégique complet et pédagogique.
    
    ### PROFIL CLIENT
    - Investisseur : ${profile.firstName} (${profile.age} ans)
    - Patrimoine Net Actuel : ${netWealth.toLocaleString()}€
    - Capacité d'Épargne Annuelle : ${annualSavings.toLocaleString()}€
    - Profil de Risque Cible : ${risk.label} (Niveau ${risk.score}/10)
    - TMI : ${profile.taxBracket}%

    ### OBJECTIFS DE VIE
    ${goals.map(g => `- ${g.title} : Cible ${g.targetAmount.toLocaleString()}€ à horizon ${g.horizon} ans`).join('\n')}

    ### VOTRE MISSION
    Générez 3 portefeuilles distincts (Prudent, Équilibré, Dynamique) avec une approche de "Bon Père de Famille" moderne et sophistiquée.
    
    ### RÈGLES DE CALCUL CRITIQUES (MATHS)
    Pour chaque portefeuille, vous devez calculer la valeur projetée à 10 ans (projectedValue10y) selon la formule actuarielle exacte :
    V10 = [Capital_Net * (1 + r)^10] + [Epargne_Annuelle * (((1 + r)^10 - 1) / r)]
    Où :
    - Capital_Net = ${netWealth}
    - Epargne_Annuelle = ${annualSavings}
    - r = rendement annuel estimé (ex: 0.03 pour 3%)
    
    ### TON & PÉDAGOGIE
    - Utilisez un langage clair, rassurant et professionnel.
    - Expliquez simplement pourquoi telle enveloppe (PEA, Assurance-vie, PER) est choisie.
    - Les stratégies doivent être compréhensibles par un néophyte tout en montrant votre expertise.

    ### STRUCTURE DE RÉPONSE
    Retournez UNIQUEMENT un objet JSON respectant le schéma fourni. Pas de texte avant ou après.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        // Un budget de 8000 est suffisant pour ces calculs et réduit le temps d'attente
        thinkingConfig: { thinkingBudget: 8000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { 
              type: Type.STRING, 
              description: "Note de synthèse globale pédagogique expliquant la stratégie globale pour le client." 
            },
            portfolios: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  expectedReturn: { type: Type.NUMBER, description: "Rendement annuel moyen en % (ex: 5.5)" },
                  volatility: { type: Type.NUMBER, description: "Volatilité annuelle estimée en %" },
                  projectedValue10y: { type: Type.NUMBER, description: "Valeur totale du capital après 10 ans (calculée via formule)" },
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
                        analysis: { type: Type.STRING, description: "Explication simple de pourquoi l'objectif est ou n'est pas atteignable." }
                      }
                    }
                  },
                  analysis: { type: Type.STRING, description: "Thèse d'investissement simplifiée pour le client." }
                },
                required: ["name", "expectedReturn", "allocation", "projectedValue10y", "attainability", "recommendedWrappers"]
              }
            }
          },
          required: ["summary", "portfolios"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Aucune réponse générée par l'IA.");
    
    // Nettoyage de sécurité
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson) as AnalysisResponse;
  } catch (error) {
    console.error("Erreur Gemini:", error);
    throw error;
  }
};
