"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { generateFitnessPlan } from '@/lib/gemini';
// Удаляем импорты Firebase, они больше не нужны

// 1. ОПРЕДЕЛЯЕМ ТИП ДАННЫХ (Решает ошибки 2339)
interface FormData {
  name: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  activityLevel: string;
  fitnessGoal: string;
  trainingFrequency: string;
  equipmentAccess: string[];
  dietPreferences: string[];
  allergies: string;
}

const steps = [
  { id: 'personal', title: 'Personal Details' },
  { id: 'goals', title: 'Fitness Goals' },
  { id: 'preferences', title: 'Preferences' },
];

export default function Onboarding() {
  const router = useRouter();
  const { user, setUserData } = useUser(); // Берем setUserData из контекста
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 2. ИНИЦИАЛИЗИРУЕМ СОСТОЯНИЕ ПРАВИЛЬНО (Решает ошибки "Property does not exist")
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    activityLevel: '',
    fitnessGoal: '',
    trainingFrequency: '',
    equipmentAccess: [],
    dietPreferences: [],
    allergies: ''
  });

  // 3. ТИПИЗИРУЕМ СОБЫТИЯ (Решает ошибки 7006 "Parameter e implicitly has any type")
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Генерируем план через AI
      const generatedPlan = await generateFitnessPlan(formData);
      
      if (generatedPlan && user) {
        // 4. СОБИРАЕМ ДАННЫЕ
        const dataToSave = {
          ...formData,
          plan: generatedPlan,
          createdAt: new Date().toISOString() // Используем строку для даты, так безопаснее для JSON
        };

        // 5. СОХРАНЯЕМ ЛОКАЛЬНО (Вместо Firebase)
        // Используем функцию из нашего нового UserContext
        setUserData(dataToSave);
        
        // Переходим в дашборд
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Something went wrong while generating your plan. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  // Компоненты шагов (упрощенная структура для примера, внутри твоя верстка)
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index <= currentStep ? 'bg-blue-100 font-bold' : 'bg-gray-100'
              }`}>
                {index + 1}
              </div>
              <span className="text-xs">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* STEP 1: PERSONAL DETAILS */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Tell us about yourself</h2>
              <div className="grid grid-cols-1 gap-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Age"
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="Height (cm)"
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="Weight (kg)"
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium">Activity Level</label>
                    <select
                        name="activityLevel"
                        value={formData.activityLevel}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">Select Activity Level</option>
                        <option value="sedentary">Sedentary (Office job)</option>
                        <option value="light">Light Active (1-2 days/week)</option>
                        <option value="moderate">Moderate (3-5 days/week)</option>
                        <option value="active">Active (6-7 days/week)</option>
                    </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GOALS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Your Fitness Goals</h2>
              <select
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                  <option value="">Select Main Goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="flexibility">Flexibility & Mobility</option>
                  <option value="maintenance">Maintenance</option>
              </select>
              
              <select
                  name="trainingFrequency"
                  value={formData.trainingFrequency}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                  <option value="">How often can you train?</option>
                  <option value="2">2 days per week</option>
                  <option value="3">3 days per week</option>
                  <option value="4">4 days per week</option>
                  <option value="5">5+ days per week</option>
              </select>

              <div>
                <label className="block mb-2 font-medium">Equipment Access</label>
                <div className="grid grid-cols-2 gap-2">
                    {['Gym', 'Dumbbells', 'Resistance Bands', 'Bodyweight Only', 'Pull-up Bar'].map((item) => (
                        <label key={item} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                                type="checkbox"
                                value={item}
                                checked={formData.equipmentAccess.includes(item)}
                                onChange={(e) => handleCheckboxChange(e, 'equipmentAccess')}
                                className="rounded text-blue-600"
                            />
                            <span>{item}</span>
                        </label>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES */}
          {currentStep === 2 && (
             <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Diet & Preferences</h2>
                <div>
                    <label className="block mb-2 font-medium">Dietary Preferences</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['No Preference', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-free'].map((item) => (
                            <label key={item} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input
                                    type="checkbox"
                                    value={item}
                                    checked={formData.dietPreferences.includes(item)}
                                    onChange={(e) => handleCheckboxChange(e, 'dietPreferences')}
                                    className="rounded text-blue-600"
                                />
                                <span>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="Any food allergies or injuries we should know about?"
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-32"
                />
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg ${
            currentStep === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Plan...
            </>
          ) : (
            currentStep === steps.length - 1 ? 'Create My Plan' : 'Next'
          )}
        </button>
      </div>
    </div>
  );
}