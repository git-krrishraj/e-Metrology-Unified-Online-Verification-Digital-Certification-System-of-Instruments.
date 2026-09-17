import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Upload } from 'lucide-react';

export const CameraUpload = ({ label = 'Upload or Capture Inspection Photos', onFilesChange, maxFiles = 4 }) => {
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelection = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    const newPreviews = [];
    const validFiles = [];

    selectedFiles.slice(0, maxFiles - previews.length).forEach((file) => {
      validFiles.push(file);
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        setPreviews((prev) => [...prev, { url: readEvent.target.result, file }]);
      };
      reader.readAsDataURL(file);
    });

    if (onFilesChange) {
      onFilesChange(validFiles);
    }
  };

  const removePhoto = (index) => {
    setPreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (onFilesChange) {
        onFilesChange(updated.map((p) => p.file));
      }
      return updated;
    });
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-700">{label}</label>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition"
        >
          <Camera className="w-4 h-4 text-blue-600" />
          <span>Camera / File Capture</span>
        </button>
      </div>

      {/* Hidden Mobile Camera Input with capture="environment" for back camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelection}
        className="hidden"
      />

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {previews.map((item, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
              <img src={item.url} alt="Inspection preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 transition"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
