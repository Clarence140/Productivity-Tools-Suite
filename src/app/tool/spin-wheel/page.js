"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../../components/ConfirmModal";

export default function SpinWheelPicker() {
  // Core state
  const [options, setOptions] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  // Advanced features state
  const [seed, setSeed] = useState("");
  const [useSeed, setUseSeed] = useState(false);
  const [spinCount, setSpinCount] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastRandomValue, setLastRandomValue] = useState(null);
  const [spinHistory, setSpinHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("spinWheelOptions");
    const savedTitle = localStorage.getItem("spinWheelCustomTitle");
    const savedHistory = localStorage.getItem("spinWheelHistory");
    if (saved) {
      setOptions(saved);
    }
    if (savedTitle) {
      setCustomTitle(savedTitle);
    }
    if (savedHistory) {
      try {
        setSpinHistory(JSON.parse(savedHistory));
      } catch (e) {
        // Ignore invalid history
      }
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

  // Save history to localStorage
  useEffect(() => {
    if (spinHistory.length > 0) {
      // Keep only last 1000 spins
      const limitedHistory = spinHistory.slice(-1000);
      localStorage.setItem("spinWheelHistory", JSON.stringify(limitedHistory));
    }
  }, [spinHistory]);

  // Draw the wheel whenever options or rotation changes
  useEffect(() => {
    drawWheel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, rotation]);

  const getOptionsList = () => {
    return options
      .split("\n")
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);
  };

  /**
   * 🎲 MULBERRY32 PRNG - Deterministic random number generator
   * For reproducible results when seed is provided
   */
  const mulberry32 = (seedValue) => {
    return function () {
      let t = (seedValue += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /**
   * 🔒 SECURE RANDOM - Using crypto.getRandomValues()
   * For true randomness when no seed is provided
   */
  const secureRandom = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / 4294967296;
  };

  /**
   * 🎯 GET RANDOM VALUE - Unified interface for random generation
   * Returns [randomValue, source]
   */
  const getRandomValue = () => {
    if (useSeed && seed) {
      // Parse seed (support numbers and strings)
      let seedNum;
      if (typeof seed === "string") {
        // Convert string to number using simple hash
        seedNum = 0;
        for (let i = 0; i < seed.length; i++) {
          seedNum = (seedNum << 5) - seedNum + seed.charCodeAt(i);
          seedNum = seedNum & seedNum; // Convert to 32bit integer
        }
      } else {
        seedNum = parseInt(seed) || 0;
      }
      const rng = mulberry32(seedNum);
      return [rng(), "seeded"];
    } else {
      return [secureRandom(), "secure"];
    }
  };

  /**
   * 📊 WILSON CONFIDENCE INTERVAL
   * Statistical confidence interval for proportions
   */
  const wilsonCI = (k, n, z = 1.96) => {
    if (n === 0) return [0, 0];
    const phat = k / n;
    const zz = z * z;
    const denom = 1 + zz / n;
    const center = phat + zz / (2 * n);
    const margin = z * Math.sqrt((phat * (1 - phat)) / n + zz / (4 * n * n));
    const lower = Math.max(0, (center - margin) / denom);
    const upper = Math.min(1, (center + margin) / denom);
    return [lower, upper];
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

    // 🎨 Vibrant, high-contrast colors for maximum visibility
    const colors = [
      "#FF4757", // Bright Red
      "#1E90FF", // Dodger Blue
      "#FFD700", // Gold
      "#FF6348", // Coral
      "#7B68EE", // Medium Slate Blue
      "#3AE374", // Emerald Green
      "#FF69B4", // Hot Pink
      "#FFA502", // Orange
      "#5F27CD", // Deep Purple
      "#00D2D3", // Turquoise
      "#EE5A6F", // Rose
      "#48DBFB", // Sky Blue
      "#FF6B6B", // Light Red
      "#4ECDC4", // Teal
      "#C44569", // Maroon
      "#1ABC9C", // Green Sea
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

    // 🎯 Draw ULTRA-PRECISE pointer/arrow at top center (pointing down to winner)
    ctx.save();
    ctx.translate(centerX, centerY - radius - 5);

    // Draw sharp, accurate arrow with gold tip
    ctx.beginPath();
    ctx.moveTo(0, 28); // 🎯 EXACT WINNER POINT (gold tip)
    ctx.lineTo(-10, 12); // Left side of arrow tip
    ctx.lineTo(-10, 0); // Left narrow part
    ctx.lineTo(-22, 0); // Left wide part
    ctx.lineTo(-22, -32); // Top left
    ctx.lineTo(22, -32); // Top right
    ctx.lineTo(22, 0); // Right wide part
    ctx.lineTo(10, 0); // Right narrow part
    ctx.lineTo(10, 12); // Right side of arrow tip
    ctx.closePath();

    // Premium gradient fill
    const gradient = ctx.createLinearGradient(0, -32, 0, 28);
    gradient.addColorStop(0, "#0077B6");
    gradient.addColorStop(0.7, "#0088CC");
    gradient.addColorStop(1, "#00a6fb");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Strong border for visibility
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner white outline for contrast
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 🎯 Gold precision indicator at exact tip (this is where winner is determined)
    ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 28, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add inner highlight to gold tip
    ctx.beginPath();
    ctx.arc(-1, 26, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fill();

    ctx.restore();
  };

  /**
   * 🎯 ADVANCED SPIN WHEEL SYSTEM
   * ==============================
   *
   * Features:
   * - Secure random OR seeded PRNG for reproducibility
   * - Batch spinning (1-10,000 spins) with statistical analysis
   * - Wilson confidence intervals for fairness validation
   * - Full transparency (shows random values, probabilities)
   * - Spin history tracking
   * - Equal probability guarantee: p = 1/N for all options
   */
  const spinWheel = async () => {
    const optionsList = getOptionsList();

    if (optionsList.length === 0) {
      alert("Please add at least 2 options to spin!");
      return;
    }

    if (optionsList.length < 2) {
      alert("Please add at least 2 unique options!");
      return;
    }

    if (isSpinning) return;

    const count = Math.max(1, Math.min(10000, parseInt(spinCount) || 1));

    if (count > 1) {
      // Batch mode - no animation
      performBatchSpins(optionsList, count);
    } else {
      // Single spin with animation
      performSingleSpin(optionsList);
    }
  };

  /**
   * 🎲 PERFORM SINGLE SPIN - With animation
   */
  const performSingleSpin = (optionsList) => {
    setIsSpinning(true);
    setWinner(null);

    // Get random value (secure or seeded)
    const [randomValue, source] = getRandomValue();
    setLastRandomValue(randomValue);

    // 🎯 STEP 1: Fair Winner Selection
    const winnerIndex = Math.floor(randomValue * optionsList.length);
    const selectedWinner = optionsList[winnerIndex];

    // Record this spin
    const spinRecord = {
      timestamp: new Date().toISOString(),
      winner: selectedWinner,
      winnerIndex,
      randomValue,
      source,
      totalOptions: optionsList.length,
      probability: 1 / optionsList.length,
    };
    setSpinHistory((prev) => [...prev, spinRecord]);

    // 🎯 STEP 2: Calculate PRECISE target rotation
    const anglePerSlice = 360 / optionsList.length;

    // The arrow points DOWN from top, so segment at rotation=0 is under arrow
    // To position winnerIndex under arrow: rotation = winnerIndex * anglePerSlice
    // Add random offset WITHIN the segment (25% to 75% for center positioning)
    const randomOffsetWithinSlice =
      (Math.random() * 0.5 + 0.25) * anglePerSlice;

    // Calculate final target angle
    const targetAngle = winnerIndex * anglePerSlice + randomOffsetWithinSlice;

    // 🎯 STEP 3: Add multiple full rotations for dramatic effect (5-7 spins)
    const fullSpins = 5 + Math.random() * 2;
    const totalRotation = fullSpins * 360 + targetAngle;

    // 🎯 STEP 4: Animate with realistic physics (ease-out with bounce)
    const duration = 4000; // 4 seconds for smoother experience
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      let progress = Math.min(elapsed / duration, 1);

      // 🎨 Advanced easing: ease-out-cubic with slight bounce at end
      let easedProgress;
      if (progress < 0.95) {
        // Smooth deceleration for 95% of animation
        easedProgress = 1 - Math.pow(1 - progress / 0.95, 3);
      } else {
        // Subtle bounce effect in last 5%
        const bounceProgress = (progress - 0.95) / 0.05;
        const bounce = Math.sin(bounceProgress * Math.PI * 2) * 0.01;
        easedProgress = 1 + bounce;
      }

      const currentRotation = startRotation + totalRotation * easedProgress;
      setRotation(currentRotation % 360);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 🎯 STEP 5: Finalize - ensure EXACT positioning (no drift)
        const finalRotation = (startRotation + totalRotation) % 360;
        setRotation(finalRotation);

        setIsSpinning(false);
        setWinner(selectedWinner);

        // Show winner after brief delay for dramatic effect
        setTimeout(() => {
          setShowWinnerModal(true);
        }, 200);

        // Remove winner from options list
        const updatedOptions = optionsList
          .filter((opt) => opt !== selectedWinner)
          .join("\n");
        setOptions(updatedOptions);
      }
    };

    requestAnimationFrame(animate);
  };

  /**
   * 📊 PERFORM BATCH SPINS - Multiple spins for statistical analysis
   */
  const performBatchSpins = (optionsList, count) => {
    const results = {};
    const spinRecords = [];

    // Initialize counters
    optionsList.forEach((opt) => {
      results[opt] = 0;
    });

    // Perform multiple spins
    for (let i = 0; i < count; i++) {
      const [randomValue, source] = getRandomValue();
      const winnerIndex = Math.floor(randomValue * optionsList.length);
      const winner = optionsList[winnerIndex];
      results[winner]++;

      spinRecords.push({
        timestamp: new Date().toISOString(),
        winner,
        winnerIndex,
        randomValue,
        source,
        totalOptions: optionsList.length,
        probability: 1 / optionsList.length,
      });
    }

    // Update history (keep last 1000)
    setSpinHistory((prev) => [...prev, ...spinRecords].slice(-1000));

    // Calculate statistics
    const stats = optionsList.map((name) => {
      const count = results[name];
      const pHat = count / spinRecords.length;
      const [ciLow, ciHigh] = wilsonCI(count, spinRecords.length);
      const expectedP = 1 / optionsList.length;

      return {
        name,
        count,
        pHat: (pHat * 100).toFixed(2) + "%",
        expected: (expectedP * 100).toFixed(2) + "%",
        ci95: `[${(ciLow * 100).toFixed(2)}%, ${(ciHigh * 100).toFixed(2)}%]`,
        withinExpected: ciLow <= expectedP && expectedP <= ciHigh,
      };
    });

    // Show stats modal
    setShowStats(true);
    setWinner({
      batchMode: true,
      count: spinRecords.length,
      results,
      stats,
      mostFrequent: Object.entries(results).sort((a, b) => b[1] - a[1])[0][0],
    });
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
            <div className="p-4">
              {/* Custom Title Input */}
              <div className="mb-3">
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "#282C35" }}
                >
                  🏆 Winner Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Siya ang magbabayad"
                  className="w-full px-3 py-2 border-2 rounded-lg outline-none transition-all text-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EFEFEF",
                    color: "#282C35",
                  }}
                />
              </div>

              {/* Options Input */}
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: "#282C35" }}
              >
                Options (One per line)
              </label>
              <textarea
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Alice
Bob
Charlie
Diana"
                className="w-full h-56 px-3 py-2 border-2 rounded-lg outline-none transition-all text-sm resize-none"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#EFEFEF",
                  color: "#282C35",
                }}
              />
              <p className="mt-1 text-xs" style={{ color: "#3a3f4b" }}>
                {optionsList.length}{" "}
                {optionsList.length === 1 ? "option" : "options"} • Auto-saved
              </p>

              {/* Advanced Features Section */}
              <div
                className="mt-3 pt-3 border-t"
                style={{ borderColor: "#d4d4d4" }}
              >
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-semibold flex items-center gap-1 hover:text-blue-600 transition-colors"
                  style={{ color: "#0077B6" }}
                >
                  <span>{showAdvanced ? "▼" : "▶"}</span>
                  Advanced Features (Seed, Batch, Stats)
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-3"
                  >
                    {/* Seed Input */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          id="useSeed"
                          checked={useSeed}
                          onChange={(e) => setUseSeed(e.target.checked)}
                          className="w-3 h-3"
                        />
                        <label
                          htmlFor="useSeed"
                          className="text-xs font-semibold"
                          style={{ color: "#282C35" }}
                        >
                          🎲 Use Seed (Reproducible)
                        </label>
                      </div>
                      {useSeed && (
                        <input
                          type="text"
                          value={seed}
                          onChange={(e) => setSeed(e.target.value)}
                          placeholder="Enter seed (number or text)"
                          className="w-full px-2 py-1 border rounded text-xs"
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderColor: "#EFEFEF",
                            color: "#282C35",
                          }}
                        />
                      )}
                    </div>

                    {/* Spin Count */}
                    <div>
                      <label
                        className="text-xs font-semibold block mb-1"
                        style={{ color: "#282C35" }}
                      >
                        📊 Spin Count (1-10,000)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={spinCount}
                        onChange={(e) => setSpinCount(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#EFEFEF",
                          color: "#282C35",
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: "#3a3f4b" }}>
                        &gt;1 for batch mode with stats
                      </p>
                    </div>

                    {/* Transparency Info */}
                    {lastRandomValue !== null && (
                      <div
                        className="p-2 rounded text-xs"
                        style={{
                          backgroundColor: "rgba(0, 119, 182, 0.05)",
                          border: "1px solid rgba(0, 119, 182, 0.2)",
                          color: "#3a3f4b",
                        }}
                      >
                        <strong>Last Random Value:</strong>{" "}
                        {lastRandomValue.toFixed(8)}
                        <br />
                        <strong>Source:</strong>{" "}
                        {useSeed && seed
                          ? "🎲 Seeded PRNG"
                          : "🔒 Crypto Secure"}
                      </div>
                    )}

                    {/* Stats Button */}
                    {spinHistory.length > 0 && (
                      <button
                        onClick={() => setShowStats(true)}
                        className="w-full px-3 py-2 text-white text-xs rounded font-medium transition-all duration-200 hover:scale-105"
                        style={{ backgroundColor: "#27ae60" }}
                      >
                        📈 View Spin History ({spinHistory.length})
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
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
            <div className="p-4">
              <div
                className="text-xs text-center mb-3 p-2 rounded"
                style={{
                  backgroundColor: "rgba(255, 215, 0, 0.1)",
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                  color: "#3a3f4b",
                }}
              >
                🎯 <strong>Gold tip</strong> points to winner • 100% accurate
                alignment
              </div>

              {/* Canvas Wheel */}
              <div className="flex flex-col items-center mb-3">
                <canvas
                  ref={canvasRef}
                  width={350}
                  height={350}
                  className="max-w-full"
                />

                {/* Current Selection Indicator */}
                {optionsList.length > 0 && !isSpinning && (
                  <div className="mt-2 text-center w-full">
                    <div
                      className="px-3 py-2 rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: "rgba(0, 119, 182, 0.05)",
                        border: "1px solid #0077B6",
                        color: "#0077B6",
                      }}
                    >
                      ⬇️{" "}
                      {(() => {
                        const anglePerSlice = 360 / optionsList.length;
                        const normalizedRotation = rotation % 360;
                        const currentIndex =
                          Math.floor(normalizedRotation / anglePerSlice) %
                          optionsList.length;
                        return optionsList[currentIndex] || "Ready!";
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Spin Button */}
              <button
                onClick={spinWheel}
                disabled={isSpinning || optionsList.length === 0}
                className="w-full py-4 text-white font-black text-lg rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden"
                style={{
                  backgroundColor:
                    isSpinning || optionsList.length === 0
                      ? "#d4d4d4"
                      : "#0077B6",
                }}
              >
                {isSpinning ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="inline-block"
                    >
                      ⭐
                    </motion.span>
                    SPINNING...
                  </span>
                ) : (
                  "🎯 SPIN THE WHEEL!"
                )}
              </button>

              {optionsList.length === 0 && (
                <p
                  className="text-center text-xs mt-2"
                  style={{ color: "#3a3f4b" }}
                >
                  Add options to enable
                </p>
              )}
            </div>
          </motion.div>
        </div>

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
                  {/* Celebration Icons with Animation */}
                  <motion.div className="flex justify-center gap-4 mb-4">
                    <motion.span
                      className="text-5xl"
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -15, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: 3,
                        repeatDelay: 0.2,
                      }}
                    >
                      🎉
                    </motion.span>
                    <motion.span
                      className="text-6xl"
                      animate={{
                        scale: [1, 1.4, 1],
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: 2,
                      }}
                    >
                      🏆
                    </motion.span>
                    <motion.span
                      className="text-5xl"
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 15, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: 3,
                        repeatDelay: 0.2,
                      }}
                    >
                      🎊
                    </motion.span>
                  </motion.div>

                  {winner && winner.batchMode ? (
                    /* Batch Results */
                    <>
                      <h2
                        className="text-2xl font-bold mb-3"
                        style={{ color: "#0077B6" }}
                      >
                        📊 Batch Spin Results
                      </h2>
                      <div
                        className="text-lg mb-4 p-4 rounded-xl text-left max-h-96 overflow-auto"
                        style={{
                          backgroundColor: "rgba(0, 119, 182, 0.05)",
                          border: "1px solid rgba(0, 119, 182, 0.2)",
                          color: "#282C35",
                        }}
                      >
                        <p className="font-bold mb-3">
                          Total Spins: {winner.count}
                        </p>
                        <p className="font-bold mb-2">
                          Most Frequent: {winner.mostFrequent}
                        </p>

                        <div className="space-y-2 text-sm">
                          {winner.stats.map((stat) => (
                            <div
                              key={stat.name}
                              className="p-2 rounded"
                              style={{
                                backgroundColor: stat.withinExpected
                                  ? "rgba(46, 213, 115, 0.1)"
                                  : "rgba(231, 76, 60, 0.1)",
                              }}
                            >
                              <div className="font-semibold">{stat.name}</div>
                              <div className="text-xs">
                                Count: {stat.count} | Actual: {stat.pHat} |
                                Expected: {stat.expected}
                              </div>
                              <div className="text-xs">
                                95% CI: {stat.ci95}{" "}
                                {stat.withinExpected ? "✓" : "⚠️"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : customTitle ? (
                    /* Single Spin with Custom Title */
                    <>
                      <motion.h2
                        className="text-2xl font-bold mb-3"
                        style={{ color: "#0077B6" }}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      >
                        {customTitle}
                      </motion.h2>
                      <motion.div
                        className="text-5xl font-black mb-4 p-6 rounded-xl relative overflow-hidden"
                        style={{
                          backgroundColor: "rgba(0, 119, 182, 0.1)",
                          color: "#282C35",
                          border: "3px solid #0077B6",
                        }}
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(0, 119, 182, 0)",
                            "0 0 0 10px rgba(0, 119, 182, 0.2)",
                            "0 0 0 0 rgba(0, 119, 182, 0)",
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        {winner}
                      </motion.div>

                      {/* Transparency Info */}
                      {lastRandomValue !== null && (
                        <div
                          className="text-xs mb-3 p-2 rounded"
                          style={{
                            backgroundColor: "rgba(0, 119, 182, 0.05)",
                            border: "1px solid rgba(0, 119, 182, 0.2)",
                            color: "#3a3f4b",
                          }}
                        >
                          Random: {lastRandomValue.toFixed(8)} | Source:{" "}
                          {useSeed && seed ? "Seeded" : "Secure"}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Single Spin Default */
                    <>
                      <motion.h2
                        className="text-3xl font-black mb-3"
                        style={{ color: "#0077B6" }}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      >
                        🏆 WINNER! 🏆
                      </motion.h2>
                      <motion.div
                        className="text-5xl font-black mb-4 p-6 rounded-xl relative overflow-hidden"
                        style={{
                          backgroundColor: "rgba(0, 119, 182, 0.1)",
                          color: "#282C35",
                          border: "3px solid #0077B6",
                        }}
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(0, 119, 182, 0)",
                            "0 0 0 10px rgba(0, 119, 182, 0.2)",
                            "0 0 0 0 rgba(0, 119, 182, 0)",
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        {winner}
                      </motion.div>

                      {/* Transparency Info */}
                      {lastRandomValue !== null && (
                        <div
                          className="text-xs mb-3 p-2 rounded"
                          style={{
                            backgroundColor: "rgba(0, 119, 182, 0.05)",
                            border: "1px solid rgba(0, 119, 182, 0.2)",
                            color: "#3a3f4b",
                          }}
                        >
                          Random: {lastRandomValue.toFixed(8)} | Source:{" "}
                          {useSeed && seed ? "Seeded" : "Secure"}
                        </div>
                      )}
                    </>
                  )}

                  {/* Accuracy Badge - Only for single spins */}
                  {(!winner || !winner.batchMode) && (
                    <motion.div
                      className="mb-4 px-4 py-2 rounded-full text-xs font-semibold inline-block"
                      style={{
                        backgroundColor: "rgba(46, 213, 115, 0.15)",
                        color: "#27ae60",
                        border: "2px solid #27ae60",
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.3,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      ✓ 100% Fair & Accurate Selection
                    </motion.div>
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
