// Stored values stay stable; these tables map them to translation keys.

export const EQUIPMENT_OPTIONS: { value: string; key: string }[] = [
  { value: 'Gym', key: 'goals.equipmentGym' },
  { value: 'Dumbbells', key: 'goals.equipmentDumbbells' },
  { value: 'Resistance Bands', key: 'goals.equipmentBands' },
  { value: 'Bodyweight Only', key: 'goals.equipmentNone' },
  { value: 'Pull-up Bar', key: 'goals.equipmentPullUpBar' },
]

export const DIET_OPTIONS: { value: string; key: string }[] = [
  { value: 'No Preference', key: 'preferences.noRestrictions' },
  { value: 'Vegetarian', key: 'preferences.vegetarian' },
  { value: 'Vegan', key: 'preferences.vegan' },
  { value: 'Keto', key: 'preferences.keto' },
  { value: 'Paleo', key: 'preferences.paleo' },
  { value: 'Gluten-free', key: 'preferences.glutenFree' },
]

/** Translation key in the `profile` namespace for a stored fitness goal. */
export const GOAL_KEYS: Record<string, string> = {
  weight_loss: 'weightLoss',
  fat_loss: 'weightLoss',
  muscle_gain: 'muscleGain',
  endurance: 'endurance',
  flexibility: 'flexibility',
  maintenance: 'maintenance',
}

/** Translation key in the `profile` namespace for a stored activity level. */
export const ACTIVITY_KEYS: Record<string, string> = {
  sedentary: 'sedentary',
  light: 'light',
  lightly_active: 'light',
  moderate: 'moderate',
  moderately_active: 'moderate',
  active: 'active',
  very_active: 'active',
}
