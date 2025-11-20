import { GoogleGenerativeAI } from "@google/generative-ai";

// Инициализация клиента Gemini
// Убедись, что в .env.local есть ключ NEXT_PUBLIC_GEMINI_API_KEY
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateFitnessPlan(userData: any) {
  if (!apiKey) {
    throw new Error("API Key not found. Please check .env.local");
  }

  try {
    // Используем модель gemini-pro (текстовая)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Формируем промпт (запрос) для нейросети на основе данных пользователя
    const prompt = `
      Act as a professional fitness coach and nutritionist.
      Create a personalized workout and meal plan based on this user profile:
      
      Name: ${userData.name}
      Gender: ${userData.gender}
      Age: ${userData.age}
      Height: ${userData.height} cm
      Weight: ${userData.weight} kg
      Activity Level: ${userData.activityLevel}
      Goal: ${userData.fitnessGoal}
      Training Frequency: ${userData.trainingFrequency} days per week
      Equipment Access: ${userData.equipmentAccess.join(', ')}
      Diet Preferences: ${userData.dietPreferences.join(', ')}
      Allergies/Injuries: ${userData.allergies}

      Please provide a detailed response in JSON format with the following structure (do not use markdown code blocks, just raw JSON):
      {
        "workoutPlan": [
          { "day": "Day 1", "focus": "...", "exercises": [{ "name": "...", "sets": "...", "reps": "..." }] }
        ],
        "mealPlan": {
          "calories": 2500,
          "macros": { "protein": "...", "carbs": "...", "fats": "..." },
          "dailyMeals": [
             { "meal": "Breakfast", "options": ["..."] }
          ]
        },
        "tips": ["Tip 1", "Tip 2"]
      }
    `;

    // Отправляем запрос
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Пытаемся очистить ответ от лишних символов (иногда AI добавляет ```json ... ```)
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("Error in Gemini API:", error);
    // Возвращаем заглушку в случае ошибки, чтобы приложение не падало
    return null;
  }
}