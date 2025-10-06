"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmModal from "../../components/ConfirmModal";

export default function EmailToMarkdown() {
  const [emailText, setEmailText] = useState("");
  const [markdownText, setMarkdownText] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);

  // Convert email to markdown whenever input changes
  useEffect(() => {
    if (!emailText.trim()) {
      setMarkdownText("");
      return;
    }

    const converted = convertEmailToMarkdown(emailText);
    setMarkdownText(converted);
  }, [emailText]);

  const convertEmailToMarkdown = (text) => {
    let result = text;

    // Remove HTML entities
    result = result
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Remove common HTML tags
    result = result
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<p>/gi, "\n\n")
      .replace(/<\/p>/gi, "")
      .replace(/<div>/gi, "\n")
      .replace(/<\/div>/gi, "")
      .replace(/<span[^>]*>/gi, "")
      .replace(/<\/span>/gi, "")
      .replace(/<[^>]+>/g, "");

    // Clean up email signatures (common patterns)
    result = result.replace(/^--\s*$/m, "\n---\n");
    result = result.replace(
      /^Sent from my (iPhone|iPad|Android|Samsung)/gim,
      ""
    );
    result = result.replace(/^Get Outlook for (iOS|Android)/gim, "");

    // Handle quoted replies (lines starting with >)
    const lines = result.split("\n");
    const processedLines = lines.map((line) => {
      // Already quoted - keep it
      if (line.trim().startsWith(">")) {
        return line;
      }
      // Common email quote patterns
      if (line.match(/^(On .+ wrote:|From:|Sent:|To:|Subject:)/)) {
        return `> ${line}`;
      }
      return line;
    });
    result = processedLines.join("\n");

    // Convert bullet points and lists
    result = result.replace(/^[\s]*[\*\-\•]\s+(.+)$/gm, "* $1");
    result = result.replace(/^[\s]*(\d+)[\.\)]\s+(.+)$/gm, "$1. $2");

    // Convert bold patterns (common in plain text emails)
    result = result.replace(/\*\*([^*]+)\*\*/g, "**$1**"); // Already markdown
    result = result.replace(/\*([^*\n]+)\*/g, "*$1*"); // Already markdown italic

    // Fix multiple blank lines
    result = result.replace(/\n{3,}/g, "\n\n");

    // Clean up excessive spaces
    result = result.replace(/[ \t]+/g, " ");

    // Trim each line
    result = result
      .split("\n")
      .map((line) => line.trim())
      .join("\n");

    // Convert email headers to proper format
    result = result.replace(/^From:\s*(.+)$/gim, "**From:** $1");
    result = result.replace(/^To:\s*(.+)$/gim, "**To:** $1");
    result = result.replace(/^Subject:\s*(.+)$/gim, "**Subject:** $1");
    result = result.replace(/^Date:\s*(.+)$/gim, "**Date:** $1");

    // Clean up leading/trailing whitespace
    result = result.trim();

    return result;
  };

  const handleClearConfirm = () => {
    setEmailText("");
    setMarkdownText("");
  };

  const handleLoadSample = () => {
    const sample = `From: john.doe@company.com
Sent: Monday, January 15, 2024 10:30 AM
To: team@company.com
Subject: New Feature Requirements

Hi Team,

Here are the requirements for the new dashboard feature:

*Key Features
1) Real-time data updates
2) User authentication
3) Export functionality

The implementation should follow these guidelines:

- Use REST API for data fetching
- Implement proper error handling
- Add comprehensive unit tests

**Important:** Please review the attached mockups before starting development.

Let me know if you have any questions.

Best regards,
John Doe
Senior Product Manager

--
Get Outlook for iOS`;
    setEmailText(sample);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownText);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownText], { type: "text/markdown" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.md";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #EFEFEF 100%)",
      }}
    >
      <div className="w-full max-w-7xl mx-auto p-6">
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
            Email to Markdown Formatter
          </h1>
          <p className="text-lg" style={{ color: "#3a3f4b" }}>
            Transform messy email content into clean, structured Markdown
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
              <div className="flex gap-3">
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
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="grid lg:grid-cols-2 gap-6 p-6">
            {/* Email Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  📧 Email Content (Paste Here)
                </label>
                <span className="text-xs" style={{ color: "#3a3f4b" }}>
                  {emailText.length} characters
                </span>
              </div>
              <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste your messy email content here...

• HTML tags will be cleaned
• Line breaks will be normalized
• Lists will be formatted
• Email headers will be structured"
                className="w-full h-[500px] px-4 py-3 border-2 rounded-xl outline-none transition-all font-mono text-sm resize-none"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#EFEFEF",
                  color: "#282C35",
                }}
                spellCheck={false}
              />
            </div>

            {/* Markdown Output */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  📝 Markdown Output
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    disabled={!markdownText}
                    className="px-3 py-1 text-white text-xs rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#0077B6",
                    }}
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    disabled={!markdownText}
                    className="px-3 py-1 text-white text-xs rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#0077B6",
                    }}
                  >
                    💾 Download
                  </button>
                </div>
              </div>
              <textarea
                value={markdownText}
                readOnly
                placeholder="Clean Markdown will appear here...

The formatter will:
✓ Remove HTML tags
✓ Clean up formatting
✓ Convert lists
✓ Structure headers"
                className="w-full h-[500px] px-4 py-3 border-2 rounded-xl outline-none font-mono text-sm resize-none"
                style={{
                  backgroundColor: "#EFEFEF",
                  borderColor: "#d4d4d4",
                  color: "#282C35",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mt-12 grid md:grid-cols-4 gap-6"
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
            <div className="text-3xl mb-3">🧹</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Clean HTML
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Removes HTML tags, entities, and styling remnants automatically
            </p>
          </div>

          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Smart Lists
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Converts bullet points and numbered lists to proper Markdown
              syntax
            </p>
          </div>

          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Quote Handling
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Identifies and formats email replies and quoted text properly
            </p>
          </div>

          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Instant Preview
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Real-time conversion as you type or paste content
            </p>
          </div>
        </motion.div>

        {/* Use Cases */}
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
          <h4 className="font-bold mb-4 text-lg" style={{ color: "#0077B6" }}>
            💼 Perfect For:
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold mb-2" style={{ color: "#282C35" }}>
                Engineers & Developers:
              </h5>
              <ul className="text-sm space-y-1" style={{ color: "#3a3f4b" }}>
                <li>• Convert specs from email to GitHub issues</li>
                <li>• Clean up bug reports for Jira/Linear</li>
                <li>• Format technical requirements for documentation</li>
                <li>• Prepare code review comments</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2" style={{ color: "#282C35" }}>
                Product Managers & Teams:
              </h5>
              <ul className="text-sm space-y-1" style={{ color: "#3a3f4b" }}>
                <li>• Convert meeting notes to Confluence pages</li>
                <li>• Format user feedback for documentation</li>
                <li>• Create structured release notes</li>
                <li>• Prepare stakeholder updates</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="mt-8 p-6 rounded-xl"
          style={{
            backgroundColor: "#0077B6",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h4 className="font-bold text-white mb-3">
            ⏱️ Time-Saving Benefits:
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-white/90 text-sm">
            <div>
              <strong className="text-white">Eliminate Manual Cleanup:</strong>{" "}
              No more copying, pasting, and reformatting line by line
            </div>
            <div>
              <strong className="text-white">Consistent Documentation:</strong>{" "}
              All email content becomes instantly production-ready
            </div>
            <div>
              <strong className="text-white">Faster Workflows:</strong> Save
              hours per week on documentation tasks
            </div>
          </div>
        </motion.div>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClearConfirm}
          title="Clear All Content?"
          message="This will remove all email and markdown content. This action cannot be undone."
        />
      </div>
    </div>
  );
}
