'use client';

import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Wand2, Loader2, Download, X, RefreshCw } from 'lucide-react';
import Image from 'next/image';

// Initialize Gemini API

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
      setMimeType(file.type);
      setResultImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) return;

    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please check your settings.');
      }
      const ai = new GoogleGenAI({ apiKey });

      // Extract base64 data without the prefix
      const base64Data = image.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64EncodeString}`;
            setResultImage(imageUrl);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        setError('No image was generated. Please try a different prompt.');
      }
    } catch (err: any) {
      console.error('Error generating image:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResultImage(null);
    setPrompt('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'edited-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-8">
        
        {/* Main Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Original Image</h2>
              {image && (
                <button 
                  onClick={handleReset}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
              )}
            </div>

            <div 
              className={`
                relative aspect-square rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden
                ${image ? 'border-transparent bg-gray-100' : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50 bg-white'}
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {image ? (
                <div className="relative w-full h-full group">
                  <Image 
                    src={image} 
                    alt="Original" 
                    fill 
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-white transition-colors"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-6 text-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-500">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">Upload an image</p>
                  <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Edit Instructions
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe how you want to change the image (e.g., 'Add a vintage filter', 'Make it look like a sketch', 'Add a cat on the table')"
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] p-4 resize-none text-gray-900 placeholder:text-gray-400"
                  disabled={loading || !image}
                />
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={handleGenerate}
                    disabled={!image || !prompt || loading}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                      ${!image || !prompt || loading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95'}
                    `}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2"
              >
                <X className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}
          </div>

          {/* Result Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Result</h2>
              {resultImage && (
                <button 
                  onClick={handleDownload}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              )}
            </div>

            <div className={`
              relative aspect-square rounded-2xl transition-all duration-500 overflow-hidden flex items-center justify-center
              ${resultImage ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}
            `}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 text-gray-400"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Wand2 className="w-6 h-6 text-indigo-600 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-sm font-medium animate-pulse">Creating magic...</p>
                  </motion.div>
                ) : resultImage ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-full"
                  >
                    <Image 
                      src={resultImage} 
                      alt="Generated Result" 
                      fill 
                      className="object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 text-gray-400 px-6 text-center"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">No result yet</p>
                      <p className="text-sm mt-1">Upload an image and describe changes to see the result here</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
