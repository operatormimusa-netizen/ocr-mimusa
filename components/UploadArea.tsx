import React, { useRef, useState } from 'react';
import { Upload, FileImage, AlertCircle, Loader2 } from 'lucide-react';

interface UploadAreaProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Mohon unggah file gambar (JPG, PNG).');
      return;
    }
    
    // Limit size to ~5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onImageSelected(base64);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 px-4">
      <div 
        className={`relative group border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ease-in-out cursor-pointer
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center animate-pulse">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-indigo-700">OPM MIMUSA Virtual sedang menganalisis dokumen...</p>
              <p className="text-sm text-slate-500">Proses ini mungkin memakan waktu beberapa detik.</p>
            </div>
          ) : preview ? (
            <div className="relative w-full max-w-md">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-auto rounded-lg shadow-md border border-slate-200" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <p className="text-white font-medium flex items-center gap-2">
                  <FileImage className="w-5 h-5" /> Ganti Gambar
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-700">
                  Klik untuk unggah atau seret gambar ke sini
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Mendukung JPG, PNG (Maks. 5MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
