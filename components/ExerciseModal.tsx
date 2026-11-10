'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Check, ExternalLink, Loader, RotateCcw, Sparkles, Timer, Wind, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { findDemo, langIndex } from '@/lib/exercises'
import { checkAIConfigured, explainExercise, getCachedGuide, type ExerciseGuide } from '@/lib/gemini'
import { setsOf, type ExerciseView } from '@/lib/plan'
import ExerciseFigure from './ExerciseFigure'

interface ExerciseModalProps {
  exercise: ExerciseView
  onClose: () => void
}

/** "How to do it" for one exercise: animated demo, technique notes, an optional AI guide, and a set/rest tracker. */
export default function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const t = useTranslations('exercise')
  const tWorkout = useTranslations('dashboard.workoutPlan')
  const locale = useLocale()
  const lang = langIndex(locale)
  const demo = findDemo(exercise.name, exercise.demo)

  const [guide, setGuide] = useState<ExerciseGuide | null>(() => getCachedGuide(exercise.name, locale))
  const [guideState, setGuideState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [aiAvailable, setAiAvailable] = useState(false)

  useEffect(() => {
    let open = true
    checkAIConfigured().then((available) => open && setAiAvailable(available))
    return () => {
      open = false
    }
  }, [])

  const totalSets = setsOf(exercise.sets)
  const [doneSets, setDoneSets] = useState(0)
  const [restLeft, setRestLeft] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  useEffect(() => {
    if (restLeft <= 0) return
    const timer = setTimeout(() => setRestLeft((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [restLeft])

  const askAI = async () => {
    setGuideState('loading')
    const result = await explainExercise(exercise.name, locale)
    setGuide(result)
    setGuideState(result ? 'idle' : 'error')
  }

  const completeSet = () => {
    const next = Math.min(doneSets + 1, totalSets)
    setDoneSets(next)
    setRestLeft(next < totalSets ? exercise.restSeconds : 0)
  }

  const resetSets = () => {
    setDoneSets(0)
    setRestLeft(0)
  }

  const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} ${t('videoQuery')}`)}`
  const steps = guide?.steps || demo?.steps.map((step) => step[lang]) || []
  const muscles = guide?.muscles.join(', ') || demo?.muscles[lang] || ''
  const mistakes = guide?.mistakes.length ? guide.mistakes : demo ? [demo.mistake[lang]] : []
  const resting = restLeft > 0
  const finished = doneSets >= totalSets

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={exercise.name}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold break-words">{exercise.name}</h2>
            <p className="text-sm text-gray-600">
              {tWorkout('setsReps', { sets: exercise.sets, reps: exercise.reps })} · {tWorkout('rest', { seconds: exercise.restSeconds })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          {/* Demo and tracker */}
          <div className="space-y-5">
            {demo ? (
              <div>
                <ExerciseFigure key={demo.key} demo={demo} />
                <p className="mt-2 text-center text-xs text-gray-500">{t('pattern', { name: demo.name[lang] })}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
                {t('noDemo')}
              </div>
            )}

            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-primary-500 px-4 py-2.5 font-semibold text-primary-600 hover:bg-primary-50"
            >
              <ExternalLink className="h-4 w-4" />
              {t('watchVideo')}
            </a>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Timer className="h-5 w-5 text-fitness-purple" />
                  {t('setsTitle')}
                </h3>
                {doneSets > 0 && (
                  <button type="button" onClick={resetSets} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
                    <RotateCcw className="h-4 w-4" />
                    {t('reset')}
                  </button>
                )}
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {Array.from({ length: totalSets }, (_, i) => (
                  <span
                    key={i}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      i < doneSets ? 'bg-fitness-green text-white' : i === doneSets ? 'border-2 border-fitness-orange text-fitness-orange' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i < doneSets ? <Check className="h-5 w-5" /> : i + 1}
                  </span>
                ))}
              </div>
              {finished ? (
                <p className="font-semibold text-fitness-green">{t('allDone')}</p>
              ) : resting ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-purple-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700" aria-live="polite">
                    {t('restTimer')} <span className="text-2xl font-bold tabular-nums text-fitness-purple">{restLeft}</span> {t('seconds')}
                  </span>
                  <button type="button" onClick={() => setRestLeft(0)} className="text-sm font-semibold text-fitness-purple hover:underline">
                    {t('skipRest')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={completeSet}
                  className="w-full rounded-lg bg-gradient-to-r from-fitness-orange to-fitness-purple px-4 py-2.5 font-semibold text-white hover:opacity-90"
                >
                  {t('setDone', { current: doneSets + 1, total: totalSets })}
                </button>
              )}
            </div>
          </div>

          {/* Technique */}
          <div className="space-y-5">
            {muscles && (
              <div>
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('muscles')}</h3>
                <p className="text-gray-900">{muscles}</p>
              </div>
            )}

            {steps.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {t('technique')}
                  {guide && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium normal-case tracking-normal text-fitness-purple">
                      <Sparkles className="h-3 w-3" />
                      {t('aiBadge')}
                    </span>
                  )}
                </h3>
                <ol className="space-y-2">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-fitness-orange">
                        {i + 1}
                      </span>
                      <span className="text-gray-800">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {guide?.breathing && (
              <p className="flex gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-gray-800">
                <Wind className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
                <span>
                  <span className="font-semibold">{t('breathing')}: </span>
                  {guide.breathing}
                </span>
              </p>
            )}

            {mistakes.length > 0 && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                <p className="mb-1 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  {t('mistakes')}
                </p>
                <ul className="space-y-1">
                  {mistakes.map((mistake, i) => (
                    <li key={i}>{mistake}</li>
                  ))}
                </ul>
              </div>
            )}

            {exercise.notes && (
              <div>
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('coachNote')}</h3>
                <p className="italic text-gray-700">{exercise.notes}</p>
              </div>
            )}

            {aiAvailable && !guide && (
              <div>
                <button
                  type="button"
                  onClick={askAI}
                  disabled={guideState === 'loading'}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-50 px-4 py-2.5 font-semibold text-fitness-purple hover:bg-purple-100 disabled:opacity-60"
                >
                  {guideState === 'loading' ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {guideState === 'loading' ? t('aiLoading') : t('askAI')}
                </button>
                {guideState === 'error' && <p className="mt-2 text-sm text-red-600">{t('aiError')}</p>}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
