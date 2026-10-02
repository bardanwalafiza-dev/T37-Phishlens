import React, { useState, useRef, useEffect, DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { scanImageFile } from '../lib/qrScanner.ts';

interface ImageQrUploaderProps {
  onScanSuccess: (data: string) => void;
}

export const ImageQrUploader: React.FC<ImageQrUploaderProps> = ({ onScanSuccess }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WebP, or SVG).');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const result = await scanImageFile(file);
      if (result && result.data) {
        onScanSuccess(result.data);
      } else {
        setErrorMsg('No readable QR code found in this image. Try uploading a clearer, higher-contrast image.');
      }
    } catch (err: any) {
      setErrorMsg(`Failed to process image: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          processFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
          }
        }}
      />

      {/* Light Theme Upload Box matching Main Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-xl aspect-4/3 sm:aspect-16/9 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#e11d48] bg-rose-50/80 shadow-md ring-4 ring-rose-100'
            : 'border-slate-300 hover:border-[#e11d48] bg-slate-50/70 hover:bg-rose-50/40 shadow-2xs'
        }`}
      >
        {previewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img
              src={previewUrl}
              alt="Uploaded QR Code"
              className="max-h-44 sm:max-h-52 max-w-full rounded-2xl object-contain shadow-sm mb-3 border border-slate-200 bg-white p-1"
            />
            {isProcessing ? (
              <div className="flex items-center gap-2 text-xs text-[#e11d48] font-bold">
                <div className="w-3.5 h-3.5 border-2 border-[#e11d48] border-t-transparent rounded-full animate-spin" />
                <span>Decoding QR matrix locally...</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-medium">Click or drop another image to replace</span>
            )}
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#e11d48] mb-3 shadow-2xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
              Drop QR Screenshot or Click to Browse
            </h4>

            <p className="text-xs text-slate-500 max-w-sm mb-3.5 leading-relaxed">
              Supports PNG, JPG, WebP, camera receipts, and direct clipboard paste (<kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Ctrl+V</kbd>)
            </p>

            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-colors">
              <ImageIcon className="w-3.5 h-3.5 text-[#e11d48]" />
              <span>Select Image File</span>
            </span>
          </>
        )}
      </div>

      {errorMsg && (
        <div className="w-full max-w-xl flex items-start gap-2.5 p-3.5 mt-3 bg-rose-50 border border-rose-200 rounded-xl text-left shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 leading-normal font-medium">{errorMsg}</p>
        </div>
      )}
    </div>
  );
};
