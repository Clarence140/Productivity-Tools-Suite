"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../../components/ConfirmModal";

export default function FlowDocGenerator() {
  const [documentation, setDocumentation] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const mermaidRef = useRef(null);

  // Sample documentation
  const SAMPLE_DOCUMENTATION = `START: User Checkout Process
STEP: Verify inventory
IF: Item is in stock?
  YES: STEP: Process payment
  NO: STEP: Notify out of stock
STEP: Ship item
END: Process Completed`;

  const ADVANCED_SAMPLE = `START: User Registration System
STEP: Display registration form
STEP: Validate user input
IF: All fields valid?
  YES: STEP: Check if email exists
  NO: STEP: Show validation errors
IF: Email already exists?
  YES: STEP: Show email taken error
  NO: STEP: Create user account
STEP: Send welcome email
STEP: Log user activity
IF: Account creation successful?
  YES: STEP: Redirect to dashboard
  NO: STEP: Show error message
GO TO: Display registration form
END: Registration Process Complete`;

  // Load Mermaid.js dynamically
  useEffect(() => {
    const loadMermaid = async () => {
      if (typeof window !== "undefined" && !window.mermaid) {
        try {
          const mermaid = await import("mermaid");

          // Initialize Mermaid with proper configuration
          mermaid.default.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: "basis",
            },
            themeVariables: {
              primaryColor: "#0077B6",
              primaryTextColor: "#282C35",
              primaryBorderColor: "#282C35",
              lineColor: "#282C35",
              secondaryColor: "#EFEFEF",
              tertiaryColor: "#FFFFFF",
            },
          });

          window.mermaid = mermaid.default;
          setMermaidLoaded(true);
          console.log("Mermaid loaded successfully");
        } catch (error) {
          console.error("Failed to load Mermaid:", error);
          setError("Failed to load diagram library. Please refresh the page.");
        }
      }
    };
    loadMermaid();
  }, []);

  // Render Mermaid diagram
  useEffect(() => {
    const renderDiagram = async () => {
      if (
        mermaidCode &&
        mermaidLoaded &&
        window.mermaid &&
        mermaidRef.current
      ) {
        try {
          mermaidRef.current.innerHTML = "";

          // Generate unique ID for this diagram
          const diagramId = "flowchart-" + Date.now();

          // Check if mermaid.render exists and is a function
          if (typeof window.mermaid.render === "function") {
            // Use the newer async/await approach
            const { svg } = await window.mermaid.render(diagramId, mermaidCode);
            mermaidRef.current.innerHTML = svg;
          } else {
            // Fallback to the older callback approach
            window.mermaid.render(diagramId, mermaidCode, (svgCode) => {
              if (mermaidRef.current) {
                mermaidRef.current.innerHTML = svgCode;
              }
            });
          }
          setError("");
        } catch (err) {
          console.error("Mermaid render error:", err);
          setError("Failed to render diagram: " + err.message);

          // Show the raw Mermaid code as fallback
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<pre style="color: #282C35; font-family: monospace; padding: 20px; background: #f8f9fa; border-radius: 8px; overflow: auto;">${mermaidCode}</pre>`;
          }
        }
      }
    };

    renderDiagram();
  }, [mermaidCode, mermaidLoaded]);

  const generateFlowchart = async () => {
    if (!documentation.trim()) {
      setError("Please enter some documentation text");
      return;
    }

    setIsGenerating(true);
    setError("");
    setMermaidCode("");

    try {
      const response = await fetch("/api/generate-flowchart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentation }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flowchart");
      }

      setMermaidCode(data.mermaid_code);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setDocumentation("");
    setMermaidCode("");
    setError("");
    if (mermaidRef.current) {
      mermaidRef.current.innerHTML = "";
    }
  };

  const loadSample = (sample) => {
    setDocumentation(sample);
    setMermaidCode("");
    setError("");
    if (mermaidRef.current) {
      mermaidRef.current.innerHTML = "";
    }
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
            📊 FlowDoc Generator
          </h1>
          <p className="text-lg" style={{ color: "#3a3f4b" }}>
            Transform structured documentation into beautiful flowcharts
          </p>
        </motion.div>

        {/* Compact Syntax Guide */}
        <motion.div
          className="mb-4 p-3 rounded-lg text-xs"
          style={{
            backgroundColor: "rgba(0, 119, 182, 0.05)",
            borderLeft: "3px solid #0077B6",
            color: "#3a3f4b",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <strong>Syntax:</strong> START: • STEP: • IF: (YES:/NO: indented 2
          spaces) • GO TO: • END:
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            className="rounded-2xl shadow-2xl border overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => loadSample(SAMPLE_DOCUMENTATION)}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "#0077B6" }}
                >
                  📝 Basic Sample
                </button>
                <button
                  onClick={() => loadSample(ADVANCED_SAMPLE)}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "#0077B6" }}
                >
                  🔥 Advanced Sample
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

            {/* Input Area */}
            <div className="p-4">
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: "#282C35" }}
              >
                Structured Documentation
              </label>
              <textarea
                value={documentation}
                onChange={(e) => setDocumentation(e.target.value)}
                placeholder={`START: Begin process
STEP: First action
IF: Decision?
  YES: STEP: If yes
  NO: STEP: If no
END: Done`}
                className="w-full h-56 px-3 py-2 border-2 rounded-lg outline-none transition-all text-xs resize-none font-mono"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#EFEFEF",
                  color: "#282C35",
                }}
              />

              {/* Generate Button */}
              <button
                onClick={generateFlowchart}
                disabled={
                  isGenerating || !documentation.trim() || !mermaidLoaded
                }
                className="w-full mt-3 py-3 text-white font-bold text-sm rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundColor:
                    isGenerating || !documentation.trim() || !mermaidLoaded
                      ? "#d4d4d4"
                      : "#0077B6",
                }}
              >
                {isGenerating
                  ? "⏳ Generating..."
                  : !mermaidLoaded
                  ? "⏳ Loading..."
                  : "🚀 Generate"}
              </button>

              {/* Error Display */}
              {error && (
                <motion.div
                  className="mt-2 p-2 rounded text-xs"
                  style={{
                    backgroundColor: "rgba(231, 76, 60, 0.1)",
                    borderLeft: "3px solid #E74C3C",
                    color: "#E74C3C",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Output Section */}
          <motion.div
            className="rounded-2xl shadow-2xl border overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-4">
              <h3
                className="text-xs font-bold mb-2 text-center"
                style={{ color: "#282C35" }}
              >
                📊 Generated Flowchart
              </h3>

              <div
                className="h-64 flex items-center justify-center rounded-lg border-2 border-dashed overflow-auto"
                style={{
                  backgroundColor: "#F8F9FA",
                  borderColor: "#EFEFEF",
                }}
              >
                {mermaidCode ? (
                  <div ref={mermaidRef} className="w-full overflow-auto p-2" />
                ) : (
                  <div
                    className="text-center text-xs"
                    style={{ color: "#3a3f4b" }}
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <p>Enter documentation and generate</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Clear Confirmation Modal */}
        <ConfirmModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClear}
          title="Clear All Content?"
          message="This will remove all documentation text and generated flowcharts. This action cannot be undone."
        />
      </div>
    </div>
  );
}
