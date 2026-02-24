import { GoogleGenerativeAI } from "@google/generative-ai";
import { InsightData, Mode } from "@/types/insight";
import { isTrustedDomain, verifyUrl, TRUSTED_DOMAINS } from "@/lib/validateSources";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const TRUSTED_DOMAINS_LIST = TRUSTED_DOMAINS.join(", ");

// Defensive JSON parser: handles plain JSON, ```json blocks, or JSON embedded in text
function parseJsonResponse(text: string): Omit<InsightData, "hasUnverifiedSources"> {
  try {
    return JSON.parse(text);
  } catch {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) return JSON.parse(codeBlockMatch[1].trim());
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("No JSON found in response");
  }
}

function buildPrompt(claim: string, mode: Mode): string {
  return `You are a calm, empathetic, and fact-based analyst helping people understand political and social claims more clearly. Your goal is NOT to shame or lecture, but to gently offer additional perspectives grounded in verified data.

## Task
Analyze the following claim and return a structured JSON response.

## Claim
"${claim}"

## Mode
${mode === "self" ? "The user wants to reflect on their own thinking." : "The user wants to understand how to talk to someone they care about who holds this belief."}

## STRICT RULES — MUST FOLLOW

1. **Sources**: ONLY cite sources from these trusted domains: ${TRUSTED_DOMAINS_LIST}
   - NEVER invent or hallucinate URLs, paper titles, or statistics
   - If you cannot find a real, verified source from the list above, omit that fact entirely
   - Do NOT include any source if you are not highly confident it exists

2. **Facts**: Every factual claim MUST be accompanied by a real source from the trusted list above
   - If no verified source is available, describe the perspective without claiming it as fact

3. **Tone**: Empathetic, calm, non-judgmental. Acknowledge why someone might hold this view.

4. **Language**: Respond in the same language as the claim ("${claim}" — detect language automatically)

5. **JSON only**: Return ONLY valid JSON. Do NOT wrap in markdown code blocks. Do NOT add any text before or after the JSON object. No citations markers like [1] inside the JSON values.

## Response Format
Return exactly this JSON structure:
{
  "inputSummary": "Brief neutral restatement of the claim (1-2 sentences)",
  "background": "Empathetic explanation of the psychological and social context — why reasonable people might hold this view (2-3 sentences)",
  "facts": [
    {
      "claim": "A specific verifiable fact relevant to this claim",
      "source": {
        "title": "Exact title of the source document/page",
        "url": "Full URL — ONLY from trusted domains list",
        "institution": "Name of the institution"
      }
    }
  ],
  "perspectives": [
    "Alternative perspective 1 — framed gently, not as 'you are wrong' but as 'here is another angle'",
    "Alternative perspective 2",
    "Alternative perspective 3"
  ],
  "conversationTips": {
    "forSelf": [
      "Question or reflection for someone examining their own thinking",
      "Another self-reflection prompt"
    ],
    "forOthers": [
      "Gentle phrase or approach to use when talking to someone who holds this view",
      "Another conversation starter"
    ]
  },
  "references": [
    {
      "title": "Source title",
      "url": "Full URL — ONLY from trusted domains",
      "institution": "Institution name"
    }
  ],
  "language": "ja or en or other ISO 639-1 code"
}

IMPORTANT: If facts array would contain unsupported claims, return an empty array rather than inventing sources. Quality over quantity.`;
}

export async function analyzeWithGemini(
  claim: string,
  mode: Mode
): Promise<InsightData> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.15,
      topP: 0.8,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ googleSearch: {} } as any],
  });

  const prompt = buildPrompt(claim, mode);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let parsed: Omit<InsightData, "hasUnverifiedSources">;
  try {
    parsed = parseJsonResponse(text);
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  // Post-process: verify all sources
  const verifiedFacts = await Promise.all(
    (parsed.facts || []).map(async (fact) => {
      if (!fact.source?.url) return null;
      if (!isTrustedDomain(fact.source.url)) return null;
      const verified = await verifyUrl(fact.source.url);
      return { ...fact, source: { ...fact.source, verified } };
    })
  );

  const verifiedRefs = await Promise.all(
    (parsed.references || []).map(async (ref) => {
      if (!ref.url) return null;
      if (!isTrustedDomain(ref.url)) return null;
      const verified = await verifyUrl(ref.url);
      return { ...ref, verified };
    })
  );

  const cleanFacts = verifiedFacts.filter(Boolean) as InsightData["facts"];
  const cleanRefs = verifiedRefs.filter(Boolean) as InsightData["references"];
  const hasUnverified =
    cleanFacts.some((f) => !f.source.verified) ||
    cleanRefs.some((r) => !r.verified);

  return {
    inputSummary: parsed.inputSummary || "",
    background: parsed.background || "",
    facts: cleanFacts,
    perspectives: parsed.perspectives || [],
    conversationTips: {
      forSelf: parsed.conversationTips?.forSelf || [],
      forOthers: parsed.conversationTips?.forOthers || [],
    },
    references: cleanRefs,
    language: parsed.language || "ja",
    hasUnverifiedSources: hasUnverified,
  };
}
