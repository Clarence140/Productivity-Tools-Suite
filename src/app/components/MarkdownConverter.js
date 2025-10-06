"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmModal from "./ConfirmModal";

export default function MarkdownConverter() {
  const [markdown, setMarkdown] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [format, setFormat] = useState("documentation"); // 'documentation' or 'formal-letter'
  const [filename, setFilename] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);

  const sampleMarkdown = `# Sample Technical Documentation

## Overview
This is a sample document showing how **Markdown** is converted to *DOCX* format with proper formatting. The documentation format automatically adds section numbering, professional spacing, and proper margins.

## Features Table

| Feature | Status | Priority | Description |
| :--- | :--- | :--- | :--- |
| \`Table Support\` | ✅ Complete | High | Full GFM table formatting |
| \`Headings\` | ✅ Complete | High | H1, H2, H3 support |
| \`Code Blocks\` | ✅ Complete | Medium | Inline and block code |
| \`Lists\` | ✅ Complete | Medium | Ordered and unordered |

## Key Features

### Bullet Points
The system properly handles bullet points with appropriate spacing:

* Professional formatting with proper indentation
* Native Word tables with borders and styling
* Preserves document structure and hierarchy
* Easy to use interface with real-time conversion
* Automatic section numbering for documentation

### Numbered Lists
Ordered lists are also supported:

1. First item with proper spacing
2. Second item maintaining consistency
3. Third item with professional formatting
4. Fourth item aligned properly

## Code Example

You can include inline code like \`convertToDocx()\` or full code blocks:

\`\`\`javascript
function convertToDocx(markdown) {
  return processMarkdown(markdown);
}
\`\`\`

## Summary
This converter ensures your documentation looks professional with minimal effort. Just paste your content and let the system handle the formatting!`;

  const handleConvert = async () => {
    if (!markdown.trim()) {
      setError("Please enter some markdown content");
      return;
    }

    if (!filename.trim()) {
      setError("Please enter a filename before downloading");
      return;
    }

    setIsConverting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/convert-to-docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markdown, format }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Conversion failed");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link with custom filename
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Ensure filename has .docx extension
      const downloadFilename = filename.trim().endsWith(".docx")
        ? filename.trim()
        : `${filename.trim()}.docx`;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleLoadSample = () => {
    setMarkdown(sampleMarkdown);
    setError("");
    setSuccess(false);
  };

  const handleClearConfirm = () => {
    setMarkdown("");
    setFilename("");
    setError("");
    setSuccess(false);
  };

  return (
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
          Markdown to DOCX Converter
        </h1>
        <p className="text-lg" style={{ color: "#3a3f4b" }}>
          Convert your AI-generated Markdown documentation to professional Word
          documents
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
        {/* Toolbar */}
        <div
          className="px-6 py-4 border-b"
          style={{
            backgroundColor: "#EFEFEF",
            borderColor: "#d4d4d4",
          }}
        >
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={handleLoadSample}
                className="px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#0077B6" }}
              >
                📝 Load Sample
              </button>
              <button
                onClick={() => setShowClearModal(true)}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "#d4d4d4",
                  color: "#282C35",
                }}
              >
                🗑️ Clear
              </button>

              {/* Format Selector */}
              <div className="flex items-center gap-2 ml-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  Format:
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="px-3 py-2 border-2 rounded-lg font-medium outline-none transition-all cursor-pointer"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EFEFEF",
                    color: "#282C35",
                  }}
                >
                  <option value="documentation">📚 Documentation</option>
                  <option value="formal-letter">✉️ Formal Letter</option>
                </select>
              </div>
            </div>
            <div className="text-sm" style={{ color: "#3a3f4b" }}>
              {markdown.length} characters
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="p-4">
          <label
            className="block text-xs font-semibold mb-1"
            style={{ color: "#282C35" }}
          >
            Markdown Content (GFM)
          </label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={
              format === "documentation"
                ? "# Title\n\n## Section\n\nYour content...\n\n| Col1 | Col2 |\n| --- | --- |\n| Data | Data |"
                : "# Letter Content\n\nYour letter text..."
            }
            className="w-full h-64 px-3 py-2 border-2 rounded-lg outline-none transition-all font-mono text-xs resize-none"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
              color: "#282C35",
            }}
            spellCheck={false}
          />
          <p className="mt-1 text-xs" style={{ color: "#3a3f4b" }}>
            {format === "documentation" &&
              "📚 Auto-numbering, bordered headings, justified text"}
            {format === "formal-letter" &&
              "✉️ Auto-adds date, subject, salutation, closing"}
          </p>
        </div>

        {/* Action Area */}
        <div className="px-4 pb-4">
          {/* Filename Input */}
          <div className="mb-3">
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: "#282C35" }}
            >
              Filename <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., Technical_Doc"
              className="w-full px-3 py-2 border-2 rounded-lg outline-none transition-all text-sm"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#EFEFEF",
                color: "#282C35",
              }}
            />
            <p className="mt-1 text-xs" style={{ color: "#3a3f4b" }}>
              Saves as:{" "}
              <span className="font-mono">
                {filename.trim() || "[filename]"}.docx
              </span>
            </p>
          </div>

          <button
            onClick={handleConvert}
            disabled={isConverting || !markdown.trim() || !filename.trim()}
            className="w-full py-3 text-white font-bold text-sm rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor:
                isConverting || !markdown.trim() || !filename.trim()
                  ? "#d4d4d4"
                  : "#0077B6",
            }}
          >
            {isConverting ? "⏳ Converting..." : "📥 Convert to DOCX"}
          </button>

          {/* Status Messages */}
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

          {success && (
            <div
              className="mt-2 p-2 rounded text-xs"
              style={{
                backgroundColor: "rgba(0, 119, 182, 0.05)",
                borderLeft: "3px solid #0077B6",
                color: "#0077B6",
              }}
            >
              ✅ Document downloaded!
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
            <strong>Supports:</strong> GFM tables • Code blocks • Auto-numbered
            sections • Business letters
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearConfirm}
        title="Clear All Content?"
        message="This will remove all markdown content and reset the filename. This action cannot be undone."
      />
    </div>
  );
}
