
import React, { useState } from 'react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden
          ${disabled ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 
            isDragging ? 'bg-emerald-50 border-emerald-500 scale-[0.99] shadow-inner' : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30'}`}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center z-10">
          <div className={`p-4 rounded-2xl mb-4 transition-colors duration-300 ${isDragging ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Upload Waste Photo</h3>
          <p className="text-sm text-slate-500 max-w-[200px]">Drag your image here or click to browse files</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleChange} 
          disabled={disabled}
        />
        {isDragging && (
          <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
              Drop it!
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

export default Dropzone;
