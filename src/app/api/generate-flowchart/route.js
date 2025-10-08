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
  let subgraphCounter = 0;
  let inSubgraph = false;
  let parallelNodes = [];

  // Helper function to get next ID
  const getNextId = () => {
    const id = `node${idCounter}`;
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
    } else if (line.startsWith("END:")) {
      const text = cleanText(line.substring(4));
      currentId = getNextId();
      mermaidCode += `${currentId}(("${text}"))\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
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
    } else if (line.startsWith("PROCESS:")) {
      const text = cleanText(line.substring(8));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("SUBPROCESS:")) {
      const text = cleanText(line.substring(11));
      currentId = getNextId();
      mermaidCode += `${currentId}[["${text}"]]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("INPUT:")) {
      const text = cleanText(line.substring(6));
      currentId = getNextId();
      mermaidCode += `${currentId}[/"${text}"/]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("OUTPUT:")) {
      const text = cleanText(line.substring(7));
      currentId = getNextId();
      mermaidCode += `${currentId}[/"${text}"/]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("DATABASE:")) {
      const text = cleanText(line.substring(9));
      currentId = getNextId();
      mermaidCode += `${currentId}[("${text}")]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("DECISION:") || line.startsWith("IF:")) {
      const text = cleanText(
        line.substring(line.startsWith("DECISION:") ? 9 : 3)
      );
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

      if (
        text.startsWith("STEP:") ||
        text.startsWith("PROCESS:") ||
        text.startsWith("SUBPROCESS:") ||
        text.startsWith("INPUT:") ||
        text.startsWith("OUTPUT:") ||
        text.startsWith("DATABASE:")
      ) {
        // Handle nested commands in YES branch
        i--; // Go back one line
        continue;
      }

      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (decisionNodeId) {
        mermaidCode += `${decisionNodeId} -- Yes --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("  NO:") || line.startsWith("NO:")) {
      const text = cleanText(line.replace(/^(\s*NO:\s*)/, ""));

      if (
        text.startsWith("STEP:") ||
        text.startsWith("PROCESS:") ||
        text.startsWith("SUBPROCESS:") ||
        text.startsWith("INPUT:") ||
        text.startsWith("OUTPUT:") ||
        text.startsWith("DATABASE:")
      ) {
        // Handle nested commands in NO branch
        i--; // Go back one line
        continue;
      }

      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (decisionNodeId) {
        mermaidCode += `${decisionNodeId} -- No --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("PARALLEL START:")) {
      const text = cleanText(line.substring(15));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      parallelNodes = [currentId];
      previousId = null; // Clear previous to start parallel paths
    } else if (line.startsWith("PARALLEL PATH:")) {
      const text = cleanText(line.substring(14));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (parallelNodes.length > 0) {
        mermaidCode += `${parallelNodes[0]} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("PARALLEL END:")) {
      const text = cleanText(line.substring(13));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      parallelNodes = [];
      previousId = currentId;
    } else if (line.startsWith("GROUP START:")) {
      const groupName = cleanText(line.substring(12));
      subgraphCounter++;
      mermaidCode += `subgraph SG${subgraphCounter}["${groupName}"]\n`;
      inSubgraph = true;
    } else if (line.startsWith("GROUP END")) {
      mermaidCode += `end\n`;
      inSubgraph = false;
    } else if (line.startsWith("DOCUMENT:")) {
      const text = cleanText(line.substring(9));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (
      line.startsWith("MULTI DOCUMENT:") ||
      line.startsWith("MULTIPLE DOCUMENTS:")
    ) {
      const text = cleanText(
        line.substring(line.startsWith("MULTI DOCUMENT:") ? 15 : 20)
      );
      currentId = getNextId();
      mermaidCode += `${currentId}[["${text}"]]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("MANUAL INPUT:")) {
      const text = cleanText(line.substring(13));
      currentId = getNextId();
      mermaidCode += `${currentId}[/"${text}"/]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("PREPARATION:")) {
      const text = cleanText(line.substring(12));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("DELAY:")) {
      const text = cleanText(line.substring(6));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (
      line.startsWith("STORED DATA:") ||
      line.startsWith("DATA STORAGE:")
    ) {
      const text = cleanText(
        line.substring(line.startsWith("STORED DATA:") ? 12 : 13)
      );
      currentId = getNextId();
      mermaidCode += `${currentId}[("${text}")]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("INTERNAL STORAGE:")) {
      const text = cleanText(line.substring(17));
      currentId = getNextId();
      mermaidCode += `${currentId}[("${text}")]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("DISPLAY:")) {
      const text = cleanText(line.substring(8));
      currentId = getNextId();
      mermaidCode += `${currentId}[/"${text}"\\]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("MERGE:")) {
      const text = cleanText(line.substring(6));
      currentId = getNextId();
      mermaidCode += `${currentId}{"${text}"}\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("CONNECTOR:")) {
      const text = cleanText(line.substring(10));
      currentId = getNextId();
      mermaidCode += `${currentId}(("${text}"))\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("OR:")) {
      const text = cleanText(line.substring(3));
      currentId = getNextId();
      mermaidCode += `${currentId}{"${text}"}\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("SUMMING JUNCTION:")) {
      const text = cleanText(line.substring(17));
      currentId = getNextId();
      mermaidCode += `${currentId}(("${text}"))\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("COLLATE:")) {
      const text = cleanText(line.substring(8));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("SORT:")) {
      const text = cleanText(line.substring(5));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("SUBROUTINE:")) {
      const text = cleanText(line.substring(11));
      currentId = getNextId();
      mermaidCode += `${currentId}[["${text}"]]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("MANUAL LOOP:")) {
      const text = cleanText(line.substring(12));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("LOOP LIMIT:")) {
      const text = cleanText(line.substring(11));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("OFF PAGE:") || line.startsWith("OFFPAGE:")) {
      const text = cleanText(
        line.substring(line.startsWith("OFF PAGE:") ? 9 : 8)
      );
      currentId = getNextId();
      mermaidCode += `${currentId}(("${text}"))\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    } else if (line.startsWith("COMMENT:") || line.startsWith("NOTE:")) {
      const text = cleanText(
        line.substring(line.startsWith("COMMENT:") ? 8 : 5)
      );
      currentId = getNextId();
      mermaidCode += `${currentId}>"${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (previousId) {
        mermaidCode += `${previousId} -.-> ${currentId}\n`;
      }
    } else if (line.startsWith("GO TO:")) {
      const targetText = cleanText(line.substring(6));
      const targetId = nodeMap.get(targetText.toLowerCase());

      if (targetId && previousId) {
        mermaidCode += `${previousId} --> ${targetId}\n`;
      }
    } else if (line.startsWith("  STEP:")) {
      // Indented STEP (usually after YES/NO)
      const text = cleanText(line.substring(7));
      currentId = getNextId();
      mermaidCode += `${currentId}["${text}"]\n`;
      nodeMap.set(text.toLowerCase(), currentId);

      if (decisionNodeId && previousId === decisionNodeId) {
        mermaidCode += `${decisionNodeId} --> ${currentId}\n`;
      } else if (previousId) {
        mermaidCode += `${previousId} --> ${currentId}\n`;
      }
      previousId = currentId;
    }
  }

  return mermaidCode;
}

// Sample documentation for testing
export const SAMPLE_DOCUMENTATION = `START: Enhanced E-Commerce System
INPUT: User enters product search
DATABASE: Query product database
DECISION: Products found?
  YES: OUTPUT: Display search results
  NO: OUTPUT: Show no results message
PROCESS: User adds item to cart
SUBPROCESS: Calculate shipping cost
DATABASE: Update cart in database
IF: User ready to checkout?
  YES: STEP: Proceed to checkout
  NO: STEP: Continue shopping
PARALLEL START: Process order
PARALLEL PATH: Send confirmation email
PARALLEL PATH: Update inventory
PARALLEL PATH: Process payment
PARALLEL END: All tasks completed
GROUP START: Order Fulfillment
STEP: Pick items from warehouse
STEP: Package items
STEP: Generate shipping label
GROUP END
OUTPUT: Order shipped notification
COMMENT: Customer receives tracking info
END: Order Complete`;
