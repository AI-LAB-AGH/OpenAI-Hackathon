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

// Add styles for typing animation
const styles = `
  .typing {
    animation: typing 0.1s ease-in-out;
  }

  @keyframes typing {
    from {
      opacity: 0.5;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
