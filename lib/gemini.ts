import { generateDemoPlan } from "./demoPlan";
import { detectLanguage, profileOf, type ChatResult, type ChatTurn, type ExerciseGuide } from "./aiShared";

// Browser side of the AI features. It never sees the Gemini key: every request goes to /api/ai,
// which builds the prompt and calls Gemini on the server (lib/aiServer.ts).

export type { ChatResult, ChatTurn, ExerciseGuide };

class AIError extends Error {
  constructor(public status: number, public code: string) {
    super(`AI request failed: ${status} ${code}`);
  }
}

async function callAI<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const code = await response.json().then((data) => String(data?.error || ""), () => "");
    throw new AIError(response.status, code);
  }
  return response.json();
}

const isNotConfigured = (error: unknown) => error instanceof AIError && error.code === "not_configured";

let configured: Promise<boolean> | null = null;

/** Whether the server has a Gemini key. Asked once per page load. */
export function checkAIConfigured(): Promise<boolean> {
  configured ??= fetch("/api/ai")
    .then((response) => response.json())
    .then((data) => Boolean(data?.configured))
    .catch(() => false);
  return configured;
}

export async function generateFitnessPlan(userData: any, locale: string = "en") {
  try {
    const { plan } = await callAI<{ plan: any }>({ action: "plan", userData: profileOf(userData), locale });
    if (!Array.isArray(plan?.workoutPlan) || !plan?.mealPlan) {
      throw new Error("The plan has an unexpected structure");
    }
    return plan;
  } catch (error) {
    if (isNotConfigured(error)) console.warn("Gemini API key is missing, using the demo plan.");
    else console.error("ОШИБКА В GEMINI API, используется демо-план:", error);
    return generateDemoPlan(userData, locale);
  }
}

const NOT_CONFIGURED: Record<string, string> = {
  en: "The AI coach needs a Gemini API key. Add GEMINI_API_KEY to .env.local and restart the app.",
  uk: "Для роботи ШІ-тренера потрібен ключ Gemini API. Додайте GEMINI_API_KEY у .env.local і перезапустіть застосунок.",
  ru: "Для работы ИИ-тренера нужен ключ Gemini API. Добавьте GEMINI_API_KEY в .env.local и перезапустите приложение.",
};

const CHAT_FAILED: Record<string, string> = {
  en: "I couldn't get a response from the AI service. Please try again later.",
  uk: "Не вдалося отримати відповідь від ШІ-сервісу. Спробуйте пізніше.",
  ru: "Не удалось получить ответ от ИИ-сервиса. Попробуйте позже.",
};

export async function chatWithAI(options: {
  message: string;
  history?: ChatTurn[];
  userData?: any;
  locale?: string;
}): Promise<ChatResult> {
  const { message, history = [], userData, locale } = options;
  const lang = detectLanguage(message, locale);

  try {
    const result = await callAI<ChatResult>({
      action: "chat",
      message,
      history: history.slice(-12),
      // Only the profile and the plan: the progress log and the rest stay in the browser.
      userData: userData ? { ...profileOf(userData), plan: userData.plan } : undefined,
      locale,
    });
    if (typeof result?.reply !== "string") throw new Error("Unexpected chat response");
    return { reply: result.reply, changes: result.changes || null };
  } catch (error) {
    if (isNotConfigured(error)) return { reply: NOT_CONFIGURED[lang] || NOT_CONFIGURED.en, changes: null };
    console.error("Error chatting with AI:", error);
    return { reply: CHAT_FAILED[lang] || CHAT_FAILED.en, changes: null };
  }
}

const GUIDE_CACHE_KEY = "fitai_exercise_guides";
const GUIDE_CACHE_LIMIT = 60;

const guideId = (name: string, locale: string) => `${locale}:${name.trim().toLowerCase()}`;

function readGuideCache(): Record<string, ExerciseGuide> {
  try {
    return JSON.parse(localStorage.getItem(GUIDE_CACHE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function getCachedGuide(name: string, locale: string): ExerciseGuide | null {
  return readGuideCache()[guideId(name, locale)] || null;
}

/** A detailed technique guide for one exercise, written by the model and cached in the browser. */
export async function explainExercise(name: string, locale: string = "en"): Promise<ExerciseGuide | null> {
  const cached = getCachedGuide(name, locale);
  if (cached) return cached;

  try {
    const { guide } = await callAI<{ guide: ExerciseGuide }>({ action: "guide", name, locale });
    if (!Array.isArray(guide?.steps) || guide.steps.length === 0) return null;

    try {
      const cache = readGuideCache();
      const keys = Object.keys(cache);
      if (keys.length >= GUIDE_CACHE_LIMIT) delete cache[keys[0]];
      cache[guideId(name, locale)] = guide;
      localStorage.setItem(GUIDE_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // The guide still works without the cache.
    }
    return guide;
  } catch (error) {
    if (!isNotConfigured(error)) console.error("Error explaining exercise:", error);
    return null;
  }
}
