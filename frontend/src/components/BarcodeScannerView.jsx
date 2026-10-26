import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanLine, 
  Camera, 
  Flashlight, 
  SwitchCamera, 
  Grid3X3, 
  CheckCircle, 
  Search, 
  Bookmark, 
  Plus, 
  Minus, 
  History, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { RECENT_BARCODES, VERIFIED_FOODS } from '../foodDatabase';
import API from '../api';

export default function BarcodeScannerView({ 
  onSaveLog = () => {},
  onNavigate = () => {}
}) {
  const [barcodeInput, setBarcodeInput] = useState('041220782914');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [facingMode, setFacingMode] = useState('environment');
  const [loggingStatus, setLoggingStatus] = useState('idle'); // 'idle' | 'logging' | 'success'
  const [statusMessage, setStatusMessage] = useState('');
  
  // Multiplier and meal slot
  const [multiplier, setMultiplier] = useState(1.0);
  const [selectedMeal, setSelectedMeal] = useState('snack');

  // Currently detected item
  const [detectedProduct, setDetectedProduct] = useState({
    code: '041220782914',
    name: 'Chobani Complete Vanilla Greek Yogurt Drink',
    brand: 'Chobani LLC',
    servingUnit: '10 fl oz (296 mL) • RTD Smoothie',
    calories: 170,
    protein: 20,
    carbs: 15,
    fat: 2.5,
    fiber: 3,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    tags: ['No Added Sugar', 'Lactose-Free', '9 Essential Amino Acids', 'Gluten-Free']
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported by your browser. Please enter barcode manually.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Check BarcodeDetector API support
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128']
        });
        const detectLoop = async () => {
          if (!streamRef.current || !videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              setBarcodeInput(code);
              lookupBarcode(code);
              return;
            }
          } catch {}
          requestAnimationFrame(detectLoop);
        };
        requestAnimationFrame(detectLoop);
      }
    } catch (err) {
      setCameraError('Camera permission was denied or device is busy. You can use manual entry below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const lookupBarcode = async (codeToLookup = barcodeInput) => {
    const code = String(codeToLookup || '').trim();
    if (!code) return;

    setStatusMessage('Querying global food database...');
    // Check local verified database first for immediate rich metadata
    const localMatch = VERIFIED_FOODS.find(f => f.barcode === code);
    if (localMatch) {
      setDetectedProduct({
        code: localMatch.barcode,
        name: localMatch.name,
        brand: localMatch.brand,
        servingUnit: localMatch.servingUnit,
        calories: localMatch.baseCalories,
        protein: localMatch.baseProtein,
        carbs: localMatch.baseCarbs,
        fat: localMatch.baseFat,
        fiber: localMatch.baseFiber || 0,
        image: localMatch.image,
        tags: localMatch.tags
      });
      setStatusMessage(`Found verified item: ${localMatch.name}`);
      return;
    }

    // Otherwise query backend / OpenFoodFacts
    try {
      const data = await API.barcode(code);
      setDetectedProduct({
        code,
        name: data.food_name || `Scanned Product ${code}`,
        brand: data.brand || 'Verified Brand',
        servingUnit: data.serving_size || '100g portion',
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
        fiber: Number(data.fiber) || 0,
        image: data.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        tags: ['Verified OpenFoodFacts', 'Packaged Item']
      });
      setStatusMessage('Product found in global OpenFoodFacts repository.');
    } catch (err) {
      setStatusMessage(err.message || 'Product not found. Enter custom values or search below.');
    }
  };

  // Confirm & Log product
  const handleConfirmLog = async () => {
    if (!detectedProduct) return;
    setLoggingStatus('logging');

    const logPayload = {
      food_name: detectedProduct.name,
      barcode: detectedProduct.code,
      calories: Math.round(detectedProduct.calories * multiplier),
      protein: Math.round(detectedProduct.protein * multiplier * 10) / 10,
      carbs: Math.round(detectedProduct.carbs * multiplier * 10) / 10,
      fat: Math.round(detectedProduct.fat * multiplier * 10) / 10,
      meal_type: selectedMeal,
      created_at: Date.now()
    };

    try {
      await onSaveLog(logPayload);
      setLoggingStatus('success');
      setTimeout(() => {
        setLoggingStatus('idle');
      }, 2000);
    } catch (err) {
      setLoggingStatus('idle');
      setStatusMessage('Error saving log: ' + err.message);
    }
  };

  // Calculated values based on multiplier
  const calcCalories = Math.round((detectedProduct?.calories || 0) * multiplier);
  const calcProtein = Math.round((detectedProduct?.protein || 0) * multiplier * 10) / 10;
  const calcCarbs = Math.round((detectedProduct?.carbs || 0) * multiplier * 10) / 10;
  const calcFat = Math.round((detectedProduct?.fat || 0) * multiplier * 10) / 10;
  const calcFiber = Math.round((detectedProduct?.fiber || 0) * multiplier * 10) / 10;

  return (
    <div className="px-space-md sm:px-margin py-space-lg max-w-7xl mx-auto w-full flex flex-col gap-space-lg">
      
      {/* Header Section with Botanical Accent */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-secondary">
            <ScanLine size={18} />
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold">
              Optical Diagnostic Scanner
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Barcode Scanner
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Point your optical camera at any packaged grocery barcode or enter numerical UPC digits directly.
          </p>
        </div>

        {/* Quick Status Indicators */}
        <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-space-sm rounded-xl border border-surface-container-high shadow-xs">
          <div className="flex items-center gap-space-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-secondary animate-ping' : 'bg-outline'}`} />
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              {cameraActive ? 'Camera Active (1080p)' : 'Camera Standby'}
            </span>
          </div>
          <span className="text-outline-variant font-label-md text-label-md">•</span>
          <span className="font-label-caps text-label-caps text-secondary uppercase bg-secondary-container px-space-xs py-0.5 rounded font-bold">
            Low Latency
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-surface-container-low border border-surface-container rounded-lg text-body-sm text-on-surface flex items-center gap-2">
          <CheckCircle size={16} className="text-secondary" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Workspace Grid (7 cols Viewfinder : 5 cols Detected Item) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* LEFT: Optical Viewfinder & Manual Input Container (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          
          {/* Viewfinder Stage */}
          <div className="relative bg-surface-container-lowest rounded-xl shadow-md border border-surface-container overflow-hidden flex flex-col">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-surface-container-highest overflow-hidden flex items-center justify-center">
              
              {/* Actual Video Feed */}
              <video 
                ref={videoRef} 
                className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                playsInline 
                muted 
              />

              {/* Simulated grocery backdrop when camera is off */}
              {!cameraActive && (
                <div className="absolute inset-0 w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" 
                    alt="Grocery items preview" 
                    className="w-full h-full object-cover filter brightness-[0.35] contrast-125 scale-105"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-on-primary">
                    <Camera size={44} className="text-secondary-container mb-3 opacity-90 animate-pulse" />
                    <p className="font-title text-title font-bold mb-1">Optical Camera Ready</p>
                    <p className="font-body-sm text-body-sm text-surface-container-high max-w-sm mb-4">
                      Click below to activate live barcode detection via camera feed or lookup UPC numbers directly.
                    </p>
                    <button
                      onClick={toggleCamera}
                      className="px-5 py-2.5 bg-secondary text-on-secondary rounded-lg font-label-md font-bold shadow-md hover:bg-secondary-fixed transition-all"
                    >
                      Start Camera Feed
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Laser Scanline Animation */}
              {cameraActive && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-secondary-container to-transparent shadow-[0_0_16px_#92f7c3] z-20 pointer-events-none animate-scanline" />
              )}

              {/* Holographic Reticle / Corner Brackets */}
              <div className="relative z-10 w-72 sm:w-80 h-44 sm:h-48 flex items-center justify-center pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-secondary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-secondary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-secondary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-secondary rounded-br-lg" />
                
                {/* Center Crosshair */}
                <div className="w-12 h-12 flex items-center justify-center opacity-70">
                  <div className="w-full h-0.5 bg-secondary/80" />
                  <div className="h-full w-0.5 bg-secondary/80 absolute" />
                </div>

                {/* Subtitle HUD */}
                <div className="absolute -bottom-8 px-space-sm py-0.5 bg-primary/80 backdrop-blur-md rounded text-primary-fixed font-label-caps text-label-caps tracking-widest uppercase">
                  Align Barcode Within Reticle
                </div>
              </div>

              {/* Top Viewfinder Controls Overlay */}
              <div className="absolute top-space-md inset-x-space-md flex items-center justify-between z-20">
                <div className="flex items-center gap-space-xs bg-primary/80 backdrop-blur-md px-space-sm py-1 rounded-full">
                  <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-secondary animate-pulse' : 'bg-outline'}`} />
                  <span className="font-label-md text-label-md text-on-primary">
                    {cameraActive ? 'Scanning Live' : 'Camera Ready'}
                  </span>
                </div>

                <div className="flex items-center gap-space-xs">
                  <button 
                    onClick={() => setFlashOn(!flashOn)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow ${
                      flashOn 
                        ? 'bg-secondary-container text-on-secondary-fixed-variant' 
                        : 'bg-surface-container-lowest/30 backdrop-blur-md text-on-primary hover:bg-surface-container-lowest/50'
                    }`}
                    title="Toggle Torch Light"
                    type="button"
                  >
                    <Flashlight size={18} />
                  </button>

                  <button 
                    onClick={toggleCamera}
                    className="w-9 h-9 rounded-full bg-surface-container-lowest/30 backdrop-blur-md text-on-primary hover:bg-surface-container-lowest/50 flex items-center justify-center transition-colors shadow"
                    title={cameraActive ? 'Stop Camera' : 'Start Camera'}
                    type="button"
                  >
                    <Camera size={18} />
                  </button>

                  <button 
                    onClick={() => setShowGrid(!showGrid)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow ${
                      showGrid 
                        ? 'bg-secondary-container text-on-secondary-fixed-variant' 
                        : 'bg-surface-container-lowest/30 text-on-primary'
                    }`}
                    title="Toggle Grid Lines"
                    type="button"
                  >
                    <Grid3X3 size={18} />
                  </button>
                </div>
              </div>

              {/* Bottom Target Acquired HUD Tag */}
              <div className="absolute bottom-space-md left-space-md z-20 flex items-center gap-space-xs bg-surface-container-lowest/90 backdrop-blur-md py-1.5 px-space-md rounded-lg shadow-sm border border-surface-container">
                <CheckCircle size={18} className="text-secondary" />
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Target Acquired: {detectedProduct?.code || '041220782914'}
                </span>
              </div>
            </div>

            {/* Manual Barcode Entry Fallback Strip */}
            <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-t border-surface-container">
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                  Barcode unscannable or blurred?
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Enter numerical UPC digits manually
                </span>
              </div>
              <form 
                className="flex items-center gap-space-xs w-full sm:w-auto" 
                onSubmit={(e) => { e.preventDefault(); lookupBarcode(barcodeInput); }}
              >
                <div className="relative flex-1 sm:w-56">
                  <input 
                    className="w-full pl-space-md pr-space-md py-2 bg-surface-container-lowest rounded-lg font-title text-title text-on-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-xs border border-surface-container text-sm" 
                    placeholder="e.g. 041220782914" 
                    type="text" 
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                  />
                </div>
                <button 
                  className="px-space-md py-2 bg-primary text-on-primary rounded-lg font-label-lg text-label-lg hover:bg-primary-container transition-colors flex items-center gap-space-xs shadow-xs shrink-0" 
                  type="submit"
                >
                  <Search size={18} />
                  <span>Lookup</span>
                </button>
              </form>
            </div>
          </div>

          {/* Diagnostic Specs Banner */}
          <div className="bg-surface-container p-space-md rounded-xl border border-surface-container-high flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shrink-0 shadow-xs border border-surface-container">
                <Camera size={22} className="text-secondary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                  Optical Engine: WebRTC Live Decoder
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Auto-focus active • Formats: EAN-13, UPC-A, Code-128, OpenFoodFacts
                </span>
              </div>
            </div>
            <span className="px-space-sm py-1 rounded bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-label-caps uppercase font-bold shrink-0">
              Hardware Ready
            </span>
          </div>
        </div>

        {/* RIGHT: Detected Product Detail Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container p-space-lg flex flex-col gap-space-lg relative overflow-hidden">
            
            {/* Ambient Aura */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            {/* Header & Verification Badge */}
            <div className="flex items-start justify-between gap-space-sm z-10">
              <div className="flex flex-col gap-1">
                <span className="font-label-caps text-label-caps tracking-wider text-outline uppercase font-bold">
                  Product Identification
                </span>
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-label-caps font-bold flex items-center gap-1">
                    <CheckCircle size={14} className="text-secondary" />
                    Verified Database Match
                  </span>
                  <span className="text-outline font-body-sm text-body-sm text-[11px]">
                    UPC: {detectedProduct?.code}
                  </span>
                </div>
              </div>
              <button 
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors" 
                title="Bookmark Food" 
                type="button"
              >
                <Bookmark size={18} />
              </button>
            </div>

            {/* Product Title & Photo Thumbnail Duo */}
            <div className="flex gap-space-md items-center z-10">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0 relative shadow-xs border border-surface-container">
                <img 
                  alt={detectedProduct?.name} 
                  className="w-full h-full object-cover" 
                  src={detectedProduct?.image} 
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider">
                  {detectedProduct?.brand}
                </span>
                <h2 className="font-title text-title text-on-surface tracking-tight leading-snug font-bold">
                  {detectedProduct?.name}
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">
                  {detectedProduct?.servingUnit}
                </span>
              </div>
            </div>

            {/* Clinical Tag Pills */}
            <div className="flex flex-wrap gap-1.5 z-10">
              {detectedProduct?.tags?.map((t, idx) => (
                <span 
                  key={idx}
                  className="px-space-sm py-0.5 rounded bg-surface-container-high text-on-surface font-label-md text-label-md text-[11px]"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Calorie & Macronutrient High-Impact Cluster */}
            <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-sm border border-surface-container z-10">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-display text-display text-primary font-bold leading-none">
                    {calcCalories}
                  </span>
                  <span className="font-label-lg text-label-lg text-on-surface-variant">
                    kcal / serving
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">
                  {Math.round((calcCalories / 2000) * 100)}% Daily Allowance
                </span>
              </div>

              {/* Macro Progress Multi-bar Representation */}
              <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-600" style={{ width: '45%' }} title="Protein" />
                <div className="h-full bg-amber-500" style={{ width: '35%' }} title="Carbs" />
                <div className="h-full bg-rose-500" style={{ width: '10%' }} title="Fat" />
                <div className="h-full bg-emerald-600" style={{ width: '10%' }} title="Fiber" />
              </div>

              {/* Discrete Nutrient Chips */}
              <div className="grid grid-cols-4 gap-space-xs pt-space-xs">
                <div className="bg-surface-container-lowest p-2 rounded-lg flex flex-col items-center shadow-xs border border-surface-container">
                  <span className="font-label-caps text-label-caps text-blue-700 uppercase font-bold text-[10px]">Protein</span>
                  <span className="font-title text-title text-on-surface font-bold">{calcProtein}g</span>
                </div>
                <div className="bg-surface-container-lowest p-2 rounded-lg flex flex-col items-center shadow-xs border border-surface-container">
                  <span className="font-label-caps text-label-caps text-amber-700 uppercase font-bold text-[10px]">Carbs</span>
                  <span className="font-title text-title text-on-surface font-bold">{calcCarbs}g</span>
                </div>
                <div className="bg-surface-container-lowest p-2 rounded-lg flex flex-col items-center shadow-xs border border-surface-container">
                  <span className="font-label-caps text-label-caps text-rose-700 uppercase font-bold text-[10px]">Fat</span>
                  <span className="font-title text-title text-on-surface font-bold">{calcFat}g</span>
                </div>
                <div className="bg-surface-container-lowest p-2 rounded-lg flex flex-col items-center shadow-xs border border-surface-container">
                  <span className="font-label-caps text-label-caps text-emerald-800 uppercase font-bold text-[10px]">Fiber</span>
                  <span className="font-title text-title text-on-surface font-bold">{calcFiber}g</span>
                </div>
              </div>
            </div>

            {/* Serving Size & Multiplier Stepper */}
            <div className="flex flex-col gap-space-md z-10">
              <div className="flex items-center justify-between gap-space-md">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-bold text-[10px]">
                    Serving Multiplier
                  </span>
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    {detectedProduct?.servingUnit}
                  </span>
                </div>
                
                {/* Multiplier Stepper */}
                <div className="flex items-center bg-surface-container rounded-lg p-1 border border-surface-container-high">
                  <button 
                    onClick={() => setMultiplier(m => Math.max(0.25, Math.round((m - 0.25) * 100) / 100))}
                    className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface flex items-center justify-center font-bold text-label-lg hover:bg-surface-container-high transition-colors shadow-xs" 
                    type="button"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-space-md font-title text-title text-on-surface font-bold">
                    {multiplier}x
                  </span>
                  <button 
                    onClick={() => setMultiplier(m => Math.round((m + 0.25) * 100) / 100)}
                    className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface flex items-center justify-center font-bold text-label-lg hover:bg-surface-container-high transition-colors shadow-xs" 
                    type="button"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Meal Selection Segmented Radio */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-bold text-[10px]">
                  Assign to Diary Category
                </span>
                <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container rounded-lg text-center border border-surface-container-high">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMeal(m)}
                      className={`py-1.5 rounded font-label-md text-label-md capitalize transition-all font-semibold ${
                        selectedMeal === m
                          ? 'bg-surface-container-lowest text-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-space-xs pt-space-xs z-10">
              <button 
                onClick={handleConfirmLog}
                disabled={loggingStatus === 'logging'}
                className={`w-full py-3 text-on-primary font-label-lg text-label-lg rounded-lg shadow-md transition-all flex items-center justify-center gap-space-sm active:scale-[0.99] font-bold ${
                  loggingStatus === 'success' 
                    ? 'bg-secondary' 
                    : 'bg-primary hover:bg-primary-container'
                }`}
                type="button"
              >
                {loggingStatus === 'logging' ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Logging to diary...</span>
                  </>
                ) : loggingStatus === 'success' ? (
                  <>
                    <Check size={20} />
                    <span>Logged to {selectedMeal.toUpperCase()} Successfully!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Confirm &amp; Log to Diary ({calcCalories} kcal)</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => { setMultiplier(1.0); startCamera(); }}
                className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg rounded-lg transition-colors flex items-center justify-center gap-space-xs font-semibold" 
                type="button"
              >
                <Camera size={18} />
                <span>Scan Another Item</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* LOWER SECTION: Diagnostic Fallback & Recently Scanned History Reel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mt-space-sm">
        
        {/* Fallback Callout Box (4 cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary border border-surface-container-high shadow-xs">
              <HelpCircle size={24} />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
              Barcode Not Found?
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              If your product packaging is foreign, artisanal, or damaged, search verified nutrition foods or log custom nutrients in 30 seconds.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('food-search-and-logging')}
            className="font-label-lg text-label-lg text-secondary hover:text-primary flex items-center gap-1 group transition-colors font-bold text-left"
          >
            <span>Search 500,000+ foods database</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Recently Scanned Reel (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div className="flex items-center gap-space-xs">
              <History size={20} className="text-secondary" />
              <h3 className="font-title text-title text-on-surface font-bold">
                Recently Scanned History
              </h3>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
              Ready for one-click re-logging
            </span>
          </div>

          {/* Reel Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-sm">
            {RECENT_BARCODES.map((item, idx) => (
              <div 
                key={idx}
                className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between gap-space-sm border border-surface-container"
              >
                <div className="flex items-center gap-space-xs">
                  <div className="w-10 h-10 rounded bg-surface-container-highest overflow-hidden shrink-0 border border-surface-container">
                    <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                      {item.name}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                      {item.calories} kcal • {item.protein}g P
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-surface-container/60">
                  <span className="font-label-caps text-label-caps text-outline text-[10px]">
                    {item.timeAgo}
                  </span>
                  <button 
                    onClick={() => {
                      setBarcodeInput(item.code);
                      lookupBarcode(item.code);
                    }}
                    className="text-secondary font-label-caps text-label-caps font-bold hover:underline flex items-center gap-0.5" 
                    type="button"
                  >
                    <span>+ LOAD</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
