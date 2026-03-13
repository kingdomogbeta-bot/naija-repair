import { useRef, useState, useEffect } from 'react';

export default function PhotoCropper({ file, imageUrl, onCrop, onCancel }) {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(imageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [sel, setSel] = useState(null); // {x,y,w,h} in displayed coordinates

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImgSrc(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

  useEffect(() => {
    setSel(null);
  }, [imgSrc]);

  const getRelative = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onMouseDown = (e) => {
    if (!imgRef.current) return;
    const pos = getRelative(e.clientX, e.clientY);
    setStartPos(pos);
    setSel({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setIsDragging(true);
  };
  const onMouseMove = (e) => {
    if (!isDragging || !startPos) return;
    const pos = getRelative(e.clientX, e.clientY);
    const x = Math.min(startPos.x, pos.x);
    const y = Math.min(startPos.y, pos.y);
    const w = Math.abs(pos.x - startPos.x);
    const h = Math.abs(pos.y - startPos.y);
    setSel({ x, y, w, h });
  };
  const onMouseUp = () => {
    setIsDragging(false);
    setStartPos(null);
  };

  const doCrop = async () => {
    if (!sel || !imgRef.current) return;
    const img = imgRef.current;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const displayedW = img.width;
    const displayedH = img.height;
    const scaleX = naturalW / displayedW;
    const scaleY = naturalH / displayedH;
    const sx = Math.max(0, Math.round(sel.x * scaleX));
    const sy = Math.max(0, Math.round(sel.y * scaleY));
    const sw = Math.max(1, Math.round(sel.w * scaleX));
    const sh = Math.max(1, Math.round(sel.h * scaleY));

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop && onCrop(dataUrl);
  };

  if (!imgSrc) return (
    <div className="p-6">No image selected</div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Crop Profile Photo</h3>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-3 py-1 rounded border">Cancel</button>
            <button onClick={doCrop} className="px-3 py-1 rounded bg-teal-600 text-white">Crop & Use</button>
          </div>
        </div>
        <div className="flex gap-4">
          <div
            ref={containerRef}
            className="relative bg-gray-100 flex-1 overflow-hidden max-h-[60vh]"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img ref={imgRef} src={imgSrc} alt="To crop" className="w-full h-auto block select-none pointer-events-none" />
            {sel && (
              <div
                style={{ left: sel.x, top: sel.y, width: sel.w, height: sel.h }}
                className="absolute border-2 border-teal-600 bg-teal-600/10"
              />
            )}
          </div>
          <div className="w-48">
            <div className="mb-2 text-sm text-gray-600">Preview</div>
            <div className="bg-gray-50 border rounded overflow-hidden w-40 h-40 flex items-center justify-center">
              {sel ? (
                <CropPreview imgSrc={imgSrc} sel={sel} imgRef={imgRef} />
              ) : (
                <div className="text-xs text-gray-400">Select an area to preview</div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">Click and drag on the image to select a region. Square or rectangular crops are supported.</div>
      </div>
    </div>
  );
}

function CropPreview({ imgSrc, sel, imgRef }) {
  if (!sel || !imgRef.current) return null;
  const img = imgRef.current;
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;
  const displayedW = img.width;
  const displayedH = img.height;
  const scaleX = naturalW / displayedW;
  const scaleY = naturalH / displayedH;
  const sx = Math.max(0, Math.round(sel.x * scaleX));
  const sy = Math.max(0, Math.round(sel.y * scaleY));
  const sw = Math.max(1, Math.round(sel.w * scaleX));
  const sh = Math.max(1, Math.round(sel.h * scaleY));

  // create a preview canvas
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imgEl = imgRef.current;
    canvas.width = 160;
    canvas.height = Math.round((sh / sw) * 160) || 160;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw scaled crop
    const temp = document.createElement('canvas');
    temp.width = sw;
    temp.height = sh;
    const tctx = temp.getContext('2d');
    tctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, sw, sh);
    ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
  }, [sel, imgRef]);

  return <canvas ref={canvasRef} />;
}
