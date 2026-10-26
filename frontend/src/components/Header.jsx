import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Bell, 
  LogOut, 
  Menu, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Sparkles 
} from 'lucide-react';

export default function Header({ 
  user, 
  onLogout, 
  calorieGoal = 2000, 
  todayCalories = 0,
  notificationMessage = '',
  onOpenMobileMenu = () => {},
  onSearchClick = () => {}
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const goalExceeded = todayCalories > calorieGoal;
  
  // Format current date nicely
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  const userDisplayName = user?.email 
    ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)
    : 'Member';

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="w-full h-full px-space-md lg:px-space-lg flex items-center justify-between gap-space-md">
        
        {/* Left: Hamburger (mobile) + Search bar */}
        <div className="flex items-center gap-space-sm flex-1 max-w-lg">
          <button 
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <div 
            onClick={onSearchClick}
            className="relative w-full flex items-center cursor-pointer group"
          >
            <Search className="absolute left-space-md text-outline group-hover:text-primary transition-colors pointer-events-none" size={18} />
            <input 
              readOnly
              onClick={onSearchClick}
              className="w-full pl-10 pr-space-md py-space-xs rounded-lg bg-surface-container text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary cursor-pointer transition-all border border-transparent hover:border-surface-variant" 
              placeholder="Search meals, ingredients, or brand codes..." 
              type="text" 
            />
            <kbd className="hidden sm:inline-block absolute right-space-sm px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase text-[10px]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          
          {/* Calendar Badge */}
          <div className="hidden md:flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-low text-on-surface border border-surface-container">
            <Calendar size={17} className="text-secondary" />
            <span className="font-label-md text-label-md">
              Today, {todayStr}
            </span>
          </div>

          {/* Notifications Button & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {(goalExceeded || notificationMessage) && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container p-space-md z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <span className="font-label-caps text-label-caps uppercase text-outline font-bold">
                    System Alerts & Updates
                  </span>
                  <span className="text-[11px] text-secondary font-semibold">Live</span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {goalExceeded ? (
                    <div className="p-2.5 rounded-lg bg-error-container/40 border border-error-container text-error flex items-start gap-2 text-body-sm">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Calorie Goal Exceeded</strong>
                        <span>Current total: {Math.round(todayCalories)} / {calorieGoal} kcal target.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-secondary-container/40 border border-secondary-container text-primary flex items-start gap-2 text-body-sm">
                      <CheckCircle size={18} className="shrink-0 mt-0.5 text-secondary" />
                      <div>
                        <strong className="block font-semibold">Optimal Metabolic State</strong>
                        <span>You are within your daily target of {calorieGoal} kcal.</span>
                      </div>
                    </div>
                  )}

                  {notificationMessage && (
                    <div className="p-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm">
                      {notificationMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip */}
          <div className="relative">
            <div 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-space-sm pl-space-xs sm:pl-space-sm cursor-pointer rounded-lg p-1 hover:bg-surface-container transition-colors"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-label-lg text-label-lg text-on-surface leading-tight font-semibold">
                  {userDisplayName}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                  Daily Goal: {calorieGoal} kcal
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-container text-primary-fixed flex items-center justify-center font-bold text-sm ring-2 ring-surface-container-high shadow-xs">
                {userDisplayName.charAt(0)}
              </div>
            </div>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container p-2 z-50">
                <div className="px-3 py-2 border-b border-surface-container mb-1">
                  <p className="font-label-md text-label-md text-on-surface font-bold truncate">
                    {user?.email}
                  </p>
                  <p className="text-[11px] text-outline">Target: {calorieGoal} kcal / day</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-error hover:bg-error-container/30 transition-colors text-label-md font-semibold text-left"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
