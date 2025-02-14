import { Loader2, UserIcon, BotIcon } from "lucide-react";
import { SourceDetails } from "./Source";

import type { Message } from "ai/react";
import type { Source } from "./types";

type ChatMessageBubbleProps = {
  message: Message;
  aiEmoji?: string;
  sources: Source[];
  isMostRecent: boolean;
  isLoading: boolean;
};

export function ChatMessageBubble(props: ChatMessageBubbleProps) {
  const { message, isLoading, isMostRecent, sources } = props;
  const showLoader = isMostRecent && isLoading;
  const colorClassName =
    message.role === "user" ? "bg-lime-300" : "bg-slate-50 text-black";
  const alignmentClassName = message.role === "user" ? "ml-auto" : "mr-auto";

  const icon =
    message.role === "user" ? (
      <UserIcon />
    ) : showLoader ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : (
      <BotIcon />
    );

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="mr-2">{icon}</div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span dangerouslySetInnerHTML={{ __html: message.content }}></span>
        {!showLoader && sources && sources.length ? (
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
