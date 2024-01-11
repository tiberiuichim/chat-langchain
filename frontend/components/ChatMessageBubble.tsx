import type { Message } from "ai/react";
import { UserIcon } from "lucide-react";
import type { Source } from "./types";
import { SourceDetails } from "./Source";

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources: Source[];
  isMostRecent: boolean;
  messageCompleted: boolean;
}) {
  const colorClassName =
    props.message.role === "user" ? "bg-lime-300" : "bg-slate-50 text-black";
  const alignmentClassName =
    props.message.role === "user" ? "ml-auto" : "mr-auto";
  const prefix = props.message.role === "user" ? <UserIcon /> : props.aiEmoji;

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="mr-2">{prefix}</div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>
        {props.sources && props.sources.length ? (
          <>
            <code className="mt-4 mr-auto bg-gray-200 px-2 py-1 rounded">
              <h2>🔍 Sources:</h2>
            </code>
            <code className="mt-1 mr-2 px-2 py-1 rounded text-xs">
              {props.sources?.map((source, i) => (
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
