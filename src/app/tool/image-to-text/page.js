"use client";

import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmModal from "../../components/ConfirmModal";

export default function ImageToTextExtractor() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return;
      }

      setImage(file);
      setError("");
      setExtractedText("");
      setProgress(0);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractText = async () => {
    if (!image) {
      setError("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    setError("");
    setProgress(0);

    let worker = null;

    try {
      // Simulate initial progress
      setProgress(10);

      // Create Tesseract worker
      worker = await createWorker("eng");

      setProgress(30);

      // Perform OCR
      const {
        data: { text },
      } = await worker.recognize(image);

      setProgress(100);
      setExtractedText(text);
    } catch (err) {
      setError("Failed to extract text. Please try again.");
      console.error("OCR Error:", err);
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsProcessing(false);
      // Keep progress at 100 briefly before resetting
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const handleDownloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleResetConfirm = () => {
    setImage(null);
    setImagePreview(null);
    setExtractedText("");
    setProgress(0);
    setError("");
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return;
      }

      setImage(file);
      setError("");
      setExtractedText("");
      setProgress(0);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #EFEFEF 100%)",
      }}
      onDragEnter={(e) => e.preventDefault()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="w-full max-w-6xl mx-auto p-6">
        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg border transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#282C35",
              borderColor: "#EFEFEF",
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-3" style={{ color: "#0077B6" }}>
            Image to Text Extractor
          </h1>
          <p className="text-lg" style={{ color: "#3a3f4b" }}>
            Extract text from images using powerful OCR technology
            (Tesseract.js)
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="rounded-2xl shadow-2xl border overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#EFEFEF",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Upload Section */}
          <div
            className="p-6 border-b"
            style={{
              backgroundColor: "#EFEFEF",
              borderColor: "#d4d4d4",
            }}
          >
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: "#282C35" }}
            >
              Upload Image
            </label>

            <div className="flex flex-col md:flex-row gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1 px-4 py-3 border-2 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#d4d4d4",
                  color: "#282C35",
                }}
              />
              <button
                onClick={() => setShowResetModal(true)}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: "#d4d4d4",
                  color: "#282C35",
                }}
              >
                🔄 Reset
              </button>
            </div>

            <p className="mt-2 text-xs" style={{ color: "#3a3f4b" }}>
              Supported formats: JPG, PNG, GIF, BMP, TIFF
            </p>
          </div>

          {/* Preview and Results Section */}
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Image Preview */}
            <div>
              <label
                className="block text-sm font-semibold mb-3"
                style={{ color: "#282C35" }}
              >
                Image Preview
              </label>
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 min-h-[300px] flex items-center justify-center transition-all duration-200 ${
                  isDragging ? "scale-105" : ""
                }`}
                style={{
                  borderColor: isDragging ? "#0077B6" : "#EFEFEF",
                  backgroundColor: isDragging
                    ? "rgba(0, 119, 182, 0.05)"
                    : "#FFFFFF",
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-[400px] object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center" style={{ color: "#3a3f4b" }}>
                    <svg
                      className={`w-16 h-16 mx-auto mb-3 transition-all ${
                        isDragging ? "scale-110" : ""
                      }`}
                      fill="none"
                      stroke={isDragging ? "#0077B6" : "currentColor"}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p
                      className={isDragging ? "font-semibold" : ""}
                      style={{ color: isDragging ? "#0077B6" : "#3a3f4b" }}
                    >
                      {isDragging ? "Drop image here!" : "No image uploaded"}
                    </p>
                    {!isDragging && (
                      <p className="text-xs mt-2" style={{ color: "#3a3f4b" }}>
                        Drag & drop an image here
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Text */}
            <div>
              <label
                className="block text-sm font-semibold mb-3"
                style={{ color: "#282C35" }}
              >
                Extracted Text
              </label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted text will appear here..."
                className="w-full h-[300px] px-4 py-3 border-2 rounded-xl outline-none transition-all font-mono text-sm resize-none"
                style={{
                  backgroundColor: "#EFEFEF",
                  borderColor: "#d4d4d4",
                  color: "#282C35",
                }}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCopyText}
                  disabled={!extractedText}
                  className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: !extractedText ? "#d4d4d4" : "#0077B6",
                  }}
                >
                  📋 Copy
                </button>
                <button
                  onClick={handleDownloadText}
                  disabled={!extractedText}
                  className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: !extractedText ? "#d4d4d4" : "#0077B6",
                  }}
                >
                  💾 Download
                </button>
              </div>
            </div>
          </div>

          {/* Extract Button */}
          <div className="px-6 pb-6">
            <button
              onClick={handleExtractText}
              disabled={!image || isProcessing}
              className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              style={{
                backgroundColor: !image || isProcessing ? "#d4d4d4" : "#0077B6",
              }}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Extracting Text... {progress}%
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Extract Text from Image
                </span>
              )}
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-4">
                <div
                  className="w-full rounded-full h-2"
                  style={{ backgroundColor: "#EFEFEF" }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: "#0077B6",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="mt-4 p-4 border-l-4 rounded-lg"
                style={{
                  backgroundColor: "#fff5f5",
                  borderColor: "#e53e3e",
                }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="#e53e3e" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="font-medium" style={{ color: "#c53030" }}>
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mt-12 grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Client-Side Processing
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              100% free! All processing happens in your browser using
              Tesseract.js - no server costs, no data upload
            </p>
          </div>

          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Multi-Language Support
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Tesseract supports 100+ languages including English, Spanish,
              Chinese, Arabic, and more
            </p>
          </div>

          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">✏️</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Editable Output
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Edit extracted text directly, copy to clipboard, or download as a
              text file
            </p>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          className="mt-8 p-6 rounded-xl border"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#0077B6",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h4 className="font-bold mb-2" style={{ color: "#0077B6" }}>
            💡 Tips for Best Results:
          </h4>
          <ul className="text-sm space-y-1" style={{ color: "#3a3f4b" }}>
            <li>• Use high-resolution images with clear, readable text</li>
            <li>• Ensure good contrast between text and background</li>
            <li>• Avoid skewed or rotated images when possible</li>
            <li>
              • For best accuracy, use images with horizontal text alignment
            </li>
            <li>• Supported formats: JPG, PNG, GIF, BMP, and TIFF</li>
          </ul>
        </motion.div>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetConfirm}
          title="Reset All Data?"
          message="This will clear the uploaded image and extracted text. This action cannot be undone."
        />
      </div>
    </div>
  );
}
