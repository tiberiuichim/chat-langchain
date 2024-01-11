import type { Message } from "ai/react";
import { Loader2, UserIcon, BrainCircuitIcon } from "lucide-react";
import type { Source } from "./types";
import { SourceDetails } from "./Source";

type ChatMessageBubbleProps = {
  message: Message;
  aiEmoji?: string;
  sources: Source[];
  isMostRecent: boolean;
  messageCompleted: boolean;
};

export function ChatMessageBubble(props: ChatMessageBubbleProps) {
  const { message, messageCompleted, sources } = props;
  const colorClassName =
    message.role === "user" ? "bg-lime-300" : "bg-slate-50 text-black";
  const alignmentClassName = message.role === "user" ? "ml-auto" : "mr-auto";

  const prefix =
    message.role === "user" ? (
      <UserIcon />
    ) : messageCompleted ? (
      <BrainCircuitIcon />
    ) : (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    );
  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="mr-2">{prefix}</div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{message.content}</span>
        {sources && sources.length ? (
          <>
            <code className="mt-4 mr-auto bg-gray-200 px-2 py-1 rounded">
              <h2>🔍 Sources:</h2>
            </code>
            <code className="mt-1 mr-2 px-2 py-1 rounded text-xs">
              {sources?.map((source, i) => (
                <SourceDetails source={source} key={i} index={i} />
              ))}
            </code>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
