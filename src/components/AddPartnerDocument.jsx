

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from 'sonner';
import { useParams } from "react-router-dom";
import partnerService from "../services/partnerService";

const AddPartnerDocument = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Get the id from the URL using react-router-dom's useParams
  const { id } = useParams();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a document to upload.");
      return;
    }
    setUploading(true);
    try {
      console.log("Selected file:", selectedFile);
      console.log("File type:", selectedFile.type);
      console.log("File size:", selectedFile.size);
      console.log("Partner ID:", id);
      
      const response = await partnerService.uploadDocument(selectedFile, id, "PARTNERSHIP_AGREEMENT_SIGNED");
      
      if (onUpload) onUpload(selectedFile);
      setSelectedFile(null);
      console.log("Upload response:", response);

      toast.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload document: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-md shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Upload Partner Document
      </h3>
      
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive && !isDragReject
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : isDragReject
            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500"
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-2">
          <svg
            className={`w-12 h-12 ${
              isDragActive && !isDragReject
                ? "text-indigo-500"
                : isDragReject
                ? "text-red-500"
                : "text-gray-400 dark:text-gray-500"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          <div className="text-sm">
            {isDragActive && !isDragReject ? (
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                Drop the document here
              </p>
            ) : isDragReject ? (
              <p className="text-red-600 dark:text-red-400 font-medium">
                File type not supported
              </p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Drag & drop a document here, or click to select
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                  Supports PDF, DOC, DOCX, JPG, JPEG, PNG (max 10MB)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Selected File Display */}
      {selectedFile && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        className={`mt-4 w-full px-4 py-2 rounded-md text-white font-medium transition-colors ${
          uploading || !selectedFile
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Uploading...</span>
          </div>
        ) : (
          "Upload Document"
        )}
      </button>
    </div>
  );
};

export default AddPartnerDocument;
