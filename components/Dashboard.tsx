'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  UtensilsCrossed,
  Dumbbell,
  TrendingUp,
  RefreshCw,
  Download,
  ChefHat,
  Apple,
  Coffee,
  Sunset,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Button from './ui/Button'
import Card from './ui/Card'
import Navbar from './ui/Navbar'

export default function Dashboard() {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const [activeTab, setActiveTab] = useState<'meal' | 'workout' | 'coach'>('meal')
  const [loading, setLoading] = useState(false)

  // Моки
  const mealPlans = [];
  const workoutPlans = [];
  const metrics = null;

  // Остальная логика удаления user и базы
  const regeneratePlans = async () => {};
  const exportPDF = () => { alert('PDF export feature coming soon!'); };

  // остальная логика и рендеринг оставим как есть, передавая user={user} в AICoach (можно = null)

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center">
            <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">
              Please complete your onboarding to view your personalized dashboard.
            </p>
            <Button onClick={() => {
              const locale = window.location.pathname.split('/')[1] || 'en'
              window.location.href = `/${locale}/onboarding`
            }}>
              {t('completeProfile')}
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const mealIcons = {
    breakfast: <Coffee className="w-5 h-5" />,
    lunch: <Sunset className="w-5 h-5" />,
    dinner: <ChefHat className="w-5 h-5" />,
    snack: <Apple className="w-5 h-5" />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, User! 👋
          </h1>
          <p className="text-gray-600">
            Here&apos;s your personalized fitness and nutrition plan
          </p>
        </motion.div>

        {/* Metrics Summary */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card glass>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">BMI</p>
                  <p className="text-2xl font-bold">{metrics.bmi}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-fitness-orange" />
              </div>
            </Card>
            <Card glass>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Daily Calories</p>
                  <p className="text-2xl font-bold">{metrics.calories}</p>
                </div>
                <UtensilsCrossed className="w-8 h-8 text-fitness-green" />
              </div>
            </Card>
            <Card glass>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Protein (g)</p>
                  <p className="text-2xl font-bold">{metrics.protein}</p>
                </div>
                <Dumbbell className="w-8 h-8 text-fitness-purple" />
              </div>
            </Card>
            <Card glass>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Carbs (g)</p>
                  <p className="text-2xl font-bold">{metrics.carbs}</p>
                </div>
                <Apple className="w-8 h-8 text-fitness-green" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('meal')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'meal'
                  ? 'border-fitness-orange text-fitness-orange'
                  : 'border-transparent text-gray-600 hover:text-fitness-orange'
              }`}
            >
              <UtensilsCrossed className="w-5 h-5 inline mr-2" />
              Meal Plan
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'workout'
                  ? 'border-fitness-orange text-fitness-orange'
                  : 'border-transparent text-gray-600 hover:text-fitness-orange'
              }`}
            >
              <Dumbbell className="w-5 h-5 inline mr-2" />
              Workout Plan
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'coach'
                  ? 'border-fitness-orange text-fitness-orange'
                  : 'border-transparent text-gray-600 hover:text-fitness-orange'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              AI Coach
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            onClick={regeneratePlans}
            isLoading={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate Plans
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'meal' && (
            <div className="space-y-6">
              {loading ? (
                <Card className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-fitness-orange border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Generating your meal plan...</p>
                </Card>
              ) : mealPlans.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-gray-600 mb-4">No meal plans yet.</p>
                  <Button onClick={regeneratePlans}>Generate Meal Plan</Button>
                </Card>
              ) : (
                mealPlans.map((plan) => (
                  <Card key={plan.id} hover>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-fitness-orange" />
                        Day {plan.day} - {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h3>
                      <div className="flex gap-4 text-sm">
                        <span className="font-semibold">{plan.totalCalories} cal</span>
                        <span className="text-gray-600">
                          P: {plan.totalProtein}g | C: {plan.totalCarbs}g | F: {plan.totalFats}g
                        </span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {plan.meals.map((meal, index) => (
                        <div
                          key={meal.id || index}
                          className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {mealIcons[meal.name.toLowerCase().includes('breakfast') ? 'breakfast' : meal.name.toLowerCase().includes('lunch') ? 'lunch' : meal.name.toLowerCase().includes('dinner') ? 'dinner' : 'snack' as keyof typeof mealIcons]}
                            <h4 className="font-semibold">{meal.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {meal.description}
                          </p>
                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>{meal.calories} cal</span>
                            <span>P: {meal.protein}g</span>
                            <span>C: {meal.carbs}g</span>
                            <span>F: {meal.fats}g</span>
                          </div>
                          {meal.ingredients && meal.ingredients.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium mb-1">Ingredients:</p>
                              <p className="text-xs text-gray-600">
                                {meal.ingredients.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'workout' && (
            <div className="space-y-6">
              {loading ? (
                <Card className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-fitness-orange border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Generating your workout plan...</p>
                </Card>
              ) : workoutPlans.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-gray-600 mb-4">No workout plans yet.</p>
                  <Button onClick={regeneratePlans}>Generate Workout Plan</Button>
                </Card>
              ) : (
                workoutPlans.map((plan) => (
                  <Card key={plan.id} hover>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-fitness-purple" />
                        Day {plan.day} - {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <Dumbbell className="w-4 h-4 inline mr-1" />
                        {plan.estimatedDuration} min
                      </div>
                    </div>
                    <div className="space-y-3">
                      {plan.exercises.map((exercise, index) => (
                        <div
                          key={exercise.id || index}
                          className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{exercise.name}</h4>
                            <span className="text-sm text-gray-600">
                              {exercise.sets} sets × {exercise.reps} reps
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>Rest: {exercise.restSeconds}s</span>
                            {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                              <span>Target: {exercise.muscleGroups.join(', ')}</span>
                            )}
                          </div>
                          {exercise.notes && (
                            <p className="text-xs text-gray-600 mt-2 italic">
                              {exercise.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'coach' && (
            <Card className="text-center py-12">
              <h3 className="text-2xl font-bold mb-2">AI Coach</h3>
              <p className="text-gray-600 mb-4">
                This feature is under development.
              </p>
              <p className="text-gray-600">
                You can customize your meal and workout plans directly.
              </p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}

