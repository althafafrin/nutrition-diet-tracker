import React, { useEffect, useState, useCallback } from 'react';
import API from './api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import FoodDiaryView from './components/FoodDiaryView';
import BarcodeScannerView from './components/BarcodeScannerView';
import FoodSearchView from './components/FoodSearchView';
import GoalsAndAnalyticsView from './components/GoalsAndAnalyticsView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import { VERIFIED_FOODS } from './foodDatabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Nutrition state
  const [goal, setGoal] = useState(2000);
  const [summary, setSummary] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
  const [weekly, setWeekly] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
  const [logs, setLogs] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedMealSlot, setSelectedMealSlot] = useState('breakfast');
  const [loading, setLoading] = useState(true);

  // Check auth on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.me()
        .then((u) => {
          setUser(u);
          setGoal(u.daily_calorie_goal || 2000);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch summary and logs
  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      const [daySum, weekSum, logList] = await Promise.all([
        API.summary('day'),
        API.summary('week'),
        API.logs()
      ]);

      setSummary(daySum || { calories: 0, carbs: 0, protein: 0, fat: 0 });
      setWeekly(weekSum || { calories: 0, carbs: 0, protein: 0, fat: 0 });
      setLogs(Array.isArray(logList) ? logList : []);

      const userGoal = Number(goal || 2000);
      if (daySum?.calories > userGoal) {
        setAlertMessage(`⚠️ Daily calorie target passed: ${Math.round(daySum.calories)} / ${userGoal} kcal`);
      } else {
        setAlertMessage('');
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  }, [user, goal]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // Seed sample initial logs if the user has no logs yet
  useEffect(() => {
    if (user && logs.length === 0 && !loading) {
      const seedDefaults = async () => {
        try {
          const sampleItems = [
            {
              food_name: "Bob's Red Mill Rolled Oats",
              calories: 300,
              protein: 10,
              carbs: 54,
              fat: 5,
              meal_type: 'breakfast',
              created_at: Date.now() - 6 * 3600 * 1000
            },
            {
              food_name: 'Organic Cage-Free Eggs, Hard Boiled',
              calories: 140,
              protein: 12,
              carbs: 1,
              fat: 10,
              meal_type: 'breakfast',
              created_at: Date.now() - 5.5 * 3600 * 1000
            },
            {
              food_name: 'Grilled Lemon Herb Chicken Breast',
              calories: 290,
              protein: 42,
              carbs: 0,
              fat: 6,
              meal_type: 'lunch',
              created_at: Date.now() - 3 * 3600 * 1000
            },
            {
              food_name: 'Tri-color Organic Quinoa cooked',
              calories: 222,
              protein: 8,
              carbs: 39,
              fat: 4,
              meal_type: 'lunch',
              created_at: Date.now() - 2.8 * 3600 * 1000
            },
            {
              food_name: 'Greek Strained Yogurt 0% Fat',
              calories: 150,
              protein: 18,
              carbs: 6,
              fat: 0,
              meal_type: 'snack',
              created_at: Date.now() - 1 * 3600 * 1000
            }
          ];

          for (const item of sampleItems) {
            await API.createLog(item);
          }
          await refreshData();
        } catch (e) {
          // ignore seeding conflicts
        }
      };
      seedDefaults();
    }
  }, [user, logs.length, loading, refreshData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setLogs([]);
  };

  const handleSaveLog = async (logData) => {
    const res = await API.createLog(logData);
    await refreshData();
    return res;
  };

  const handleDeleteLog = async (id) => {
    try {
      await API.deleteLog(id);
      await refreshData();
    } catch (err) {
      alert('Failed to delete log: ' + err.message);
    }
  };

  const handleQuickAddMeal = (mealSlot, presetItem = null) => {
    setSelectedMealSlot(mealSlot || 'breakfast');
    if (presetItem) {
      handleSaveLog({
        food_name: presetItem.name,
        calories: presetItem.calories,
        carbs: presetItem.carbs,
        protein: presetItem.protein,
        fat: presetItem.fat || 0,
        meal_type: mealSlot,
        created_at: Date.now()
      });
    } else {
      setCurrentTab('food-search-and-logging');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="font-label-lg font-bold">Initializing NutriTrack...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthView 
        onAuth={(u) => {
          setUser(u);
          setGoal(u.daily_calorie_goal || 2000);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased">
      
      {/* Fixed Sidebar */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        todayCalories={summary.calories}
        calorieGoal={goal}
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
      />

      {/* Main viewport offset for fixed sidebar */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <Header 
          user={user}
          onLogout={handleLogout}
          calorieGoal={goal}
          todayCalories={summary.calories}
          notificationMessage={alertMessage}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSearchClick={() => setCurrentTab('food-search-and-logging')}
        />

        {/* Dynamic Route View */}
        <main className="w-full pt-16 bg-background flex-1 pb-16">
          {currentTab === 'dashboard' && (
            <DashboardView 
              user={user}
              summary={summary}
              weekly={weekly}
              logs={logs}
              goal={goal}
              onNavigate={setCurrentTab}
              onQuickAddMeal={handleQuickAddMeal}
              onDeleteLog={handleDeleteLog}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'food-diary' && (
            <FoodDiaryView 
              logs={logs}
              goal={goal}
              onQuickAddMeal={handleQuickAddMeal}
              onDeleteLog={handleDeleteLog}
            />
          )}

          {currentTab === 'barcode-scanner' && (
            <BarcodeScannerView 
              onSaveLog={handleSaveLog}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'food-search-and-logging' && (
            <FoodSearchView 
              initialMealSlot={selectedMealSlot}
              onSaveLog={handleSaveLog}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'nutrition-goals' && (
            <GoalsAndAnalyticsView 
              user={user}
              goal={goal}
              onUpdateGoal={newGoal => setGoal(newGoal)}
              summary={summary}
              weekly={weekly}
              mode="goals"
            />
          )}

          {currentTab === 'reports-and-analytics' && (
            <GoalsAndAnalyticsView 
              user={user}
              goal={goal}
              summary={summary}
              weekly={weekly}
              mode="analytics"
            />
          )}

          {currentTab === 'profile-and-settings' && (
            <SettingsView 
              user={user}
              onUpdateUser={u => setUser(u)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="w-full py-4 px-space-lg text-center text-outline text-[12px] border-t border-surface-container bg-surface-container-low">
          NutriTrack Diagnostic Nutrition Platform • Evidence-based clinical wellness tracker • Signed in as {user.email}
        </footer>

      </div>

    </div>
  );
}
