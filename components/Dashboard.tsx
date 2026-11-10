'use client'

import React, { useCallback, useMemo, useState } from 'react'
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
  Bot,
  PlayCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import Card from './ui/Card'
import Navbar from './ui/Navbar'
import AICoach from './AICoach'
import ExerciseModal from './ExerciseModal'
import { useUser } from '@/context/UserContext'
import { calculateUserMetrics, toDateKey } from '@/lib/utils'
import { exportMealPlanPDF, exportWorkoutPlanPDF } from '@/lib/pdfExport'
import { generateFitnessPlan } from '@/lib/gemini'
import { getMealDays, getWorkoutDays, mealKind, type ExerciseView } from '@/lib/plan'

type Tab = 'meal' | 'workout' | 'coach'

export default function Dashboard() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const router = useRouter()
  const { userData, setUserData } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>('meal')
  const [loading, setLoading] = useState(false)
  const [openExercise, setOpenExercise] = useState<ExerciseView | null>(null)
  const closeExercise = useCallback(() => setOpenExercise(null), [])

  const metrics = useMemo(() => (userData ? calculateUserMetrics(userData) : null), [userData])
  const mealPlans = useMemo(() => getMealDays(userData?.plan?.mealPlan), [userData?.plan?.mealPlan])
  const workoutPlans = useMemo(() => getWorkoutDays(userData?.plan?.workoutPlan), [userData?.plan?.workoutPlan])

  const today = toDateKey()
  const doneToday: number[] = userData?.workoutLog?.[today] || []

  const regeneratePlans = async () => {
    if (!userData) return

    setLoading(true)
    try {
      const newPlan = await generateFitnessPlan(userData, locale)
      // Generation takes minutes: merge into the data as it is now, not as it was when the request started.
      setUserData((current: any) => ({ ...current, plan: newPlan, createdAt: Date.now() }))
    } catch (error) {
      console.error('Error regenerating plan:', error)
      alert(t('actions.regenerateError'))
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = async () => {
    try {
      if (activeTab === 'workout' && workoutPlans.length > 0) {
        await exportWorkoutPlanPDF(userData, workoutPlans, locale)
      } else if (activeTab !== 'workout' && mealPlans.length > 0) {
        await exportMealPlanPDF(userData, mealPlans, locale)
      } else {
        alert(t('actions.noDataToExport'))
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert(t('actions.noDataToExport'))
    }
  }

  // Marks a workout as done today and keeps the progress log (workouts per day) in step with it.
  const toggleWorkoutDone = (day: number) => {
    setUserData((current: any) => {
      const done: number[] = current?.workoutLog?.[today] || []
      const wasDone = done.includes(day)
      const progress: any[] = [...(current?.progress || [])]
      const index = progress.findIndex((entry) => entry.date === today)
      const workouts = Math.max(0, (progress[index]?.workouts || 0) + (wasDone ? -1 : 1))
      if (index >= 0) progress[index] = { ...progress[index], workouts }
      else if (!wasDone) progress.push({ date: today, workouts })
      progress.sort((a, b) => String(a.date).localeCompare(String(b.date)))
      return {
        ...current,
        progress,
        workoutLog: { [today]: wasDone ? done.filter((item) => item !== day) : [...done, day] },
      }
    })
  }

  const tabClass = (tab: Tab) =>
    `px-4 sm:px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
      activeTab === tab
        ? 'border-fitness-orange text-fitness-orange'
        : 'border-transparent text-gray-600 hover:text-fitness-orange'
    }`

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
            <Button onClick={() => router.push(`/${locale}/onboarding`)}>
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
          {userData?.plan?.demo && (
            <p className="mt-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              {t('demoNotice')}
            </p>
          )}
        </motion.div>

        {/* Metrics Summary */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card glass>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('metrics.bmi')}</p>
                  <p className="text-2xl font-bold">{metrics.bmi}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-fitness-orange" />
              </div>
            </Card>
            <Card glass>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('metrics.dailyCalories')}</p>
                  <p className="text-2xl font-bold">{metrics.calories}</p>
                </div>
                <UtensilsCrossed className="w-8 h-8 text-fitness-green" />
              </div>
            </Card>
            <Card glass>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('metrics.protein')}</p>
                  <p className="text-2xl font-bold">{metrics.protein}</p>
                </div>
                <Dumbbell className="w-8 h-8 text-fitness-purple" />
              </div>
            </Card>
            <Card glass>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('metrics.carbs')}</p>
                  <p className="text-2xl font-bold">{metrics.carbs}</p>
                </div>
                <Apple className="w-8 h-8 text-fitness-green" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
            <button onClick={() => setActiveTab('meal')} className={tabClass('meal')}>
              <UtensilsCrossed className="w-5 h-5 inline mr-2" />
              {t('tabs.mealPlan')}
            </button>
            <button onClick={() => setActiveTab('workout')} className={tabClass('workout')}>
              <Dumbbell className="w-5 h-5 inline mr-2" />
              {t('tabs.workoutPlan')}
            </button>
            <button onClick={() => setActiveTab('coach')} className={tabClass('coach')}>
              <Bot className="w-5 h-5 inline mr-2" />
              {t('tabs.aiCoach')}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
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
              onClick={() => router.push(`/${locale}/meal-plan`)}
            >
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              {t('actions.viewFullMealPlan')}
            </Button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab !== 'coach' && (
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
                mealPlans.map((plan) => (
                  <Card key={plan.id} hover>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-fitness-orange" />
                        {t('day', { day: plan.day })}
                      </h3>
                      <div className="flex gap-4 text-sm">
                        <span className="font-semibold">{t('mealPlan.calories', { calories: plan.totalCalories })}</span>
                        <span className="text-gray-600">
                           P: {plan.totalProtein} | C: {plan.totalCarbs} | F: {plan.totalFats}
                        </span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {plan.meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {mealIcons[mealKind(meal.name)]}
                            <h4 className="font-semibold flex-1">{meal.name}</h4>
                            {meal.calories > 0 && (
                              <span className="text-xs font-medium text-gray-500">
                                {t('mealPlan.calories', { calories: meal.calories })}
                              </span>
                            )}
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
                  <p className="text-gray-600 mb-4">{t('workoutPlan.noPlans')}</p>
                </Card>
              ) : (
                <>
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <PlayCircle className="w-4 h-4 text-fitness-orange" />
                    {t('workoutPlan.tapHint')}
                  </p>
                  {workoutPlans.map((plan) => {
                    const done = doneToday.includes(plan.day)
                    return (
                      <Card key={plan.id} className={done ? 'border-green-300' : undefined}>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-fitness-purple" />
                            {t('day', { day: plan.day })}
                            {plan.focus && <span className="text-base font-medium text-gray-600">· {plan.focus}</span>}
                          </h3>
                          {plan.exercises.length > 0 && (
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                <Dumbbell className="w-4 h-4 inline mr-1" />
                                {t('workoutPlan.duration', { duration: plan.estimatedDuration })}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleWorkoutDone(plan.day)}
                                aria-pressed={done}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                  done
                                    ? 'border-green-300 bg-green-50 text-green-700'
                                    : 'border-gray-300 text-gray-600 hover:border-fitness-green hover:text-fitness-green'
                                }`}
                              >
                                {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                {done ? t('workoutPlan.done') : t('workoutPlan.markDone')}
                              </button>
                            </div>
                          )}
                        </div>
                        {plan.exercises.length === 0 && (
                          <p className="text-sm text-gray-600">{t('restDay')}</p>
                        )}
                        <div className="space-y-3">
                          {plan.exercises.map((exercise) => (
                            <button
                              key={exercise.id}
                              type="button"
                              onClick={() => setOpenExercise(exercise)}
                              className="group block w-full text-left p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-fitness-orange hover:bg-orange-50/50 transition-colors focus:outline-none focus:ring-2 focus:ring-fitness-orange"
                            >
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <h4 className="font-semibold">{exercise.name}</h4>
                                <span className="text-sm text-gray-600 text-right">
                                  {t('workoutPlan.setsReps', { sets: exercise.sets, reps: exercise.reps })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-xs text-gray-600">
                                <span>{t('workoutPlan.rest', { seconds: exercise.restSeconds })}</span>
                                <span className="inline-flex items-center gap-1 font-medium text-fitness-orange">
                                  <PlayCircle className="w-4 h-4" />
                                  {t('workoutPlan.howTo')}
                                </span>
                              </div>
                              {exercise.notes && (
                                <p className="text-xs text-gray-600 mt-2 italic">
                                  {exercise.notes}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </Card>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </motion.div>
        )}

        {/* The coach stays mounted so the conversation and its undo history survive tab switches. */}
        <div className={activeTab === 'coach' ? '' : 'hidden'}>
          <AICoach active={activeTab === 'coach'} onViewPlan={setActiveTab} />
        </div>
      </div>

      {openExercise && <ExerciseModal exercise={openExercise} onClose={closeExercise} />}
    </div>
  )
}