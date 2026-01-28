import React from 'react';
import { ScanFace, ShieldCheck, Zap } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl mb-6">
        <span className="block xl:inline">Ekstrak Data</span>{' '}
        <span className="block text-indigo-600 xl:inline">Kartu Keluarga</span>
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-slate-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        Ubah foto Kartu Keluarga fisik menjadi data digital terstruktur dalam hitungan detik menggunakan kecerdasan buatan by J Project.
      </p>
      
      <div className="mt-10 max-w-4xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-3 bg-indigo-50 rounded-full mb-3">
            <ScanFace className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Akurasi Tinggi</h3>
          <p className="text-sm text-slate-500 text-center mt-1">Mengenali teks NIK dan nama dengan presisi tinggi.</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-3 bg-indigo-50 rounded-full mb-3">
            <Zap className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Proses Cepat</h3>
          <p className="text-sm text-slate-500 text-center mt-1">Hasil ekstraksi keluar dalam hitungan detik.</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-3 bg-indigo-50 rounded-full mb-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Privasi Terjaga</h3>
          <p className="text-sm text-slate-500 text-center mt-1">Pemrosesan aman, data tidak disimpan permanen.</p>
        </div>
      </div>
    </div>
  );
};
