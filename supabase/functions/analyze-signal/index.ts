import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"

console.log("Analyze signal function loaded")

serve(async (req) => {
  const { url, method } = req

  if (method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { signal_id, analysis_type } = await req.json()

    if (!signal_id || !analysis_type) {
      return new Response(
        JSON.stringify({ error: 'signal_id and analysis_type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate analysis_type
    const validTypes = ['intent', 'seniority', 'outreach']
    if (!validTypes.includes(analysis_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid analysis_type. Must be one of: intent, seniority, outreach' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the signal
    const { data: signal, error: signalError } = await supabaseClient
      .from('signals')
      .select('*')
      .eq('id', signal_id)
      .single()

    if (signalError || !signal) {
      return new Response(
        JSON.stringify({ error: 'Signal not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if user can run AI analysis
    const { data: canAnalyze, error: limitError } = await supabaseClient
      .rpc('can_run_ai_analysis', { user_uuid: signal.user_id })

    if (limitError || !canAnalyze) {
      return new Response(
        JSON.stringify({ error: 'AI analysis not available for your plan' }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create analysis prompt based on type
    let prompt = ''
    const signalData = JSON.stringify({
      entity_name: signal.entity_name,
      entity_type: signal.entity_type,
      observed_title: signal.observed_title,
      observed_company: signal.observed_company,
      observed_location: signal.observed_location,
      source_excerpt: signal.source_excerpt
    }, null, 2)

    switch (analysis_type) {
      case 'intent':
        prompt = `Analyze the following business signal and determine the likelihood of business intent (scale 1-10, where 10 is highest intent).

Signal data:
${signalData}

Return JSON with:
- intent_score: number 1-10
- intent_reasoning: string explanation
- key_indicators: array of strings showing what suggests this intent level`
        break

      case 'seniority':
        prompt = `Analyze the following business signal and determine the seniority level of the observed person.

Signal data:
${signalData}

Return JSON with:
- seniority_level: "executive" | "senior" | "mid" | "junior" | "unknown"
- seniority_confidence: number 1-10
- seniority_reasoning: string explanation`
        break

      case 'outreach':
        prompt = `Generate outreach assistance for the following business signal.

Signal data:
${signalData}

Return JSON with:
- recommended_approach: string (email, linkedin, call, etc.)
- key_talking_points: array of strings
- suggested_timing: string
- potential_objections: array of strings
- ai_generated_email_draft: string (clearly marked as AI-generated)`
        break
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let analysis = {}
    try {
      analysis = JSON.parse(text)
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      analysis = { error: 'Failed to parse analysis response' }
    }

    // Insert analysis into database
    const { data: insertedAnalysis, error: insertError } = await supabaseClient
      .from('ai_analysis')
      .insert({
        signal_id: signal_id,
        analysis_type: analysis_type,
        content: analysis
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: insertedAnalysis
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})