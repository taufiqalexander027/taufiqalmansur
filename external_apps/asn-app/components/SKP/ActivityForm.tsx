import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Save, RefreshCw, X, Loader2 } from 'lucide-react';
import { Activity } from '../../types';

interface ActivityFormProps {
  onSubmit: (activity: Omit<Activity, 'id'>) => void;
  onUpdate: (activity: Activity) => void;
  onCancelEdit: () => void;
  initialData: Activity | null;
  selectedMonth: string; // YYYY-MM
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ onSubmit, onUpdate, onCancelEdit, initialData, selectedMonth }) => {
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setLocation(initialData.location);
      setDescription(initialData.description);
      setImage(initialData.image);
    } else {
      resetForm();
    }
  }, [initialData, selectedMonth]); // Re-run if selectedMonth changes

  const resetForm = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if "Today" is within the selected month
    if (todayStr.startsWith(selectedMonth)) {
        setDate(todayStr);
    } else {
        // If viewing a past/future month, default to the 1st of that month
        // This prevents accidental entry of wrong month dates
        setDate(`${selectedMonth}-01`);
    }
    
    setLocation('');
    setDescription('');
    setImage(null);
  };

  // Compress image logic to keep PDF size small
  const processImage = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Good enough for A4 print
        const scaleSize = MAX_WIDTH / img.width;
        
        // Calculate new dimensions
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
        
        // Compress to JPEG with 0.7 quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImage(compressedDataUrl);
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onUpdate({
        ...initialData,
        date,
        location,
        description,
        image
      });
    } else {
      onSubmit({
        date,
        location,
        description,
        image
      });
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Edit Kegiatan' : 'Input Kegiatan Baru'}
        </h2>
        {initialData && (
          <button 
            type="button" 
            onClick={onCancelEdit} 
            className="text-gray-500 hover:text-red-500"
            title="Batalkan Edit"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Keterangan Kegiatan - Moved to Top per requirements */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Uraian Kegiatan
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            placeholder="Deskripsikan kinerja Anda hari ini..."
          />
        </div>

        {/* Date and Location - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Lokasi
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Kantor BKD, Ruang Rapat"
            />
          </div>
        </div>

        {/* Photo Input Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dokumentasi Foto
          </label>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Camera size={20} />
              <span className="font-medium">Ambil Foto</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <ImageIcon size={20} />
              <span className="font-medium">Pilih Galeri</span>
            </button>
          </div>
          
          {/* Hidden Inputs */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Loading / Image Preview */}
          {isProcessing && (
             <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
               <div className="flex flex-col items-center text-blue-600">
                 <Loader2 size={30} className="animate-spin mb-2" />
                 <span className="text-sm font-medium">Mengompres Foto...</span>
               </div>
             </div>
          )}

          {!isProcessing && image && (
            <div className="relative mt-2 w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
              <img
                src={image}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full mt-6 bg-blue-900 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-800 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          {initialData ? <RefreshCw size={20} /> : <Save size={20} />}
          {initialData ? 'Update Laporan' : 'Simpan Laporan'}
        </button>
      </form>
    </div>
  );
};