import React, { useState, useRef, useEffect } from 'react';
import { Assessment } from '../../types';
import { Save, RefreshCw, X, Camera, Image as ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';

interface AssessmentFormProps {
  onSubmit: (data: Omit<Assessment, 'id' | 'timestamp'>, imageFiles?: File[]) => void;
  onUpdate: (data: Assessment, imageFiles?: File[]) => void;
  onCancelEdit: () => void;
  initialData: Assessment | null;
  forcedIndicator?: string; // Optional prop to lock indicator
  selectedMonth?: string; // YYYY-MM context
  onDateChange?: (date: string) => void; // New prop to notify parent about date changes
}

const INDICATORS = [
  "1. BERORIENTASI PELAYANAN - Berkomitmen memberikan pelayanan prima demi kepuasan masyarakat",
  "2. AKUNTABEL - Bertanggungjawab atas kepercayaan yang diberikan",
  "3. KOMPETEN - Terus belajar dan mengembangkan kapabilitas",
  "4. HARMONIS - Saling peduli dan menghargai perbedaan",
  "5. LOYAL - Berdedikasi dan mengutamakan kepentingan Bangsa dan Negara",
  "6. ADAPTIF - Terus berinovasi dan antusias dalam menggerakkan ataupun menghadapi perubahan",
  "7. KOLABORATIF - Membangun kerjasama yang sinergis"
];

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  onSubmit,
  onUpdate,
  onCancelEdit,
  initialData,
  forcedIndicator,
  selectedMonth,
  onDateChange
}) => {
  const [indicator, setIndicator] = useState(forcedIndicator || INDICATORS[0]);
  const [date, setDate] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setIndicator(initialData.indicator);
      setCustomTitle(initialData.customTitle || '');
      setDescription(initialData.description);

      const d = initialData.date || initialData.timestamp.split('T')[0];
      setDate(d);
      if (onDateChange) onDateChange(d); // Notify parent

      if (initialData.images && initialData.images.length > 0) {
        setImages(initialData.images);
      } else if (initialData.image) {
        setImages([initialData.image]);
      } else {
        setImages([]);
      }
      setSelectedFiles([]); // Reset files on edit load
    } else {
      // New Entry Mode
      resetForm();
    }
  }, [initialData, forcedIndicator, selectedMonth]);

  const resetForm = () => {
    setIndicator(forcedIndicator || INDICATORS[0]);
    setCustomTitle('');
    setDescription('');
    setImages([]);
    setSelectedFiles([]);

    // Set default date based on selected month
    let defaultDate = new Date().toISOString().split('T')[0];
    if (selectedMonth) {
      if (defaultDate.startsWith(selectedMonth)) {
        // keep today
      } else {
        defaultDate = `${selectedMonth}-01`;
      }
    }

    setDate(defaultDate);
    if (onDateChange) onDateChange(defaultDate); // Notify parent initial date
  };

  const handleDateChangeInternal = (val: string) => {
    setDate(val);
    if (onDateChange) onDateChange(val);
  };

  const processImage = (file: File) => {
    setIsProcessing(true);
    setSelectedFiles(prev => [...prev, file]); // Store file
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          width = MAX_WIDTH;
          height = img.height * scaleSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImages(prev => [...prev, compressedDataUrl]);
        setIsProcessing(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    // Also remove from selectedFiles if it was a new upload
    // Note: This logic is tricky if we mix existing images (URL) and new images (File).
    // But here 'images' state contains both existing URLs and new Base64 previews.
    // 'selectedFiles' only contains new files.
    // If we remove an image, we need to know if it was a new file or existing.
    // For simplicity, let's assume we clear all selectedFiles if user removes ANY image, 
    // OR we just try to sync indices. 
    // Actually, since we append new files to the end, if the index is >= initialData.images.length, it's a new file.

    // Better approach: Re-uploading is safer. 
    // But let's try to handle it.
    // If initialData exists, we have X existing images.
    // If index < X, we are removing an existing image.
    // If index >= X, we are removing a new file at index - X.

    const existingCount = (initialData?.images?.length || (initialData?.image ? 1 : 0));
    if (index >= existingCount) {
      const fileIndex = index - existingCount;
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCustom = indicator.startsWith("8.") || indicator.startsWith("UMUM");

    const payload = {
      indicator,
      date,
      customTitle: isCustom ? customTitle : undefined,
      description,
      images, // This contains mixed URLs/Base64, backend might ignore if files are sent
      image: images.length > 0 ? images[0] : null
    };

    if (initialData) {
      onUpdate({
        ...initialData,
        ...payload
      }, selectedFiles);
    } else {
      onSubmit(payload, selectedFiles);
      // Reset fields for next entry, but keep indicator/date context
      setDescription('');
      setImages([]);
      setSelectedFiles([]);
      setCustomTitle('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-yellow-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Edit Penilaian' : 'Input Kegiatan Baru'}
        </h2>

        <button
          type="button"
          onClick={onCancelEdit}
          className="text-gray-500 hover:text-red-500"
          title="Tutup / Batalkan"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* If indicator is forced, display it as text instead of dropdown */}
        {forcedIndicator ? (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">
              Indikator Terpilih
            </label>
            <p className="font-bold text-gray-800 text-sm md:text-base leading-relaxed">
              {forcedIndicator}
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Indikator
            </label>
            <select
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-white text-sm"
            >
              {INDICATORS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tanggal Kegiatan
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => handleDateChangeInternal(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
          />
        </div>

        {(indicator.startsWith("8.") || indicator.startsWith("UMUM")) && (
          <div className="animate-fade-in p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tupoksi / Nama Kegiatan (Untuk Dicetak)
            </label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Contoh: Menjadi Panitia HUT RI Ke-79"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              *Teks ini akan menggantikan label "Indikator" pada hasil cetak PDF.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Uraian Realisasi Kegiatan
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-h-[250px]"
            placeholder="Jelaskan secara detail kegiatan yang dilakukan..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dokumentasi (Maksimal 2 Foto)
          </label>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {images.length < 2 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="aspect-square flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                <span className="text-xs mt-1">Tambah</span>
              </button>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full mt-6 bg-yellow-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-yellow-700 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          {initialData ? <RefreshCw size={20} /> : <Save size={20} />}
          {initialData ? 'Update Penilaian' : 'Simpan Penilaian'}
        </button>
      </form>
    </div>
  );
};