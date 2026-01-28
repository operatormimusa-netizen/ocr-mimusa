import React, { useState, useEffect } from 'react';
import { KartuKeluargaData, FamilyMember } from '../types';
import { Copy, Check, User, Users, MapPin, ChevronDown, RotateCcw, CreditCard, FileSpreadsheet, Download, Table, Edit3 } from 'lucide-react';

interface ResultTableProps {
  data: KartuKeluargaData;
  onReset: () => void;
}

export const ResultTable: React.FC<ResultTableProps> = ({ data: initialData, onReset }) => {
  const [localData, setLocalData] = useState<KartuKeluargaData>(initialData);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [copiedRow, setCopiedRow] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(0);

  // Sync local state if initialData changes (new scan)
  useEffect(() => {
    setLocalData(initialData);
    const firstChildIndex = initialData.anggotaKeluarga.findIndex(m => 
      m.statusHubungan.toLowerCase().includes('anak')
    );
    if (firstChildIndex !== -1) {
      setSelectedStudentIndex(firstChildIndex);
    }
  }, [initialData]);

  const handleMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    const updatedAnggota = [...localData.anggotaKeluarga];
    updatedAnggota[index] = { ...updatedAnggota[index], [field]: value };
    setLocalData({ ...localData, anggotaKeluarga: updatedAnggota });
  };

  const handleHeaderChange = (field: keyof Omit<KartuKeluargaData, 'anggotaKeluarga'>, value: string) => {
    setLocalData({ ...localData, [field]: value });
  };

  const selectedStudent = localData.anggotaKeluarga[selectedStudentIndex];

  const findMemberByName = (name: string): { member: FamilyMember | undefined, index: number } => {
    if (!name || name === "-" || name === "") return { member: undefined, index: -1 };
    const idx = localData.anggotaKeluarga.findIndex(m => 
      m.namaLengkap.toLowerCase().trim() === name.toLowerCase().trim()
    );
    return { member: localData.anggotaKeluarga[idx], index: idx };
  };

  const fatherRes = findMemberByName(selectedStudent?.namaAyah);
  const motherRes = findMemberByName(selectedStudent?.namaIbu);

  // --- EXPORT DATA PREPARATION (Using LOCAL state) ---
  const getExportData = () => {
    const safeVal = (val: string | undefined) => val ? val.replace(/[\t\n\r]/g, " ").trim() : "-";
    
    return {
      noKK: safeVal(localData.nomorKK),
      nik: safeVal(selectedStudent?.nik),
      nama: safeVal(selectedStudent?.namaLengkap),
      jk: safeVal(selectedStudent?.jenisKelamin),
      tmpLahir: safeVal(selectedStudent?.tempatLahir),
      tglLahir: safeVal(selectedStudent?.tanggalLahir),
      
      nikAyah: safeVal(fatherRes.member?.nik),
      namaAyah: safeVal(fatherRes.member?.namaLengkap || selectedStudent?.namaAyah),
      tmpLahirAyah: safeVal(fatherRes.member?.tempatLahir),
      tglLahirAyah: safeVal(fatherRes.member?.tanggalLahir),
      
      nikIbu: safeVal(motherRes.member?.nik),
      namaIbu: safeVal(motherRes.member?.namaLengkap || selectedStudent?.namaIbu),
      tmpLahirIbu: safeVal(motherRes.member?.tempatLahir),
      tglLahirIbu: safeVal(motherRes.member?.tanggalLahir),
      
      dusun: safeVal(localData.dusun || localData.alamat),
      rt: safeVal(localData.rt),
      rw: safeVal(localData.rw),
      desa: safeVal(localData.desaKelurahan),
      kec: safeVal(localData.kecamatan),
      kab: safeVal(localData.kabupatenKota),
      prov: safeVal(localData.provinsi),
    };
  };

  const headers = [
    "NO KK", "NIK", "NAMA SISWA", "JENIS KELAMIN", 
    "TEMPAT LAHIR", "TANGGAL LAHIR", 
    "NIK AYAH", "NAMA AYAH", "TEMPAT LAHIR AYAH", "TANGGAL LAHIR AYAH", 
    "NIK IBU", "NAMA IBU", "TEMPAT LAHIR IBU", "TANGGAL LAHIR IBU", 
    "DUSUN", "RT", "RW", "DESA", "KECAMATAN", "KABUPATEN", "PROPINSI"
  ];

  const getRowValues = (d: ReturnType<typeof getExportData>) => [
    d.noKK, d.nik, d.nama, d.jk, d.tmpLahir, d.tglLahir,
    d.nikAyah, d.namaAyah, d.tmpLahirAyah, d.tglLahirAyah,
    d.nikIbu, d.namaIbu, d.tmpLahirIbu, d.tglLahirIbu,
    d.dusun, d.rt, d.rw, d.desa, d.kec, d.kab, d.prov
  ];

  const handleCopyRowGSheet = () => {
    const d = getExportData();
    const rowString = getRowValues(d).join("\t");
    navigator.clipboard.writeText(rowString);
    setCopiedRow(true);
    setTimeout(() => setCopiedRow(false), 2000);
  };

  const handleCopyTableGSheet = () => {
    const d = getExportData();
    const headerString = headers.join("\t");
    const rowString = getRowValues(d).join("\t");
    navigator.clipboard.writeText(`${headerString}\n${rowString}`);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  const handleDownloadCSV = () => {
    const d = getExportData();
    const headerString = headers.join(",");
    const rowString = getRowValues(d).map(v => `"${v}"`).join(",");
    const csvContent = "data:text/csv;charset=utf-8," + headerString + "\n" + rowString;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Siswa_${d.nama.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(localData, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  if (!selectedStudent) return null;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      {/* Header / Student Selector */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Validasi Data <Edit3 className="w-4 h-4 text-slate-400" />
            </h2>
            <button 
                onClick={onReset}
                className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors"
            >
                <RotateCcw className="w-3 h-3" /> Reset / Upload Baru
            </button>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">
            Pilih Siswa untuk diekstrak:
          </label>
          <div className="relative w-full">
            <select
              value={selectedStudentIndex}
              onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
              className="w-full appearance-none bg-indigo-50 border border-indigo-200 text-indigo-900 py-2.5 pl-4 pr-10 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {localData.anggotaKeluarga.map((member, idx) => (
                <option key={idx} value={idx}>
                  {member.namaLengkap} ({member.statusHubungan})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-indigo-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        
        {/* Nomor KK Banner (Editable) */}
        <section className="bg-indigo-600 p-4 rounded-xl shadow-md text-center text-white relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
          <div className="flex flex-col items-center justify-center relative z-10">
            <div className="flex items-center gap-2 mb-1 opacity-90">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Nomor Kartu Keluarga</span>
            </div>
            <input 
              type="text"
              value={localData.nomorKK}
              onChange={(e) => handleHeaderChange('nomorKK', e.target.value)}
              className="bg-transparent text-center text-2xl sm:text-3xl font-mono font-bold tracking-[0.15em] w-full focus:outline-none focus:bg-white/10 rounded px-2 transition-colors border border-transparent hover:border-white/30"
              placeholder="Nomor KK"
            />
          </div>
        </section>

        {/* A. Identitas Siswa */}
        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">A. Identitas Siswa</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Field 
              label="NIK Siswa" 
              value={selectedStudent.nik} 
              onChange={(v) => handleMemberChange(selectedStudentIndex, 'nik', v)}
            />
            <Field 
              label="Nama Siswa" 
              value={selectedStudent.namaLengkap} 
              onChange={(v) => handleMemberChange(selectedStudentIndex, 'namaLengkap', v)}
              highlight 
            />
            <Field 
              label="Jenis Kelamin" 
              value={selectedStudent.jenisKelamin} 
              onChange={(v) => handleMemberChange(selectedStudentIndex, 'jenisKelamin', v)}
            />
            <div className="grid grid-cols-2 gap-4">
                <Field 
                  label="Tempat Lahir" 
                  value={selectedStudent.tempatLahir} 
                  onChange={(v) => handleMemberChange(selectedStudentIndex, 'tempatLahir', v)}
                />
                <Field 
                  label="Tanggal Lahir" 
                  value={selectedStudent.tanggalLahir} 
                  onChange={(v) => handleMemberChange(selectedStudentIndex, 'tanggalLahir', v)}
                />
            </div>
          </div>
        </section>

        {/* B. Data Orang Tua */}
        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Users className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">B. Data Orang Tua</h3>
          </div>
          
          <div className="space-y-6">
            {/* 1. Ayah */}
            <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
              <h4 className="font-bold text-slate-700 mb-3 text-xs uppercase flex items-center gap-2">
                <span className="bg-orange-200 text-orange-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span> Ayah
              </h4>
              {fatherRes.member ? (
                <div className="space-y-3">
                  <Field label="NIK" value={fatherRes.member.nik} onChange={(v) => handleMemberChange(fatherRes.index, 'nik', v)} />
                  <Field label="Nama" value={fatherRes.member.namaLengkap} onChange={(v) => handleMemberChange(fatherRes.index, 'namaLengkap', v)} />
                  <div className="grid grid-cols-2 gap-3">
                     <Field label="Tempat Lahir" value={fatherRes.member.tempatLahir} onChange={(v) => handleMemberChange(fatherRes.index, 'tempatLahir', v)} />
                     <Field label="Tgl Lahir" value={fatherRes.member.tanggalLahir} onChange={(v) => handleMemberChange(fatherRes.index, 'tanggalLahir', v)} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Field 
                    label="Nama Ayah (Teks)" 
                    value={selectedStudent.namaAyah} 
                    onChange={(v) => handleMemberChange(selectedStudentIndex, 'namaAyah', v)} 
                  />
                  <p className="text-[10px] text-orange-600 italic leading-tight">Catatan: Data detail NIK/TTL Ayah tidak ditemukan di tabel anggota. Gemini mungkin gagal membaca atau baris tidak ada.</p>
                </div>
              )}
            </div>

            {/* 2. Ibu */}
            <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
              <h4 className="font-bold text-slate-700 mb-3 text-xs uppercase flex items-center gap-2">
                <span className="bg-orange-200 text-orange-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span> Ibu
              </h4>
              {motherRes.member ? (
                <div className="space-y-3">
                  <Field label="NIK" value={motherRes.member.nik} onChange={(v) => handleMemberChange(motherRes.index, 'nik', v)} />
                  <Field label="Nama" value={motherRes.member.namaLengkap} onChange={(v) => handleMemberChange(motherRes.index, 'namaLengkap', v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tempat Lahir" value={motherRes.member.tempatLahir} onChange={(v) => handleMemberChange(motherRes.index, 'tempatLahir', v)} />
                    <Field label="Tgl Lahir" value={motherRes.member.tanggalLahir} onChange={(v) => handleMemberChange(motherRes.index, 'tanggalLahir', v)} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Field 
                    label="Nama Ibu (Teks)" 
                    value={selectedStudent.namaIbu} 
                    onChange={(v) => handleMemberChange(selectedStudentIndex, 'namaIbu', v)} 
                  />
                  <p className="text-[10px] text-orange-600 italic leading-tight">Catatan: Data detail NIK/TTL Ibu tidak ditemukan di tabel anggota.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* C. Data Alamat */}
        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">C. Data Alamat</h3>
          </div>
          <div className="space-y-3">
            <Field 
              label="Dusun / Jalan" 
              value={localData.dusun || localData.alamat} 
              onChange={(v) => handleHeaderChange('dusun', v)}
              highlight 
            />
            <div className="grid grid-cols-3 gap-3">
                <Field label="RT" value={localData.rt} onChange={(v) => handleHeaderChange('rt', v)} />
                <Field label="RW" value={localData.rw} onChange={(v) => handleHeaderChange('rw', v)} />
                <Field label="Kode Pos" value={localData.kodePos} onChange={(v) => handleHeaderChange('kodePos', v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Desa/Kel" value={localData.desaKelurahan} onChange={(v) => handleHeaderChange('desaKelurahan', v)} />
                <Field label="Kecamatan" value={localData.kecamatan} onChange={(v) => handleHeaderChange('kecamatan', v)} />
                <Field label="Kab/Kota" value={localData.kabupatenKota} onChange={(v) => handleHeaderChange('kabupatenKota', v)} />
                <Field label="Propinsi" value={localData.provinsi} onChange={(v) => handleHeaderChange('provinsi', v)} />
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions (Sticky) */}
      <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-center">Export Data Terpilih ke Excel / GSheet</h4>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button 
            onClick={handleCopyRowGSheet}
            className="flex flex-col items-center justify-center p-3 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            title="Salin hasil koreksi ke GSheet"
          >
            {copiedRow ? <Check className="w-5 h-5 mb-1 text-green-600" /> : <FileSpreadsheet className="w-5 h-5 mb-1" />}
            <span className="text-xs">Salin Baris (Data)</span>
          </button>

          <button 
            onClick={handleCopyTableGSheet}
            className="flex flex-col items-center justify-center p-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
          >
             {copiedTable ? <Check className="w-5 h-5 mb-1 text-green-600" /> : <Table className="w-5 h-5 mb-1" />}
            <span className="text-xs">Salin Tabel Lengkap</span>
          </button>
        </div>

        <button 
          onClick={handleDownloadCSV}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg transition-all"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Format .CSV
        </button>

        <button onClick={handleCopyJSON} className="w-full mt-3 text-[10px] text-slate-400 hover:text-indigo-500 flex items-center justify-center gap-1">
            {copiedJSON ? "Raw JSON Disalin" : "Salin Raw JSON"}
        </button>
      </div>
    </div>
  );
};

const Field: React.FC<{ 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
  highlight?: boolean 
}> = ({ label, value, onChange, highlight }) => (
  <div className="flex flex-col group">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 group-focus-within:text-indigo-500 transition-colors">
      {label}
    </span>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-slate-50 border border-slate-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-tight ${
        highlight ? 'text-base text-indigo-900 font-bold' : 'text-sm text-slate-800'
      }`}
      placeholder={`Isi ${label}...`}
    />
  </div>
);
