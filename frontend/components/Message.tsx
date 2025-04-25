import Markdown from "react-markdown";

type MessageProps = {
  content: string;
  role: "user" | "assistant";
};

export default function Message({ content, role = "assistant" }: MessageProps) {
  return (
    <div
      className={`
        max-w-[70%] w-fit px-4 py-2 rounded-lg  ${
          role == "user"
            ? "bg-neutral-200 ml-auto text-right"
            : "bg-transparent"
        }
      `}
    >
      <div className="markdown-content prose">
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}
