'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Weight,
  Activity,
  BarChart3,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useUser } from '@/context/UserContext'
import { calculateUserMetrics } from '@/lib/utils'
import Card from './ui/Card'
import Navbar from './ui/Navbar'
import Button from './ui/Button'

// Mock progress data
const generateMockProgressData = () => {
  const dates = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: 70 - (i * 0.1) + Math.random() * 0.5,
      calories: 2000 + Math.random() * 300 - 150,
      workouts: Math.floor(Math.random() * 2) + 1,
    })
  }
  return dates
}

export default function ProgressPage() {
  const { user } = useUser()
  const [progressData, setProgressData] = useState(generateMockProgressData())
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const metrics = calculateUserMetrics(user || {} as any)

  const weeklyData = progressData.slice(-7)
  const monthlyData = progressData

  const currentData = selectedPeriod === 'week' ? weeklyData : monthlyData

  const stats = {
    weightLoss: user && user.weight ? ((70 - 68.5) / 70 * 100).toFixed(1) : '0',
    workoutsCompleted: currentData.reduce((sum, d) => sum + d.workouts, 0),
    avgCalories: Math.round(currentData.reduce((sum, d) => sum + d.calories, 0) / currentData.length),
    consistency: Math.round((currentData.filter((d) => d.workouts > 0).length / currentData.length) * 100),
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
          <h1 className="text-4xl font-bold mb-2">Progress Tracking</h1>
          <p className="text-gray-600">
            Monitor your fitness journey and see your improvements
          </p>
        </motion.div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {(['week', 'month', 'year'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card glass>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Weight Loss</p>
                <p className="text-2xl font-bold">{stats.weightLoss}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-fitness-green" />
            </div>
          </Card>
          <Card glass>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Workouts</p>
                <p className="text-2xl font-bold">{stats.workoutsCompleted}</p>
              </div>
              <Activity className="w-8 h-8 text-fitness-orange" />
            </div>
          </Card>
          <Card glass>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Calories</p>
                <p className="text-2xl font-bold">{stats.avgCalories}</p>
              </div>
              <Target className="w-8 h-8 text-fitness-purple" />
            </div>
          </Card>
          <Card glass>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Consistency</p>
                <p className="text-2xl font-bold">{stats.consistency}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-fitness-green" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weight Chart */}
          <Card>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Weight className="w-5 h-5 text-fitness-orange" />
              Weight Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#ff6b35"
                  strokeWidth={2}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Calories Chart */}
          <Card>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-fitness-green" />
              Daily Calories
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#10b981" name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Workout Frequency */}
        <Card>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-fitness-purple" />
            Workout Frequency
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="workouts" fill="#9b59b6" name="Workouts per Day" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Goals Summary */}
        {metrics && user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card glass>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-fitness-orange" />
                Your Goals
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fitness Goal:</span>
                  <span className="font-semibold capitalize">
                    {user.fitnessGoal?.replace('_', ' ') || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Calories:</span>
                  <span className="font-semibold">{metrics.calories} kcal/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Training Frequency:</span>
                  <span className="font-semibold">{user.trainingFrequency || 0} days/week</span>
                </div>
              </div>
            </Card>

            <Card glass>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-fitness-green" />
                Current Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI:</span>
                  <span className="font-semibold">{metrics.bmi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein:</span>
                  <span className="font-semibold">{metrics.protein}g/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs:</span>
                  <span className="font-semibold">{metrics.carbs}g/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fats:</span>
                  <span className="font-semibold">{metrics.fats}g/day</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

