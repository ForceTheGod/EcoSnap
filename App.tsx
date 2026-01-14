
import React, { useState, useEffect, useCallback } from 'react';
import { wasteClassifier } from './services/wasteClassifier';
import { ClassificationResult, WasteCategory } from './types';
import Dropzone from './components/Dropzone';
import CameraView from './components/CameraView';

type Mode = 'upload' | 'live';

const App: React.FC = () => {
  const [modelReady, setModelReady] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('upload');

  useEffect(() => {
    const initModel = async () => {
      try {
        await wasteClassifier.loadModel();
        setModelReady(true);
        setLoadingError(null);
      } catch (err: any) {
        setLoadingError(err.message || "Neural System Initialization Failed.");
      }
    };
    initModel();
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!modelReady) return;
    setResult(null);
    setPreviewUrl(null);
    setLoadingError(null);
    setIsProcessing(true);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const classification = await wasteClassifier.classify(file);
      setResult(classification);
    } catch (err: any) {
      setLoadingError(err.message || "Analysis failed.");
    } finally {
      setIsProcessing(false);
    }
  }, [modelReady]);

  const handleLiveResult = (newResult: ClassificationResult) => {
    // Only update if confidence is reasonable
    if (newResult.confidence > 0.2) {
      setResult(newResult);
    }
  };

  const clearError = () => {
    setLoadingError(null);
    if (!modelReady) {
      window.location.reload();
    }
  };

  const getCategoryStyles = (category: WasteCategory) => {
    switch (category) {
      case WasteCategory.ORGANIC: return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' };
      case WasteCategory.PLASTIC: return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200' };
      case WasteCategory.PAPER: return { bg: 'bg-sky-500', text: 'text-sky-600', light: 'bg-sky-50', border: 'border-sky-200' };
      case WasteCategory.METAL: return { bg: 'bg-zinc-500', text: 'text-zinc-600', light: 'bg-zinc-50', border: 'border-zinc-200' };
      case WasteCategory.GLASS: return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' };
      case WasteCategory.E_WASTE: return { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200' };
      default: return { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-200' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm border border-slate-100 mb-8">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-emerald-200 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V12m3.024-4.5a1.5 1.5 0 013 0v6a1.5 1.5 0 01-3 0v-6zM6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-widest text-emerald-600 uppercase">Production Ready</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-4">
          Eco<span className="text-emerald-500 italic">Clear</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Vision-first waste identification powered by Gemini 2.5 Flash.
        </p>

        <div className="mt-10 flex justify-center">
          <div className="bg-slate-100 p-1.5 rounded-[1.5rem] flex items-center shadow-inner border border-slate-200/50">
            <button 
              onClick={() => { setMode('upload'); setResult(null); setPreviewUrl(null); setLoadingError(null); }}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${mode === 'upload' ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Upload
            </button>
            <button 
              onClick={() => { setMode('live'); setResult(null); setPreviewUrl(null); setLoadingError(null); }}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${mode === 'live' ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Live Scan
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <section className="space-y-6">
          <div className="bg-white/80 glass-effect p-8 rounded-[2.5rem] shadow-xl border border-white/50">
            {loadingError ? (
              <div className="py-8 text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Neural Link Error</h3>
                <p className="text-xs text-rose-500 font-medium mb-6 leading-relaxed px-4">{loadingError}</p>
                <button onClick={clearError} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200">
                  Try Again
                </button>
              </div>
            ) : !modelReady ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waking Up Intelligence...</p>
              </div>
            ) : mode === 'upload' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Dropzone onFileSelect={handleFileSelect} disabled={isProcessing} />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CameraView onResult={handleLiveResult} isActive={mode === 'live'} />
              </div>
            )}
          </div>
          
          <div className="px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model: Gemini-2.5-Flash</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">100% Privacy</span>
          </div>
        </section>

        <section className="lg:sticky lg:top-8">
          {previewUrl || (mode === 'live' && (result || isProcessing)) ? (
            <div className="space-y-6 animate-in fade-in duration-700">
              {mode === 'upload' && previewUrl && (
                <div className="bg-white p-3 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden group aspect-square">
                  <img src={previewUrl} className={`w-full h-full object-cover rounded-[2.5rem] transition-all duration-700 ${isProcessing ? 'blur-xl grayscale scale-110 opacity-30' : 'group-hover:scale-105'}`} alt="Input Source" />
                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] animate-pulse">Deep Scanning...</span>
                    </div>
                  )}
                </div>
              )}

              {result && (
                <div className="bg-white/90 glass-effect p-8 rounded-[3rem] shadow-2xl border border-white/50 animate-in zoom-in-95 duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getCategoryStyles(result.category).light} ${getCategoryStyles(result.category).text}`}>
                        {result.category}
                      </span>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight pt-2">
                        {result.label}
                      </h2>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Confidence</span>
                       <span className={`text-xl font-black ${getCategoryStyles(result.category).text}`}>{Math.round(result.confidence * 100)}%</span>
                    </div>
                  </div>

                  <div className={`p-6 rounded-[2rem] border ${getCategoryStyles(result.category).border} ${getCategoryStyles(result.category).light} mb-8`}>
                    <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 opacity-60 ${getCategoryStyles(result.category).text}`}>Disposal Protocol</h4>
                    <p className="text-slate-800 font-semibold leading-relaxed text-sm">
                      {result.disposalInstructions}
                    </p>
                  </div>

                  <div className="space-y-4 text-[11px] text-slate-500 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                      <span className="font-bold uppercase tracking-widest opacity-40">System Reasoning</span>
                    </div>
                    <p className="italic leading-relaxed">
                      "{result.reasoning}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 opacity-40">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-2">Awaiting Analysis</h3>
              <p className="text-xs text-slate-300 max-w-[200px] leading-relaxed">Position item clearly in the frame or upload a photo to start classification.</p>
            </div>
          )}
        </section>
      </div>

      <footer className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">EcoClear Protocol v2.6.1</span>
        </div>
        <div className="flex gap-6">
           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Environmentally Optimized</span>
           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Client-Side Logic</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
