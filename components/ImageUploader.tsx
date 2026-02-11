
import React from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  label: string;
  image: ImageData | null;
  onUpload: (data: ImageData) => void;
  onClear: () => void;
  placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onUpload, onClear, placeholder }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onUpload({
          base64: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        {!image ? (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-white hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer min-h-[240px]">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <svg className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-gray-500 text-center text-sm">{placeholder || "Click to upload image"}</p>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-gray-100 group">
            <img 
              src={`data:${image.mimeType};base64,${image.base64}`} 
              alt={label} 
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClear}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
