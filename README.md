# 📄 Markdown to DOCX Converter

A modern, beautiful web application that converts AI-generated Markdown documentation (especially with tables) into professionally formatted Microsoft Word (DOCX) files.

## 🌟 Features

- **Perfect Table Conversion**: GitHub Flavored Markdown (GFM) tables are converted to native Word tables with proper formatting
- **Professional Styling**: Maintains headings (H1, H2, H3), paragraphs, code blocks, and lists
- **Instant Conversion**: Server-side processing using Next.js API Routes for fast and reliable generation
- **Beautiful UI**: Modern, responsive design with Tailwind CSS and smooth animations
- **Free & Open Source**: Built entirely with free, open-source technologies

## 🛠️ Tech Stack

| Technology       | Purpose                                    |
| ---------------- | ------------------------------------------ |
| **React**        | Frontend UI framework                      |
| **Next.js 15**   | Full-stack React framework with API routes |
| **Tailwind CSS** | Modern utility-first CSS framework         |
| **marked**       | Markdown parser with GFM support           |
| **docx**         | DOCX file generation library               |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn

### Installation

1. Navigate to the project directory:

```bash
cd chillbro
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open your browser and visit:

```
http://localhost:3000
```

## 📖 How to Use

1. **Paste Markdown**: Enter or paste your Markdown content (with GFM tables) into the text area
2. **Load Sample**: Click "Load Sample" to see an example of supported Markdown formatting
3. **Convert**: Click the "Convert to DOCX" button
4. **Download**: Your formatted Word document will automatically download

### Supported Markdown Features

- ✅ **Headings**: `#` (H1), `##` (H2), `###` (H3)
- ✅ **Tables**: Full GFM table syntax with alignment (`:---`, `:---:`, `---:`)
- ✅ **Code Blocks**: Fenced code blocks with triple backticks
- ✅ **Inline Code**: Single backtick code spans
- ✅ **Lists**: Ordered and unordered lists
- ✅ **Text Formatting**: Bold (`**text**`), italic (`*text*`)
- ✅ **Paragraphs**: Standard text paragraphs

### Example Table Syntax

```markdown
| Parameter    | Required | Data Type | Description                         |
| :----------- | :------- | :-------- | :---------------------------------- |
| `username`   | Yes      | String    | The user's account login identifier |
| `auth_token` | No       | UUID      | Optional token for API access       |
```

## 🏗️ Project Structure

```
chillbro/
├── src/
│   └── app/
│       ├── api/
│       │   └── convert-to-docx/
│       │       └── route.js          # API endpoint for DOCX conversion
│       ├── components/
│       │   └── MarkdownConverter.js  # Main UI component
│       ├── globals.css               # Global styles
│       ├── layout.js                 # Root layout
│       └── page.js                   # Home page
├── public/                           # Static assets
├── package.json                      # Dependencies and scripts
└── README.md                         # This file
```

## 🎨 Features Deep Dive

### Table Conversion

The converter intelligently detects GFM tables in your Markdown and converts them to native Word tables with:

- Bold header rows
- Light gray header background
- Proper borders
- Full-width tables

### Code Formatting

Code blocks are preserved with:

- Monospace font (Courier New)
- Gray background for readability
- Proper spacing

### Professional Document Structure

- Consistent heading hierarchy
- Proper paragraph spacing
- Native Word formatting (not just styled text)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Deploy with one click (no configuration needed!)

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository on [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server (with Turbopack)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### API Endpoint

**POST** `/api/convert-to-docx`

**Request Body:**

```json
{
  "markdown": "# Your Markdown Content"
}
```

**Response:**

- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Binary DOCX file

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Tables powered by [marked](https://marked.js.org/)
- DOCX generation by [docx](https://github.com/dolanmiu/docx)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 💡 Use Cases

Perfect for:

- Converting AI-generated documentation
- Creating technical specifications
- Generating API documentation
- Building project reports
- Converting blog posts to Word format

---

Built with ❤️ using free and open-source technologies
