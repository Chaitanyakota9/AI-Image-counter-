import React, { useMemo, useState } from 'react';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import CountsPanel from './components/CountsPanel';
import SegmentCard from './components/SegmentCard';
import SegmentPicker from './components/SegmentPicker';
import TotalsBar from './components/TotalsBar';
import JsonViewer from './components/JsonViewer';
import type { PredictResponse } from './types';
import { baseURL } from './api/http';
import { resolveStaticUrl } from './utils';

const App: React.FC = () => {
  const [data, setData] = useState<PredictResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegIdx, setSelectedSegIdx] = useState<number | null>(null);

  const originalImageSrc = useMemo(() => data ? resolveStaticUrl(data.image_path, baseURL) : '', [data]);
  const selectedSegment = useMemo(() => {
    if (!data || selectedSegIdx === null) return null;
    return data.segments[selectedSegIdx] ?? null;
  }, [data, selectedSegIdx]);

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
            <strong className="font-semibold">Error:</strong> <span className="ml-1">{error}</span>
            <button onClick={() => setError(null)} className="absolute right-2 top-2 rounded px-2 py-1 hover:bg-red-100">
              ✕
            </button>
          </div>
        )}

        <UploadForm
          uploading={uploading}
          progress={progress}
          onResult={(resp) => { setData(resp); setSelectedSegIdx(null); }}
          onError={(msg) => { setError(msg); }}
          setUploading={setUploading}
          setProgress={setProgress}
        />

        {data && (
          <section className="space-y-6">
            <TotalsBar samDetected={data.totals?.sam_detected} returned={data.totals?.returned} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-4">
                <h2 className="text-lg font-semibold mb-3">Original Image</h2>
                
                {/* Debug info */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
                  <strong>Debug:</strong> Image path: {data.image_path} | Resolved: {originalImageSrc}
                </div>
                
                <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {originalImageSrc ? (
                    <img 
                      src={originalImageSrc} 
                      className="max-w-full max-h-full object-contain" 
                      alt="original"
                      onError={(e) => {
                        console.error('Image failed to load:', originalImageSrc);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>No image path available</p>
                    </div>
                  )}
                </div>
              </div>
              <CountsPanel counts={data.counts} candidateLabels={data.candidate_labels} />
            </div>

            <SegmentPicker
              segments={data.segments}
              selectedIndex={selectedSegIdx}
              setSelectedIndex={setSelectedSegIdx}
            />

            <div>
              {selectedSegment ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SegmentCard index={(selectedSegIdx ?? 0) + 1} segment={selectedSegment} />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow p-4 text-sm text-gray-600">
                  Select a segment from the dropdown above to view its details.
                </div>
              )}
            </div>

            <JsonViewer data={data} />
          </section>
        )}
      </main>
    </div>
  );
};

export default App;