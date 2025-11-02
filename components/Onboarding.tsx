'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Activity,
  Target,
  UtensilsCrossed,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import Card from './ui/Card'
import Navbar from './ui/Navbar'
// -- убрано всё, что связано с пользователем и бд --

export default function Onboarding() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('onboarding')
  const tCommon = useTranslations('common')
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({})
  const STEPS = [
    { id: 1, name: t('steps.personalInfo'), icon: User },
    { id: 2, name: t('steps.bodyMetrics'), icon: Activity },
    { id: 3, name: t('steps.goals'), icon: Target },
    { id: 4, name: t('steps.preferences'), icon: UtensilsCrossed },
  ]
  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };
  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      router.push(`/${locale}/dashboard`);
    } finally {
      setLoading(false);
    }
  };
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      currentStep >= step.id
                        ? 'bg-fitness-orange text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 hidden sm:block">
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-fitness-orange to-fitness-purple h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <Card className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-6">Personal Information</h2>
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Enter your full name"
                />
                <Select
                  label="Gender"
                  value={formData.gender || ''}
                  onChange={(e) => updateFormData({ gender: e.target.value as any })}
                  options={[
                    { value: '', label: 'Select gender' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <Input
                  label="Age"
                  type="number"
                  value={formData.age?.toString() || ''}
                  onChange={(e) => updateFormData({ age: parseInt(e.target.value) || undefined })}
                  placeholder="Enter your age"
                />
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => router.push(`/${locale}`)} className="flex-1">
                    {tCommon('cancel')}
                  </Button>
                  <Button onClick={nextStep} className="flex-1">
                    {tCommon('next')} <ArrowRight className="ml-2 w-4 h-4 inline" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-6">Body Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={formData.height?.toString() || ''}
                    onChange={(e) => updateFormData({ height: parseFloat(e.target.value) || undefined })}
                    placeholder="e.g., 175"
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={formData.weight?.toString() || ''}
                    onChange={(e) => updateFormData({ weight: parseFloat(e.target.value) || undefined })}
                    placeholder="e.g., 70"
                  />
                </div>
                <Select
                  label="Activity Level"
                  value={formData.activityLevel || ''}
                  onChange={(e) => updateFormData({ activityLevel: e.target.value as any })}
                  options={[
                    { value: '', label: 'Select activity level' },
                    { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
                    { value: 'lightly_active', label: 'Lightly Active (light exercise 1-3 days/week)' },
                    { value: 'moderately_active', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
                    { value: 'very_active', label: 'Very Active (hard exercise 6-7 days/week)' },
                  ]}
                />
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="mr-2 w-4 h-4 inline" /> {tCommon('back')}
                  </Button>
                  <Button onClick={nextStep} className="flex-1">
                    {tCommon('next')} <ArrowRight className="ml-2 w-4 h-4 inline" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-6">Fitness Goals</h2>
                <Select
                  label="Primary Fitness Goal"
                  value={formData.fitnessGoal || ''}
                  onChange={(e) => updateFormData({ fitnessGoal: e.target.value as any })}
                  options={[
                    { value: '', label: 'Select your goal' },
                    { value: 'muscle_gain', label: 'Muscle Gain' },
                    { value: 'fat_loss', label: 'Fat Loss' },
                  ]}
                />
                <Input
                  label="Training Frequency (days per week)"
                  type="number"
                  min="1"
                  max="7"
                  value={formData.trainingFrequency?.toString() || ''}
                  onChange={(e) => updateFormData({ trainingFrequency: parseInt(e.target.value) || undefined })}
                  placeholder="e.g., 4"
                />
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Equipment Access (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 'Gym Membership', 'None (Bodyweight)'].map((item) => {
                      const isSelected = formData.equipmentAccess?.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            const current = formData.equipmentAccess || []
                            const updated = isSelected
                              ? current.filter((e) => e !== item)
                              : [...current, item]
                            updateFormData({ equipmentAccess: updated })
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-fitness-orange bg-fitness-orange/10'
                              : 'border-gray-300 hover:border-fitness-orange/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item}</span>
                            {isSelected && <Check className="w-5 h-5 text-fitness-orange" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="mr-2 w-4 h-4 inline" /> {tCommon('back')}
                  </Button>
                  <Button onClick={nextStep} className="flex-1">
                    {tCommon('next')} <ArrowRight className="ml-2 w-4 h-4 inline" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-6">Diet Preferences</h2>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Diet Preferences (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'No Restrictions'].map((item) => {
                      const isSelected = formData.dietPreferences?.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            const current = formData.dietPreferences || []
                            const updated = isSelected
                              ? current.filter((e) => e !== item)
                              : [...current, item]
                            updateFormData({ dietPreferences: updated })
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-fitness-green bg-fitness-green/10'
                              : 'border-gray-300 hover:border-fitness-green/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item}</span>
                            {isSelected && <Check className="w-5 h-5 text-fitness-green" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <Input
                  label="Allergies or Food Restrictions (comma separated)"
                  type="text"
                  value={formData.allergies?.join(', ') || ''}
                  onChange={(e) => {
                    const allergies = e.target.value.split(',').map((a) => a.trim()).filter((a) => a)
                    updateFormData({ allergies })
                  }}
                  placeholder="e.g., Peanuts, Dairy, Gluten"
                />
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="mr-2 w-4 h-4 inline" /> {tCommon('back')}
                  </Button>
                  <Button onClick={handleSubmit} isLoading={loading} className="flex-1">
                    {t('preferences.completeSetup')} <Check className="ml-2 w-4 h-4 inline" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}

