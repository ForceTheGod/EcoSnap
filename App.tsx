
import React, { useState, useEffect, useCallback } from 'react';
import { wasteClassifier } from './services/wasteClassifier';
import { ClassificationResult, WasteCategory } from './types';
import Dropzone from './components/Dropzone';

const App: React.FC = () => {
  const [modelReady, setModelReady] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Initialize model on mount
  useEffect(() => {
    const initModel = async () => {
      try {
        await wasteClassifier.loadModel();
        setModelReady(true);
      } catch (err) {
        setLoadingError("Could not initialize the ML model. Please ensure you have a stable internet connection for the first load.");
      }
    };
    initModel();
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!modelReady) return;

    // Reset previous results
    setResult(null);
    setPreviewUrl(null);
    setIsProcessing(true);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // Classification logic
      const classification = await wasteClassifier.classify(file);
      setResult(classification);
    } catch (err) {
      console.error(err);
      setLoadingError("Failed to classify the image.");
    } finally {
      setIsProcessing(false);
    }
  }, [modelReady]);

  const getCategoryColor = (category: WasteCategory) => {
    switch (category) {
      case WasteCategory.ORGANIC: return 'bg-green-100 text-green-800 border-green-200';
      case WasteCategory.PLASTIC: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case WasteCategory.PAPER: return 'bg-blue-100 text-blue-800 border-blue-200';
      case WasteCategory.METAL: return 'bg-gray-100 text-gray-800 border-gray-200';
      case WasteCategory.GLASS: return 'bg-teal-100 text-teal-800 border-teal-200';
      case WasteCategory.E_WASTE: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <header className="mb-10 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">EcoSnap</h1>
        </div>
        <p className="text-slate-500 font-medium">Instant Waste Classifier</p>
      </header>

      <main className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {!modelReady && !loadingError ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Downloading AI model...</p>
            <p className="text-xs text-slate-400 mt-2">This usually takes about 20-30 seconds depending on your connection speed.</p>
          </div>
        ) : loadingError ? (
          <div className="p-8 text-center bg-red-50 text-red-700">
            <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <p className="font-bold mb-2">Error</p>
            <p className="text-sm">{loadingError}</p>
          </div>
        ) : (
          <div className="p-6">
            <Dropzone onFileSelect={handleFileSelect} disabled={isProcessing} />

            {previewUrl && (
              <div className="mt-8 space-y-6">
                <div className="relative group">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center animate-pulse">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
                      <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Scanning...</span>
                    </div>
                  )}
                </div>

                {result && !isProcessing && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">{result.category}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getCategoryColor(result.category)}`}>
                            {result.category.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400">Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          ID: {result.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Disposal Instructions</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        {result.disposalInstructions}
                      </p>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 italic text-xs text-blue-600/80">
                      <span className="font-bold">Reasoning:</span> {result.reasoning}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-8 text-center text-slate-400 text-xs px-4">
        <p>Built with TensorFlow.js • No data ever leaves your device.</p>
        <p className="mt-2">EcoSnap is a prototype classifier. Use best judgment for hazardous waste disposal.</p>
      </footer>
    </div>
  );
};

export default App;
