"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../../components/ConfirmModal";

export default function SpinWheelPicker() {
  const [options, setOptions] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  // Load saved options and custom title from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("spinWheelOptions");
    const savedTitle = localStorage.getItem("spinWheelCustomTitle");
    if (saved) {
      setOptions(saved);
    }
    if (savedTitle) {
      setCustomTitle(savedTitle);
    }
  }, []);

  // Save options to localStorage whenever they change
  useEffect(() => {
    if (options) {
      localStorage.setItem("spinWheelOptions", options);
    }
  }, [options]);

  // Save custom title to localStorage
  useEffect(() => {
    if (customTitle) {
      localStorage.setItem("spinWheelCustomTitle", customTitle);
    }
  }, [customTitle]);

  // Draw the wheel whenever options or rotation changes
  useEffect(() => {
    drawWheel();
  }, [options, rotation]);

  const getOptionsList = () => {
    return options
      .split("\n")
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    const optionsList = getOptionsList();

    // Create data structure for each pie slice with ID and exact angle positions
    const slices = optionsList.map((option, index) => ({
      id: `slice-${index}`,
      option: option,
      index: index,
      startAngle: 0,
      endAngle: 0,
      centerAngle: 0,
      color: "",
    }));

    if (optionsList.length === 0) {
      // Draw empty wheel
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(centerX, centerY);

      // Outer circle
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#EFEFEF";
      ctx.fill();
      ctx.strokeStyle = "#0077B6";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Center text
      ctx.fillStyle = "#3a3f4b";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Add options to spin!", 0, 0);

      ctx.restore();
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context and apply rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    const anglePerSlice = (2 * Math.PI) / optionsList.length;

    // Vibrant random colors like real game wheels
    const colors = [
      "#FF6B6B", // Red
      "#4ECDC4", // Teal
      "#FFE66D", // Yellow
      "#95E1D3", // Mint
      "#F38181", // Pink
      "#AA96DA", // Purple
      "#FCBAD3", // Light Pink
      "#A8E6CF", // Light Green
      "#FFD93D", // Gold
      "#6BCF7F", // Green
      "#C56CF0", // Violet
      "#FF8C42", // Orange
      "#3498DB", // Blue
      "#E74C3C", // Dark Red
      "#1ABC9C", // Turquoise
      "#F39C12", // Dark Yellow
    ];

    // Draw each slice with precise data
    slices.forEach((slice, index) => {
      const startAngle = index * anglePerSlice - Math.PI / 2;
      const endAngle = startAngle + anglePerSlice;
      const centerAngle = startAngle + anglePerSlice / 2;

      // Update slice data with exact angles
      slice.startAngle = startAngle;
      slice.endAngle = endAngle;
      slice.centerAngle = centerAngle;
      slice.color = colors[index % colors.length];

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      // Dark borders between slices for better separation
      ctx.strokeStyle = "#282C35";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text with word wrapping
      ctx.save();
      const textAngle = startAngle + anglePerSlice / 2;
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Word wrap function
      const wrapText = (text, maxWidth) => {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);

          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          lines.push(currentLine);
        }

        return lines;
      };

      const maxWidth = radius * 0.6;
      const lines = wrapText(slice.option, maxWidth);
      const lineHeight = 16;
      const totalHeight = lines.length * lineHeight;
      const startY = -radius * 0.65 - totalHeight / 2 + lineHeight / 2;

      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, 0, startY + lineIndex * lineHeight);
      });

      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#0077B6";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();

    // Draw PRECISE pointer/arrow at top center (pointing down to winner)
    ctx.save();
    ctx.translate(centerX, centerY - radius - 5);

    // Draw very sharp arrow pointing down with thin tip for accuracy
    ctx.beginPath();
    ctx.moveTo(0, 25); // Sharp tip of arrow (pointing down) - THIS IS THE EXACT WINNER POINT
    ctx.lineTo(-8, 10); // Left side of tip
    ctx.lineTo(-8, 0); // Left narrow part
    ctx.lineTo(-20, 0); // Left wide part
    ctx.lineTo(-20, -30); // Top left
    ctx.lineTo(20, -30); // Top right
    ctx.lineTo(20, 0); // Right wide part
    ctx.lineTo(8, 0); // Right narrow part
    ctx.lineTo(8, 10); // Right side of tip
    ctx.closePath();

    // Gradient fill for arrow
    const gradient = ctx.createLinearGradient(0, -30, 0, 25);
    gradient.addColorStop(0, "#0077B6");
    gradient.addColorStop(1, "#00a6fb");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Strong dark border for maximum visibility
    ctx.strokeStyle = "#282C35";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Add white inner glow for contrast
    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 3;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw a small circle at the exact tip for precision indicator
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 25, 5, 0, 2 * Math.PI); // Exact tip point
    ctx.fillStyle = "#FFD700"; // Gold color for high visibility
    ctx.fill();
    ctx.strokeStyle = "#282C35";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  const spinWheel = () => {
    const optionsList = getOptionsList();

    if (optionsList.length === 0) {
      alert("Please add at least one option to spin!");
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    // Pick winner BEFORE animation (100% random)
    const winnerIndex = Math.floor(Math.random() * optionsList.length);
    const selectedWinner = optionsList[winnerIndex];

    // Calculate ACCURATE target rotation
    const anglePerSlice = 360 / optionsList.length;

    // When rotation = 0, slice 0 is at top under the arrow
    // When rotation = anglePerSlice, slice 1 is at top, etc.
    // So to put slice with index winnerIndex at top:
    // rotation = winnerIndex * anglePerSlice

    // Add random offset WITHIN the slice (20% to 80% into the colored area)
    const randomOffsetWithinSlice = (Math.random() * 0.6 + 0.2) * anglePerSlice;

    // Final target rotation to position winner under arrow
    const targetRotation =
      winnerIndex * anglePerSlice + randomOffsetWithinSlice;

    // Add multiple full spins for dramatic effect (5-7 rotations)
    const spins = 5 + Math.random() * 2;
    const totalRotation = spins * 360 + targetRotation;

    // Animate rotation
    const duration = 5000; // 5 seconds
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic for smooth deceleration)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeOut;

      setRotation(currentRotation % 360);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWinner(selectedWinner);
        setShowWinnerModal(true);

        // Remove winner from options list
        const updatedOptions = optionsList
          .filter((opt) => opt !== selectedWinner)
          .join("\n");
        setOptions(updatedOptions);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleClearConfirm = () => {
    setOptions("");
    setCustomTitle("");
    localStorage.removeItem("spinWheelOptions");
    localStorage.removeItem("spinWheelCustomTitle");
    setWinner(null);
    setRotation(0);
  };

  const handleLoadSample = () => {
    const sample = `Alice
Bob
Charlie
Diana
Edward
Fiona
George
Hannah`;
    setOptions(sample);
    setCustomTitle("Siya ang magbabayad");
  };

  const optionsList = getOptionsList();

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
            🎡 Spin the Wheel Name Picker
          </h1>
          <p className="text-lg" style={{ color: "#3a3f4b" }}>
            Random selection made fun! Add names and let the wheel decide
          </p>
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

            {/* Input Area */}
            <div className="p-6">
              {/* Custom Title Input */}
              <div className="mb-4">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#282C35" }}
                >
                  🏆 Winner Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Siya ang magbabayad, The winner is, Presenter"
                  className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EFEFEF",
                    color: "#282C35",
                  }}
                />
                <p className="mt-1 text-xs" style={{ color: "#3a3f4b" }}>
                  This text will replace "WINNER!" - e.g., "Siya ang magbabayad"
                  will show: <strong>"🎉 Siya ang magbabayad: [Name]"</strong>
                </p>
              </div>

              {/* Options Input */}
              <label
                className="block text-sm font-semibold mb-3"
                style={{ color: "#282C35" }}
              >
                Enter Options (One per line)
              </label>
              <textarea
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Alice
Bob
Charlie
Diana
Edward
Fiona

Add one name per line..."
                className="w-full h-96 px-4 py-3 border-2 rounded-xl outline-none transition-all text-base resize-none"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#EFEFEF",
                  color: "#282C35",
                }}
              />
              <p className="mt-2 text-sm" style={{ color: "#3a3f4b" }}>
                {optionsList.length}{" "}
                {optionsList.length === 1 ? "option" : "options"} • Auto-saved •
                Aalisin ang nanalo pagkatapos
              </p>
            </div>
          </motion.div>

          {/* Wheel Section */}
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
                className="text-lg font-bold mb-2 text-center"
                style={{ color: "#282C35" }}
              >
                🎡 The Wheel
              </h3>
              <p
                className="text-xs text-center mb-6"
                style={{ color: "#3a3f4b" }}
              >
                ⬇️ Kung saan tumama ang{" "}
                <span style={{ color: "#FFD700", fontWeight: "bold" }}>
                  ● gold tip
                </span>{" "}
                sa kulay, yun ang winner!
              </p>

              {/* Canvas Wheel */}
              <div className="flex flex-col items-center mb-6">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={400}
                  className="max-w-full"
                />

                {/* Current Selection Indicator */}
                {optionsList.length > 0 && !isSpinning && (
                  <div className="mt-4 text-center">
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: "#3a3f4b" }}
                    >
                      ⬇️ Kasalukuyang tumuturo sa:
                    </p>
                    <div
                      className="px-6 py-3 rounded-xl border-2"
                      style={{
                        backgroundColor: "rgba(0, 119, 182, 0.05)",
                        borderColor: "#0077B6",
                      }}
                    >
                      <p
                        className="font-bold text-lg"
                        style={{ color: "#0077B6" }}
                      >
                        {(() => {
                          // Simple and accurate: which slice is currently under the arrow
                          const anglePerSlice = 360 / optionsList.length;
                          const normalizedRotation = rotation % 360;

                          // Direct calculation: rotation tells us which slice is at top
                          const currentIndex =
                            Math.floor(normalizedRotation / anglePerSlice) %
                            optionsList.length;

                          return optionsList[currentIndex] || "Ready to spin!";
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Spin Button */}
              <button
                onClick={spinWheel}
                disabled={isSpinning || optionsList.length === 0}
                className="w-full py-6 text-white font-black text-2xl rounded-xl transition-all duration-200 hover:shadow-2xl hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundColor:
                    isSpinning || optionsList.length === 0
                      ? "#d4d4d4"
                      : "#0077B6",
                }}
              >
                {isSpinning ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
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
                    SPINNING...
                  </span>
                ) : (
                  "🎯 SPIN THE WHEEL!"
                )}
              </button>

              {optionsList.length === 0 && (
                <p
                  className="text-center text-sm mt-4"
                  style={{ color: "#3a3f4b" }}
                >
                  Add at least one option to enable spinning
                </p>
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
            <div className="text-3xl mb-3">🎲</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              100% Random
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              True randomization - winner is selected before animation starts
              for complete fairness
            </p>
          </div>

          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Auto-Remove Winners
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Selected winners are automatically removed from the list after
              each spin - perfect for elimination games!
            </p>
          </div>

          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EFEFEF",
            }}
          >
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#282C35" }}>
              Visual & Fun
            </h3>
            <p className="text-sm" style={{ color: "#3a3f4b" }}>
              Engaging wheel animation with smooth spinning and exciting reveal
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
              • <strong>Team Meetings:</strong> "Siya ang mag-present" - Pick
              who presents first
            </li>
            <li>
              • <strong>Giveaways:</strong> "The winner is" - Fairly select
              prize winners
            </li>
            <li>
              • <strong>Decision Making:</strong> "Siya ang magbabayad" - Who
              pays for lunch?
            </li>
            <li>
              • <strong>Games:</strong> "Next player" - Random turn order
              selection
            </li>
            <li>
              • <strong>Classroom:</strong> "Mag-answer" - Pick students for
              questions
            </li>
            <li>
              • <strong>Custom Titles:</strong> Set your own message for any
              occasion!
            </li>
          </ul>
        </motion.div>

        {/* Winner Modal */}
        <AnimatePresence>
          {showWinnerModal && winner && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWinnerModal(false)}
              style={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                backgroundColor: "rgba(40, 44, 53, 0.3)",
              }}
            >
              <motion.div
                className="relative max-w-md w-full rounded-2xl shadow-2xl border overflow-hidden"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderColor: "rgba(0, 119, 182, 0.3)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative gradient top bar */}
                <div
                  className="h-2"
                  style={{
                    background: "linear-gradient(90deg, #0077B6, #00a6fb)",
                  }}
                />

                {/* Content */}
                <div className="p-8 text-center">
                  {/* Confetti/Trophy Icon */}
                  <motion.div
                    className="text-7xl mb-4"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: 2,
                    }}
                  >
                    🎉
                  </motion.div>

                  {customTitle ? (
                    <>
                      <h2
                        className="text-2xl font-bold mb-2"
                        style={{ color: "#0077B6" }}
                      >
                        🎉 {customTitle}
                      </h2>
                      <div
                        className="text-5xl font-black mb-6 p-6 rounded-xl"
                        style={{
                          backgroundColor: "rgba(0, 119, 182, 0.1)",
                          color: "#282C35",
                        }}
                      >
                        {winner}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2
                        className="text-3xl font-black mb-4"
                        style={{ color: "#0077B6" }}
                      >
                        🏆 WINNER! 🏆
                      </h2>
                      <div
                        className="text-5xl font-black mb-6 p-6 rounded-xl"
                        style={{
                          backgroundColor: "rgba(0, 119, 182, 0.1)",
                          color: "#282C35",
                        }}
                      >
                        {winner}
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => setShowWinnerModal(false)}
                    className="px-8 py-3 text-white font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
                    style={{ backgroundColor: "#0077B6" }}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear Confirmation Modal */}
        <ConfirmModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClearConfirm}
          title="Clear All Options?"
          message="This will remove all options and reset the wheel. This action cannot be undone."
        />
      </div>
    </div>
  );
}
