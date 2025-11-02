export interface User {
  id: string
  email: string
  name: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  height?: number // in cm
  weight?: number // in kg
  fitnessGoal?: 'muscle_gain' | 'fat_loss'
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
  equipmentAccess?: string[]
  dietPreferences?: string[]
  allergies?: string[]
  trainingFrequency?: number // days per week
  createdAt: string
  updatedAt?: string
}

export interface UserMetrics {
  bmi: number
  bmr: number // Basal Metabolic Rate
  tdee: number // Total Daily Energy Expenditure
  calories: number
  protein: number // grams
  carbs: number // grams
  fats: number // grams
}

