'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

interface UploadedFile {
  name: string;
  type: string;
  content: string;
}

interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.type === 'application/pdf' || file.type === 'text/plain' || file.type === 'application/json') {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            onFileUpload(result);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drag & drop files here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supported formats: PDF, JSON, TXT
        </p>
        <label className="inline-block">
          <input
            type="file"
            multiple
            accept=".pdf,.json,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
            Browse Files
          </span>
        </label>
      </div>
    </div>
  );
}