// Curated verified foods matching the clinical-wellness NutriTrack design system
export const VERIFIED_FOODS = [
  {
    id: 'food_1',
    name: 'Organic Rolled Oats',
    brand: "Bob's Red Mill",
    category: 'Whole Foods',
    mealSlot: 'breakfast',
    barcode: '039978001153',
    servingUnit: '1 cup (81g)',
    servingSizes: [
      { name: '1 cup (81g)', factor: 1 },
      { name: '100 grams', factor: 1.23 },
      { name: '1/2 cup (40.5g)', factor: 0.5 },
      { name: '1 bowl prepared (240g)', factor: 0.93 }
    ],
    baseCalories: 300,
    baseProtein: 10,
    baseCarbs: 54,
    baseFat: 5,
    baseFiber: 8,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    tags: ['Whole Grain', 'High Fiber', 'Organic', 'Verified'],
    source: 'USDA Reference FNDDS 2024'
  },
  {
    id: 'food_2',
    name: 'Organic Cage-Free Eggs, Hard Boiled',
    brand: 'Vital Farms',
    category: 'High Protein',
    mealSlot: 'breakfast',
    barcode: '860000000102',
    servingUnit: '2 large (100g)',
    servingSizes: [
      { name: '2 large (100g)', factor: 1 },
      { name: '1 large (50g)', factor: 0.5 },
      { name: '3 large (150g)', factor: 1.5 }
    ],
    baseCalories: 140,
    baseProtein: 12,
    baseCarbs: 1,
    baseFat: 10,
    baseFiber: 0,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80',
    tags: ['Cage-Free', 'High Protein', 'Keto Friendly', 'Verified'],
    source: 'USDA Reference FNDDS 2024'
  },
  {
    id: 'food_3',
    name: 'Grilled Lemon Herb Chicken Breast',
    brand: 'Whole Cuts Fresh',
    category: 'High Protein',
    mealSlot: 'lunch',
    barcode: '041220782914',
    servingUnit: '1 fillet (180g)',
    servingSizes: [
      { name: '1 fillet (180g)', factor: 1 },
      { name: '100 grams', factor: 0.55 },
      { name: '1/2 fillet (90g)', factor: 0.5 }
    ],
    baseCalories: 290,
    baseProtein: 42,
    baseCarbs: 0,
    baseFat: 6,
    baseFiber: 0,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80',
    tags: ['Lean Protein', 'Gluten-Free', 'Zero Carb', 'Verified'],
    source: 'USDA Reference FNDDS 2024'
  },
  {
    id: 'food_4',
    name: 'Tri-color Organic Quinoa Cooked',
    brand: 'Ancient Harvest',
    category: 'Whole Foods',
    mealSlot: 'lunch',
    barcode: '079176313101',
    servingUnit: '1 cup (185g)',
    servingSizes: [
      { name: '1 cup (185g)', factor: 1 },
      { name: '100 grams', factor: 0.54 },
      { name: '1/2 cup (92g)', factor: 0.5 }
    ],
    baseCalories: 222,
    baseProtein: 8,
    baseCarbs: 39,
    baseFat: 4,
    baseFiber: 5,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    tags: ['Complete Protein', 'Organic', 'Gluten-Free', 'Verified'],
    source: 'USDA Reference FNDDS 2024'
  },
  {
    id: 'food_5',
    name: 'Greek Strained Yogurt 0% Fat',
    brand: 'Fage Total',
    category: 'High Protein',
    mealSlot: 'snack',
    barcode: '052159000078',
    servingUnit: '1 container (170g)',
    servingSizes: [
      { name: '1 container (170g)', factor: 1 },
      { name: '100 grams', factor: 0.59 },
      { name: '1 cup (227g)', factor: 1.33 }
    ],
    baseCalories: 100,
    baseProtein: 18,
    baseCarbs: 6,
    baseFat: 0,
    baseFiber: 0,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
    tags: ['Probiotics', 'Zero Fat', 'High Protein', 'Verified'],
    source: 'Branded Packaged'
  },
  {
    id: 'food_6',
    name: 'Chobani Complete Vanilla Greek Yogurt Drink',
    brand: 'Chobani LLC',
    category: 'Branded Packaged',
    mealSlot: 'snack',
    barcode: '041220782914',
    servingUnit: '1 bottle (296 ml / 10 fl oz)',
    servingSizes: [
      { name: '1 bottle (296 ml)', factor: 1 },
      { name: '1/2 bottle (148 ml)', factor: 0.5 }
    ],
    baseCalories: 170,
    baseProtein: 20,
    baseCarbs: 15,
    baseFat: 2.5,
    baseFiber: 3,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    tags: ['No Added Sugar', 'Lactose-Free', '9 Essential Amino Acids', 'Gluten-Free'],
    source: 'Verified Database Match'
  },
  {
    id: 'food_7',
    name: 'Wild Atlantic Salmon Fillet',
    brand: 'Fresh Catch Wild',
    category: 'High Protein',
    mealSlot: 'dinner',
    barcode: '028400070560',
    servingUnit: '1 portion (150g)',
    servingSizes: [
      { name: '1 portion (150g)', factor: 1 },
      { name: '100 grams', factor: 0.67 },
      { name: '1 fillet (200g)', factor: 1.33 }
    ],
    baseCalories: 280,
    baseProtein: 34,
    baseCarbs: 0,
    baseFat: 15,
    baseFiber: 0,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
    tags: ['Omega-3 Rich', 'Wild Caught', 'Heart Healthy', 'Verified'],
    source: 'USDA Reference FNDDS 2024'
  },
  {
    id: 'food_8',
    name: 'Sweet Potato (Baked with Skin)',
    brand: 'Raw Produce',
    category: 'Whole Foods',
    mealSlot: 'dinner',
    barcode: '033383000501',
    servingUnit: '1 medium (114g)',
    servingSizes: [
      { name: '1 medium (114g)', factor: 1 },
      { name: '100 grams', factor: 0.88 },
      { name: '1 large (180g)', factor: 1.58 }
    ],
    baseCalories: 103,
    baseProtein: 2.3,
    baseCarbs: 24,
    baseFat: 0.2,
    baseFiber: 4,
    image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=400&q=80',
    tags: ['Vitamin A', 'Complex Carbs', 'Whole Food', 'Verified'],
    source: 'USDA Reference FNDDS 2024'
  },
  {
    id: 'food_9',
    name: 'Haas Avocado',
    brand: 'Raw Produce',
    category: 'Whole Foods',
    mealSlot: 'lunch',
    barcode: '033383000402',
    servingUnit: '1 medium (150g)',
    servingSizes: [
      { name: '1 medium (150g)', factor: 1 },
      { name: '1/2 medium (75g)', factor: 0.5 },
      { name: '100 grams', factor: 0.67 }
    ],
    baseCalories: 240,
    baseProtein: 3,
    baseCarbs: 12,
    baseFat: 22,
    baseFiber: 10,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
    tags: ['Healthy Fats', 'High Fiber', 'Keto', 'Verified'],
    source: 'USDA Reference FNDDS 2024'
  },
  {
    id: 'food_10',
    name: 'Califia Farms Unsweetened Almond Milk',
    brand: 'Califia Farms',
    category: 'Branded Packaged',
    mealSlot: 'breakfast',
    barcode: '852909003013',
    servingUnit: '1 cup (240ml)',
    servingSizes: [
      { name: '1 cup (240ml)', factor: 1 },
      { name: '100 ml', factor: 0.42 }
    ],
    baseCalories: 35,
    baseProtein: 1,
    baseCarbs: 1,
    baseFat: 3,
    baseFiber: 1,
    image: 'https://images.unsplash.com/photo-1568651316301-443b74ca134d?auto=format&fit=crop&w=400&q=80',
    tags: ['Dairy-Free', 'Low Calorie', 'Calcium Rich', 'Vegan'],
    source: 'Branded Packaged'
  },
  {
    id: 'food_11',
    name: 'RXBAR Chocolate Sea Salt Protein Bar',
    brand: 'RXBAR',
    category: 'Branded Packaged',
    mealSlot: 'snack',
    barcode: '857777004232',
    servingUnit: '1 bar (52g)',
    servingSizes: [
      { name: '1 bar (52g)', factor: 1 }
    ],
    baseCalories: 210,
    baseProtein: 12,
    baseCarbs: 23,
    baseFat: 9,
    baseFiber: 5,
    image: 'https://images.unsplash.com/photo-1622484216802-8a9d188562d2?auto=format&fit=crop&w=400&q=80',
    tags: ['No Added Sugar', 'Egg White Protein', 'Whole Food Ingredients'],
    source: 'Branded Packaged'
  },
  {
    id: 'food_12',
    name: "Dave's Killer Bread 21 Whole Grains",
    brand: "Dave's Killer Bread",
    category: 'Branded Packaged',
    mealSlot: 'breakfast',
    barcode: '013764027053',
    servingUnit: '1 slice (45g)',
    servingSizes: [
      { name: '1 slice (45g)', factor: 1 },
      { name: '2 slices (90g)', factor: 2 }
    ],
    baseCalories: 110,
    baseProtein: 5,
    baseCarbs: 22,
    baseFat: 1.5,
    baseFiber: 5,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    tags: ['Organic', 'Whole Grain', '5g Protein', 'Non-GMO'],
    source: 'Branded Packaged'
  }
];

export const RECENT_BARCODES = [
  {
    code: '041220782914',
    name: 'Chobani Complete Vanilla Drink',
    brand: 'Chobani LLC',
    calories: 170,
    protein: 20,
    carbs: 15,
    fat: 2.5,
    serving: '1 bottle (296ml)',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    timeAgo: 'Just now'
  },
  {
    code: '852909003013',
    name: 'Califia Farms Almond Milk',
    brand: 'Califia Farms',
    calories: 35,
    protein: 1,
    carbs: 1,
    fat: 3,
    serving: '1 cup (240ml)',
    image: 'https://images.unsplash.com/photo-1568651316301-443b74ca134d?auto=format&fit=crop&w=400&q=80',
    timeAgo: '10m ago'
  },
  {
    code: '857777004232',
    name: 'RXBAR Chocolate Sea Salt',
    brand: 'RXBAR',
    calories: 210,
    protein: 12,
    carbs: 23,
    fat: 9,
    serving: '1 bar (52g)',
    image: 'https://images.unsplash.com/photo-1622484216802-8a9d188562d2?auto=format&fit=crop&w=400&q=80',
    timeAgo: 'Today, 8:40 AM'
  },
  {
    code: '013764027053',
    name: "Dave's 21 Whole Grains Bread",
    brand: "Dave's Killer Bread",
    calories: 110,
    protein: 5,
    carbs: 22,
    fat: 1.5,
    serving: '1 slice (45g)',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    timeAgo: 'Yesterday'
  }
];
