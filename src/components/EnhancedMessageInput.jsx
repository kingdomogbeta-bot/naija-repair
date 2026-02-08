import { useState, useRef } from 'react';
import { Image, Send, Paperclip } from 'lucide-react';

export default function EnhancedMessageInput({ onSend, recipientTyping = false }) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSend = () => {
    if (message.trim() || images.length > 0) {
      onSend({
        content: message,
        images: images
      });
      setMessage('');
      setImages([]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {recipientTyping && (
        <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          Typing...
        </div>
      )}

      {images.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt={`Upload ${i + 1}`} className="w-20 h-20 object-cover rounded-lg" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 hover:bg-gray-100 rounded-lg transition-all"
          title="Attach image"
        >
          <Image className="w-5 h-5 text-gray-600" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() && images.length === 0}
          className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
