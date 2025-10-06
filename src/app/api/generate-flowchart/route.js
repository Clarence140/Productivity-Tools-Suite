import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { documentation } = await request.json();

    if (!documentation || typeof documentation !== "string") {
      return NextResponse.json(
        { error: "Documentation text is required" },
        { status: 400 }
      );
    }

    // Generate Mermaid flowchart code
    const mermaidCode = generateMermaidCode(documentation);

    return NextResponse.json({ mermaid_code: mermaidCode });
  } catch (error) {
    console.error("Error generating flowchart:", error);
    return NextResponse.json(
      { error: "Failed to generate flowchart" },
      { status: 500 }
    );
  }
}

function generateMermaidCode(inputText) {
  const lines = inputText.trim().split("\n");
  let mermaidCode = "graph TD\n";
  let currentId = "A";
  let previousId = null;
  let decisionNodeId = null;
  let nodeMap = new Map(); // Track text to ID mapping for GO TO
  let idCounter = 0;

  // Helper function to get next ID
  const getNextId = () => {
    const id = String.fromCharCode(65 + (idCounter % 26)); // A-Z
    idCounter++;
    return id;
  };

  // Helper function to clean text
  const cleanText = (text) => {
    return text.replace(/[{}[\]()]/g, "").trim();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    if (line.startsWith("START:")) {
      const text = cleanText(line.substring(6));
      currentId = getNextId();
      mermaidCode += `${currentId}(("${text}"))\n`;
      nodeMap.set(text.toLowerCase(), currentId);
      previousId = currentId;
    } else if (line.startsWith("STEP:")) {
      const text = cleanText(line.substring(5));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("IF:")) {
      const text = cleanText(line.substring(3));
      currentId = getNextId();
      mermaidCode += `${currentId}{"${text}"}\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      decisionNodeId = currentId;
      previousId = currentId;
    } else if (line.startsWith("  YES:") || line.startsWith("YES:")) {
      const text = cleanText(line.replace(/^(\s*YES:\s*)/, ""));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (decisionNodeId) {
        mermaidCode += `${decisionNodeId} -- Yes --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("  NO:") || line.startsWith("NO:")) {
      const text = cleanText(line.replace(/^(\s*NO:\s*)/, ""));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (decisionNodeId) {
        mermaidCode += `${decisionNodeId} -- No --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("GO TO:")) {
      const targetText = cleanText(line.substring(6));
      const targetId = nodeMap.get(targetText.toLowerCase());

      if (targetId && previousId) {
        mermaidCode += `${previousId} --> ${targetId}\n`;
      }
    } else if (line.startsWith("END:")) {
      const text = cleanText(line.substring(4));
      currentId = getNextId();
      mermaidCode += `${currentId}(("${text}"))\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
    }
  }

  return mermaidCode;
}

// Sample documentation for testing
export const SAMPLE_DOCUMENTATION = `START: User Checkout Process
STEP: Verify inventory
IF: Item is in stock?
  YES: STEP: Process payment
  NO: STEP: Notify out of stock
STEP: Ship item
END: Process Completed`;
