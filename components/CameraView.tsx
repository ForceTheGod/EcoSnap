
import React, { useRef, useEffect, useState } from 'react';
import { wasteClassifier } from '../services/wasteClassifier';
import { ClassificationResult } from '../types';

interface CameraViewProps {
  onResult: (result: ClassificationResult) => void;
  isActive: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onResult, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const requestRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 640 }, 
          height: { ideal: 640 } 
        },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError("Camera access blocked. Please enable permissions and refresh.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    if (requestRef.current) {
      window.clearTimeout(requestRef.current);
      requestRef.current = null;
    }
    isProcessingRef.current = false;
  };

  const processFrame = async () => {
    if (!isActive || !isStreaming || isProcessingRef.current) {
      scheduleNext();
      return;
    }

    const video = videoRef.current;
    if (video && video.readyState >= 3) { 
      isProcessingRef.current = true;
      try {
        const result = await wasteClassifier.classifyElement(video);
        onResult(result);
      } catch (e) {
        // Silent fail for individual frames
      } finally {
        isProcessingRef.current = false;
      }
    }
    scheduleNext();
  };

  const scheduleNext = () => {
    if (isActive && isStreaming) {
      // Local inference is fast! We can scan much more frequently (800ms)
      requestRef.current = window.setTimeout(() => {
        processFrame();
      }, 800) as unknown as number;
    }
  };

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive]);

  useEffect(() => {
    if (isStreaming && isActive) {
      processFrame();
    }
  }, [isStreaming, isActive]);

  if (error) {
    return (
      <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 