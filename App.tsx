import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { UploadArea } from './components/UploadArea';
import { ResultTable } from './components/ResultTable';
import { ImageViewer } from './components/ImageViewer';
import { parseKartuKeluargaImage } from './services/geminiService';
import { KartuKeluargaData } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<KartuKeluargaData | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleImageSelected = async (base64: string) => {
    setIsLoading(true);
    setImageSrc(base64); // Save image for preview
    setResultData(null);
    
    try {
      const data = await parseKartuKeluargaImage(base64);
      setResultData(data);
    } catch (error) {
      alert("Terjadi kesalahan saat memproses gambar. Pastikan gambar jelas dan coba lagi.");
      console.error(error);
      setResultData(null); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResultData(null);
    setImageSrc(null);
    setIsLoading(false);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex-none z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
              <img 
                src="/logo.png" 
                alt="Logo MIMUSA" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  // Fallback if image not found
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="font-bold text-lg text-slate-800 tracking-tight hidden sm:block">KK Scanner MIMUSA</span>
            </div>
            <div className="flex items-center gap-4">
               {isLoading && (
                 <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                 </div>
               )}
               <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
                  J_project 
               </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow relative overflow-hidden">
        {resultData && imageSrc ? (
          // Split View Mode (Validation Mode)
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Panel: Image Viewer */}
            <div className="lg:w-1/2 h-1/2 lg:h-full bg-slate-900 relative border-b lg:border-b-0 lg:border-r border-slate-700">
              <ImageViewer src={imageSrc} />
            </div>

            {/* Right Panel: Data Result */}
            <div className="lg:w-1/2 h-1/2 lg:h-full bg-slate-50 overflow-hidden relative">
              <ResultTable data={resultData} onReset={handleReset} />
            </div>
          </div>
        ) : (
          // Landing / Upload Mode
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col items-center justify-start pt-10 pb-20">
              <Hero />
              <UploadArea 
                onImageSelected={handleImageSelected} 
                isLoading={isLoading} 
              />
            </div>
             {/* Footer inside scrollable area for landing */}
            <footer className="bg-transparent py-8 w-full">
              <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs">
                <p>© {new Date().getFullYear()} KK Scanner by J PROJECT.</p>
              </div>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;