import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyAuwXyN-WV2raJPB593tXuzRA2kLY1M1Ic'

let genAI: GoogleGenerativeAI | null = null

function getGenAI() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY)
  }
  return genAI
}

export async function generateMealPlan(userData: any, days: number = 7) {
  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `Create a ${days}-day personalized meal plan for:
- Gender: ${userData.gender || 'not specified'}
- Age: ${userData.age || 'not specified'}
- Height: ${userData.height || 'not specified'} cm
- Weight: ${userData.weight || 'not specified'} kg
- Fitness Goal: ${userData.fitnessGoal || 'not specified'}
- Activity Level: ${userData.activityLevel || 'not specified'}
- Daily Calories: ${userData.calories || 2000}
- Diet Preferences: ${userData.dietPreferences?.join(', ') || 'none'}
- Allergies: ${userData.allergies?.join(', ') || 'none'}

Return a JSON array with daily meal plans. Each day should have breakfast, lunch, dinner, and snacks.
Each meal should include: name, description, calories, protein (g), carbs (g), fats (g), ingredients array, and cooking instructions array.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    // Fallback to mock data
    return generateMockMealPlan(days)
  } catch (error) {
    console.error('Error generating meal plan:', error)
    return generateMockMealPlan(days)
  }
}

export async function generateWorkoutPlan(userData: any, days: number = 7) {
  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `Create a ${days}-day personalized workout plan for:
- Gender: ${userData.gender || 'not specified'}
- Age: ${userData.age || 'not specified'}
- Fitness Goal: ${userData.fitnessGoal || 'not specified'}
- Activity Level: ${userData.activityLevel || 'not specified'}
- Training Frequency: ${userData.trainingFrequency || 3} days per week
- Equipment Available: ${userData.equipmentAccess?.join(', ') || 'bodyweight only'}

Return a JSON array with daily workout plans. Each workout should include exercises with:
- name, sets, reps, restSeconds (in seconds), muscleGroups array, equipment array (optional), and notes (optional).`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    // Fallback to mock data
    return generateMockWorkoutPlan(days, userData)
  } catch (error) {
    console.error('Error generating workout plan:', error)
    return generateMockWorkoutPlan(days, userData)
  }
}

export async function chatWithAI(userMessage: string, context?: string) {
  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = context 
      ? `You are a fitness and nutrition AI coach. User context: ${context}\n\nUser question: ${userMessage}\n\nProvide a helpful, accurate, and motivating response.`
      : `You are a fitness and nutrition AI coach. User question: ${userMessage}\n\nProvide a helpful, accurate, and motivating response.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error chatting with AI:', error)
    return 'I apologize, but I encountered an error. Please try again later.'
  }
}

// Mock data generators for fallback
function generateMockMealPlan(days: number) {
  const meals = []
  for (let day = 1; day <= days; day++) {
    meals.push({
      day,
      date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      meals: [
        {
          id: `breakfast-${day}`,
          name: 'Protein Pancakes',
          description: 'Fluffy pancakes with protein powder',
          calories: 450,
          protein: 35,
          carbs: 45,
          fats: 12,
          ingredients: ['Oats', 'Protein powder', 'Eggs', 'Banana'],
          instructions: ['Mix ingredients', 'Cook on pan', 'Serve hot'],
        },
        {
          id: `lunch-${day}`,
          name: 'Grilled Chicken Salad',
          description: 'Healthy salad with lean protein',
          calories: 550,
          protein: 40,
          carbs: 30,
          fats: 25,
          ingredients: ['Chicken breast', 'Mixed greens', 'Olive oil', 'Vegetables'],
          instructions: ['Grill chicken', 'Toss salad', 'Add dressing'],
        },
        {
          id: `dinner-${day}`,
          name: 'Salmon with Vegetables',
          description: 'Baked salmon with roasted vegetables',
          calories: 600,
          protein: 45,
          carbs: 35,
          fats: 30,
          ingredients: ['Salmon fillet', 'Broccoli', 'Sweet potato', 'Olive oil'],
          instructions: ['Bake salmon', 'Roast vegetables', 'Season and serve'],
        },
      ],
    })
  }
  return meals
}

function generateMockWorkoutPlan(days: number, userData: any) {
  const workouts = []
  const exercises = [
    { name: 'Squats', sets: 4, reps: 10, rest: 60, muscles: ['legs', 'glutes'] },
    { name: 'Push-ups', sets: 3, reps: 12, rest: 45, muscles: ['chest', 'triceps'] },
    { name: 'Pull-ups', sets: 3, reps: 8, rest: 60, muscles: ['back', 'biceps'] },
    { name: 'Plank', sets: 3, reps: '60s', rest: 30, muscles: ['core'] },
    { name: 'Deadlifts', sets: 4, reps: 8, rest: 90, muscles: ['back', 'legs'] },
  ]

  for (let day = 1; day <= days; day++) {
    const dayExercises = exercises.map((ex, idx) => ({
      id: `ex-${day}-${idx}`,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.rest,
      muscleGroups: ex.muscles,
      notes: `Focus on proper form`,
    }))

    workouts.push({
      day,
      date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      exercises: dayExercises,
      estimatedDuration: 45,
      targetMuscleGroups: ['full body'],
    })
  }
  return workouts
}

