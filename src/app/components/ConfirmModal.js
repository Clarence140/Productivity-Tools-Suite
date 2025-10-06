"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient top bar */}
            <div
              className="h-1"
              style={{
                background: "linear-gradient(90deg, #0077B6, #00a6fb)",
              }}
            />

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  backgroundColor: "rgba(0, 119, 182, 0.1)",
                }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="#0077B6"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3
                className="text-xl font-bold text-center mb-2"
                style={{ color: "#282C35" }}
              >
                {title || "Confirm Action"}
              </h3>

              {/* Message */}
              <p className="text-center mb-6" style={{ color: "#3a3f4b" }}>
                {message || "Are you sure you want to proceed?"}
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: "#EFEFEF",
                    color: "#282C35",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                  style={{
                    backgroundColor: "#0077B6",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


