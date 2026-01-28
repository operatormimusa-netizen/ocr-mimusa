import { GoogleGenAI, Type } from "@google/genai";
import { KartuKeluargaData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to enforce DD/MM/YYYY
const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return "";
  
  // Replace all dashes with slashes first (common case DD-MM-YYYY -> DD/MM/YYYY)
  let normalized = dateStr.replace(/-/g, '/');
  
  // Handle YYYY/MM/DD case if it occurs (though unlikely with prompt)
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(normalized)) {
      const [y, m, d] = normalized.split('/');
      return `${d}/${m}/${y}`;
  }
  
  return normalized;
};

export const parseKartuKeluargaImage = async (base64Image: string): Promise<KartuKeluargaData> => {
  try {
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: `Analisis gambar Kartu Keluarga (KK) Indonesia ini. Ekstrak data untuk keperluan pendaftaran siswa.
            
            Instruksi Khusus:
            1. Data Header:
               - Pisahkan RT dan RW ke field berbeda (hanya angkanya).
               - Ekstrak nama Dusun atau Jalan utama ke field 'dusun'.
               - Ekstrak Desa/Kelurahan, Kecamatan, Kabupaten, Provinsi, Kode Pos.
            
            2. Data Anggota Keluarga (Tabel): 
               - Loop setiap baris.
               - Pastikan NIK, Nama Lengkap, Tempat Lahir, Tanggal Lahir, Nama Ayah, dan Nama Ibu terekstrak dengan akurat karena akan digunakan untuk cross-reference data orang tua.
            
            Jika data tidak terbaca, gunakan string kosong "". Format tanggal WAJIB "DD/MM/YYYY" (contoh: 31/01/2005).`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nomorKK: { type: Type.STRING },
            namaKepalaKeluarga: { type: Type.STRING },
            alamat: { type: Type.STRING, description: "Alamat lengkap" },
            dusun: { type: Type.STRING, description: "Nama Dusun atau Jalan" },
            rt: { type: Type.STRING },
            rw: { type: Type.STRING },
            kodePos: { type: Type.STRING },
            desaKelurahan: { type: Type.STRING },
            kecamatan: { type: Type.STRING },
            kabupatenKota: { type: Type.STRING },
            provinsi: { type: Type.STRING },
            anggotaKeluarga: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  no: { type: Type.STRING },
                  namaLengkap: { type: Type.STRING },
                  nik: { type: Type.STRING },
                  jenisKelamin: { type: Type.STRING },
                  tempatLahir: { type: Type.STRING },
                  tanggalLahir: { type: Type.STRING },
                  agama: { type: Type.STRING },
                  pendidikan: { type: Type.STRING },
                  jenisPekerjaan: { type: Type.STRING },
                  statusPerkawinan: { type: Type.STRING },
                  statusHubungan: { type: Type.STRING },
                  kewarganegaraan: { type: Type.STRING },
                  namaAyah: { type: Type.STRING },
                  namaIbu: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gagal mendapatkan respons dari Gemini.");

    const parsedData = JSON.parse(text) as KartuKeluargaData;
    
    // Post-process dates to strictly ensure DD/MM/YYYY
    if (parsedData.anggotaKeluarga) {
        parsedData.anggotaKeluarga = parsedData.anggotaKeluarga.map(member => ({
            ...member,
            tanggalLahir: normalizeDate(member.tanggalLahir)
        }));
    }

    return parsedData;

  } catch (error) {
    console.error("Error parsing KK:", error);
    throw error;
  }
};