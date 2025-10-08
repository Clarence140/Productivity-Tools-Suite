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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const mermaidRef = useRef(null);
  const fullScreenMermaidRef = useRef(null);

  // Sample documentation
  const SAMPLE_DOCUMENTATION = `START: User Checkout Process
STEP: Verify inventory
IF: Item is in stock?
  YES: STEP: Process payment
  NO: STEP: Notify out of stock
STEP: Ship item
END: Process Completed`;

  const ADVANCED_SAMPLE = `START: Advanced E-Commerce System
INPUT: User enters product search
DATABASE: Query product database
DECISION: Products found?
  YES: OUTPUT: Display search results
  NO: OUTPUT: Show no results message
PROCESS: User selects product
SUBPROCESS: Calculate pricing and tax
DATABASE: Update cart in database
IF: User ready to checkout?
  YES: STEP: Proceed to payment
  NO: STEP: Continue shopping
PARALLEL START: Process order
PARALLEL PATH: Send confirmation email
PARALLEL PATH: Update inventory system
PARALLEL PATH: Process payment gateway
PARALLEL END: All tasks completed
GROUP START: Order Fulfillment
STEP: Pick items from warehouse
STEP: Package and label items
STEP: Arrange courier pickup
GROUP END
OUTPUT: Shipping notification sent
COMMENT: Track order status in real-time
END: Order Complete`;

  const ENTERPRISE_SAMPLE = `START: Enterprise Data Pipeline
INPUT: Receive data from multiple sources
GROUP START: Data Validation
STEP: Check data format
STEP: Validate schema
DECISION: Data valid?
  YES: PROCESS: Continue processing
  NO: OUTPUT: Send error report
GROUP END
DATABASE: Store raw data
SUBPROCESS: Transform and clean data
PARALLEL START: Data Processing
PARALLEL PATH: Run analytics
PARALLEL PATH: Generate reports
PARALLEL PATH: Update dashboards
PARALLEL END: Processing complete
DATABASE: Store processed data
OUTPUT: Notify stakeholders
COMMENT: Schedule next pipeline run
END: Pipeline Completed`;

  const PROFESSIONAL_SAMPLE = `START: Software Deployment System
MANUAL INPUT: Developer submits code
DOCUMENT: Generate deployment docs
PREPARATION: Setup deployment environment
SUBPROCESS: Run pre-deployment checks
DECISION: All tests passed?
  YES: PROCESS: Continue deployment
  NO: STEP: Rollback changes
GROUP START: Deployment Phase
PARALLEL START: Multi-region deployment
PARALLEL PATH: Deploy to US servers
PARALLEL PATH: Deploy to EU servers
PARALLEL PATH: Deploy to ASIA servers
PARALLEL END: Deployment complete
GROUP END
DATABASE: Update deployment logs
STORED DATA: Archive release artifacts
DELAY: Wait for health checks
DISPLAY: Show deployment status
DECISION: Health check passed?
  YES: CONNECTOR: Success
  NO: MANUAL LOOP: Manual intervention
MERGE: Combine results
OUTPUT: Send notification emails
MULTIPLE DOCUMENTS: Generate reports
SUBROUTINE: Cleanup temporary files
COMMENT: Monitor for 24 hours
OFF PAGE: Continue to monitoring
END: Deployment Complete`;

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

  // Render Mermaid diagram for full screen view
  useEffect(() => {
    const renderFullScreenDiagram = async () => {
      if (
        mermaidCode &&
        mermaidLoaded &&
        window.mermaid &&
        fullScreenMermaidRef.current &&
        isFullScreen
      ) {
        try {
          fullScreenMermaidRef.current.innerHTML = "";

          // Generate unique ID for this diagram
          const diagramId = "flowchart-fullscreen-" + Date.now();

          // Check if mermaid.render exists and is a function
          if (typeof window.mermaid.render === "function") {
            // Use the newer async/await approach
            const { svg } = await window.mermaid.render(diagramId, mermaidCode);
            fullScreenMermaidRef.current.innerHTML = svg;
          } else {
            // Fallback to the older callback approach
            window.mermaid.render(diagramId, mermaidCode, (svgCode) => {
              if (fullScreenMermaidRef.current) {
                fullScreenMermaidRef.current.innerHTML = svgCode;
              }
            });
          }
        } catch (err) {
          console.error("Mermaid render error:", err);
        }
      }
    };

    renderFullScreenDiagram();
  }, [mermaidCode, mermaidLoaded, isFullScreen]);

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

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3)); // Max 3x zoom
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5)); // Min 0.5x zoom
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setZoomLevel(1); // Reset zoom when closing
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

        {/* Detailed Instructions */}
        <motion.div
          className="mb-6 p-6 rounded-xl shadow-lg border"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#EFEFEF",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2
            className="text-lg font-bold mb-3 flex items-center gap-2"
            style={{ color: "#0077B6" }}
          >
            📖 How to Use This Tool
          </h2>

          <div className="space-y-4 text-sm" style={{ color: "#3a3f4b" }}>
            {/* What to paste */}
            <div>
              <h3 className="font-semibold mb-2" style={{ color: "#282C35" }}>
                ✍️ Available Keywords (Basic & Advanced)
              </h3>
              <p className="mb-3 text-xs italic">
                Use these keywords to create professional flowcharts with
                different shapes:
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Basic Flow Control */}
                <div>
                  <p
                    className="font-semibold text-xs mb-2"
                    style={{ color: "#0077B6" }}
                  >
                    🔹 Basic Flow Control:
                  </p>
                  <ul className="list-none space-y-1 text-[11px]">
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        START:
                      </code>{" "}
                      Circle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        END:
                      </code>{" "}
                      Circle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        STEP:
                      </code>{" "}
                      Rectangle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        PROCESS:
                      </code>{" "}
                      Rectangle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        IF:
                      </code>{" "}
                      /{" "}
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        DECISION:
                      </code>{" "}
                      Diamond
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        YES:
                      </code>{" "}
                      /{" "}
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        NO:
                      </code>{" "}
                      Branches
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        GO TO:
                      </code>{" "}
                      Loop back
                    </li>
                  </ul>
                </div>

                {/* Data & Documents */}
                <div>
                  <p
                    className="font-semibold text-xs mb-2"
                    style={{ color: "#0077B6" }}
                  >
                    🔹 Data & Documents:
                  </p>
                  <ul className="list-none space-y-1 text-[11px]">
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        INPUT:
                      </code>{" "}
                      Parallelogram
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        OUTPUT:
                      </code>{" "}
                      Parallelogram
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        MANUAL INPUT:
                      </code>{" "}
                      Parallelogram
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        DOCUMENT:
                      </code>{" "}
                      Rectangle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        MULTIPLE DOCUMENTS:
                      </code>{" "}
                      Double rect
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        DATABASE:
                      </code>{" "}
                      Cylinder
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        STORED DATA:
                      </code>{" "}
                      Cylinder
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        INTERNAL STORAGE:
                      </code>{" "}
                      Cylinder
                    </li>
                  </ul>
                </div>

                {/* Process & Sub-process */}
                <div>
                  <p
                    className="font-semibold text-xs mb-2"
                    style={{ color: "#0077B6" }}
                  >
                    🔹 Process Types:
                  </p>
                  <ul className="list-none space-y-1 text-[11px]">
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        SUBPROCESS:
                      </code>{" "}
                      Rounded rect
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        SUBROUTINE:
                      </code>{" "}
                      Double rect
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        PREPARATION:
                      </code>{" "}
                      Rectangle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        MANUAL LOOP:
                      </code>{" "}
                      Rectangle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        LOOP LIMIT:
                      </code>{" "}
                      Rectangle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        DELAY:
                      </code>{" "}
                      Rectangle
                    </li>
                  </ul>
                </div>

                {/* Logic & Flow */}
                <div>
                  <p
                    className="font-semibold text-xs mb-2"
                    style={{ color: "#0077B6" }}
                  >
                    🔹 Logic & Flow:
                  </p>
                  <ul className="list-none space-y-1 text-[11px]">
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        MERGE:
                      </code>{" "}
                      Diamond
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        OR:
                      </code>{" "}
                      Diamond
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        CONNECTOR:
                      </code>{" "}
                      Circle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        SUMMING JUNCTION:
                      </code>{" "}
                      Circle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        OFF PAGE:
                      </code>{" "}
                      Circle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        COLLATE:
                      </code>{" "}
                      Rectangle
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        SORT:
                      </code>{" "}
                      Rectangle
                    </li>
                  </ul>
                </div>

                {/* Display & Notes */}
                <div>
                  <p
                    className="font-semibold text-xs mb-2"
                    style={{ color: "#0077B6" }}
                  >
                    🔹 Display & Notes:
                  </p>
                  <ul className="list-none space-y-1 text-[11px]">
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        DISPLAY:
                      </code>{" "}
                      Special shape
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        COMMENT:
                      </code>{" "}
                      Note box
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        NOTE:
                      </code>{" "}
                      Note box
                    </li>
                  </ul>
                </div>

                {/* Grouping & Parallel */}
                <div>
                  <p
                    className="font-semibold text-xs mb-2"
                    style={{ color: "#0077B6" }}
                  >
                    🔹 Large Projects:
                  </p>
                  <ul className="list-none space-y-1 text-[11px]">
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        GROUP START:
                      </code>{" "}
                      Begin group
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        GROUP END
                      </code>{" "}
                      End group
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        PARALLEL START:
                      </code>{" "}
                      Begin parallel
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        PARALLEL PATH:
                      </code>{" "}
                      Add path
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        PARALLEL END:
                      </code>{" "}
                      End parallel
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 p-3 rounded bg-blue-50 border border-blue-200">
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "#0077B6" }}
                >
                  ℹ️ Industry Standard Symbols
                </p>
                <p className="text-[11px]" style={{ color: "#3a3f4b" }}>
                  Based on{" "}
                  <a
                    href="https://www.smartdraw.com/flowchart/flowchart-symbols.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-700"
                  >
                    SmartDraw flowchart standards
                  </a>
                  . All keywords support professional flowchart creation for
                  documentation, software design, and process mapping.
                </p>
              </div>
            </div>

            {/* ChatGPT Tip */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "rgba(0, 119, 182, 0.08)" }}
            >
              <h3
                className="font-semibold mb-2 flex items-center gap-2"
                style={{ color: "#282C35" }}
              >
                💡 Pro Tip: Use ChatGPT to Help!
              </h3>
              <p className="mb-2">
                Don&apos;t know how to format your process? Let AI help you! 🤖
              </p>
              <p className="mb-2">
                <strong>Just copy this prompt to ChatGPT:</strong>
              </p>
              <div
                className="bg-white p-3 rounded border text-xs font-mono"
                style={{ borderColor: "#d4d4d4" }}
              >
                &quot;I have a process/workflow idea: [explain your process
                here]. Can you convert it to flowchart format using these
                keywords: START:, END:, STEP:, PROCESS:, SUBPROCESS:, INPUT:,
                OUTPUT:, DATABASE:, IF:/DECISION: (with YES:/NO: branches),
                GROUP START/END (for grouping), PARALLEL START/PATH/END (for
                parallel tasks), COMMENT:, and GO TO:? Make it structured for a
                flowchart generator that supports advanced shapes.&quot;
              </div>
              <p className="mt-2 text-xs italic">
                ChatGPT will format your explanation into the proper structure,
                then just paste it here! 🎯
              </p>
            </div>

            {/* Quick example */}
            <div>
              <h3 className="font-semibold mb-2" style={{ color: "#282C35" }}>
                📝 Quick Examples:
              </h3>

              <div className="space-y-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#0077B6" }}
                >
                  Basic Example:
                </p>
                <pre
                  className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border"
                  style={{ borderColor: "#EFEFEF" }}
                >
                  {`START: User Login
INPUT: Enter credentials
DATABASE: Verify in database
IF: Valid credentials?
  YES: STEP: Grant access
  NO: OUTPUT: Show error
END: Process complete`}
                </pre>

                <p
                  className="text-xs font-semibold mt-3"
                  style={{ color: "#0077B6" }}
                >
                  Advanced Example with Groups:
                </p>
                <pre
                  className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border"
                  style={{ borderColor: "#EFEFEF" }}
                >
                  {`START: Order Processing
GROUP START: Payment
SUBPROCESS: Validate card
DATABASE: Process payment
GROUP END
PARALLEL START: Fulfillment
PARALLEL PATH: Send email
PARALLEL PATH: Update inventory
PARALLEL END: Complete
END: Order Done`}
                </pre>
              </div>
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
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => loadSample(SAMPLE_DOCUMENTATION)}
                  className="px-3 py-1.5 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 text-xs"
                  style={{ backgroundColor: "#0077B6" }}
                >
                  📝 Basic
                </button>
                <button
                  onClick={() => loadSample(ADVANCED_SAMPLE)}
                  className="px-3 py-1.5 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 text-xs"
                  style={{ backgroundColor: "#0077B6" }}
                >
                  🔥 Advanced
                </button>
                <button
                  onClick={() => loadSample(ENTERPRISE_SAMPLE)}
                  className="px-3 py-1.5 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 text-xs"
                  style={{ backgroundColor: "#0077B6" }}
                >
                  🚀 Enterprise
                </button>
                <button
                  onClick={() => loadSample(PROFESSIONAL_SAMPLE)}
                  className="px-3 py-1.5 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 text-xs"
                  style={{ backgroundColor: "#0077B6" }}
                  title="Shows all SmartDraw symbols"
                >
                  ⭐ Professional
                </button>
                <button
                  onClick={() => setShowClearModal(true)}
                  className="px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 text-xs"
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold" style={{ color: "#282C35" }}>
                  📊 Generated Flowchart
                </h3>
                {mermaidCode && (
                  <button
                    onClick={() => setIsFullScreen(true)}
                    className="px-3 py-1 text-xs text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                    style={{ backgroundColor: "#0077B6" }}
                    title="View full screen"
                  >
                    🔍 Full View
                  </button>
                )}
              </div>

              <div
                className="h-[500px] flex items-center justify-center rounded-lg border-2 border-dashed overflow-auto"
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

        {/* Full Screen Flowchart Modal */}
        <AnimatePresence>
          {isFullScreen && mermaidCode && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseFullScreen}
            >
              <motion.div
                className="relative w-full h-full max-w-7xl max-h-screen rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: "#FFFFFF" }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Zoom Controls */}
                <div
                  className="px-6 py-4 border-b flex items-center justify-between"
                  style={{ backgroundColor: "#0077B6", borderColor: "#005a8a" }}
                >
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    📊 Flowchart - Full View
                  </h3>

                  <div className="flex items-center gap-3">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10">
                      <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 0.5}
                        className="p-1 rounded transition-all duration-200 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom out"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                          />
                        </svg>
                      </button>

                      <span className="text-white text-sm font-semibold min-w-[3rem] text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>

                      <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 3}
                        className="p-1 rounded transition-all duration-200 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom in"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={handleZoomReset}
                        className="px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:bg-white/20 text-white"
                        title="Reset zoom"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={handleCloseFullScreen}
                      className="p-2 rounded-lg transition-all duration-200 hover:bg-white/20"
                      title="Close full view"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Flowchart Content with Zoom */}
                <div
                  className="w-full h-[calc(100%-4rem)] overflow-auto p-8"
                  style={{ backgroundColor: "#F8F9FA" }}
                >
                  <div
                    ref={fullScreenMermaidRef}
                    className="w-full h-full flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "center center",
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
