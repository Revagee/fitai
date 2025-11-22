import { GoogleGenerativeAI } from "@google/generative-ai";

// Проверка ключа
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateFitnessPlan(userData: any) {
  if (!apiKey) {
    console.error("API Key is missing!");
    alert("В файле .env.local нет ключа API. Процесс остановлен.");
    return null;
  }

  try {
    // Используем модель gemini-1.5-flash с настройкой JSON
    // Это ГАРАНТИРУЕТ, что ответ будет в правильном формате
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an elite fitness coach. Create a JSON fitness plan for this user:
      
      User Profile:
      - Name: ${userData.name}
      - Gender: ${userData.gender}
      - Age: ${userData.age}
      - Height: ${userData.height} cm
      - Weight: ${userData.weight} kg
      - Activity: ${userData.activityLevel}
      - Goal: ${userData.fitnessGoal}
      - Frequency: ${userData.trainingFrequency} days/week
      - Equipment: ${userData.equipmentAccess.join(', ')}
      - Diet: ${userData.dietPreferences.join(', ')}
      - Allergies: ${userData.allergies}

      REQUIRED JSON STRUCTURE (Create a 7-day plan):
      {
        "workoutPlan": [
          { 
            "day": "Day 1", 
            "focus": "Legs/Cardio", 
            "exercises": [
              { "name": "Squats", "sets": "3", "reps": "12", "notes": "Keep back straight" }
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
    `;

    console.log("Отправка запроса к Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Ответ получен:", text);

    // Парсим JSON
    const jsonResponse = JSON.parse(text);
    return jsonResponse;

  } catch (error) {
    console.error("ОШИБКА В GEMINI API:", error);
    // Если ошибка связана с ключом или квотами, покажем её
    return null;
  }
}

// Function to detect language from text
function detectLanguage(text: string): string {
  // Simple language detection based on common words and characters
  const russianChars = /[а-яё]/i;
  const ukrainianChars = /[а-яіїєґ]/i;
  
  if (russianChars.test(text)) {
    return 'ru';
  } else if (ukrainianChars.test(text)) {
    return 'uk';
  }
  return 'en';
}

export async function chatWithAI(message: string, context?: string, userLocale?: string): Promise<string> {
  if (!apiKey) {
    console.error("API Key is missing!");
    return "I'm sorry, but the AI service is not configured. Please add your API key to continue.";
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
    });

    // Detect language from user message or use provided locale
    const detectedLang = detectLanguage(message) || userLocale || 'en';
    
    const languageInstructions: Record<string, string> = {
      'ru': 'Отвечай на русском языке. Используй дружелюбный и мотивирующий тон.',
      'uk': 'Відповідай українською мовою. Використовуй дружній та мотивуючий тон.',
      'en': 'Respond in English. Use a friendly and motivating tone.'
    };

    const systemPrompt = `You are an expert AI fitness and nutrition coach. Your role is to provide helpful, accurate, and motivating advice about:
- Fitness and exercise routines
- Nutrition and meal planning
- Weight management
- Healthy lifestyle habits
- Goal setting and progress tracking

Be friendly, encouraging, and professional. Provide practical, actionable advice. If you don't know something, admit it rather than guessing.

IMPORTANT: ${languageInstructions[detectedLang] || languageInstructions['en']}

${context ? `User Context: ${context}\n\n` : ''}
Please respond to the user's question in a helpful and encouraging way.`;

    const prompt = `${systemPrompt}\n\nUser: ${message}\n\nCoach:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error chatting with AI:", error);
    return "I apologize, but I encountered an error. Please try again later.";
  }
}