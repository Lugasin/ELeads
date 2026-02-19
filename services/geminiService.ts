/**
 * @deprecated This service was part of the legacy architecture.
 * Signal extraction and analysis are now handled by Supabase Edge Functions:
 * - supabase/functions/extract-signals/
 * - supabase/functions/analyze-signal/
 * 
 * To be removed in v2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { BusinessEntity, RelationshipStatus, SignalType, Lead, LeadStatus } from "../types";

const getAi = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_GENAI_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("NEURAL_LINK_ERROR: Uplink key not found. Please connect your GCP node (VITE_GOOGLE_GENAI_KEY).");
  }
  return new GoogleGenAI({ apiKey });
};

import { calculateEngagementScore } from './scoringService';

export const scoutMarketEntities = async (sector: string, region: string): Promise<BusinessEntity[]> => {
  try {
    const ai = getAi();
    // Prompt modified to produce strict JSON matching our new schema where possible, 
    // but ultimately this should optionally be replaced by real API calls in Phase 1.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{
          text: `Act as a Strict Market Intelligence Analyst for E-Place Group.
          Conduct reconnaissance in ${region}, Zambia for the "${sector}" sector.
          
          STRICT PROTOCOL: VALIDATED DATA ONLY.
          1. DO NOT invent or hallucinate businesses. Return ONLY existing, verifiable entities relative to your training data.
          2. DO NOT invent contacts. If unknown, leave contacts empty [].
          3. DO NOT invent scores. Engagement scores are calculated deterministically by our system, not you.
          
          Goal: Identify real businesses in this sector/region.
          
          Return a JSON array of Business Entities.
          
          Structure:
          [
            {
              "name": "Real Company Name ONLY",
              "industry": "Specific Sector",
              "location": "District",
              "description": "Enterprise overview",
              "contacts": [], 
              "signals": [
                { "signal_type": "expansion", "description": "Verified recent activity or news", "confidence": 0.95 }
              ],
              "domain": "company.zm"
            }
          ]`
        }]
      }],
      config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(response.text || '[]');
    return data.map((item: any) => {
      const bizId = `entity-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const contacts = (item.contacts || []).map((c: any) => ({
        id: `c-${Math.random().toString(36).substr(2, 5)}`,
        business_id: bizId,
        full_name: c.full_name || c.name || "Unknown",
        role: c.role,
        email: c.email,
        visibility: 'team',
        confidence_score: c.confidence_score || 0,
        created_at: now
      }));

      const signals = (item.signals || []).map((s: any) => ({
        id: `s-${Math.random().toString(36).substr(2, 5)}`,
        business_id: bizId,
        signal_type: s.signal_type || 'update',
        source: 'Neural-Recon',
        confidence: s.confidence || 0.5,
        detected_at: now,
        description: s.description
      }));

      // Temporary entity structure for scoring calculation
      const tempEntity: BusinessEntity = {
        id: bizId,
        name: item.name,
        industry: item.industry,
        country: 'Zambia',
        city: item.location || region,
        description: item.description,
        website: item.domain || '',
        status: LeadStatus.TARGET,
        created_at: now,
        contacts,
        signals
      };

      // Calculate deterministic score
      const engagement = calculateEngagementScore(tempEntity);

      return {
        ...tempEntity,
        engagement,
        logoUrl: `https://logo.clearbit.com/${item.domain || 'google.com'}`,
        lastVerified: now,
        notes: ""
      };
    });
  } catch (error) {
    console.error("Scouting node failure:", error);
    throw error;
  }
};

export const generateStrategicBrief = async (entity: BusinessEntity): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a 2-paragraph strategic brief for penetrating ${entity.name} with E-Place services. 
    Focus on their market presence and how Outreach Workflows optimize their ${entity.industry} workflow in Zambia.`
  });
  return response.text || "Strategic brief unavailable.";
};

export const generateOutreachBundle = async (lead: Lead): Promise<{ email: string; sms: string }> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional cold email and a short SMS outreach for ${lead.name}. 
    Industry: ${lead.industry}. 
    Pitch E-Place Outreach Workflow: Focus on cost-efficiency and regional deliverability in Zambia.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          email: { type: Type.STRING },
          sms: { type: Type.STRING }
        },
        required: ["email", "sms"]
      }
    }
  });
  const text = response.text || '{"email": "", "sms": ""}';
  return JSON.parse(text.trim());
};

export const qualifyLeadAI = async (lead: Lead): Promise<{ status: LeadStatus }> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this entity for E-Place conversion: ${lead.name} in the ${lead.industry} sector. 
    Location: ${lead.city}. 
    Determine if they should be marked as "Qualified" or remain "Target".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING }
        },
        required: ["status"]
      }
    }
  });
  const data = JSON.parse(response.text?.trim() || '{"status": "Target"}');
  return data as { status: LeadStatus };
};
