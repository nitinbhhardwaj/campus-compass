/**
 * Serverless function: /api/parse
 * Handles conversational speech/text parsing into structured intents.
 * 
 * Security & Reliability:
 * 1. API keys (GEMINI_API_KEY / OPENAI_API_KEY / LLM_API_KEY) live strictly in process.env, never in client code.
 * 2. Payload size protection: limits input transcript to 1,000 characters and body to 10KB.
 * 3. Rate limiting: in-memory IP sliding window (max 30 requests / min).
 * 4. Model output is treated as untrusted JSON; strictly formatted via system prompt.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_TRANSCRIPT_LENGTH = 1_000;
const MAX_BODY_BYTES = 10_240; // 10KB

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [] };

  // Filter timestamps within current window
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  activeTimestamps.push(now);
  rateLimitMap.set(ip, { timestamps: activeTimestamps });
  return true;
}

export default async function handler(req: any, res?: any) {
  // Support both standard Node.js serverless (req, res) and Web Request / Response
  const isWebReq = typeof Request !== 'undefined' && req instanceof Request;

  const getHeader = (name: string): string => {
    if (isWebReq) return req.headers.get(name) || '';
    return (req.headers && req.headers[name.toLowerCase()]) || '';
  };

  const method = isWebReq ? req.method : req.method;
  if (method !== 'POST') {
    const errorBody = { error: 'Method not allowed. Only POST is supported.' };
    if (isWebReq) return new Response(JSON.stringify(errorBody), { status: 405 });
    return res.status(405).json(errorBody);
  }

  // Rate Limiting by IP
  const clientIp = getHeader('x-forwarded-for')?.split(',')[0]?.trim() || getHeader('x-real-ip') || 'anonymous';
  if (!checkRateLimit(clientIp)) {
    const errorBody = { error: 'Too many requests. Please wait a moment before trying again.' };
    if (isWebReq) return new Response(JSON.stringify(errorBody), { status: 429 });
    return res.status(429).json(errorBody);
  }

  let body: any;
  try {
    if (isWebReq) {
      const text = await req.text();
      if (text.length > MAX_BODY_BYTES) {
        return new Response(JSON.stringify({ error: 'Payload too large.' }), { status: 413 });
      }
      body = JSON.parse(text);
    } else {
      body = req.body;
      if (typeof body === 'string') {
        if (body.length > MAX_BODY_BYTES) {
          return res.status(413).json({ error: 'Payload too large.' });
        }
        body = JSON.parse(body);
      }
    }
  } catch (err) {
    const errorBody = { error: 'Invalid JSON request body.' };
    if (isWebReq) return new Response(JSON.stringify(errorBody), { status: 400 });
    return res.status(400).json(errorBody);
  }

  const { transcript, context } = body || {};

  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    const errorBody = { error: 'Transcript is required.' };
    if (isWebReq) return new Response(JSON.stringify(errorBody), { status: 400 });
    return res.status(400).json(errorBody);
  }

  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    const errorBody = { error: `Transcript exceeds maximum allowed length of ${MAX_TRANSCRIPT_LENGTH} characters.` };
    if (isWebReq) return new Response(JSON.stringify(errorBody), { status: 400 });
    return res.status(400).json(errorBody);
  }

  const today = context?.today || new Date().toISOString().split('T')[0];
  const allowedTaskCategories = context?.allowedTaskCategories || ['study', 'gym', 'skincare', 'chore', 'other'];
  const allowedExpenseCategories = context?.allowedExpenseCategories || ['food', 'travel', 'rent', 'subscriptions', 'study', 'other'];
  const dietPreference = context?.dietPreference || 'student staples';

  const systemPrompt = `You are Nova, an intelligent daily planning assistant for college students.
Your job is to analyze the user's spoken or typed utterance and output structured actions.

CONTEXT:
- Today's date is: "${today}".
- Allowed task categories: ${JSON.stringify(allowedTaskCategories)}.
- Allowed expense categories: ${JSON.stringify(allowedExpenseCategories)}.
- User dietary preferences: "${dietPreference}".

INSTRUCTIONS:
1. Return ONLY a valid JSON object matching this schema:
   {
     "intents": [
       {
         "type": "add_task",
         "title": "string (concise description)",
         "category": "study" | "gym" | "skincare" | "chore" | "other",
         "priority": 1 | 2 | 3 (1=urgent/due soon, 2=normal, 3=optional),
         "dueDate": "YYYY-MM-DD" | null,
         "recurrence": "none" | "daily" | "weekly"
       },
       {
         "type": "add_expense",
         "amountRupees": "string (e.g. '120' or '12.50')",
         "category": "food" | "travel" | "rent" | "subscriptions" | "study" | "other",
         "note": "string (description)",
         "date": "YYYY-MM-DD"
       },
       {
         "type": "add_protein",
         "label": "string (food name and portion)",
         "grams": number (approximate grams of protein, e.g. 1 egg = 6, 2 eggs = 12)
       },
       {
         "type": "clarify",
         "question": "string (friendly clarifying question)"
       }
     ]
   }
2. RESOLVE RELATIVE DATES ("today", "tomorrow", "day after tomorrow", "Friday", "in 2 days") against the supplied today ("${today}") into exact "YYYY-MM-DD" strings.
3. If an utterance is missing crucial details, ambiguous, or unclear, output a "clarify" intent instead of guessing.
4. For multi-item utterances (e.g. "I spent 120 on lunch and had 2 eggs and need to do DBMS tomorrow"), output multiple intents in the array (max 5).
5. DO NOT provide medical, dietary, or financial advice.
6. Output raw JSON only. Do not wrap in markdown or backticks.`;

  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;

  if (!apiKey) {
    // If no remote API key is provisioned in the environment, fallback gracefully to rule-based fallback parsing
    const fallbackIntents = generateLocalFallbackIntents(transcript, today);
    const responsePayload = { intents: fallbackIntents };
    if (isWebReq) return new Response(JSON.stringify(responsePayload), { status: 200, headers: { 'Content-Type': 'application/json' } });
    return res.status(200).json(responsePayload);
  }

  try {
    // Call Gemini API if GEMINI_API_KEY is present
    if (process.env.GEMINI_API_KEY) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: `User Utterance: "${transcript}"` },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText || '{}');
      if (isWebReq) return new Response(JSON.stringify(parsed), { status: 200, headers: { 'Content-Type': 'application/json' } });
      return res.status(200).json(parsed);
    }

    // Default to OpenAI-compatible endpoint if OPENAI_API_KEY is present
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');
    if (isWebReq) return new Response(JSON.stringify(parsed), { status: 200, headers: { 'Content-Type': 'application/json' } });
    return res.status(200).json(parsed);
  } catch (err) {
    // Graceful fallback to local heuristic parsing when network/remote LLM fails
    const fallbackIntents = generateLocalFallbackIntents(transcript, today);
    const responsePayload = { intents: fallbackIntents };
    if (isWebReq) return new Response(JSON.stringify(responsePayload), { status: 200, headers: { 'Content-Type': 'application/json' } });
    return res.status(200).json(responsePayload);
  }
}

/**
 * Deterministic heuristic parser used for offline testing or when remote LLM key is absent.
 */
function generateLocalFallbackIntents(transcript: string, today: string): any[] {
  const lower = transcript.toLowerCase();
  const intents: any[] = [];

  // 1. Check for expense mentions (e.g. "spent 120 on lunch", "paid 50 for chai")
  const expenseMatch = lower.match(/(?:spent|paid|bought|expense of)\s+(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)\s*(?:on|for)?\s*([a-zA-Z\s]+)?/i);
  if (expenseMatch) {
    const amount = expenseMatch[1];
    const rawNote = expenseMatch[2]?.trim().replace(/\band\b.*$/, '').trim() || 'Expense';
    intents.push({
      type: 'add_expense',
      amountRupees: amount,
      category: lower.includes('lunch') || lower.includes('dinner') || lower.includes('food') || lower.includes('chai') ? 'food' : 'other',
      note: rawNote.charAt(0).toUpperCase() + rawNote.slice(1),
      date: today,
    });
  }

  // 2. Check for protein mentions (e.g. "two eggs", "2 eggs", "scoop of whey", "100g paneer")
  if (lower.includes('egg')) {
    const countMatch = lower.match(/(\d+|one|two|three|four)\s*(?:boiled\s*)?eggs?/i);
    const wordToNum: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };
    const count = countMatch ? (parseInt(countMatch[1], 10) || wordToNum[countMatch[1].toLowerCase()] || 2) : 2;
    intents.push({
      type: 'add_protein',
      label: `${count} egg${count > 1 ? 's' : ''}`,
      grams: count * 6,
    });
  } else if (lower.includes('whey')) {
    intents.push({
      type: 'add_protein',
      label: '1 scoop whey',
      grams: 24,
    });
  } else if (lower.includes('paneer')) {
    intents.push({
      type: 'add_protein',
      label: 'Paneer',
      grams: 18,
    });
  }

  // 3. Check for task mentions (e.g. "submit dbms assignment tomorrow", "read chapter 3")
  const taskKeywords = ['submit', 'assignment', 'study', 'read', 'gym', 'workout', 'push day', 'leg day', 'laundry', 'skincare'];
  if (taskKeywords.some((k) => lower.includes(k))) {
    let dueDate: string | null = null;
    if (lower.includes('tomorrow')) {
      const [year, month, day] = today.split('-').map(Number);
      const tomorrowDate = new Date(year, month - 1, day + 1);
      dueDate = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;
    } else if (lower.includes('today')) {
      dueDate = today;
    }

    let category: any = 'other';
    if (lower.includes('dbms') || lower.includes('study') || lower.includes('assignment') || lower.includes('read')) {
      category = 'study';
    } else if (lower.includes('gym') || lower.includes('workout') || lower.includes('push') || lower.includes('leg')) {
      category = 'gym';
    } else if (lower.includes('skincare')) {
      category = 'skincare';
    } else if (lower.includes('laundry') || lower.includes('chore')) {
      category = 'chore';
    }

    // Clean up title
    let title = transcript
      .replace(/hey nova,?/i, '')
      .replace(/and i spent.*/i, '')
      .replace(/and i had.*/i, '')
      .trim();
    if (title.length > 3) {
      intents.push({
        type: 'add_task',
        title: title.charAt(0).toUpperCase() + title.slice(1),
        category,
        priority: category === 'study' ? 1 : 2,
        dueDate,
        recurrence: 'none',
      });
    }
  }

  // If nothing matched, ask to clarify
  if (intents.length === 0) {
    intents.push({
      type: 'clarify',
      question: "I couldn't quite extract a task, expense, or protein entry from that. Could you clarify what you'd like to add?",
    });
  }

  return intents;
}
