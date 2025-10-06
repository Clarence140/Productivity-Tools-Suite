import { NextResponse } from "next/server";
import { marked } from "marked";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  AlignmentType as NumberingAlignmentType,
} from "docx";

// Configure marked to parse GitHub Flavored Markdown
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Helper function to parse HTML table into structured data
function parseHTMLTable(html) {
  const tableMatch = html.match(/<table>([\s\S]*?)<\/table>/);
  if (!tableMatch) return null;

  const rows = [];
  const rowMatches = tableMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g);

  for (const rowMatch of rowMatches) {
    const cells = [];
    const cellMatches = rowMatch[1].matchAll(
      /<th>([\s\S]*?)<\/th>|<td>([\s\S]*?)<\/td>/g
    );

    for (const cellMatch of cellMatches) {
      const cellContent = (cellMatch[1] || cellMatch[2] || "").trim();
      // Remove HTML tags and decode entities
      const cleanContent = cellContent
        .replace(/<[^>]*>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      cells.push(cleanContent);
    }

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

// Helper function to create a Word table from data
function createWordTable(tableData) {
  if (!tableData || tableData.length === 0) return null;

  const rows = tableData.map((rowData, rowIndex) => {
    return new TableRow({
      children: rowData.map((cellText) => {
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  bold: rowIndex === 0, // Make header row bold
                  size: rowIndex === 0 ? 22 : 20, // Slightly larger for headers
                }),
              ],
            }),
          ],
          shading:
            rowIndex === 0
              ? {
                  fill: "E7E6E6", // Light gray background for header
                }
              : undefined,
        });
      }),
    });
  });

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });
}

// Helper function to extract text content from HTML
function extractTextFromHTML(html) {
  return html
    .replace(/<code>(.*?)<\/code>/g, "$1")
    .replace(/<strong>(.*?)<\/strong>/g, "$1")
    .replace(/<em>(.*?)<\/em>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Documentation format - Professional, structured, with proper numbering
function convertToDocumentationFormat(markdownText) {
  const html = marked.parse(markdownText);
  const elements = [];

  // Add document header with better spacing
  elements.push(
    new Paragraph({
      text: "",
      spacing: { after: 240 },
    })
  );

  const blocks = html.split(/(?=<h[1-3]|<p|<ul|<ol|<table|<pre)/);
  let sectionNumber = 0;
  let subsectionNumber = 0;

  for (const block of blocks) {
    if (!block.trim()) continue;

    // Handle H1 headings - Main sections with numbering
    if (block.startsWith("<h1>")) {
      sectionNumber++;
      subsectionNumber = 0;
      const text = extractTextFromHTML(block);

      // Add extra spacing before H1 (except first one)
      if (sectionNumber > 1) {
        elements.push(
          new Paragraph({
            text: "",
            spacing: { after: 200 },
          })
        );
      }

      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${sectionNumber}. ${text}`,
              bold: true,
              size: 32,
              color: "1a1a1a",
            }),
          ],
          spacing: {
            before: 480,
            after: 280,
          },
          border: {
            bottom: {
              color: "CCCCCC",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );
    }
    // Handle H2 headings - Subsections with numbering
    else if (block.startsWith("<h2>")) {
      subsectionNumber++;
      const text = extractTextFromHTML(block);

      // Add spacing before H2
      elements.push(
        new Paragraph({
          text: "",
          spacing: { after: 80 },
        })
      );

      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${sectionNumber}.${subsectionNumber} ${text}`,
              bold: true,
              size: 28,
              color: "2c2c2c",
            }),
          ],
          spacing: {
            before: 360,
            after: 200,
          },
        })
      );
    }
    // Handle H3 headings
    else if (block.startsWith("<h3>")) {
      const text = extractTextFromHTML(block);

      // Add spacing before H3
      elements.push(
        new Paragraph({
          text: "",
          spacing: { after: 60 },
        })
      );

      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: text,
              bold: true,
              size: 24,
              color: "404040",
            }),
          ],
          spacing: {
            before: 280,
            after: 140,
          },
        })
      );
    }
    // Handle tables with better formatting
    else if (block.includes("<table>")) {
      const tableData = parseHTMLTable(block);
      if (tableData) {
        const table = createWordTable(tableData);
        if (table) {
          elements.push(
            new Paragraph({
              text: "",
              spacing: { before: 160, after: 80 },
            })
          );
          elements.push(table);
          elements.push(
            new Paragraph({
              text: "",
              spacing: { before: 80, after: 160 },
            })
          );
        }
      }
    }
    // Handle code blocks
    else if (block.includes("<pre>")) {
      const codeMatch = block.match(/<code[^>]*>([\s\S]*?)<\/code>/);
      if (codeMatch) {
        const codeText = codeMatch[1]
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeText,
                font: "Courier New",
                size: 20,
              }),
            ],
            shading: {
              fill: "F5F5F5",
            },
            spacing: {
              before: 160,
              after: 160,
            },
            indent: {
              left: convertInchesToTwip(0.5),
            },
          })
        );
      }
    }
    // Handle unordered lists
    else if (block.includes("<ul>")) {
      // Add spacing before list
      elements.push(
        new Paragraph({
          text: "",
          spacing: { after: 80 },
        })
      );

      const items = block.matchAll(/<li>(.*?)<\/li>/g);
      const itemsArray = Array.from(items);
      itemsArray.forEach((item, index) => {
        const text = extractTextFromHTML(item[1]);
        elements.push(
          new Paragraph({
            text,
            bullet: {
              level: 0,
            },
            spacing: {
              before: 60,
              after: 60,
              line: 320,
            },
            indent: {
              left: convertInchesToTwip(0.25),
            },
          })
        );
      });

      // Add spacing after list
      elements.push(
        new Paragraph({
          text: "",
          spacing: { after: 120 },
        })
      );
    }
    // Handle ordered lists
    else if (block.includes("<ol>")) {
      // Add spacing before list
      elements.push(
        new Paragraph({
          text: "",
          spacing: { after: 80 },
        })
      );

      const items = block.matchAll(/<li>(.*?)<\/li>/g);
      const itemsArray = Array.from(items);
      itemsArray.forEach((item, index) => {
        const text = extractTextFromHTML(item[1]);
        elements.push(
          new Paragraph({
            text,
            numbering: {
              reference: "numbered-list",
              level: 0,
            },
            spacing: {
              before: 60,
              after: 60,
              line: 320,
            },
          })
        );
      });

      // Add spacing after list
      elements.push(
        new Paragraph({
          text: "",
          spacing: { after: 120 },
        })
      );
    }
    // Handle paragraphs
    else if (block.startsWith("<p>")) {
      const text = extractTextFromHTML(block);
      if (text) {
        const hasCode = block.includes("<code>");
        if (hasCode) {
          const parts = [];
          const regex = /<code>(.*?)<\/code>|([^<]+)/g;
          let match;

          while ((match = regex.exec(block)) !== null) {
            if (match[1]) {
              parts.push(
                new TextRun({
                  text: match[1],
                  font: "Courier New",
                  color: "000000",
                  highlight: "lightGray",
                })
              );
            } else if (match[2]) {
              const cleanText = extractTextFromHTML(match[2]);
              if (cleanText) {
                parts.push(new TextRun(cleanText));
              }
            }
          }

          elements.push(
            new Paragraph({
              children: parts.length > 0 ? parts : [new TextRun(text)],
              spacing: {
                before: 140,
                after: 140,
                line: 360,
              },
              alignment: AlignmentType.JUSTIFIED,
              indent: {
                firstLine: convertInchesToTwip(0.5), // Indent first line for better readability
              },
            })
          );
        } else {
          elements.push(
            new Paragraph({
              text,
              spacing: {
                before: 140,
                after: 140,
                line: 360,
              },
              alignment: AlignmentType.JUSTIFIED,
              indent: {
                firstLine: convertInchesToTwip(0.5), // Indent first line for better readability
              },
            })
          );
        }
      }
    }
  }

  return elements;
}

// Formal Letter format - Business letter with proper structure
function convertToFormalLetterFormat(markdownText) {
  const html = marked.parse(markdownText);
  const elements = [];

  // Current date
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Letterhead spacing
  elements.push(
    new Paragraph({
      text: "",
      spacing: { after: 240 },
    })
  );

  // Date
  elements.push(
    new Paragraph({
      text: dateStr,
      spacing: { after: 240 },
    })
  );

  const blocks = html.split(/(?=<h[1-3]|<p|<ul|<ol|<table|<pre)/);
  let isFirstHeading = true;

  for (const block of blocks) {
    if (!block.trim()) continue;

    // H1 - Treat as Subject line
    if (block.startsWith("<h1>")) {
      const text = extractTextFromHTML(block);
      elements.push(
        new Paragraph({
          text: "",
          spacing: { after: 120 },
        })
      );
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Subject: ",
              bold: true,
            }),
            new TextRun({
              text: text,
            }),
          ],
          spacing: { after: 240 },
        })
      );

      // Add salutation after subject
      if (isFirstHeading) {
        elements.push(
          new Paragraph({
            text: "Dear Sir/Madam,",
            spacing: { after: 200 },
          })
        );
        isFirstHeading = false;
      }
    }
    // H2/H3 - Treat as section headers in letter body
    else if (block.startsWith("<h2>") || block.startsWith("<h3>")) {
      const text = extractTextFromHTML(block);
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: text,
              bold: true,
              underline: {},
            }),
          ],
          spacing: {
            before: 240,
            after: 160,
          },
        })
      );
    }
    // Tables
    else if (block.includes("<table>")) {
      const tableData = parseHTMLTable(block);
      if (tableData) {
        const table = createWordTable(tableData);
        if (table) {
          elements.push(
            new Paragraph({
              text: "",
              spacing: { before: 160, after: 80 },
            })
          );
          elements.push(table);
          elements.push(
            new Paragraph({
              text: "",
              spacing: { before: 80, after: 160 },
            })
          );
        }
      }
    }
    // Code blocks - rare in letters but handle anyway
    else if (block.includes("<pre>")) {
      const codeMatch = block.match(/<code[^>]*>([\s\S]*?)<\/code>/);
      if (codeMatch) {
        const codeText = codeMatch[1]
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeText,
                font: "Courier New",
                size: 20,
              }),
            ],
            shading: {
              fill: "F5F5F5",
            },
            spacing: {
              before: 160,
              after: 160,
            },
            indent: {
              left: convertInchesToTwip(0.5),
            },
          })
        );
      }
    }
    // Lists
    else if (block.includes("<ul>")) {
      const items = block.matchAll(/<li>(.*?)<\/li>/g);
      for (const item of items) {
        const text = extractTextFromHTML(item[1]);
        elements.push(
          new Paragraph({
            text,
            bullet: {
              level: 0,
            },
            spacing: {
              before: 80,
              after: 80,
            },
          })
        );
      }
    } else if (block.includes("<ol>")) {
      const items = block.matchAll(/<li>(.*?)<\/li>/g);
      for (const item of items) {
        const text = extractTextFromHTML(item[1]);
        elements.push(
          new Paragraph({
            text,
            numbering: {
              reference: "numbered-list",
              level: 0,
            },
            spacing: {
              before: 80,
              after: 80,
            },
          })
        );
      }
    }
    // Paragraphs - body text
    else if (block.startsWith("<p>")) {
      const text = extractTextFromHTML(block);
      if (text) {
        elements.push(
          new Paragraph({
            text,
            spacing: {
              before: 120,
              after: 120,
              line: 360,
            },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
    }
  }

  // Add closing
  elements.push(
    new Paragraph({
      text: "",
      spacing: { before: 240 },
    })
  );
  elements.push(
    new Paragraph({
      text: "Sincerely,",
      spacing: { after: 480 },
    })
  );
  elements.push(
    new Paragraph({
      text: "_____________________",
      spacing: { after: 120 },
    })
  );
  elements.push(
    new Paragraph({
      text: "[Your Name]",
    })
  );
  elements.push(
    new Paragraph({
      text: "[Your Position]",
    })
  );

  return elements;
}

// Main function to convert markdown to DOCX elements (legacy support)
function convertMarkdownToDocx(markdownText) {
  const html = marked.parse(markdownText);
  const elements = [];

  // Split HTML into blocks
  const blocks = html.split(/(?=<h[1-3]|<p|<ul|<ol|<table|<pre)/);

  for (const block of blocks) {
    if (!block.trim()) continue;

    // Handle H1 headings
    if (block.startsWith("<h1>")) {
      const text = extractTextFromHTML(block);
      elements.push(
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_1,
          spacing: {
            before: 240,
            after: 120,
          },
        })
      );
    }
    // Handle H2 headings
    else if (block.startsWith("<h2>")) {
      const text = extractTextFromHTML(block);
      elements.push(
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 200,
            after: 100,
          },
        })
      );
    }
    // Handle H3 headings
    else if (block.startsWith("<h3>")) {
      const text = extractTextFromHTML(block);
      elements.push(
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_3,
          spacing: {
            before: 160,
            after: 80,
          },
        })
      );
    }
    // Handle tables
    else if (block.includes("<table>")) {
      const tableData = parseHTMLTable(block);
      if (tableData) {
        const table = createWordTable(tableData);
        if (table) {
          elements.push(table);
          elements.push(new Paragraph({ text: "" })); // Add spacing after table
        }
      }
    }
    // Handle code blocks
    else if (block.includes("<pre>")) {
      const codeMatch = block.match(/<code[^>]*>([\s\S]*?)<\/code>/);
      if (codeMatch) {
        const codeText = codeMatch[1]
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeText,
                font: "Courier New",
                size: 20,
              }),
            ],
            shading: {
              fill: "F5F5F5",
            },
            spacing: {
              before: 100,
              after: 100,
            },
          })
        );
      }
    }
    // Handle unordered lists
    else if (block.includes("<ul>")) {
      const items = block.matchAll(/<li>(.*?)<\/li>/g);
      for (const item of items) {
        const text = extractTextFromHTML(item[1]);
        elements.push(
          new Paragraph({
            text,
            bullet: {
              level: 0,
            },
            spacing: {
              before: 40,
              after: 40,
            },
          })
        );
      }
    }
    // Handle ordered lists
    else if (block.includes("<ol>")) {
      const items = block.matchAll(/<li>(.*?)<\/li>/g);
      for (const item of items) {
        const text = extractTextFromHTML(item[1]);
        elements.push(
          new Paragraph({
            text,
            numbering: {
              reference: "numbered-list",
              level: 0,
            },
            spacing: {
              before: 40,
              after: 40,
            },
          })
        );
      }
    }
    // Handle paragraphs
    else if (block.startsWith("<p>")) {
      const text = extractTextFromHTML(block);
      if (text) {
        // Check for inline code
        const hasCode = block.includes("<code>");
        if (hasCode) {
          // Split text by code tags and create mixed formatting
          const parts = [];
          const regex = /<code>(.*?)<\/code>|([^<]+)/g;
          let match;

          while ((match = regex.exec(block)) !== null) {
            if (match[1]) {
              // Code portion - use background color instead of shading
              parts.push(
                new TextRun({
                  text: match[1],
                  font: "Courier New",
                  color: "000000",
                  highlight: "lightGray",
                })
              );
            } else if (match[2]) {
              // Regular text
              const cleanText = extractTextFromHTML(match[2]);
              if (cleanText) {
                parts.push(new TextRun(cleanText));
              }
            }
          }

          elements.push(
            new Paragraph({
              children: parts.length > 0 ? parts : [new TextRun(text)],
              spacing: {
                before: 60,
                after: 60,
              },
            })
          );
        } else {
          elements.push(
            new Paragraph({
              text,
              spacing: {
                before: 60,
                after: 60,
              },
            })
          );
        }
      }
    }
  }

  return elements;
}

export async function POST(request) {
  try {
    const { markdown, format = "documentation" } = await request.json();

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json(
        { error: "Invalid markdown content" },
        { status: 400 }
      );
    }

    // Convert markdown to document elements based on format
    let docElements;
    if (format === "formal-letter") {
      docElements = convertToFormalLetterFormat(markdown);
    } else if (format === "documentation") {
      docElements = convertToDocumentationFormat(markdown);
    } else {
      // Fallback to basic conversion
      docElements = convertMarkdownToDocx(markdown);
    }

    // Create the Word document with numbering configuration and proper margins
    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "numbered-list",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.25),
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1), // 1 inch top margin
                right: convertInchesToTwip(1), // 1 inch right margin
                bottom: convertInchesToTwip(1), // 1 inch bottom margin
                left: convertInchesToTwip(1), // 1 inch left margin
              },
            },
          },
          children: docElements,
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Return the file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="document.docx"',
      },
    });
  } catch (error) {
    console.error("Error converting to DOCX:", error);
    return NextResponse.json(
      { error: "Failed to convert document", details: error.message },
      { status: 500 }
    );
  }
}
