import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { genre, tempo, chorusLine } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a professional hit songwriter and music producer. You create complete, radio-ready songs with creative lyrics, catchy melodies described in text, and detailed structure.

Your output must be a JSON object with these fields:
- title: A catchy song title
- lyrics: The full song lyrics with sections labeled (Intro, Verse 1, Pre-Chorus, Chorus, Verse 2, Bridge, Final Chorus, Outro). Include instrument cues in brackets like [Guitar riff], [Piano solo], [Bass drop], [Vocal harmony].
- structure: A brief description of the song arrangement
- genre: The genre style used
- tempo: The tempo description

Make the lyrics creative, emotionally resonant, and commercially viable. The chorus must prominently feature the user's chorus line. Include specific instrument parts for vocals, guitar, piano, and bass throughout.`;

    const userPrompt = `Create a hit ${genre} song at ${tempo} tempo. The chorus must include this line: "${chorusLine}". Include parts for vocals, guitar, piano, and bass.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_song",
              description: "Create a complete song with lyrics and structure",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Catchy song title" },
                  lyrics: { type: "string", description: "Full song lyrics with sections and instrument cues" },
                  structure: { type: "string", description: "Brief song structure description" },
                  genre: { type: "string", description: "Genre style" },
                  tempo: { type: "string", description: "Tempo description" },
                },
                required: ["title", "lyrics", "structure", "genre", "tempo"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_song" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let song;
    if (toolCall) {
      song = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse content as JSON
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        song = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse song from AI response");
      }
    }

    return new Response(JSON.stringify(song), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-song error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
