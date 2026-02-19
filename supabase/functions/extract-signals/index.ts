import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"

console.log("Extract signals function loaded")

interface SignalSource {
  id: string
  user_id: string
  type: string
  value: string
}

interface ExtractedSignal {
  entity_name?: string
  entity_type?: 'person' | 'company'
  observed_title?: string
  observed_company?: string
  observed_location?: string
  observed_contact?: string
  source_excerpt?: string
  source_url?: string
  observed_at?: string
}

serve(async (req) => {
  const { url, method } = req

  // This is needed if you're planning to invoke your function from a browser.
  if (method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the source_id from the request body
    const { source_id } = await req.json()

    if (!source_id) {
      return new Response(
        JSON.stringify({ error: 'source_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the source
    const { data: source, error: sourceError } = await supabaseClient
      .from('signal_sources')
      .select('*')
      .eq('id', source_id)
      .single()

    if (sourceError || !source) {
      return new Response(
        JSON.stringify({ error: 'Source not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if user can create signals
    const { data: canCreate, error: limitError } = await supabaseClient
      .rpc('can_create_signal', { user_uuid: source.user_id })

    if (limitError || !canCreate) {
      return new Response(
        JSON.stringify({ error: 'Signal creation limit exceeded for your plan' }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get content based on source type
    let content = ''
    if (source.type === 'pasted_text') {
      content = source.value
    } else if (source.type === 'url') {
      // For URLs, we'd need to fetch the content
      // For now, we'll use a placeholder or implement web scraping
      // This is a simplified version - in production you'd want proper content extraction
      try {
        const response = await fetch(source.value)
        if (response.ok) {
          content = await response.text()
          // Basic HTML stripping (very basic)
          content = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        } else {
          content = `Unable to fetch content from ${source.value}`
        }
      } catch (error) {
        content = `Error fetching content: ${error.message}`
      }
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Extract signals using Gemini
    const prompt = `You are an information extraction system.

Rules:
- Only extract entities explicitly present in the input text.
- Do NOT infer, guess, complete, or generate missing information.
- If a name, role, company, or contact is not written in the text, do not include it.
- Do NOT use words like verified, confirmed, or real.
- Treat all results as observed public mentions only.
- Return JSON array of signals only.

Input text:
${content}

Return a JSON array of objects with these possible fields (only include fields that are explicitly in the text):
- entity_name: the person's or company's name
- entity_type: "person" or "company"
- observed_title: job title or role
- observed_company: company name
- observed_location: location mentioned
- observed_contact: email or phone if present
- source_excerpt: relevant quote from text
- source_url: the source URL
- observed_at: date if mentioned (ISO format)

If no entities exist, return an empty array.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let signals: ExtractedSignal[] = []
    try {
      signals = JSON.parse(text)
      if (!Array.isArray(signals)) {
        signals = []
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      signals = []
    }

    // Insert signals into database
    const signalsToInsert = signals.map(signal => ({
      user_id: source.user_id,
      source_id: source.id,
      ...signal,
      observed_at: signal.observed_at ? new Date(signal.observed_at).toISOString() : null
    }))

    const { data: insertedSignals, error: insertError } = await supabaseClient
      .from('signals')
      .insert(signalsToInsert)
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save signals' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        signals_extracted: insertedSignals?.length || 0,
        signals: insertedSignals
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