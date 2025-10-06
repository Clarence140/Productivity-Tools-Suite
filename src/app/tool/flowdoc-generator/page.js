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

        {/* Syntax Guide */}
        <motion.div
          className="mb-8 p-6 rounded-xl border"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#0077B6",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="font-bold text-lg mb-4" style={{ color: "#0077B6" }}>
            📝 Syntax Rules (100% Rule-Based for Accuracy)
          </h3>
          <div
            className="grid md:grid-cols-2 gap-4 text-sm"
            style={{ color: "#3a3f4b" }}
          >
            <div>
              <p>
                <strong>START:</strong> Begin process
              </p>
              <p>
                <strong>STEP:</strong> Process action
              </p>
              <p>
                <strong>IF:</strong> Decision point
              </p>
            </div>
            <div>
              <p>
                <strong>YES:</strong> Decision branch (indent with 2 spaces)
              </p>
              <p>
                <strong>NO:</strong> Decision branch (indent with 2 spaces)
              </p>
              <p>
                <strong>GO TO:</strong> Jump to existing step
              </p>
              <p>
                <strong>END:</strong> End process
              </p>
            </div>
          </div>
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
            <div className="p-6">
              <label
                className="block text-sm font-semibold mb-3"
                style={{ color: "#282C35" }}
              >
                Structured Documentation (Follow the syntax rules above)
              </label>
              <textarea
                value={documentation}
                onChange={(e) => setDocumentation(e.target.value)}
                placeholder={`START: Begin your process
STEP: First action to take
IF: Decision point?
  YES: STEP: Action if yes
  NO: STEP: Action if no
STEP: Continue process
END: Process completed`}
                className="w-full h-96 px-4 py-3 border-2 rounded-xl outline-none transition-all text-sm resize-none font-mono"
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
                className="w-full mt-4 py-4 text-white font-bold text-lg rounded-xl transition-all duration-200 hover:shadow-2xl hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundColor:
                    isGenerating || !documentation.trim() || !mermaidLoaded
                      ? "#d4d4d4"
                      : "#0077B6",
                }}
              >
                {isGenerating ? (
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
                    Generating Flowchart...
                  </span>
                ) : !mermaidLoaded ? (
                  "⏳ Loading Diagram Engine..."
                ) : (
                  "🚀 Generate Flowchart"
                )}
              </button>

              {/* Error Display */}
              {error && (
                <motion.div
                  className="mt-4 p-4 rounded-lg border-2"
                  style={{
                    backgroundColor: "rgba(231, 76, 60, 0.1)",
                    borderColor: "#E74C3C",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#E74C3C" }}
                  >
                    ⚠️ {error}
                  </p>
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
            <div className="p-6">
              <h3
                className="text-lg font-bold mb-4 text-center"
                style={{ color: "#282C35" }}
              >
                📊 Generated Flowchart
              </h3>

              <div
                className="min-h-96 flex items-center justify-center rounded-xl border-2 border-dashed"
                style={{
                  backgroundColor: "#F8F9FA",
                  borderColor: "#EFEFEF",
                }}
              >
                {mermaidCode ? (
                  <div
                    ref={mermaidRef}
                    className="w-full overflow-auto"
                    style={{ minHeight: "400px" }}
                  />
                ) : (
                  <div className="text-center" style={{ color: "#3a3f4b" }}>
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-lg font-medium">
                      Your flowchart will appear here
                    </p>
                    <p className="text-sm mt-2">
                      Enter documentation and click "Generate Flowchart"
                    </p>
                  </div>
                )}
              </div>

              {/* Mermaid Code Display */}
              {mermaidCode && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4
                    className="font-semibold mb-2"
                    style={{ color: "#282C35" }}
                  >
                    Generated Mermaid Code:
                  </h4>
                  <pre
                    className="p-4 rounded-lg text-xs overflow-auto max-h-40"
                    style={{
                      backgroundColor: "#F8F9FA",
                      color: "#282C35",
                      border: "1px solid #EFEFEF",
                    }}
                  >
                    {mermaidCode}
                  </pre>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

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
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              100% Rule-Based
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Guaranteed accuracy through structured syntax - no AI guessing or
              interpretation errors
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
              Instant Generation
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Transform documentation to visual flowcharts in seconds with
              Mermaid.js rendering
            </p>
          </div>

          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Complex Logic Support
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Handle decisions, loops, jumps, and complex branching with GO TO
              statements
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
              • <strong>Software Development:</strong> API workflows, user
              authentication, data processing
            </li>
            <li>
              • <strong>Business Processes:</strong> Customer onboarding, order
              fulfillment, approval workflows
            </li>
            <li>
              • <strong>Documentation:</strong> Technical specs, system
              architecture, decision trees
            </li>
            <li>
              • <strong>Training Materials:</strong> Process guides,
              troubleshooting flows, step-by-step procedures
            </li>
            <li>
              • <strong>Project Planning:</strong> Task dependencies, milestone
              tracking, resource allocation
            </li>
          </ul>
        </motion.div>

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
