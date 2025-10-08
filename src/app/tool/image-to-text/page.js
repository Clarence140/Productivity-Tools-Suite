"use client";

import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import Link from "next/link";
import Image from "next/image";
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
          <div className="grid md:grid-cols-2 gap-4 p-4">
            {/* Image Preview */}
            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: "#282C35" }}
              >
                Image Preview
              </label>
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-3 h-56 flex items-center justify-center transition-all duration-200 ${
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
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={500}
                    height={500}
                    className="max-w-full max-h-full object-contain rounded"
                    unoptimized
                  />
                ) : (
                  <div
                    className="text-center text-xs"
                    style={{ color: "#3a3f4b" }}
                  >
                    <svg
                      className={`w-10 h-10 mx-auto mb-2 transition-all ${
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
                    <p style={{ color: isDragging ? "#0077B6" : "#3a3f4b" }}>
                      {isDragging ? "Drop here!" : "Drag & drop or upload"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Text */}
            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: "#282C35" }}
              >
                Extracted Text
              </label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted text appears here..."
                className="w-full h-56 px-3 py-2 border-2 rounded-lg outline-none transition-all font-mono text-xs resize-none"
                style={{
                  backgroundColor: "#EFEFEF",
                  borderColor: "#d4d4d4",
                  color: "#282C35",
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={handleCopyText}
              disabled={!extractedText}
              className="flex-1 px-3 py-2 text-white text-xs rounded font-medium transition-all duration-200 disabled:cursor-not-allowed hover:scale-105"
              style={{
                backgroundColor: !extractedText ? "#d4d4d4" : "#0077B6",
              }}
            >
              📋 Copy
            </button>
            <button
              onClick={handleDownloadText}
              disabled={!extractedText}
              className="flex-1 px-3 py-2 text-white text-xs rounded font-medium transition-all duration-200 disabled:cursor-not-allowed hover:scale-105"
              style={{
                backgroundColor: !extractedText ? "#d4d4d4" : "#0077B6",
              }}
            >
              💾 Download
            </button>
          </div>

          {/* Extract Button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleExtractText}
              disabled={!image || isProcessing}
              className="w-full py-3 text-white font-bold text-sm rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                backgroundColor: !image || isProcessing ? "#d4d4d4" : "#0077B6",
              }}
            >
              {isProcessing
                ? `⏳ Extracting... ${progress}%`
                : "🚀 Extract Text"}
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-2">
                <div
                  className="w-full rounded-full h-1.5"
                  style={{ backgroundColor: "#EFEFEF" }}
                >
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
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
                className="mt-2 p-2 rounded text-xs"
                style={{
                  backgroundColor: "#fff5f5",
                  borderLeft: "3px solid #e53e3e",
                  color: "#c53030",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Compact Info */}
            <div
              className="mt-3 p-2 rounded text-xs"
              style={{
                backgroundColor: "rgba(0, 119, 182, 0.05)",
                borderLeft: "3px solid #0077B6",
                color: "#3a3f4b",
              }}
            >
              <strong>Tip:</strong> Use clear, high-contrast images • Supports
              100+ languages • Processing in browser
            </div>
          </div>
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
