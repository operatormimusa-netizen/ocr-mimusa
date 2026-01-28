export interface FamilyMember {
  no: string;
  namaLengkap: string;
  nik: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  pendidikan: string;
  jenisPekerjaan: string;
  statusPerkawinan: string;
  statusHubungan: string;
  kewarganegaraan: string;
  namaAyah: string;
  namaIbu: string;
}

export interface KartuKeluargaData {
  nomorKK: string;
  namaKepalaKeluarga: string;
  alamat: string;
  dusun: string;
  rt: string;
  rw: string;
  kodePos: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  anggotaKeluarga: FamilyMember[];
}
