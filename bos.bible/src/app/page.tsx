'use client';

import { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';

interface UploadedFile {
  name: string;
  type: string;
  content: string;
}

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFileUpload = (file: UploadedFile) => {
    setFiles(prev => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI File Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Upload PDF, JSON, or TXT files and chat with AI about their content
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload and Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Upload Files
              </h2>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>

            {/* Uploaded Files List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Uploaded Files
                </h2>
                {files.length > 0 && (
                  <button
                    onClick={clearAllFiles}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {files.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No files uploaded yet
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Remove file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <ChatInterface files={files} />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How to Use
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Upload one or more files (PDF, JSON, or TXT)</li>
            <li>Wait for files to be processed</li>
            <li>Ask questions about the content in the chat interface</li>
            <li>The AI will use your uploaded files as context to answer questions</li>
          </ol>
        </div>
      </div>
    </div>
  );
}