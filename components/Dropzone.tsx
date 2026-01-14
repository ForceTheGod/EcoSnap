
import React from 'react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label 
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200
          ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-white border-blue-300 hover:bg-blue-50'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
          <svg className="w-10 h-10 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="mb-2 text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">PNG, JPG, or WEBP (Images only)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleChange} 
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default Dropzone;
