import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ onUpload, maxFiles = 5, existingImages = [] }) {
  const [images, setImages] = useState(existingImages);
  const [previews, setPreviews] = useState(existingImages);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result;
        setImages(prev => [...prev, newImage]);
        setPreviews(prev => [...prev, newImage]);
        onUpload([...images, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newImages);
    onUpload(newImages);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <img src={preview} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {images.length < maxFiles && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-teal-500 hover:bg-teal-50 transition-all"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Upload Image</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        {images.length}/{maxFiles} images • Max 5MB per image
      </p>
    </div>
  );
}
