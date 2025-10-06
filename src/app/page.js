"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const tools = [
    {
      id: 1,
      title: "Markdown to Word",
      description:
        "Convert Markdown documents to professionally formatted Word (DOCX) files with automatic section numbering and formatting",
      icon: "📄",
      link: "/tool/text-to-word",
      features: [
        "Auto-numbered sections",
        "GFM table support",
        "Formal letter format",
        "Custom filenames",
      ],
    },
    {
      id: 2,
      title: "Image to Text (OCR)",
      description:
        "Extract text from images using powerful OCR technology. Supports 100+ languages, completely free and client-side",
      icon: "🖼️",
      link: "/tool/image-to-text",
      features: [
        "Multi-language support",
        "Client-side processing",
        "Editable output",
        "Copy & download",
      ],
    },
    {
      id: 3,
      title: "Word & Character Counter",
      description:
        "Real-time text analysis tool that counts words, characters, sentences, lines, and estimates reading time as you type",
      icon: "🔢",
      link: "/tool/word-counter",
      features: [
        "Real-time counting",
        "Sentence & paragraph analysis",
        "Reading time estimate",
        "Copy formatted stats",
      ],
    },
    {
      id: 4,
      title: "Email to Markdown",
      description:
        "Transform messy email content into clean, structured Markdown format. Perfect for engineers and PMs working with documentation",
      icon: "📧",
      link: "/tool/email-to-markdown",
      features: [
        "Clean HTML tags",
        "Smart list conversion",
        "Quote handling",
        "Instant formatting",
      ],
    },
    {
      id: 5,
      title: "Spin the Wheel Picker",
      description:
        "Fun and fair random selection tool. Add names or options, spin the wheel, and let chance decide the winner!",
      icon: "🎡",
      link: "/tool/spin-wheel",
      features: [
        "100% random selection",
        "Visual spinning animation",
        "Auto-save options",
        "Exciting winner reveal",
      ],
    },
    {
      id: 6,
      title: "FlowDoc Generator",
      description:
        "Transform structured documentation into beautiful flowcharts using rule-based parsing. Perfect for technical documentation and process flows.",
      icon: "📊",
      link: "/tool/flowdoc-generator",
      features: [
        "100% rule-based accuracy",
        "Mermaid.js rendering",
        "Complex logic support",
        "Instant visualization",
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #EFEFEF 100%)",
      }}
    >
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="text-6xl mb-4 inline-block">🚀</span>
          </motion.div>
          <h1
            className="text-5xl md:text-6xl font-black mb-6"
            style={{ color: "#282C35" }}
          >
            <span style={{ color: "#0077B6" }}>Boost</span> Your Workflow
          </h1>
          <p
            className="text-xl md:text-2xl font-medium mb-4"
            style={{ color: "#282C35" }}
          >
            Productivity Tools Suite
          </p>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#3a3f4b" }}>
            Free, powerful, and privacy-focused tools to supercharge your
            productivity. All processing happens in your browser - no server
            costs, no data upload.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tools.map((tool, index) => (
            <motion.div key={tool.id} variants={itemVariants}>
              <Link href={tool.link} className="group block h-full">
                <div
                  className="relative h-full rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EFEFEF",
                  }}
                >
                  {/* Hover Effect Border */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{
                      background: "linear-gradient(135deg, #0077B6, #00a6fb)",
                    }}
                  />
                  <div
                    className="absolute inset-[2px] rounded-2xl z-0"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />

                  {/* Content */}
                  <div className="relative z-10 p-8 flex flex-col h-full">
                    {/* Icon */}
                    <div className="mb-6">
                      <div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                        style={{ backgroundColor: "#0077B6" }}
                      >
                        {tool.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h2
                      className="text-2xl font-bold mb-3"
                      style={{ color: "#0077B6" }}
                    >
                      {tool.title}
                    </h2>

                    {/* Description */}
                    <p
                      className="mb-6 leading-relaxed flex-grow"
                      style={{ color: "#3a3f4b" }}
                    >
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {tool.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "#282C35" }}
                        >
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="#0077B6"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div
                      className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                      style={{ backgroundColor: "#0077B6" }}
                    >
                      <span>Open Tool</span>
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2
            className="text-3xl font-bold text-center mb-8"
            style={{ color: "#282C35" }}
          >
            Why Choose Our Tools?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div
              className="p-6 rounded-xl shadow-lg border text-center"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#EFEFEF" }}
            >
              <div className="text-4xl mb-3">🔒</div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: "#282C35" }}
              >
                Privacy First
              </h3>
              <p className="text-sm" style={{ color: "#3a3f4b" }}>
                All processing happens locally in your browser. Your data never
                leaves your device.
              </p>
            </div>

            <div
              className="p-6 rounded-xl shadow-lg border text-center"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#EFEFEF" }}
            >
              <div className="text-4xl mb-3">💰</div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: "#282C35" }}
              >
                100% Free
              </h3>
              <p className="text-sm" style={{ color: "#3a3f4b" }}>
                No hidden costs, no subscriptions, no API keys required. Forever
                free.
              </p>
            </div>

            <div
              className="p-6 rounded-xl shadow-lg border text-center"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#EFEFEF" }}
            >
              <div className="text-4xl mb-3">⚡</div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: "#282C35" }}
              >
                Lightning Fast
              </h3>
              <p className="text-sm" style={{ color: "#3a3f4b" }}>
                Client-side processing means instant results with no server
                delays.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div
            className="rounded-2xl p-8 shadow-2xl max-w-3xl mx-auto"
            style={{ backgroundColor: "#0077B6" }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Boost Your Productivity?
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Choose a tool above and start working smarter, not harder!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.link}
                  className="px-5 py-3 bg-white font-bold rounded-xl transition-all duration-200 hover:shadow-xl hover:scale-105 text-sm md:text-base"
                  style={{ color: "#0077B6" }}
                >
                  {tool.icon} {tool.title.replace(" Picker", "")}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer
          className="mt-16 text-center text-sm"
          style={{ color: "#3a3f4b" }}
        >
          <p>
            Built with ❤️ using Next.js, Tailwind CSS, and open-source
            technologies
          </p>
          <p className="mt-2">
            No data collection • No tracking • 100% Privacy Focused
          </p>
        </footer>
      </div>
    </div>
  );
}
