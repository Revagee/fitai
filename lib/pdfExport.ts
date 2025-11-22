import jsPDF from 'jspdf'

interface MealPlan {
  day: number
  date: string
  totalCalories: number
  totalProtein: string
  totalCarbs: string
  totalFats: string
  meals: any[]
}

interface WorkoutPlan {
  day: number
  date: string
  exercises: any[]
}

export function exportMealPlanPDF(userData: any, mealPlans: MealPlan[], locale: string = 'en') {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Colors
  const primaryColor = [255, 107, 0] // Orange
  const secondaryColor = [147, 51, 234] // Purple
  const textColor = [31, 41, 55] // Gray-800

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('FitAI Meal Plan', 20, 25)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated for: ${userData?.name || 'User'}`, 20, 35)
  doc.text(`Date: ${new Date().toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'uk' ? 'uk-UA' : 'en-US')}`, 20, 42)

  yPosition = 60

  // Weekly Overview
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.rect(0, yPosition, pageWidth, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Weekly Meal Plan', 20, yPosition + 10)

  yPosition += 25

  // Daily Plans
  mealPlans.forEach((plan, index) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage()
      yPosition = 20
    }

    // Day Header
    doc.setFillColor(240, 240, 240)
    doc.rect(10, yPosition, pageWidth - 20, 12, 'F')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Day ${plan.day}`, 15, yPosition + 8)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const macrosText = `Calories: ${plan.totalCalories} | P: ${plan.totalProtein} | C: ${plan.totalCarbs} | F: ${plan.totalFats}`
    doc.text(macrosText, pageWidth - 15 - doc.getTextWidth(macrosText), yPosition + 8)

    yPosition += 18

    // Meals
    plan.meals.forEach((meal) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text(meal.name || 'Meal', 15, yPosition)

      yPosition += 7

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      const description = doc.splitTextToSize(meal.description || '', pageWidth - 30)
      doc.text(description, 15, yPosition)
      yPosition += description.length * 5 + 5
    })

    yPosition += 10
  })

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  doc.save(`meal-plan-${userData?.name || 'user'}-${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportWorkoutPlanPDF(userData: any, workoutPlans: WorkoutPlan[], locale: string = 'en') {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Colors
  const primaryColor = [255, 107, 0] // Orange
  const secondaryColor = [147, 51, 234] // Purple
  const textColor = [31, 41, 55] // Gray-800

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('FitAI Workout Plan', 20, 25)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated for: ${userData?.name || 'User'}`, 20, 35)
  doc.text(`Date: ${new Date().toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'uk' ? 'uk-UA' : 'en-US')}`, 20, 42)

  yPosition = 60

  // Weekly Overview
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.rect(0, yPosition, pageWidth, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Weekly Workout Plan', 20, yPosition + 10)

  yPosition += 25

  // Daily Plans
  workoutPlans.forEach((plan) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage()
      yPosition = 20
    }

    // Day Header
    doc.setFillColor(240, 240, 240)
    doc.rect(10, yPosition, pageWidth - 20, 12, 'F')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Day ${plan.day}`, 15, yPosition + 8)

    yPosition += 18

    // Exercises
    plan.exercises.forEach((exercise) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text(exercise.name || 'Exercise', 15, yPosition)

      yPosition += 7

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      const details = `Sets: ${exercise.sets} | Reps: ${exercise.reps}${exercise.restSeconds ? ` | Rest: ${exercise.restSeconds}s` : ''}`
      doc.text(details, 15, yPosition)
      yPosition += 7

      if (exercise.notes) {
        const notes = doc.splitTextToSize(exercise.notes, pageWidth - 30)
        doc.text(notes, 15, yPosition)
        yPosition += notes.length * 5
      }

      yPosition += 5
    })

    yPosition += 10
  })

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  doc.save(`workout-plan-${userData?.name || 'user'}-${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportCombinedPDF(userData: any, mealPlans: MealPlan[], workoutPlans: WorkoutPlan[], locale: string = 'en') {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Colors
  const primaryColor = [255, 107, 0]
  const secondaryColor = [147, 51, 234]
  const textColor = [31, 41, 55]

  // Title Page
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('FitAI', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' })
  
  doc.setFontSize(20)
  doc.text('Complete Fitness Plan', pageWidth / 2, pageHeight / 2, { align: 'center' })
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated for: ${userData?.name || 'User'}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' })
  doc.text(`Date: ${new Date().toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'uk' ? 'uk-UA' : 'en-US')}`, pageWidth / 2, pageHeight / 2 + 30, { align: 'center' })

  // Export meal plans
  exportMealPlanPDF(userData, mealPlans, locale)
  
  // Export workout plans
  exportWorkoutPlanPDF(userData, workoutPlans, locale)
}

