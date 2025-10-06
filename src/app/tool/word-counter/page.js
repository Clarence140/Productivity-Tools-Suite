"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmModal from "../../components/ConfirmModal";

export default function WordCounter() {
  const [text, setText] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const [stats, setStats] = useState({
    words: 0,
    charactersWithSpaces: 0,
    charactersNoSpaces: 0,
    sentences: 0,
    lines: 0,
    paragraphs: 0,
    readingTime: 0,
  });

  // Calculate statistics whenever text changes
  useEffect(() => {
    if (!text) {
      setStats({
        words: 0,
        charactersWithSpaces: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        lines: 0,
        paragraphs: 0,
        readingTime: 0,
      });
      return;
    }

    // Word count - split by whitespace and filter empty strings
    const wordArray = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const wordCount = wordArray.length;

    // Character count with spaces
    const charsWithSpaces = text.length;

    // Character count without spaces
    const charsNoSpaces = text.replace(/\s/g, "").length;

    // Sentence count - split by sentence-ending punctuation
    const sentenceArray = text
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim().length > 0);
    const sentenceCount = sentenceArray.length;

    // Line count - split by line breaks
    const lineArray = text.split(/\n/).filter((line) => line.trim().length > 0);
    const lineCount = Math.max(lineArray.length, 1);

    // Paragraph count - split by double line breaks
    const paragraphArray = text
      .split(/\n\s*\n/)
      .filter((para) => para.trim().length > 0);
    const paragraphCount = paragraphArray.length;

    // Reading time estimate (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    setStats({
      words: wordCount,
      charactersWithSpaces: charsWithSpaces,
      charactersNoSpaces: charsNoSpaces,
      sentences: sentenceCount,
      lines: lineCount,
      paragraphs: paragraphCount,
      readingTime: readingTime,
    });
  }, [text]);

  const handleClearConfirm = () => {
    setText("");
  };

  const handleLoadSample = () => {
    const sample = `Welcome to the Word Counter Tool!

This is a powerful text analysis tool that helps you understand your content better. It provides real-time statistics as you type.

The tool counts words, characters, sentences, lines, and even estimates reading time. Perfect for writers, students, and professionals who need to meet specific word count requirements.

Try typing or pasting your text here to see instant results!`;
    setText(sample);
  };

  const handleCopyStats = () => {
    const statsText = `**Word Count:** ${stats.words}
**Character Count (with spaces):** ${stats.charactersWithSpaces}
**Character Count (no spaces):** ${stats.charactersNoSpaces}
**Sentence Count:** ${stats.sentences}
**Line Count:** ${stats.lines}
**Paragraph Count:** ${stats.paragraphs}
**Estimated Reading Time:** ${stats.readingTime} minute${
      stats.readingTime !== 1 ? "s" : ""
    }`;

    navigator.clipboard.writeText(statsText);
  };

  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #EFEFEF 100%)",
      }}
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
            Word & Character Counter
          </h1>
          <p className="text-lg" style={{ color: "#3a3f4b" }}>
            Real-time text analysis - Count words, characters, sentences, and
            more
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
                <button
                  onClick={handleCopyStats}
                  disabled={!text}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: !text ? "#d4d4d4" : "#0077B6",
                  }}
                >
                  📋 Copy Stats
                </button>
              </div>
            </div>
          </div>

          {/* Text Input Area */}
          <div className="p-4">
            <label
              className="block text-xs font-semibold mb-2"
              style={{ color: "#282C35" }}
            >
              Enter or Paste Your Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing... (counts update in real-time)"
              className="w-full h-56 px-3 py-2 border-2 rounded-lg outline-none transition-all text-sm leading-relaxed resize-none"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#EFEFEF",
                color: "#282C35",
              }}
              spellCheck={true}
            />
          </div>

          {/* Statistics Display */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-bold mb-2" style={{ color: "#282C35" }}>
              📊 Statistics
            </h3>

            {/* Compact Stats Grid */}
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-3">
              <div
                className="p-2 rounded text-center"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  border: "1px solid rgba(0, 119, 182, 0.2)",
                }}
              >
                <div className="text-lg font-bold" style={{ color: "#0077B6" }}>
                  {stats.words.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: "#282C35" }}>
                  Words
                </div>
              </div>

              <div
                className="p-2 rounded text-center"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  border: "1px solid rgba(0, 119, 182, 0.2)",
                }}
              >
                <div className="text-lg font-bold" style={{ color: "#0077B6" }}>
                  {stats.charactersWithSpaces.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: "#282C35" }}>
                  Chars
                </div>
              </div>

              <div
                className="p-2 rounded text-center"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  border: "1px solid rgba(0, 119, 182, 0.2)",
                }}
              >
                <div className="text-lg font-bold" style={{ color: "#0077B6" }}>
                  {stats.charactersNoSpaces.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: "#282C35" }}>
                  No Spc
                </div>
              </div>

              <div
                className="p-2 rounded text-center"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  border: "1px solid rgba(0, 119, 182, 0.2)",
                }}
              >
                <div className="text-lg font-bold" style={{ color: "#0077B6" }}>
                  {stats.sentences.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: "#282C35" }}>
                  Sent.
                </div>
              </div>

              <div
                className="p-2 rounded text-center"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  border: "1px solid rgba(0, 119, 182, 0.2)",
                }}
              >
                <div className="text-lg font-bold" style={{ color: "#0077B6" }}>
                  {stats.lines.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: "#282C35" }}>
                  Lines
                </div>
              </div>

              <div
                className="p-2 rounded text-center"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  border: "1px solid rgba(0, 119, 182, 0.2)",
                }}
              >
                <div className="text-lg font-bold" style={{ color: "#0077B6" }}>
                  {stats.paragraphs.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: "#282C35" }}>
                  Para.
                </div>
              </div>

              <div
                className="p-2 rounded text-center"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  border: "1px solid rgba(0, 119, 182, 0.2)",
                }}
              >
                <div className="text-lg font-bold" style={{ color: "#0077B6" }}>
                  {stats.readingTime}m
                </div>
                <div className="text-xs" style={{ color: "#282C35" }}>
                  Read
                </div>
              </div>
            </div>

            {/* Compact Info */}
            <div
              className="p-2 rounded text-xs"
              style={{
                backgroundColor: "rgba(0, 119, 182, 0.05)",
                borderLeft: "3px solid #0077B6",
                color: "#3a3f4b",
              }}
            >
              Real-time analysis • Reading time based on 200 wpm • Copy stats
              above
            </div>
          </div>
        </motion.div>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClearConfirm}
          title="Clear All Text?"
          message="This will remove all text and reset all statistics. This action cannot be undone."
        />
      </div>
    </div>
  );
}
