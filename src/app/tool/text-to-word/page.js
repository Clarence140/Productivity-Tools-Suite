import MarkdownConverter from "../../components/MarkdownConverter";

export default function TextToWordTool() {
  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #EFEFEF 100%)",
      }}
    >
      <MarkdownConverter />
    </div>
  );
}
