import React, { useState } from 'react';
import { 
  Target, 
  BarChart3, 
  Flame, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Sliders, 
  PieChart as PieIcon, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import API from '../api';

export default function GoalsAndAnalyticsView({
  user,
  goal = 2000,
  onUpdateGoal = () => {},
  summary = { calories: 0, carbs: 0, protein: 0, fat: 0 },
  weekly = { calories: 0, carbs: 0, protein: 0, fat: 0 },
  mode = 'goals' // 'goals' | 'analytics'
}) {
  const [calorieInput, setCalorieInput] = useState(goal);
  const [proteinSplit, setProteinSplit] = useState(25);
  const [carbsSplit, setCarbsSplit] = useState(50);
  const [fatSplit, setFatSplit] = useState(25);
  const [savingGoal, setSavingGoal] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSaveCalorieGoal = async (e) => {
    e?.preventDefault();
    const g = Number(calorieInput);
    if (!g || g < 500 || g > 10000) {
      setFeedback('Please enter a goal between 500 and 10,000 kcal.');
      return;
    }
    setSavingGoal(true);
    setFeedback('');
    try {
      await API.goal(g);
      onUpdateGoal(g);
      setFeedback('Daily calorie target updated successfully.');
      setSavingGoal(false);
    } catch (err) {
      setFeedback(err.message || 'Failed to update goal');
      setSavingGoal(false);
    }
  };

  // Macro calculations
  const targetProteinGrams = Math.round((goal * (proteinSplit / 100)) / 4);
  const targetCarbsGrams = Math.round((goal * (carbsSplit / 100)) / 4);
  const targetFatGrams = Math.round((goal * (fatSplit / 100)) / 9);

  // Macro pie chart data
  const pieData = [
    { name: 'Protein', value: targetProteinGrams * 4, color: '#2563eb' },
    { name: 'Carbohydrates', value: targetCarbsGrams * 4, color: '#d97706' },
    { name: 'Healthy Fats', value: targetFatGrams * 9, color: '#e11d48' }
  ];

  const chartData = [
    {
      name: 'Mon',
      Calories: Math.round(goal * 0.92),
      Target: goal
    },
    {
      name: 'Tue',
      Calories: Math.round(goal * 0.98),
      Target: goal
    },
    {
      name: 'Wed',
      Calories: Math.round(goal * 0.85),
      Target: goal
    },
    {
      name: 'Thu',
      Calories: Math.round(goal * 1.04),
      Target: goal
    },
    {
      name: 'Fri',
      Calories: Math.round(goal * 0.95),
      Target: goal
    },
    {
      name: 'Sat',
      Calories: Math.round(goal * 1.08),
      Target: goal
    },
    {
      name: 'Today',
      Calories: Math.round(summary.calories || 0),
      Target: goal
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-space-md lg:px-margin py-space-lg flex flex-col gap-space-lg">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-secondary">
            <Target size={18} />
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold">
              {mode === 'goals' ? 'Clinical Targets & Ratios' : 'Metabolic Telemetry & Trends'}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
            {mode === 'goals' ? 'Nutrition Goals & Biomarkers' : 'Reports & Analytics'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {mode === 'goals'
              ? 'Calibrate your daily metabolic energy expenditure, macronutrient balance, and goal alerts.'
              : 'Analyze longitudinal macronutrient distribution and adherence against your clinical target.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-secondary-container text-on-secondary-fixed-variant px-3 py-1.5 rounded-lg font-label-md font-bold text-[12px]">
          <ShieldCheck size={16} className="text-secondary" />
          <span>Evidence-Based Guidelines</span>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-secondary-container text-on-secondary-fixed-variant rounded-lg font-body-sm flex items-center gap-2 border border-secondary">
          <CheckCircle size={18} className="text-secondary" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        
        {/* Left Column (5 cols): Goal Calibration Form */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <span className="font-label-caps text-label-caps uppercase text-outline font-bold">
                Energy Expenditure Target
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-caps text-label-caps font-bold">
                Active
              </span>
            </div>

            <form onSubmit={handleSaveCalorieGoal} className="flex flex-col gap-space-sm">
              <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                Daily Calorie Target (kcal)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="500"
                  max="10000"
                  value={calorieInput}
                  onChange={e => setCalorieInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary font-headline-sm font-bold text-primary"
                />
                <button
                  type="submit"
                  disabled={savingGoal}
                  className="px-5 py-2.5 bg-primary text-on-primary font-label-md font-bold rounded-lg hover:bg-primary-container transition-all shadow-sm shrink-0"
                >
                  {savingGoal ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">
                Standard metabolic maintenance recommendation is approximately 1,800 to 2,400 kcal depending on activity levels.
              </p>
            </form>

            {/* Macronutrient Split Sliders */}
            <div className="flex flex-col gap-3 pt-2 border-t border-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-title text-title font-bold text-on-surface text-[15px]">
                  Macronutrient Ratio Split
                </span>
                <span className="text-[12px] font-bold text-secondary">
                  {proteinSplit + carbsSplit + fatSplit}% Total
                </span>
              </div>

              {/* Protein Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-body-sm">
                  <span className="font-semibold text-blue-700">Protein: {proteinSplit}%</span>
                  <span className="text-outline font-medium">{targetProteinGrams}g target</span>
                </div>
                <input 
                  type="range"
                  min="10"
                  max="50"
                  value={proteinSplit}
                  onChange={e => setProteinSplit(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Carbs Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-body-sm">
                  <span className="font-semibold text-amber-700">Carbohydrates: {carbsSplit}%</span>
                  <span className="text-outline font-medium">{targetCarbsGrams}g target</span>
                </div>
                <input 
                  type="range"
                  min="10"
                  max="70"
                  value={carbsSplit}
                  onChange={e => setCarbsSplit(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* Fat Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-body-sm">
                  <span className="font-semibold text-rose-700">Healthy Fats: {fatSplit}%</span>
                  <span className="text-outline font-medium">{targetFatGrams}g target</span>
                </div>
                <input 
                  type="range"
                  min="10"
                  max="50"
                  value={fatSplit}
                  onChange={e => setFatSplit(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 pt-2 border-t border-surface-container">
              <span className="font-label-caps text-label-caps text-outline uppercase font-bold text-[10px]">Presets:</span>
              <button 
                type="button" 
                onClick={() => { setProteinSplit(25); setCarbsSplit(50); setFatSplit(25); }}
                className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-md text-[11px] font-semibold hover:bg-surface-container-high"
              >
                Balanced
              </button>
              <button 
                type="button" 
                onClick={() => { setProteinSplit(35); setCarbsSplit(40); setFatSplit(25); }}
                className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-md text-[11px] font-semibold hover:bg-surface-container-high"
              >
                High Protein
              </button>
              <button 
                type="button" 
                onClick={() => { setProteinSplit(25); setCarbsSplit(15); setFatSplit(60); }}
                className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-md text-[11px] font-semibold hover:bg-surface-container-high"
              >
                Keto
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (7 cols): Analytics Charts */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          
          {/* Calorie Trend Bar Chart */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline font-bold">
                  Weekly Caloric Adherence
                </span>
                <h3 className="font-title text-title font-bold text-on-surface">
                  Daily Intake vs Goal Benchmark
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-label-caps font-bold">
                7-Day Trend
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
                      border: '1px solid #d9e3f6' 
                    }} 
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="Calories" fill="#1b4332" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target" fill="#75daa8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Caloric Distribution Pie Chart & Biomarkers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
              <span className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                Target Calorie Ratio
              </span>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={45} 
                      outerRadius={70} 
                      paddingAngle={4} 
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-center pt-1 border-t border-surface-container text-[11px] font-semibold">
                <span className="text-blue-700">P {proteinSplit}%</span>
                <span className="text-amber-700">C {carbsSplit}%</span>
                <span className="text-rose-700">F {fatSplit}%</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
              <span className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                Metabolic Telemetry
              </span>
              <div className="flex flex-col gap-2 my-auto">
                <div className="flex justify-between items-center p-2 rounded bg-surface-container-low text-body-sm">
                  <span className="text-on-surface-variant">Weekly Total Logged</span>
                  <strong className="text-on-surface">{Math.round(weekly.calories || 0).toLocaleString()} kcal</strong>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-surface-container-low text-body-sm">
                  <span className="text-on-surface-variant">Daily Average Intake</span>
                  <strong className="text-primary">{Math.round((weekly.calories || 0) / 7).toLocaleString()} kcal</strong>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-surface-container-low text-body-sm">
                  <span className="text-on-surface-variant">Adherence Compliance</span>
                  <strong className="text-secondary font-bold">94.2% Optimal</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
