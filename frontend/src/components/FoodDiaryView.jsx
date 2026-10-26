import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sunrise, 
  Sun, 
  Apple, 
  Moon, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Copy, 
  Trash2, 
  Utensils, 
  Check, 
  Flame, 
  TrendingDown, 
  SlidersHorizontal 
} from 'lucide-react';

export default function FoodDiaryView({
  logs = [],
  goal = 2000,
  onQuickAddMeal = () => {},
  onDeleteLog = () => {},
  onDuplicateLog = () => {}
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [collapsedMeals, setCollapsedMeals] = useState({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  const toggleCollapse = (mealId) => {
    setCollapsedMeals(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  // Date navigation handlers
  const changeDateBy = (days) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(selectedDate);

  // Filter logs for the selected day
  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDate);
  dayEnd.setHours(23, 59, 59, 999);

  const dayLogs = logs.filter(l => {
    const t = Number(l.created_at);
    return t >= dayStart.getTime() && t <= dayEnd.getTime();
  });

  const totalCalories = dayLogs.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
  const totalProtein = dayLogs.reduce((acc, curr) => acc + (Number(curr.protein) || 0), 0);
  const totalCarbs = dayLogs.reduce((acc, curr) => acc + (Number(curr.carbs) || 0), 0);
  const totalFat = dayLogs.reduce((acc, curr) => acc + (Number(curr.fat || 0)), 0);

  const proteinGoal = Math.round((goal * 0.25) / 4);
  const carbsGoal = Math.round((goal * 0.50) / 4);
  const fatGoal = Math.round((goal * 0.25) / 9);

  const percentMet = Math.min(100, Math.round((totalCalories / (goal || 2000)) * 100));
  const remainingKcal = Math.max(0, goal - totalCalories);

  const mealDefinitions = [
    { id: 'breakfast', title: 'Breakfast', icon: Sunrise, time: '07:45 AM', preset: 'Mediterranean Balanced' },
    { id: 'lunch', title: 'Lunch', icon: Sun, time: '01:15 PM', preset: 'High Bioavailable Protein' },
    { id: 'snack', title: 'Snacks', icon: Apple, time: '04:30 PM', preset: 'Metabolic Sustained Energy' },
    { id: 'dinner', title: 'Dinner', icon: Moon, time: '07:45 PM', preset: 'Restorative Clean Macronutrients' }
  ];

  const getLogsForMeal = (mealId) => {
    return dayLogs.filter(l => {
      const type = (l.meal_type || '').toLowerCase();
      if (mealId === 'snack') return type === 'snack' || type === 'snacks';
      return type === mealId;
    });
  };

  const handleCopyFood = (food) => {
    onQuickAddMeal(food.meal_type || 'breakfast', {
      name: food.food_name,
      calories: food.calories,
      carbs: food.carbs,
      protein: food.protein,
      fat: food.fat
    });
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-space-md lg:px-margin py-space-lg flex flex-col gap-space-lg">
      
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Check size={18} className="text-secondary-fixed" />
          <span className="font-label-md text-label-md">Food entry duplicated to today's log!</span>
        </div>
      )}

      {/* Date Navigation Strip & Period Controls */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container">
        <div className="flex items-center gap-space-xs w-full md:w-auto justify-between md:justify-start">
          <button 
            onClick={() => changeDateBy(-1)}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md" 
            type="button"
          >
            <ChevronLeft size={18} />
            <span>Yesterday</span>
          </button>
          
          <div className="flex items-center gap-space-sm px-space-lg py-space-sm rounded-lg bg-surface-container-low text-primary font-title text-title border border-surface-container">
            <CalendarIcon size={20} className="text-secondary" />
            <span className="tracking-tight font-semibold">{formattedDate}</span>
            {isToday(selectedDate) && (
              <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-label-caps uppercase ml-1 font-bold">
                Today
              </span>
            )}
          </div>

          <button 
            onClick={() => changeDateBy(1)}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md" 
            type="button"
          >
            <span>Tomorrow</span>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-space-sm w-full md:w-auto justify-end">
          <label className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer border border-surface-container">
            <CalendarIcon size={18} className="text-secondary" />
            <span>Pick Date</span>
            <input 
              type="date" 
              className="sr-only" 
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value + 'T12:00:00'));
                }
              }}
            />
          </label>
          <button 
            onClick={() => setSelectedDate(new Date())}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors border border-surface-container" 
            type="button"
          >
            <span>Jump to Today</span>
          </button>
        </div>
      </section>

      {/* Executive Metabolic Dashboard Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        
        {/* Calorie Gauge Card (5 cols) */}
        <div className="lg:col-span-5 bg-primary text-on-primary rounded-xl p-space-lg shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between z-10">
            <div>
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary-fixed-dim font-bold">
                Daily Energy Balance
              </span>
              <div className="flex items-baseline gap-space-sm mt-1">
                <span className="font-display text-display font-bold leading-none">
                  {Math.round(totalCalories).toLocaleString()}
                </span>
                <span className="font-body-md text-body-md text-primary-fixed-dim">
                  / {goal.toLocaleString()} kcal target
                </span>
              </div>
            </div>
            <div className="px-space-sm py-space-xs rounded-lg bg-primary-container text-primary-fixed font-label-md text-label-md flex items-center gap-1 font-semibold">
              <Flame size={16} className="text-secondary-fixed" />
              <span>{percentMet}% Logged</span>
            </div>
          </div>

          <div className="my-space-md z-10 flex flex-col gap-1.5">
            <div className="w-full h-3 bg-surface-container-lowest/20 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-secondary-fixed rounded-full transition-all duration-500" 
                style={{ width: `${percentMet}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-primary-fixed-dim font-label-caps text-label-caps font-semibold">
              <span>CONSUMED: {Math.round(totalCalories)} KCAL</span>
              <span className="text-on-primary font-bold">
                REMAINING: {remainingKcal} KCAL
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-xs z-10 border-t border-primary-container/40">
            <div className="flex items-center gap-space-xs">
              <TrendingDown size={16} className="text-secondary-container" />
              <span className="font-body-sm text-body-sm text-primary-fixed">
                {remainingKcal > 0 ? `${remainingKcal} kcal buffer remaining` : 'Target threshold met'}
              </span>
            </div>
            <span className="font-label-caps text-label-caps text-secondary-container font-bold">
              STATUS: {totalCalories > goal ? 'EXCEEDED' : 'OPTIMAL'}
            </span>
          </div>

          {/* Ambient blur highlight */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-secondary-fixed opacity-10 blur-2xl pointer-events-none" />
        </div>

        {/* Macronutrient Diagnostics Grid (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between pb-space-xs">
            <div>
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline font-bold">
                Target Macros Distribution
              </span>
              <h3 className="font-title text-title text-on-surface font-bold">
                Precision Bio-Nutrients
              </h3>
            </div>
            <span className="font-body-sm text-body-sm text-outline">
              Day's Allowance Ratio
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md my-space-sm">
            
            {/* Protein Column */}
            <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-md rounded-xl border border-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps font-bold text-blue-700 uppercase">
                  Protein
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-caps text-label-caps font-bold">
                  {Math.min(100, Math.round((totalProtein / (proteinGoal || 1)) * 100))}%
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {Math.round(totalProtein)}g
                </span>
                <span className="font-body-sm text-body-sm text-outline">
                  / {proteinGoal}g
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((totalProtein / (proteinGoal || 1)) * 100))}%` }}
                />
              </div>
              <span className="font-label-caps text-label-caps text-outline">
                {Math.max(0, proteinGoal - Math.round(totalProtein))}g deficit left
              </span>
            </div>

            {/* Carbs Column */}
            <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-md rounded-xl border border-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps font-bold text-amber-700 uppercase">
                  Net Carbs
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-caps text-label-caps font-bold">
                  {Math.min(100, Math.round((totalCarbs / (carbsGoal || 1)) * 100))}%
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {Math.round(totalCarbs)}g
                </span>
                <span className="font-body-sm text-body-sm text-outline">
                  / {carbsGoal}g
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((totalCarbs / (carbsGoal || 1)) * 100))}%` }}
                />
              </div>
              <span className="font-label-caps text-label-caps text-outline">
                {Math.max(0, carbsGoal - Math.round(totalCarbs))}g headroom left
              </span>
            </div>

            {/* Fat Column */}
            <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-md rounded-xl border border-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps font-bold text-rose-700 uppercase">
                  Healthy Fats
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-caps text-label-caps font-bold">
                  {Math.min(100, Math.round((totalFat / (fatGoal || 1)) * 100))}%
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {Math.round(totalFat)}g
                </span>
                <span className="font-body-sm text-body-sm text-outline">
                  / {fatGoal}g
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((totalFat / (fatGoal || 1)) * 100))}%` }}
                />
              </div>
              <span className="font-label-caps text-label-caps text-outline">
                {Math.max(0, fatGoal - Math.round(totalFat))}g buffer remaining
              </span>
            </div>

          </div>

          <div className="flex items-center justify-between bg-surface-container-lowest pt-space-xs">
            <div className="flex items-center gap-space-md flex-wrap">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="font-label-caps text-label-caps text-outline">Protein: {Math.round(totalProtein)}g</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-label-caps text-label-caps text-outline">Carbs: {Math.round(totalCarbs)}g</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-label-caps text-label-caps text-outline">Fat: {Math.round(totalFat)}g</span>
              </div>
            </div>
            <span className="font-label-caps text-label-caps text-secondary font-bold">
              COMPLIANT PROFILE
            </span>
          </div>
        </div>

      </section>

      {/* The 4 Meal Accordion Panels */}
      <div className="flex flex-col gap-space-md">
        {mealDefinitions.map((meal) => {
          const mealLogs = getLogsForMeal(meal.id);
          const mealCalories = mealLogs.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
          const mealProtein = mealLogs.reduce((acc, curr) => acc + (Number(curr.protein) || 0), 0);
          const mealCarbs = mealLogs.reduce((acc, curr) => acc + (Number(curr.carbs) || 0), 0);
          const mealFat = mealLogs.reduce((acc, curr) => acc + (Number(curr.fat || 0)), 0);

          const isCollapsed = collapsedMeals[meal.id];
          const MealIcon = meal.icon;

          return (
            <article 
              key={meal.id}
              className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden transition-all duration-200"
            >
              {/* Accordion Header */}
              <div 
                onClick={() => toggleCollapse(meal.id)}
                className="p-space-md sm:p-space-lg bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm cursor-pointer select-none hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shadow-xs border border-surface-container">
                    <MealIcon size={22} className="text-secondary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {meal.title}
                      </h2>
                      <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                        {meal.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs text-outline font-label-caps text-label-caps uppercase mt-0.5">
                      <span>{mealLogs.length} item{mealLogs.length !== 1 ? 's' : ''} logged</span>
                      <span>•</span>
                      <span className="font-bold text-on-surface">{Math.round(mealCalories)} kcal</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-space-md">
                  <div className="flex items-center gap-space-xs">
                    <span className="px-space-sm py-0.5 rounded bg-blue-50 text-blue-800 font-label-caps text-label-caps font-bold">
                      P {Math.round(mealProtein)}g
                    </span>
                    <span className="px-space-sm py-0.5 rounded bg-amber-50 text-amber-800 font-label-caps text-label-caps font-bold">
                      C {Math.round(mealCarbs)}g
                    </span>
                    <span className="px-space-sm py-0.5 rounded bg-rose-50 text-rose-800 font-label-caps text-label-caps font-bold">
                      F {Math.round(mealFat)}g
                    </span>
                  </div>
                  <button 
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container text-on-surface-variant transition-colors" 
                    type="button"
                  >
                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                  </button>
                </div>
              </div>

              {/* Meal Item Rows */}
              {!isCollapsed && (
                <div className="divide-y divide-surface-container">
                  {mealLogs.length === 0 ? (
                    <div className="p-8 text-center text-outline text-body-sm flex flex-col items-center justify-center">
                      <Utensils size={32} className="opacity-25 mb-2" />
                      <p>No food logged for {meal.title.toLowerCase()} on this date.</p>
                      <button 
                        onClick={() => onQuickAddMeal(meal.id)}
                        className="mt-3 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-semibold hover:bg-primary-container transition-colors inline-flex items-center gap-1.5"
                      >
                        <Plus size={16} /> Add {meal.title} Item
                      </button>
                    </div>
                  ) : (
                    mealLogs.map((item) => (
                      <div 
                        key={item.id}
                        className="p-space-md sm:p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md hover:bg-surface-container-low/40 transition-colors group"
                      >
                        <div className="flex items-center gap-space-md min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0 font-bold text-lg shadow-xs border border-surface-container-high">
                            {item.food_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                              {item.food_name}
                            </span>
                            <div className="flex items-center gap-space-xs text-outline font-body-sm text-body-sm">
                              <span>Serving portion</span>
                              <span>•</span>
                              <span className="text-primary font-bold">{Math.round(item.calories)} kcal</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-space-lg pl-14 sm:pl-0">
                          <div className="flex items-center gap-space-sm font-label-caps text-label-caps">
                            <span className="text-blue-700 font-medium">P {Math.round(item.protein || 0)}g</span>
                            <span className="text-amber-700 font-medium">C {Math.round(item.carbs || 0)}g</span>
                            <span className="text-rose-700 font-medium">F {Math.round(item.fat || 0)}g</span>
                          </div>

                          <div className="flex items-center gap-space-xs opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleCopyFood(item)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors" 
                              title="Copy / Re-log Item" 
                              type="button"
                            >
                              <Copy size={16} />
                            </button>
                            <button 
                              onClick={() => onDeleteLog(item.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container/30 transition-colors" 
                              title="Delete Item" 
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Bottom Row: Quick Add Button */}
                  <div className="p-space-md bg-surface-container-low/30 flex items-center justify-between border-t border-surface-container">
                    <button 
                      onClick={() => onQuickAddMeal(meal.id)}
                      className="flex items-center gap-space-xs text-primary font-label-lg text-label-lg hover:text-primary-container transition-colors font-bold" 
                      type="button"
                    >
                      <Plus size={18} />
                      <span>+ Quick Add {meal.title} Item</span>
                    </button>
                    <span className="font-label-caps text-label-caps text-outline">
                      Preset: {meal.preset}
                    </span>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

    </div>
  );
}
