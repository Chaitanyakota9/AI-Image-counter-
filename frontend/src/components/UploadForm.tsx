import React, { useCallback, useEffect, useRef, useState } from 'react';
import { predictFullStream, predictFull } from '../api/backend';
import type { PredictResponse } from '../types';

type Props = {
  uploading: boolean;
  progress: number;
  onResult: (resp: PredictResponse) => void;
  onError: (msg: string) => void;
  setUploading: (v: boolean) => void;
  setProgress: (v: number) => void;
};

const UploadForm: React.FC<Props> = ({ uploading, progress, onResult, onError, setUploading, setProgress }) => {
  const [file, setFile] = useState<File | null>(null);
  const [labels, setLabels] = useState<string>('');
  const [maxSeg, setMaxSeg] = useState<number>(10);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clear any existing localStorage values and start with defaults
    localStorage.removeItem('candidate_labels');
    localStorage.removeItem('max_segments');
    setLabels('');
    setMaxSeg(10);
  }, []);

  const onDrop = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.dataTransfer.files && ev.dataTransfer.files[0]) {
      setFile(ev.dataTransfer.files[0]);
    }
  }, []);

  const onDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
  };

  const handleSelect = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      onError('Please choose an image file.');
      return;
    }
    const form = new FormData();
    form.append('file', file);
    const trimmed = labels.trim();
    if (trimmed) {
      form.append('candidate_labels', trimmed);
    }
    form.append('max_segments', String(maxSeg || 10));

    try {
      setUploading(true);
      setProgress(0);
      setProgressMessage('Starting analysis...');
      
      try {
        // Try streaming endpoint first
        await predictFullStream(
          form,
          // onProgress
          (data) => {
            setProgress(data.progress);
            setProgressMessage(data.message);
          },
          // onComplete
          (result) => {
            onResult(result);
            setUploading(false);
            setProgressMessage('');
          },
          // onError
          (error) => {
            onError(error);
            setUploading(false);
            setProgressMessage('');
          }
        );
      } catch (streamError: any) {
        // Fallback to regular endpoint if streaming fails
        console.warn('Streaming endpoint failed, falling back to regular endpoint:', streamError);
        setProgressMessage('Using fallback method...');
        
        const res = await predictFull(form, (ev) => {
          if (ev.total) {
            const p = Math.round((ev.loaded / ev.total) * 100);
            setProgress(p);
            setProgressMessage('Uploading...');
          }
        });
        
        onResult(res);
        setUploading(false);
        setProgressMessage('');
      }
    } catch (err: any) {
      onError(err?.message || 'Upload failed.');
      setUploading(false);
      setProgressMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card-solid rounded-3xl p-8 space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Image Analysis</h2>
        <p className="text-gray-600">Upload an image to analyze and segment objects</p>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          file 
            ? 'border-blue-400 bg-blue-50/50' 
            : 'border-white/30 hover:border-white/50 hover:bg-white/5'
        }`}
        onClick={handleSelect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        aria-label="Drag and drop image or click to select"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              {file ? 'File Selected' : 'Drag & drop an image here'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {file ? 'or click to change' : 'or click to browse'}
            </p>
          </div>
        </div>
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {file && (
          <div className="mt-4 p-3 bg-blue-100 rounded-xl inline-block">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Selected:</span> {file.name}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Candidate labels (comma-separated)
          </label>
          <p className="text-xs text-gray-500">
            Leave empty to use default labels. The system will intelligently map ResNet predictions to your labels.
          </p>
          <input
            type="text"
            placeholder="e.g. car, cat, dog, person, tree, building"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Max segments
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={maxSeg}
            onChange={(e) => setMaxSeg(Math.max(1, Math.min(100, parseInt(e.target.value || '10', 10))))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          type="submit"
          disabled={!file || uploading}
          className={`btn-primary ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Analyze Image
            </div>
          )}
        </button>
        
        {uploading && (
          <div className="flex items-center gap-3 px-4 py-2 bg-white/80 rounded-xl backdrop-blur-sm">
            <div className="w-4 h-4 relative">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
              {progressMessage && (
                <span className="text-xs text-gray-500">{progressMessage}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default UploadForm;