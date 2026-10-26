import React, { useState } from 'react';
import { 
  ScanLine, 
  Plus, 
  Verified, 
  Flag, 
  Utensils, 
  Flame, 
  RefreshCw, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  Clock, 
  TrendingUp, 
  Copy, 
  MoreHorizontal, 
  Trash2, 
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export default function DashboardView({
  user,
  summary = { calories: 0, carbs: 0, protein: 0, fat: 0 },
  weekly = { calories: 0, carbs: 0, protein: 0, fat: 0 },
  logs = [],
  goal = 2000,
  onNavigate = () => {},
  onQuickAddMeal = () => {},
  onDeleteLog = () => {},
  onRefresh = () => {}
}) {
  const [hydrationMl, setHydrationMl] = useState(2100);
  const hydrationTarget = 2500;

  const userDisplayName = user?.email 
    ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)
    : 'Health Champion';

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Active burned constant estimate
  const activeBurned = 280;
  const foodIntake = Math.round(summary.calories || 0);
  const netCalories = Math.max(0, foodIntake - activeBurned);
  const kcalLeft = Math.max(0, goal - foodIntake);
  const percentMet = Math.min(100, Math.round((foodIntake / (goal || 2000)) * 100));

  // Macronutrient estimated goals (based on standard balanced ratio: 25% P, 50% C, 25% F)
  const proteinGoal = Math.round((goal * 0.25) / 4); // ~125g for 2000 kcal
  const carbsGoal = Math.round((goal * 0.50) / 4);   // ~250g for 2000 kcal
  const fatGoal = Math.round((goal * 0.25) / 9);     // ~55g for 2000 kcal

  const currentProtein = Math.round(summary.protein || 0);
  const currentCarbs = Math.round(summary.carbs || 0);
  const currentFat = Math.round(summary.fat || 0);

  const proteinPercent = Math.min(100, Math.round((currentProtein / (proteinGoal || 1)) * 100));
  const carbsPercent = Math.min(100, Math.round((currentCarbs / (carbsGoal || 1)) * 100));
  const fatPercent = Math.min(100, Math.round((currentFat / (fatGoal || 1)) * 100));

  // Circular gauge calculations
  // Circumference = 2 * PI * 68 = ~427.25
  const circumference = 427;
  const strokeOffset = circumference - (circumference * percentMet) / 100;

  // Hydration glasses (8 glasses of 250 ml = 2000 ml, target 2500 ml)
  const glasses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const filledGlassesCount = Math.floor(hydrationMl / 250);

  // Group logs into meal slots for Today's Meal Timeline
  const mealSlots = [
    { id: 'breakfast', title: 'Breakfast', label: 'Meal 01', time: 'Logged 8:15 AM' },
    { id: 'lunch', title: 'Lunch', label: 'Meal 02', time: 'Logged 1:10 PM' },
    { id: 'snack', title: 'Snacks', label: 'Meal 03', time: 'Logged 4:00 PM' },
    { id: 'dinner', title: 'Dinner', label: 'Meal 04', time: 'Scheduled ~7:30 PM' }
  ];

  // Helper to filter logs for each slot
  const getLogsForSlot = (slotId) => {
    return logs.filter(l => {
      const type = (l.meal_type || '').toLowerCase();
      if (slotId === 'snack') return type === 'snack' || type === 'snacks';
      return type === slotId;
    });
  };

  const chartData = [
    {
      name: 'Today',
      calories: Math.round(summary.calories || 0),
      carbs: Math.round(summary.carbs || 0),
      protein: Math.round(summary.protein || 0),
      fat: Math.round(summary.fat || 0)
    },
    {
      name: 'Week Avg',
      calories: Math.round((weekly.calories || 0) / 7),
      carbs: Math.round((weekly.carbs || 0) / 7),
      protein: Math.round((weekly.protein || 0) / 7),
      fat: Math.round((weekly.fat || 0) / 7)
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-space-md sm:px-margin py-space-xl flex flex-col gap-space-xl">
      
      {/* Top Greeting & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-secondary mb-1">
            <Verified size={18} />
            <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">
              Metabolic Clinical Profile
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            {greeting}, {userDisplayName}!
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex items-center gap-space-xs flex-wrap">
            <span>Today's Status</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <span className="text-secondary font-semibold">
              {kcalLeft > 0 ? `${kcalLeft} kcal away` : 'Daily calorie goal achieved'}
            </span>
            <span>from your daily target</span>
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-space-sm self-start md:self-auto flex-wrap">
          <button 
            onClick={() => onNavigate('barcode-scanner')}
            className="group flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-all shadow-xs" 
            type="button"
          >
            <ScanLine size={18} className="text-primary-container group-hover:scale-110 transition-transform" />
            <span>Scan Barcode</span>
          </button>
          <button 
            onClick={() => onNavigate('food-search-and-logging')}
            className="group flex items-center gap-space-sm px-space-lg py-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-all shadow-md hover:shadow-lg active:scale-[0.98]" 
            type="button"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>Quick Log Food</span>
          </button>
        </div>
      </div>

      {/* Top Metric Grid: Circular Calorie Gauge, Macro Trio, and Hydration Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
        
        {/* Prominent Calorie Progress Card (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-bold">
                Energy Balance Gauge
              </span>
            </div>
            <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
              Daily Target
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-space-md my-auto py-space-sm">
            {/* Circular Ring Gauge using Pure Scalable Inline SVG */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Background Track */}
                <circle 
                  className="text-surface-container" 
                  cx="80" 
                  cy="80" 
                  fill="transparent" 
                  r="68" 
                  stroke="currentColor" 
                  strokeWidth="13"
                />
                {/* Calorie Consumed Track */}
                <circle 
                  className="text-primary-container transition-all duration-700 ease-out" 
                  cx="80" 
                  cy="80" 
                  fill="transparent" 
                  r="68" 
                  stroke="currentColor" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeOffset} 
                  strokeLinecap="round" 
                  strokeWidth="13"
                />
              </svg>
              {/* Gauge Center Data Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-headline-lg text-headline-lg text-primary font-bold leading-none tracking-tight">
                  {kcalLeft}
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-outline mt-1 font-bold">
                  kcal Left
                </span>
                <span className="mt-1 px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-[10px] font-bold">
                  {percentMet}% MET
                </span>
              </div>
            </div>

            {/* Base Metrics Breakdown Details */}
            <div className="flex flex-col gap-space-xs sm:gap-space-sm w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-space-lg p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-space-xs">
                  <Flag size={16} className="text-outline" />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Daily Target</span>
                </div>
                <span className="font-title text-title text-on-surface font-semibold ml-auto">
                  {goal.toLocaleString()} <span className="font-body-sm text-body-sm text-outline font-normal">kcal</span>
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-space-lg p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-space-xs">
                  <Utensils size={16} className="text-secondary" />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Food Intake</span>
                </div>
                <span className="font-title text-title text-secondary font-semibold ml-auto">
                  {foodIntake.toLocaleString()} <span className="font-body-sm text-body-sm text-outline font-normal">kcal</span>
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-space-lg p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-space-xs">
                  <Flame size={16} className="text-error" />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Active Burned</span>
                </div>
                <span className="font-title text-title text-error font-semibold ml-auto">
                  -{activeBurned} <span className="font-body-sm text-body-sm text-outline font-normal">kcal</span>
                </span>
              </div>

              <div className="pt-space-xs bg-surface-container-low/70 px-space-sm py-1.5 rounded flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Net Remaining</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  {Math.max(0, goal - netCalories).toLocaleString()} <span className="font-body-sm text-body-sm text-outline font-normal">kcal</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-sm text-outline font-body-sm text-body-sm border-t border-surface-container">
            <span className="flex items-center gap-1">
              <RefreshCw size={14} className="cursor-pointer hover:rotate-180 transition-transform" onClick={onRefresh} />
              Live Sync
            </span>
            <button 
              onClick={() => onNavigate('nutrition-goals')}
              className="text-secondary font-label-md text-label-md font-semibold hover:underline"
            >
              Adjust Calorie Goals
            </button>
          </div>
        </div>

        {/* Macro Cards Trio & Water Tracker (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md justify-between">
          
          {/* Trio of Macronutrient Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            
            {/* Protein Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="px-space-xs py-0.5 rounded bg-blue-50 text-blue-700 font-label-caps text-label-caps uppercase font-bold tracking-wider">
                  Protein
                </span>
                <Dumbbell size={18} className="text-blue-600" />
              </div>
              <div className="my-space-sm">
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-md text-headline-md text-on-surface font-bold">
                    {currentProtein}g
                  </span>
                  <span className="font-body-md text-body-md text-outline">
                    / {proteinGoal}g
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm mt-0.5">
                  <span className="text-on-surface-variant">{proteinPercent}% achieved</span>
                  <span className="text-primary font-semibold font-label-md text-label-md">
                    {Math.max(0, proteinGoal - currentProtein)}g left
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500" 
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Carbohydrates Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="px-space-xs py-0.5 rounded bg-amber-50 text-amber-700 font-label-caps text-label-caps uppercase font-bold tracking-wider">
                  Carbs
                </span>
                <Wheat size={18} className="text-amber-600" />
              </div>
              <div className="my-space-sm">
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-md text-headline-md text-on-surface font-bold">
                    {currentCarbs}g
                  </span>
                  <span className="font-body-md text-body-md text-outline">
                    / {carbsGoal}g
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm mt-0.5">
                  <span className="text-on-surface-variant">{carbsPercent}% achieved</span>
                  <span className="text-on-surface font-semibold font-label-md text-label-md">
                    {Math.max(0, carbsGoal - currentCarbs)}g left
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500" 
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
            </div>

            {/* Fats Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="px-space-xs py-0.5 rounded bg-rose-50 text-rose-700 font-label-caps text-label-caps uppercase font-bold tracking-wider">
                  Lipids / Fat
                </span>
                <Droplet size={18} className="text-rose-600" />
              </div>
              <div className="my-space-sm">
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-md text-headline-md text-on-surface font-bold">
                    {currentFat}g
                  </span>
                  <span className="font-body-md text-body-md text-outline">
                    / {fatGoal}g
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm mt-0.5">
                  <span className="text-on-surface-variant">{fatPercent}% achieved</span>
                  <span className="text-error font-semibold font-label-md text-label-md">
                    {Math.max(0, fatGoal - currentFat)}g left
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500" 
                  style={{ width: `${fatPercent}%` }}
                />
              </div>
            </div>

          </div>

          {/* Water Tracker Card (Hydration Status) */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0 shadow-xs">
                <Droplet size={28} className="fill-secondary text-secondary" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-title text-title text-on-surface font-bold">
                    Hydration Tracker
                  </span>
                  <span className="px-space-xs py-0.5 rounded bg-surface-container text-secondary font-label-caps text-label-caps font-bold">
                    {Math.round((hydrationMl / hydrationTarget) * 100)}% GOAL
                  </span>
                </div>
                <span className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  <strong className="text-on-surface font-semibold">{hydrationMl.toLocaleString()} ml</strong> logged of {hydrationTarget.toLocaleString()} ml target
                </span>
              </div>
            </div>

            {/* Glass Icons representation */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
              {glasses.map((g, idx) => {
                const isFilled = idx < filledGlassesCount;
                return (
                  <button 
                    key={g}
                    onClick={() => setHydrationMl((idx + 1) * 250)}
                    className={`w-7 h-9 rounded flex items-center justify-center transition-all hover:scale-110 ${
                      isFilled 
                        ? 'bg-secondary-container text-secondary font-bold' 
                        : 'bg-surface-container-high/60 text-outline border border-dashed border-outline-variant hover:text-secondary'
                    }`}
                    title={`Glass ${g} (250ml)`}
                  >
                    <Droplet size={16} className={isFilled ? 'fill-secondary' : ''} />
                  </button>
                );
              })}
            </div>

            {/* Quick Water Intake Buttons */}
            <div className="flex items-center gap-space-xs shrink-0 w-full sm:w-auto">
              <button 
                onClick={() => setHydrationMl(prev => Math.min(3500, prev + 250))}
                className="flex-1 sm:flex-none px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors active:scale-95" 
                type="button"
              >
                +250ml
              </button>
              <button 
                onClick={() => setHydrationMl(prev => Math.min(3500, prev + 500))}
                className="flex-1 sm:flex-none px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors active:scale-95" 
                type="button"
              >
                +500ml
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Middle Section: Structured Meal Timeline (4 Columns) */}
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              Today's Meal Timeline
            </h2>
            <span className="px-space-xs py-0.5 rounded bg-surface-container font-label-caps text-label-caps text-outline font-semibold">
              4 MEAL PERIODS
            </span>
          </div>
          <button 
            onClick={() => onNavigate('food-diary')}
            className="font-label-md text-label-md text-secondary hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <span>Open Diary</span>
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-lg">
          {mealSlots.map((slot) => {
            const slotLogs = getLogsForSlot(slot.id);
            const slotCalories = slotLogs.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);

            return (
              <div 
                key={slot.id}
                className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-space-sm border-b border-surface-container">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline font-bold">
                        {slot.label}
                      </span>
                      <span className="font-title text-title text-on-surface font-bold">
                        {slot.title}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5 text-[11px]">
                        <Clock size={12} className="text-secondary" /> {slot.time}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-title text-title text-primary font-bold">
                        {Math.round(slotCalories)}
                      </span>
                      <span className="font-label-caps text-label-caps text-outline block text-[10px]">
                        kcal
                      </span>
                    </div>
                  </div>

                  {/* Food Items Breakdown */}
                  <div className="flex flex-col gap-space-xs mt-space-sm min-h-[120px]">
                    {slotLogs.length === 0 ? (
                      <div className="py-6 text-center text-outline text-body-sm flex flex-col items-center justify-center">
                        <Utensils size={24} className="opacity-30 mb-1" />
                        <span>No items logged yet</span>
                      </div>
                    ) : (
                      slotLogs.map((item) => (
                        <div 
                          key={item.id}
                          className="p-space-xs rounded-lg hover:bg-surface-container-low transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-label-md text-label-md text-on-surface font-semibold leading-snug truncate pr-2">
                              {item.food_name}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface font-semibold ml-2 shrink-0">
                              {Math.round(item.calories)} kcal
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-outline font-body-sm text-body-sm mt-1">
                            <span className="text-[11px]">Serving portion</span>
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="px-1 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                                P {Math.round(item.protein || 0)}g
                              </span>
                              <span className="px-1 py-0.2 rounded bg-amber-50 text-amber-700 font-medium">
                                C {Math.round(item.carbs || 0)}g
                              </span>
                              <span className="px-1 py-0.2 rounded bg-rose-50 text-rose-700 font-medium">
                                F {Math.round(item.fat || 0)}g
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-space-md flex items-center justify-between border-t border-surface-container">
                  <button 
                    onClick={() => onQuickAddMeal(slot.id)}
                    className="text-secondary hover:text-primary font-label-md text-label-md font-semibold flex items-center gap-1 transition-colors" 
                    type="button"
                  >
                    <Plus size={16} /> Add Food
                  </button>
                  <button 
                    onClick={() => onNavigate('food-diary')}
                    className="w-8 h-8 rounded hover:bg-surface-container text-outline hover:text-on-surface flex items-center justify-center transition-colors" 
                    type="button"
                    title="View details"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Nutrition Overview & Chart Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Chart Panel */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-bold">
                Metabolic Breakdown
              </span>
              <h2 className="font-title text-title text-on-surface font-bold">
                Daily & Weekly Nutrition Overview
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-label-caps font-bold">
              Energy & Macros
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6eeff" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#717973', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#717973', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    border: '1px solid #d9e3f6', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)' 
                  }} 
                />
                <Legend iconType="circle" />
                <Bar dataKey="calories" name="Calories (kcal)" fill="#1b4332" radius={[4, 4, 0, 0]} />
                <Bar dataKey="protein" name="Protein (g)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="carbs" name="Carbs (g)" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fat" name="Fat (g)" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Food Logs Activity */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-secondary" />
              <h3 className="font-title text-title text-on-surface font-bold">Recent Food Logs</h3>
            </div>
            <button 
              onClick={onRefresh}
              className="p-1 text-outline hover:text-on-surface rounded-md transition-colors"
              title="Refresh logs"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="flex flex-col divide-y divide-surface-container overflow-y-auto max-h-64 my-2">
            {logs.length === 0 ? (
              <p className="py-8 text-center text-outline text-body-sm">
                No logs recorded yet. Use Quick Log or Scan Barcode above to record your first meal!
              </p>
            ) : (
              logs.slice(0, 5).map((l) => (
                <div key={l.id} className="py-2.5 flex items-center justify-between gap-3 group">
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                      {l.food_name}
                    </p>
                    <span className="text-[11px] text-outline block">
                      {new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {l.meal_type || 'snack'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="font-label-md text-label-md font-bold text-primary block">
                        {Math.round(l.calories)} kcal
                      </span>
                      <span className="text-[10px] text-outline">
                        P{Math.round(l.protein)} C{Math.round(l.carbs)} F{Math.round(l.fat || 0)}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteLog(l.id)}
                      className="p-1 text-outline hover:text-error hover:bg-error-container/30 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => onNavigate('food-diary')}
            className="w-full py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md transition-colors text-center font-semibold mt-2"
          >
            View All Diary Records ({logs.length})
          </button>
        </div>
      </div>

    </div>
  );
}
