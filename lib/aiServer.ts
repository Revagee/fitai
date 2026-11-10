import 'server-only'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { DEMO_KEYS } from './exercises'
import { compactPlan, sanitizeChanges } from './plan'
import { detectLanguage, type ChatResult, type ChatTurn, type ExerciseGuide } from './aiShared'

// Everything that talks to Gemini lives here and runs only on the server (see app/api/ai/route.ts),
// so the API key never reaches the browser.

// NEXT_PUBLIC_* names are still read so an old .env.local keeps working, but prefer the plain ones:
// a NEXT_PUBLIC_ variable is copied into browser code as soon as any client file mentions it.
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
export const aiConfigured = Boolean(apiKey)
const genAI = new GoogleGenerativeAI(apiKey || '')

const PRIMARY_MODEL = process.env.GEMINI_MODEL || process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-flash-latest'
// Safety net: during demand spikes the full-size models answer 503 or hang for minutes,
// while the lite model keeps replying within a couple of seconds.
// Two of them, because even a lite model occasionally answers 503 for a moment.
const FAST_MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite']
const unique = (models: string[]) => Array.from(new Set(models))
const PLAN_MODELS = unique([PRIMARY_MODEL, 'gemini-3.8-flash', ...FAST_MODELS])
const CHAT_MODELS = unique([PRIMARY_MODEL, ...FAST_MODELS])
// Leaves room for the fast model to answer inside the route's 5-minute limit if the main one hangs.
const PLAN_TIMEOUT_MS = 4 * 60 * 1000
// Chat and exercise guides are short: give up on a slow model quickly and ask the fast one.
const CHAT_TIMEOUT_MS = 25 * 1000
const COOLDOWN_MS = 5 * 60 * 1000
// Models that were overloaded or timed out recently; they are tried last until the cooldown ends.
const coolingUntil: Record<string, number> = {}

/**
 * Tries each model in turn. Overload (503), rate limit (429) and timeouts move on to the next model;
 * the long plan request also retries once before moving on.
 */
async function generateWithFallback(prompt: string, interactive: boolean) {
  const now = Date.now()
  const cooling = (model: string) => (coolingUntil[model] || 0) > now
  const models = interactive ? CHAT_MODELS : PLAN_MODELS
  const ordered = [...models.filter((model) => !cooling(model)), ...models.filter(cooling)]
  const timeout = interactive ? CHAT_TIMEOUT_MS : PLAN_TIMEOUT_MS
  const attempts = interactive ? 1 : 2
  const generationConfig = { responseMimeType: 'application/json' }

  let lastError: unknown
  let timedOut = false
  for (const model of ordered) {
    // After a timeout the user has waited long enough: go straight to the fast models.
    if (timedOut && !FAST_MODELS.includes(model)) continue
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const result = await genAI.getGenerativeModel({ model, generationConfig }, { timeout }).generateContent(prompt)
        return result.response.text()
      } catch (error) {
        lastError = error
        const busy = /\b(503|429)\b/.test(String(error))
        if (/abort|timed? ?out/i.test(String(error))) timedOut = true
        if (busy || timedOut) coolingUntil[model] = Date.now() + COOLDOWN_MS
        if (!busy || timedOut) break
        if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    }
  }
  throw lastError
}

// The model sometimes wraps JSON in a code fence or adds a sentence around it.
function parseJson(raw: string): any {
  try {
    return JSON.parse(raw)
  } catch {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end <= start) return null
    try {
      return JSON.parse(raw.slice(start, end + 1))
    } catch {
      return null
    }
  }
}

const LANGUAGE_NAMES: Record<string, string> = { en: 'English', uk: 'Ukrainian', ru: 'Russian' }

// Request data comes from the browser, so it is trimmed and flattened before it goes into a prompt.
const line = (value: unknown, max = 80) =>
  value == null ? '' : String(value).replace(/\s+/g, ' ').trim().slice(0, max)
const list = (value: unknown) => (Array.isArray(value) ? value : []).slice(0, 12).map((item) => line(item, 40)).filter(Boolean).join(', ')

export async function planFromAI(userData: any, locale: string) {
  const prompt = `
      You are an elite fitness coach. Create a JSON fitness plan for this user.
      Write every text value (focus, exercise and meal names, options, notes, tips) in ${LANGUAGE_NAMES[locale] || 'English'}. Keep the JSON keys in English.

      User Profile:
      - Name: ${line(userData?.name)}
      - Gender: ${line(userData?.gender)}
      - Age: ${line(userData?.age)}
      - Height: ${line(userData?.height)} cm
      - Weight: ${line(userData?.weight)} kg
      - Activity: ${line(userData?.activityLevel)}
      - Goal: ${line(userData?.fitnessGoal)}
      - Frequency: ${line(userData?.trainingFrequency)} days/week
      - Equipment: ${list(userData?.equipmentAccess)}
      - Diet: ${list(userData?.dietPreferences)}
      - Allergies: ${line(userData?.allergies, 300)}

      REQUIRED JSON STRUCTURE (Create a 7-day plan):
      {
        "workoutPlan": [
          {
            "day": "Day 1",
            "focus": "Legs/Cardio",
            "exercises": [
              { "name": "Squats", "sets": "3", "reps": "12", "rest": 60, "notes": "Keep back straight", "demo": "squat" }
            ]
          },
          { "day": "Day 2", "focus": "Upper Body", "exercises": [...] },
          ... (create 7 days total)
        ],
        "mealPlan": {
          "calories": 2000,
          "macros": { "protein": "150g", "carbs": "200g", "fats": "60g" },
          "weeklyMeals": [
            {
              "day": 1,
              "meals": [
                { "meal": "Breakfast", "options": ["Oatmeal with berries", "Greek yogurt"], "calories": 400, "protein": "20g", "carbs": "50g", "fats": "10g" },
                { "meal": "Lunch", "options": ["Grilled chicken salad"], "calories": 500, "protein": "40g", "carbs": "30g", "fats": "20g" },
                { "meal": "Dinner", "options": ["Salmon with vegetables"], "calories": 600, "protein": "45g", "carbs": "40g", "fats": "25g" },
                { "meal": "Snack", "options": ["Apple with almond butter"], "calories": 200, "protein": "5g", "carbs": "25g", "fats": "10g" }
              ]
            },
            ... (create 7 days total)
          ]
        },
        "tips": ["Drink water", "Sleep 8 hours"]
      }

      For every exercise: "rest" is the rest between sets in seconds, and "demo" is the movement pattern
      it is closest to, one of: ${DEMO_KEYS.join(', ')} (use "" when none fits).
    `

  // JSON-режим гарантирует, что ответ будет в правильном формате
  const plan = parseJson(await generateWithFallback(prompt, false))
  if (!Array.isArray(plan?.workoutPlan) || !plan?.mealPlan) {
    throw new Error('Gemini returned a plan with an unexpected structure')
  }
  return plan
}

const HISTORY_LIMIT = 12

export async function chatFromAI(options: {
  message: string
  history?: ChatTurn[]
  userData?: any
  locale?: string
}): Promise<ChatResult | null> {
  const { userData, locale } = options
  const message = String(options.message || '').trim().slice(0, 2000)
  const detectedLang = detectLanguage(message, locale)

  const profile = userData
    ? [
        `Gender: ${line(userData.gender) || 'N/A'}`,
        `Age: ${line(userData.age) || 'N/A'}`,
        `Height: ${line(userData.height) || 'N/A'} cm`,
        `Weight: ${line(userData.weight) || 'N/A'} kg`,
        `Goal: ${line(userData.fitnessGoal) || 'N/A'}`,
        `Activity: ${line(userData.activityLevel) || 'N/A'}`,
        `Training days per week: ${line(userData.trainingFrequency) || 'N/A'}`,
        `Equipment: ${list(userData.equipmentAccess) || 'N/A'}`,
        `Diet: ${list(userData.dietPreferences) || 'N/A'}`,
        `Allergies: ${line(userData.allergies, 300) || 'none'}`,
      ].join('; ')
    : 'unknown'

  const plan = userData?.plan ? JSON.stringify(compactPlan(userData.plan)) : null
  const conversation = (Array.isArray(options.history) ? options.history : [])
    .slice(-HISTORY_LIMIT)
    .map((turn) => `${turn?.role === 'user' ? 'User' : 'Coach'}: ${String(turn?.content || '').slice(0, 2000)}`)
    .join('\n')

  const prompt = `You are an expert AI fitness and nutrition coach inside the FitAI app. You give helpful, accurate, motivating advice about training, nutrition, weight management and healthy habits. Be friendly and practical. If you don't know something, say so rather than guessing.

You can also EDIT the user's saved 7-day plan when they ask for it.

User profile: ${profile}

${plan ? `CURRENT PLAN (JSON, days are numbered 1-7):\n${plan}` : 'The user has no saved plan yet, so you cannot edit one.'}

${conversation ? `Conversation so far:\n${conversation}\n` : ''}
User: ${message}

Answer with a single JSON object and nothing else:
{
  "reply": "your answer to the user",
  "changes": null
}

Rules for "reply":
- Write it in ${LANGUAGE_NAMES[detectedLang] || 'English'}. Plain text only: no markdown headings or tables; short paragraphs or simple "- " lists are fine.
- When you change the plan, say briefly what exactly you changed and why.
- Get to the point; greet the user only if they greet you first.

Rules for "changes":
- Keep it null unless the user clearly asks to change, replace, add or remove something in their plan (or agrees to a change you proposed). For questions and advice it must be null.
- Otherwise use this shape, including only the parts that change:
  {
    "workoutDays": [ { "day": 1, "focus": "...", "exercises": [ { "name": "...", "sets": "3", "reps": "10-12", "rest": 60, "notes": "...", "demo": "squat" } ] } ],
    "mealDays": [ { "day": 1, "meals": [ { "meal": "Breakfast", "options": ["..."], "calories": 400, "protein": "20g", "carbs": "50g", "fats": "10g" } ] } ],
    "mealTargets": { "calories": 2000, "protein": "150g", "carbs": "200g", "fats": "60g" }
  }
- Each day you include REPLACES that whole day, so list every exercise or meal of that day after the change, copying the untouched ones exactly as they are. Do not include days that stay the same.
- A rest day is a workout day with an empty "exercises" list.
- "demo" is the movement pattern closest to the exercise, one of: ${DEMO_KEYS.join(', ')} (use "" when none fits).
- Write exercise names, meal names, options, focus and notes in the same language the current plan uses.
- Respect the user's equipment, diet and allergies, and keep the day's calories close to the target unless the user asks otherwise.
- If the request is unclear (for example, which day), ask a short question in "reply" and keep "changes" null.`

  const raw = await generateWithFallback(prompt, true)
  const parsed = parseJson(raw)
  const reply = typeof parsed?.reply === 'string' && parsed.reply.trim() ? parsed.reply.trim() : null

  if (!reply) {
    // Not the JSON we asked for: plain text is still an answer; broken JSON is a failure (null).
    return parsed ? null : { reply: raw.trim(), changes: null }
  }
  return { reply, changes: userData?.plan ? sanitizeChanges(parsed.changes) : null }
}

const strings = (value: unknown, max: number) =>
  (Array.isArray(value) ? value : []).map((item) => String(item).trim()).filter(Boolean).slice(0, max)

/** A detailed technique guide for one exercise; null when the model returned nothing usable. */
export async function guideFromAI(exerciseName: string, locale: string): Promise<ExerciseGuide | null> {
  const name = line(exerciseName, 120).replace(/["`]/g, '')
  if (!name) return null

  const prompt = `You are an experienced strength and conditioning coach. Explain how to perform the exercise "${name}" safely and with correct technique, for a person training on their own.
Write every text value in ${LANGUAGE_NAMES[locale] || 'English'}. Be concrete and brief: each item is one sentence.

Answer with a single JSON object:
{
  "muscles": ["main muscles worked, 2-4 items"],
  "steps": ["4-6 steps, from the starting position to the end of a repetition"],
  "mistakes": ["2-3 common mistakes and how to avoid them"],
  "breathing": "when to inhale and when to exhale"
}`

  const parsed = parseJson(await generateWithFallback(prompt, true))
  const guide: ExerciseGuide = {
    muscles: strings(parsed?.muscles, 5),
    steps: strings(parsed?.steps, 8),
    mistakes: strings(parsed?.mistakes, 4),
    breathing: typeof parsed?.breathing === 'string' ? parsed.breathing.trim() : '',
  }
  return guide.steps.length ? guide : null
}
