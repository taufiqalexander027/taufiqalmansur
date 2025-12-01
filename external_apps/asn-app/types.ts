export interface Activity {
  id: string;
  date: string;
  location: string;
  description: string;
  image: string | null; // Base64 string
}

export interface Assessment {
  id: string;
  indicator: string;
  description: string;
  image: string | null; // Legacy single image support
  images?: string[]; // Multiple images support
  timestamp: string; // ISO String for sorting
  date?: string; // Specific date of activity
  customTitle?: string; // Custom tupoksi title untuk UMUM
}

export interface UserProfile {
  nama: string;
  nip?: string;
  pangkat?: string;
  golongan?: string;
  jabatan: string;
  unitKerja: string;
  kota?: string;
}

export type ViewState = 'HOME' | 'SKP' | 'BERAKHLAK' | 'UMUM';

export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

// Declare html2pdf global var
declare global {
  var html2pdf: any;
}