import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  ScanLine, 
  Search, 
  Target, 
  BarChart3, 
  Settings, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  todayCalories = 0, 
  calorieGoal = 2000,
  isOpen = false,
  setIsOpen = () => {}
}) {
  const percentMet = Math.min(100, Math.round((todayCalories / (calorieGoal || 2000)) * 100));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'food-diary', label: 'Food Diary', icon: BookOpen },
    { id: 'barcode-scanner', label: 'Barcode Scanner', icon: ScanLine },
    { id: 'food-search-and-logging', label: 'Food Search & Logging', icon: Search },
    { id: 'nutrition-goals', label: 'Nutrition Goals', icon: Target },
    { id: 'reports-and-analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'profile-and-settings', label: 'Profile & Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col">
          {/* Logo & Header */}
          <div className="h-16 px-space-lg flex items-center justify-between border-b border-surface-container">
            <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-fixed shadow-sm">
                <Sparkles size={18} />
              </div>
              <span className="font-title text-title text-primary tracking-tight font-bold">
                NutriTrack
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-space-sm py-0.5 rounded-lg bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-label-caps uppercase tracking-wider font-bold">
                PRO
              </span>
              <button 
                className="lg:hidden p-1 text-on-surface-variant hover:text-on-surface rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="px-space-md py-space-sm flex flex-col gap-space-xs mt-2">
            <button 
              onClick={() => { setCurrentTab('food-search-and-logging'); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-space-sm py-space-sm rounded-lg bg-primary text-on-primary font-label-lg text-label-lg transition-all hover:bg-primary-container shadow-[0_4px_20px_-2px_rgba(27,67,50,0.12)] active:scale-[0.98]" 
              type="button"
            >
              <Plus size={18} />
              <span>Log Food</span>
            </button>
            <button 
              onClick={() => { setCurrentTab('barcode-scanner'); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-space-sm py-space-sm rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors hover:bg-surface-container-high hover:text-on-surface active:scale-[0.98]" 
              type="button"
            >
              <ScanLine size={18} />
              <span>Scan Barcode</span>
            </button>
          </div>

          {/* Navigation Title */}
          <div className="px-space-lg pt-space-md pb-space-xs">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline font-bold">
              Navigation
            </span>
          </div>

          {/* Nav List */}
          <nav className="px-space-md flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-320px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentTab(item.id); setIsOpen(false); }}
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all text-left w-full ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-label-lg shadow-sm'
                      : 'text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary-fixed' : 'text-outline'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Metric Progress Box */}
        <div className="p-space-md mx-space-md mb-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs border border-surface-container-high shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Daily Calorie Target
            </span>
            <span className="font-label-caps text-label-caps text-secondary font-bold">
              {percentMet}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentMet > 100 ? 'bg-error' : 'bg-secondary'
              }`}
              style={{ width: `${Math.min(100, percentMet)}%` }}
            />
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {Math.round(todayCalories).toLocaleString()} of {calorieGoal.toLocaleString()} kcal logged
          </span>
        </div>
      </aside>
    </>
  );
}
