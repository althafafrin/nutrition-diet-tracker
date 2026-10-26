import React, { useState } from 'react';
import { 
  Search, 
  ScanLine, 
  Check, 
  History, 
  Star, 
  Verified, 
  SlidersHorizontal, 
  Plus, 
  Minus, 
  ChevronDown, 
  Calendar, 
  Clock, 
  BookmarkPlus, 
  CheckCircle,
  Utensils
} from 'lucide-react';
import { VERIFIED_FOODS } from '../foodDatabase';

export default function FoodSearchView({ 
  initialMealSlot = 'breakfast', 
  onSaveLog = () => {},
  onNavigate = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  
  // Selected food for right panel
  const [selectedFood, setSelectedFood] = useState(VERIFIED_FOODS[0]);
  const [servingFactor, setServingFactor] = useState(1);
  const [servingUnitsLabel, setServingUnitsLabel] = useState(VERIFIED_FOODS[0]?.servingUnit || '1 cup (81g)');
  const [quantity, setQuantity] = useState(1.0);
  const [targetMealSlot, setTargetMealSlot] = useState(initialMealSlot);
  const [isFavorite, setIsFavorite] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Custom log inputs for user-added foods
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  // Filter foods
  const filteredFoods = VERIFIED_FOODS.filter(food => {
    const matchesQuery = !searchQuery || 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.barcode && food.barcode.includes(searchQuery));

    const matchesSource = sourceFilter === 'All' || 
      (sourceFilter === 'USDA Database' && food.source.includes('USDA')) ||
      (sourceFilter === 'Branded Packaged' && food.source.includes('Branded')) ||
      (sourceFilter === 'Custom Meals' && food.category === 'Custom');

    const matchesTag = tagFilter === 'All' ||
      food.category.toLowerCase().includes(tagFilter.toLowerCase()) ||
      food.tags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase()));

    return matchesQuery && matchesSource && matchesTag;
  });

  const selectFood = (food) => {
    setSelectedFood(food);
    setServingFactor(1);
    setServingUnitsLabel(food.servingUnit);
    setQuantity(1.0);
  };

  // Recalculate dynamic energy
  const currentMultiplier = servingFactor * quantity;
  const calcCalories = Math.round((selectedFood?.baseCalories || 0) * currentMultiplier);
  const calcProtein = Math.round((selectedFood?.baseProtein || 0) * currentMultiplier * 10) / 10;
  const calcCarbs = Math.round((selectedFood?.baseCarbs || 0) * currentMultiplier * 10) / 10;
  const calcFat = Math.round((selectedFood?.baseFat || 0) * currentMultiplier * 10) / 10;
  const calcFiber = Math.round((selectedFood?.baseFiber || 0) * currentMultiplier * 10) / 10;

  // Handle Log submission
  const handleLogToDiary = async () => {
    if (!selectedFood) return;
    setIsSaving(true);
    setStatusText('');

    const payload = {
      food_name: selectedFood.name,
      barcode: selectedFood.barcode || null,
      calories: calcCalories,
      protein: calcProtein,
      carbs: calcCarbs,
      fat: calcFat,
      meal_type: targetMealSlot,
      created_at: Date.now()
    };

    try {
      await onSaveLog(payload);
      setStatusText(`Added ${quantity}x ${selectedFood.name} (${calcCalories} kcal) to ${targetMealSlot.toUpperCase()}`);
      setIsSaving(false);
    } catch (err) {
      setStatusText('Failed to save: ' + err.message);
      setIsSaving(false);
    }
  };

  // Quick Add directly from item card
  const handleQuickAdd = async (food) => {
    const payload = {
      food_name: food.name,
      barcode: food.barcode || null,
      calories: food.baseCalories,
      protein: food.baseProtein,
      carbs: food.baseCarbs,
      fat: food.baseFat,
      meal_type: targetMealSlot,
      created_at: Date.now()
    };

    try {
      await onSaveLog(payload);
      setStatusText(`Quick-logged ${food.name} (${food.baseCalories} kcal)`);
    } catch (err) {
      setStatusText('Failed to save: ' + err.message);
    }
  };

  const handleSaveCustom = async (e) => {
    e.preventDefault();
    if (!customName || !customCalories) return;

    const payload = {
      food_name: customName,
      barcode: null,
      calories: Number(customCalories),
      protein: Number(customProtein || 0),
      carbs: Number(customCarbs || 0),
      fat: Number(customFat || 0),
      meal_type: targetMealSlot,
      created_at: Date.now()
    };

    try {
      await onSaveLog(payload);
      setShowCustomModal(false);
      setCustomName('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      setStatusText(`Logged custom meal: ${customName}`);
    } catch (err) {
      setStatusText('Failed to save: ' + err.message);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-space-md lg:px-margin py-space-lg flex flex-col gap-space-lg">
      
      {/* Top Filter & Search Header */}
      <div className="flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
          
          {/* Giant Search Input Field */}
          <div className="relative flex-1">
            <Search className="absolute left-space-md top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={22} />
            <input 
              className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low text-on-surface font-body-lg text-body-lg rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all placeholder:text-outline border border-surface-container" 
              placeholder="Search 500,000+ verified foods, recipes, or enter barcode..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={() => onNavigate('barcode-scanner')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary p-1.5 transition-colors"
              title="Switch to barcode camera"
            >
              <ScanLine size={20} />
            </button>
          </div>

          {/* Database Source Selector Pills */}
          <div className="flex items-center gap-space-xs p-1 bg-surface-container-low rounded-lg shrink-0 border border-surface-container">
            {['All', 'USDA Database', 'Branded Packaged'].map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-space-md py-1.5 rounded font-label-md text-label-md transition-all font-semibold ${
                  sourceFilter === src 
                    ? 'bg-primary text-on-primary shadow-xs' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                {src}
              </button>
            ))}
            <button
              onClick={() => setShowCustomModal(true)}
              className="px-space-md py-1.5 rounded text-secondary hover:text-primary font-label-md text-label-md font-bold transition-all"
              type="button"
            >
              + Custom
            </button>
          </div>
        </div>

        {/* Filter Sub-bar */}
        <div className="flex items-center justify-between gap-space-md overflow-x-auto pt-space-xs border-t border-surface-container">
          <div className="flex items-center gap-space-xs shrink-0 py-1">
            <span className="font-label-caps text-label-caps uppercase text-outline mr-1 tracking-wider font-bold">
              Filters:
            </span>
            {[
              { id: 'All', label: 'All', icon: Check },
              { id: 'Whole Foods', label: 'Whole Foods' },
              { id: 'High Protein', label: 'High Protein' },
              { id: 'Organic', label: 'Organic' },
              { id: 'Keto', label: 'Keto / Low Carb' }
            ].map((f) => {
              const active = tagFilter === f.id;
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setTagFilter(f.id)}
                  className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all flex items-center gap-1 font-semibold ${
                    active 
                      ? 'bg-primary text-on-primary shadow-xs' 
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span>{f.label}</span>
                  {Icon && <Icon size={14} />}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-outline shrink-0">
            <span className="font-body-sm text-body-sm">
              Database: <strong className="text-on-surface font-semibold">USDA FNDDS 2024</strong>
            </span>
            <SlidersHorizontal size={16} />
          </div>
        </div>
      </div>

      {statusText && (
        <div className="p-3 bg-secondary-container text-on-secondary-fixed-variant rounded-lg font-body-sm flex items-center gap-2 border border-secondary">
          <CheckCircle size={18} className="text-secondary shrink-0" />
          <span>{statusText}</span>
        </div>
      )}

      {/* Main Split Layout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        
        {/* Left Panel: Search Results List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-sm">
          <div className="flex items-center justify-between px-space-xs mb-1">
            <div className="flex items-center gap-space-sm">
              <span className="font-title text-title text-on-surface font-bold">
                Matches Found
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-caps text-label-caps font-bold">
                {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-outline">
              Verified Diagnostic Profiles
            </span>
          </div>

          {filteredFoods.length === 0 ? (
            <div className="bg-surface-container-lowest p-12 rounded-xl text-center border border-surface-container">
              <Utensils size={36} className="text-outline mx-auto mb-3 opacity-40" />
              <h3 className="font-title text-title font-bold text-on-surface">No matching items found</h3>
              <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
                Try searching for oats, chicken, salmon, yogurt, or add a custom food item with your specific macronutrients.
              </p>
              <button
                onClick={() => setShowCustomModal(true)}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md font-bold hover:bg-primary-container transition-colors"
              >
                + Add Custom Food Entry
              </button>
            </div>
          ) : (
            filteredFoods.map((food) => {
              const isSelected = selectedFood?.id === food.id;
              return (
                <div
                  key={food.id}
                  onClick={() => selectFood(food)}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all cursor-pointer border ${
                    isSelected ? 'ring-2 ring-primary border-primary' : 'border-surface-container'
                  }`}
                >
                  <div className="flex items-start gap-space-md min-w-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-surface-container">
                      <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex flex-col min-w-0 pr-space-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                          {food.name}
                        </span>
                        <Verified size={16} className="text-secondary shrink-0" />
                      </div>
                      <span className="font-body-sm text-body-sm text-outline truncate">
                        {food.brand} • {food.servingUnit}
                      </span>

                      {/* Macros Strip */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-caps text-label-caps font-bold">
                          {food.baseCalories} kcal
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-label-caps text-label-caps font-medium">
                          P: {food.baseProtein}g
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-label-caps text-label-caps font-medium">
                          C: {food.baseCarbs}g
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 font-label-caps text-label-caps font-medium">
                          F: {food.baseFat}g
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center mt-3 sm:mt-0 gap-2 shrink-0">
                    {isSelected ? (
                      <span className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 font-bold shadow-xs">
                        <Check size={16} /> Selected
                      </span>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdd(food);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-secondary-container hover:text-on-secondary-fixed-variant text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors font-semibold"
                      >
                        <Plus size={16} /> Quick Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Panel: Detailed Food Logging Panel for Selected Item (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-surface-container sticky top-20">
          
          {/* Header & Star Favorite */}
          <div className="flex items-start justify-between gap-space-sm pb-2 border-b border-surface-container">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-label-caps uppercase tracking-wider font-bold text-[10px]">
                  Verified Nutrition Data
                </span>
                <span className="font-label-caps text-label-caps text-outline text-[10px]">
                  UPC: {selectedFood?.barcode || 'USDA-FNDDS'}
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold leading-snug">
                {selectedFood?.name}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-[13px]">
                {selectedFood?.brand}
              </p>
            </div>

            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-amber-100 text-amber-600' 
                  : 'bg-surface-container-low text-outline hover:text-amber-600'
              }`}
              title="Toggle Favorite"
            >
              <Star size={20} className={isFavorite ? 'fill-amber-600' : ''} />
            </button>
          </div>

          {/* Serving Size & Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
            
            {/* Serving Measurement Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                Serving Measurement
              </label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-surface-container-low text-on-surface px-space-md py-2.5 rounded-lg font-label-md text-label-md focus:outline-none focus:ring-2 focus:ring-primary pr-8 cursor-pointer border border-surface-container"
                  value={servingUnitsLabel}
                  onChange={(e) => {
                    const match = selectedFood?.servingSizes?.find(s => s.name === e.target.value);
                    if (match) {
                      setServingFactor(match.factor);
                      setServingUnitsLabel(match.name);
                    }
                  }}
                >
                  {selectedFood?.servingSizes?.map((size, idx) => (
                    <option key={idx} value={size.name}>
                      {size.name}
                    </option>
                  )) || <option>{selectedFood?.servingUnit}</option>}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={18} />
              </div>
            </div>

            {/* Number of Servings Stepper */}
            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                Number of Servings
              </label>
              <div className="flex items-center bg-surface-container-low rounded-lg p-1 justify-between border border-surface-container">
                <button 
                  onClick={() => setQuantity(q => Math.max(0.25, Math.round((q - 0.25) * 100) / 100))}
                  className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors shadow-xs" 
                  type="button"
                >
                  <Minus size={14} />
                </button>
                <span className="font-headline-sm text-headline-sm text-primary px-2 font-bold">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(q => Math.round((q + 0.25) * 100) / 100)}
                  className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors shadow-xs" 
                  type="button"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

          </div>

          {/* Dynamic Clinical Nutrition Facts Label */}
          <div className="flex flex-col bg-surface-container-low p-space-md rounded-xl border border-surface-container">
            <div className="flex items-baseline justify-between pb-space-xs">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline font-bold text-[10px]">
                Calculated Energy
              </span>
              <span className="font-display text-display text-primary leading-none font-bold">
                {calcCalories} <span className="font-title text-title text-on-surface-variant font-normal">kcal</span>
              </span>
            </div>

            {/* Micro Visual Bar Breakdown */}
            <div className="w-full h-2 rounded-full bg-surface-variant flex overflow-hidden my-space-xs">
              <div className="bg-blue-600 h-full" style={{ width: '30%' }} title="Protein" />
              <div className="bg-amber-500 h-full" style={{ width: '50%' }} title="Carbs" />
              <div className="bg-rose-500 h-full" style={{ width: '20%' }} title="Fat" />
            </div>

            <div className="grid grid-cols-4 gap-2 text-center py-2 px-1 border-t border-surface-container mt-1">
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps text-blue-700 uppercase font-bold text-[10px]">Protein</span>
                <span className="font-headline-sm text-headline-sm text-blue-900 font-bold">{calcProtein}g</span>
                <span className="font-label-caps text-label-caps text-outline text-[9px]">{Math.round((calcProtein / 50) * 100)}% DV</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps text-amber-700 uppercase font-bold text-[10px]">Carbs</span>
                <span className="font-headline-sm text-headline-sm text-amber-900 font-bold">{calcCarbs}g</span>
                <span className="font-label-caps text-label-caps text-outline text-[9px]">{Math.round((calcCarbs / 275) * 100)}% DV</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps text-emerald-800 uppercase font-bold text-[10px]">Fiber</span>
                <span className="font-headline-sm text-headline-sm text-emerald-900 font-bold">{calcFiber}g</span>
                <span className="font-label-caps text-label-caps text-outline text-[9px]">{Math.round((calcFiber / 28) * 100)}% DV</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps text-rose-700 uppercase font-bold text-[10px]">Fat</span>
                <span className="font-headline-sm text-headline-sm text-rose-900 font-bold">{calcFat}g</span>
                <span className="font-label-caps text-label-caps text-outline text-[9px]">{Math.round((calcFat / 78) * 100)}% DV</span>
              </div>
            </div>
          </div>

          {/* Target Meal Slot Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
              Target Meal Slot
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-low rounded-lg border border-surface-container">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTargetMealSlot(slot)}
                  className={`py-2 px-1 rounded font-label-md text-label-md capitalize text-center transition-all font-semibold ${
                    targetMealSlot === slot
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Selector */}
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg text-on-surface border border-surface-container text-body-sm font-medium">
              <Calendar size={16} className="text-secondary" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg text-on-surface border border-surface-container text-body-sm font-medium">
              <Clock size={16} className="text-outline" />
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-space-xs">
            <button 
              onClick={handleLogToDiary}
              disabled={isSaving}
              className="w-full py-3.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-md active:scale-[0.99] font-bold" 
              type="button"
            >
              <CheckCircle size={20} />
              <span>Add to Food Diary ({calcCalories} kcal)</span>
            </button>

            <button 
              onClick={() => setShowCustomModal(true)}
              className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors font-semibold" 
              type="button"
            >
              <BookmarkPlus size={18} />
              <span>Log Custom Meal / Recipe</span>
            </button>
          </div>

          {/* Bottom Confirmation Pill Preview */}
          <div className="flex items-center gap-2.5 p-2.5 bg-secondary-container/60 rounded-lg text-on-secondary-fixed-variant border border-secondary-container">
            <CheckCircle size={18} className="text-secondary shrink-0" />
            <span className="font-body-sm text-body-sm text-[11px] leading-tight flex-1">
              Ready to log: <strong>{quantity}x {selectedFood?.name}</strong> to <strong>{targetMealSlot.toUpperCase()}</strong> • {calcCalories} kcal applied to daily target.
            </span>
          </div>

        </div>

      </div>

      {/* Custom Meal Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Create Custom Meal
              </h3>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="text-outline hover:text-on-surface p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="flex flex-col gap-3">
              <div>
                <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                  Food / Recipe Name
                </label>
                <input 
                  required
                  placeholder="e.g. Grandma's Vegetable Soup"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary text-body-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                    Calories (kcal)
                  </label>
                  <input 
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 350"
                    value={customCalories}
                    onChange={e => setCustomCalories(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary text-body-md"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                    Protein (g)
                  </label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={customProtein}
                    onChange={e => setCustomProtein(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary text-body-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                    Carbohydrates (g)
                  </label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="e.g. 40"
                    value={customCarbs}
                    onChange={e => setCustomCarbs(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary text-body-md"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
                    Fat (g)
                  </label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={customFat}
                    onChange={e => setCustomFat(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary text-body-md"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="mt-3 w-full py-3 bg-primary text-on-primary rounded-lg font-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm"
              >
                Log Custom Food Entry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
