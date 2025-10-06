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
          <div className="p-6">
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: "#282C35" }}
            >
              Enter or Paste Your Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or paste your text here...

The counter will automatically update as you type!"
              className="w-full h-96 px-4 py-3 border-2 rounded-xl outline-none transition-all text-base leading-relaxed resize-none"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#EFEFEF",
                color: "#282C35",
              }}
              spellCheck={true}
            />
          </div>

          {/* Statistics Display */}
          <div className="px-6 pb-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: "#282C35" }}>
              📊 Text Statistics
            </h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Word Count */}
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  borderColor: "rgba(0, 119, 182, 0.2)",
                }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#0077B6" }}
                >
                  {stats.words.toLocaleString()}
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  Words
                </div>
              </div>

              {/* Characters with spaces */}
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  borderColor: "rgba(0, 119, 182, 0.2)",
                }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#0077B6" }}
                >
                  {stats.charactersWithSpaces.toLocaleString()}
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  Characters (with spaces)
                </div>
              </div>

              {/* Characters without spaces */}
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  borderColor: "rgba(0, 119, 182, 0.2)",
                }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#0077B6" }}
                >
                  {stats.charactersNoSpaces.toLocaleString()}
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  Characters (no spaces)
                </div>
              </div>

              {/* Sentences */}
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  borderColor: "rgba(0, 119, 182, 0.2)",
                }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#0077B6" }}
                >
                  {stats.sentences.toLocaleString()}
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  Sentences
                </div>
              </div>

              {/* Lines */}
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  borderColor: "rgba(0, 119, 182, 0.2)",
                }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#0077B6" }}
                >
                  {stats.lines.toLocaleString()}
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  Lines
                </div>
              </div>

              {/* Paragraphs */}
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  borderColor: "rgba(0, 119, 182, 0.2)",
                }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#0077B6" }}
                >
                  {stats.paragraphs.toLocaleString()}
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  Paragraphs
                </div>
              </div>

              {/* Reading Time */}
              <div
                className="p-6 rounded-xl border-2 md:col-span-2"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.05)",
                  borderColor: "rgba(0, 119, 182, 0.2)",
                }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#0077B6" }}
                >
                  {stats.readingTime} min
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#282C35" }}
                >
                  Estimated Reading Time
                </div>
                <div className="text-xs mt-1" style={{ color: "#3a3f4b" }}>
                  Based on 200 words/minute
                </div>
              </div>
            </div>

            {/* Formatted Output */}
            <div
              className="rounded-xl p-6 border-2"
              style={{
                backgroundColor: "#EFEFEF",
                borderColor: "#d4d4d4",
              }}
            >
              <h4
                className="font-bold mb-3 flex items-center gap-2"
                style={{ color: "#282C35" }}
              >
                <span>📄</span> Formatted Statistics Output
              </h4>
              <div
                className="font-mono text-sm space-y-1"
                style={{ color: "#282C35" }}
              >
                <div>
                  <strong>Word Count:</strong> {stats.words}
                </div>
                <div>
                  <strong>Character Count (with spaces):</strong>{" "}
                  {stats.charactersWithSpaces}
                </div>
                <div>
                  <strong>Character Count (no spaces):</strong>{" "}
                  {stats.charactersNoSpaces}
                </div>
                <div>
                  <strong>Sentence Count:</strong> {stats.sentences}
                </div>
                <div>
                  <strong>Line Count:</strong> {stats.lines}
                </div>
                <div>
                  <strong>Paragraph Count:</strong> {stats.paragraphs}
                </div>
                <div>
                  <strong>Estimated Reading Time:</strong> {stats.readingTime}{" "}
                  minute{stats.readingTime !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
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
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Real-Time Analysis
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Statistics update instantly as you type - no need to click any
              buttons
            </p>
          </div>

          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Accurate Counting
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Precise word, character, sentence, and line counting with proper
              text parsing
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
              Comprehensive Stats
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Get complete text analytics including reading time estimates and
              paragraph counts
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
          <h4 className="font-bold mb-2" style={{ color: "#0077B6" }}>
            💡 Perfect For:
          </h4>
          <ul className="text-sm space-y-1" style={{ color: "#3a3f4b" }}>
            <li>
              • <strong>Writers:</strong> Meet word count requirements for
              articles and essays
            </li>
            <li>
              • <strong>Students:</strong> Check assignment length and essay
              word counts
            </li>
            <li>
              • <strong>Bloggers:</strong> Optimize content length for SEO
            </li>
            <li>
              • <strong>Social Media:</strong> Stay within character limits for
              posts
            </li>
            <li>
              • <strong>Editors:</strong> Analyze document structure and
              readability
            </li>
          </ul>
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
