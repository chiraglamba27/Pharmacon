import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/client';

interface UploadedFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface FileUploaderProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

interface QueuedFile {
  file: File;
  id: string;
  status: 'queued' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
  result?: UploadedFile;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('presentation')) return FileText;
  return File;
}

export default function FileUploader({ onUploadComplete, accept, maxFiles = 20, className = '' }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: QueuedFile[] = Array.from(files).slice(0, maxFiles - queue.length).map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: 'queued' as const,
      progress: 0,
    }));

    setQueue((prev) => [...prev, ...newFiles]);
  }, [queue.length, maxFiles]);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }, [addFiles]);

  const uploadAll = useCallback(async () => {
    const filesToUpload = queue.filter((f) => f.status === 'queued');
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    // Mark all as uploading
    setQueue((prev) => prev.map((f) =>
      f.status === 'queued' ? { ...f, status: 'uploading' as const, progress: 50 } : f
    ));

    try {
      const files = filesToUpload.map((f) => f.file);
      const result = await api.upload<{ files: UploadedFile[] }>('/files/upload', files);

      // Mark all as done
      setQueue((prev) => prev.map((f) => {
        if (f.status === 'uploading') {
          const uploaded = result.files.find((r) => r.originalName === f.file.name);
          return { ...f, status: 'done' as const, progress: 100, result: uploaded };
        }
        return f;
      }));

      onUploadComplete?.(result.files);
    } catch (err: any) {
      setQueue((prev) => prev.map((f) =>
        f.status === 'uploading' ? { ...f, status: 'error' as const, error: err.message } : f
      ));
    } finally {
      setIsUploading(false);
    }
  }, [queue, onUploadComplete]);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((f) => f.status !== 'done'));
  }, []);

  const queuedCount = queue.filter((f) => f.status === 'queued').length;
  const doneCount = queue.filter((f) => f.status === 'done').length;

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-primary-400 bg-primary-50/50 scale-[1.01]'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept || '.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.zip,.csv,.txt'}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className={`
          mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors
          ${isDragging ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}
        `}>
          <Upload className="w-6 h-6" />
        </div>

        <p className={`text-sm font-medium mb-1 ${isDragging ? 'text-primary-700' : 'text-slate-700'}`}>
          {isDragging ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="text-xs text-slate-400">
          or click to browse · PPT, PDF, Images, ZIP · up to 100 MB
        </p>
      </div>

      {/* File queue */}
      {queue.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">
              {queue.length} file{queue.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              {doneCount > 0 && (
                <button onClick={clearCompleted} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Clear completed
                </button>
              )}
            </div>
          </div>

          {queue.map((item) => {
            const Icon = getFileIcon(item.file.type);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700 truncate">{item.file.name}</div>
                  <div className="text-xs text-slate-400">{formatFileSize(item.file.size)}</div>
                  {item.status === 'uploading' && (
                    <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="text-xs text-red-500 mt-0.5">{item.error}</div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {item.status === 'queued' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                  )}
                  {item.status === 'done' && (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Upload button */}
          {queuedCount > 0 && (
            <button
              onClick={uploadAll}
              disabled={isUploading}
              className="btn-primary w-full gap-2 mt-3"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {queuedCount} file{queuedCount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
