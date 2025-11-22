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
import AICoach from './AICoach'
import { useUser } from '@/context/UserContext'
import { calculateUserMetrics } from '@/lib/utils'
import { exportMealPlanPDF, exportWorkoutPlanPDF } from '@/lib/pdfExport'
import { generateFitnessPlan } from '@/lib/gemini'

export default function Dashboard() {
  const t = useTranslations('dashboard')
  const { userData, setUserData } = useUser()
  const [activeTab, setActiveTab] = useState<'meal' | 'workout' | 'coach'>('meal')
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)

  // Инициализация метрик и данных при загрузке
  useEffect(() => {
    if (userData) {
      setMetrics(calculateUserMetrics(userData));
    }
  }, [userData]);

  // --- АДАПТЕР ДАННЫХ (Превращаем ответ AI в формат Дашборда) ---
  
  // 1. План питания
  const mealPlans: any[] = userData?.plan?.mealPlan ? [{
    id: 'mp-1',
    day: 1,
    date: new Date().toISOString(),
    totalCalories: userData.plan.mealPlan.calories || 0,
    totalProtein: userData.plan.mealPlan.macros?.protein || '0g',
    totalCarbs: userData.plan.mealPlan.macros?.carbs || '0g',
    totalFats: userData.plan.mealPlan.macros?.fats || '0g',
    meals: Array.isArray(userData.plan.mealPlan.dailyMeals) 
      ? userData.plan.mealPlan.dailyMeals.map((meal: any, index: number) => ({
          id: `meal-${index}`,
          name: meal.meal || `Meal ${index + 1}`,
          description: Array.isArray(meal.options) ? meal.options.join(', ') : meal.options,
          calories: 0, // AI часто не дает калории на каждое блюдо отдельно
          protein: 0,
          carbs: 0,
          fats: 0,
          ingredients: []
        }))
      : []
  }] : [];

  // 2. План тренировок
  const workoutPlans: any[] = Array.isArray(userData?.plan?.workoutPlan) 
    ? userData.plan.workoutPlan.map((day: any, index: number) => ({
        id: `wp-${index}`,
        day: index + 1,
        date: new Date().toISOString(),
        estimatedDuration: 45, // Примерное время
        exercises: Array.isArray(day.exercises) ? day.exercises.map((ex: any, i: number) => ({
           id: `ex-${index}-${i}`,
           name: ex.name,
           sets: ex.sets,
           reps: ex.reps,
           restSeconds: 60,
           notes: ex.notes || '',
           muscleGroups: []
        })) : []
      })) 
    : [];


  const regeneratePlans = async () => {
    if (!userData) return
    
    setLoading(true)
    try {
      const newPlan = await generateFitnessPlan(userData)
      if (newPlan) {
        const updatedData = {
          ...userData,
          plan: newPlan,
          createdAt: Date.now()
        }
        setUserData(updatedData)
        // Reload to show new plan
        window.location.reload()
      }
    } catch (error) {
      console.error('Error regenerating plan:', error)
      alert(t('actions.regenerateError') || 'Error regenerating plan. Please try again.')
    } finally {
      setLoading(false)
    }
  };
  
  const exportPDF = () => {
    const locale = window.location.pathname.split('/')[1] || 'en'
    
    if (activeTab === 'meal' && mealPlans.length > 0) {
      exportMealPlanPDF(userData, mealPlans, locale)
    } else if (activeTab === 'workout' && workoutPlans.length > 0) {
      exportWorkoutPlanPDF(userData, workoutPlans, locale)
    } else {
      alert(t('actions.noDataToExport') || 'No data to export')
    }
  };

  // --- ОТРИСОВКА ---

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('completeProfile')}</h2>
            <p className="text-gray-600 mb-6">
              {t('completeOnboarding')}
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

  const mealIcons: any = {
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
            {t('welcome', { name: userData?.name || 'User' })}
          </h1>
          <p className="text-gray-600">
            {t('personalizedPlan')}
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
              {t('tabs.mealPlan')}
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
              {t('tabs.workoutPlan')}
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
              {t('tabs.aiCoach')}
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
            {t('actions.regeneratePlans')}
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            <Download className="w-4 h-4 mr-2" />
            {t('actions.exportPDF')}
          </Button>
          {activeTab === 'meal' && (
            <Button
              variant="outline"
              onClick={() => {
                const locale = window.location.pathname.split('/')[1] || 'en'
                window.location.href = `/${locale}/meal-plan`
              }}
            >
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              {t('actions.viewFullMealPlan') || 'View Full Meal Plan'}
            </Button>
          )}
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
                  <p className="mt-4 text-gray-600">{t('actions.generating', { type: t('tabs.mealPlan').toLowerCase() })}</p>
                </Card>
              ) : mealPlans.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-gray-600 mb-4">{t('mealPlan.noPlans')}</p>
                </Card>
              ) : (
                mealPlans.map((plan: any) => (
                  <Card key={plan.id} hover>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-fitness-orange" />
                        Day {plan.day}
                      </h3>
                      <div className="flex gap-4 text-sm">
                        <span className="font-semibold">{plan.totalCalories} cal</span>
                        <span className="text-gray-600">
                           P: {plan.totalProtein} | C: {plan.totalCarbs} | F: {plan.totalFats}
                        </span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {plan.meals.map((meal: any, index: number) => (
                        <div
                          key={meal.id || index}
                          className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {mealIcons[meal.name.toLowerCase().includes('breakfast') ? 'breakfast' : meal.name.toLowerCase().includes('lunch') ? 'lunch' : meal.name.toLowerCase().includes('dinner') ? 'dinner' : 'snack'] || <Coffee className="w-5 h-5" />}
                            <h4 className="font-semibold">{meal.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {meal.description}
                          </p>
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
                  <p className="mt-4 text-gray-600">{t('actions.generating', { type: t('tabs.workoutPlan').toLowerCase() })}</p>
                </Card>
              ) : workoutPlans.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-gray-600 mb-4">No workout plans found.</p>
                </Card>
              ) : (
                workoutPlans.map((plan: any) => (
                  <Card key={plan.id} hover>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-fitness-purple" />
                        Day {plan.day}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <Dumbbell className="w-4 h-4 inline mr-1" />
                        {plan.estimatedDuration} min
                      </div>
                    </div>
                    <div className="space-y-3">
                      {plan.exercises.map((exercise: any, index: number) => (
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
            <AICoach user={userData} />
          )}
        </motion.div>
      </div>
    </div>
  )
}