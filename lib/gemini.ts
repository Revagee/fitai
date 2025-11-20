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
      model: "gemini-1.5-flash",
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

      REQUIRED JSON STRUCTURE:
      {
        "workoutPlan": [
          { 
            "day": "Day 1", 
            "focus": "Legs/Cardio", 
            "exercises": [
              { "name": "Squats", "sets": "3", "reps": "12" }
            ] 
          }
        ],
        "mealPlan": {
          "calories": 2000,
          "macros": { "protein": "150g", "carbs": "200g", "fats": "60g" },
          "dailyMeals": [
             { "meal": "Breakfast", "options": ["Oatmeal with berries"] }
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