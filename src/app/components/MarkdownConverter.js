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
        <div className="p-6">
          <div className="mb-3">
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#282C35" }}
            >
              Paste Your Markdown Content (GFM Format)
            </label>
            {format === "documentation" && (
              <p className="text-xs italic" style={{ color: "#0077B6" }}>
                💡 Documentation format: Auto-numbered sections (1., 1.1, etc.),
                professional spacing, bordered headings, justified text
              </p>
            )}
            {format === "formal-letter" && (
              <p className="text-xs italic" style={{ color: "#0077B6" }}>
                ✉️ Formal letter format: Auto-adds date, subject line,
                salutation, closing signature, proper business letter structure
              </p>
            )}
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# Your Documentation Title

## Section 1

Your content here...

| Column 1 | Column 2 | Column 3 |
| :--- | :--- | :--- |
| Data 1 | Data 2 | Data 3 |"
            className="w-full h-96 px-4 py-3 border-2 rounded-xl outline-none transition-all font-mono text-sm resize-none"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
              color: "#282C35",
            }}
            spellCheck={false}
          />
        </div>

        {/* Action Area */}
        <div className="px-6 pb-6">
          {/* Filename Input */}
          <div className="mb-4">
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#282C35" }}
            >
              Document Filename <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., Technical_Documentation or MyLetter"
              className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#EFEFEF",
                color: "#282C35",
              }}
            />
            <p className="mt-1 text-xs" style={{ color: "#3a3f4b" }}>
              File will be saved as:{" "}
              <span className="font-mono font-semibold">
                {filename.trim() || "[filename]"}.docx
              </span>
            </p>
          </div>

          <button
            onClick={handleConvert}
            disabled={isConverting || !markdown.trim() || !filename.trim()}
            className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            style={{
              backgroundColor:
                isConverting || !markdown.trim() || !filename.trim()
                  ? "#d4d4d4"
                  : "#0077B6",
            }}
          >
            {isConverting ? (
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
                Converting...
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Convert to DOCX
              </span>
            )}
          </button>

          {/* Status Messages */}
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

          {success && (
            <div
              className="mt-4 p-4 border-l-4 rounded-lg"
              style={{
                backgroundColor: "rgba(0, 119, 182, 0.05)",
                borderColor: "#0077B6",
              }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="#0077B6" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium" style={{ color: "#0077B6" }}>
                  ✅ Document downloaded successfully!
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
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
            Smart Documentation
          </h3>
          <p className="text-sm" style={{ color: "#3a3f4b" }}>
            Auto-numbered sections (1., 1.1, 1.2), bordered headings, justified
            text, professional spacing - perfect for technical docs
          </p>
        </div>

        <div
          className="p-6 rounded-xl shadow-lg border"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#EFEFEF",
          }}
        >
          <div className="text-3xl mb-3">✉️</div>
          <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
            Formal Letters
          </h3>
          <p className="text-sm" style={{ color: "#3a3f4b" }}>
            Auto-adds date, subject line, salutation, closing signature - proper
            business letter format even from cluttered text
          </p>
        </div>

        <div
          className="p-6 rounded-xl shadow-lg border"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#EFEFEF",
          }}
        >
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
            Perfect Tables
          </h3>
          <p className="text-sm" style={{ color: "#3a3f4b" }}>
            GFM tables converted to native Word tables with proper formatting,
            borders, and styling in both formats
          </p>
        </div>
      </motion.div>

      {/* Footer Note */}
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
          💡 Pro Tip:
        </h4>
        <p className="text-sm mb-3" style={{ color: "#3a3f4b" }}>
          This converter supports{" "}
          <strong>GitHub Flavored Markdown (GFM)</strong> including tables with
          alignment (`:---`, `:---:`, `---:`), code blocks with syntax
          highlighting markers, inline code with backticks, and all standard
          Markdown formatting.
        </p>
        <p className="text-sm" style={{ color: "#3a3f4b" }}>
          <strong>Documentation Format:</strong> Automatically adds section
          numbering (1., 1.1, etc.), professional spacing, bordered headings,
          and justified text. Perfect for technical specs, API docs, and user
          manuals. <strong>Formal Letter Format:</strong> Automatically
          structures your content as a business letter with date, subject line,
          salutation, and closing signature - even if your input text is
          unorganized!
        </p>
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
