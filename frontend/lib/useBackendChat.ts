import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { applyPatch } from "fast-json-patch";

import { useMarked } from "./useMarked";

import type { Source } from "../components/types";
import type { Message } from "ai";

interface ExtendedMessage extends Message {
  runId?: string;
  sources?: Source[];
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/llm";

type BackendChatProps = {
  endpoint: string;
};

export function useBackendChat({ endpoint }: BackendChatProps) {
  const [messages, setMessages] = useState<Array<ExtendedMessage>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  const conversationId = uuidv4();
  const [chatHistory, setChatHistory] = useState<
    { human: string; ai: string }[]
  >([]);

  const { parser } = useMarked();

  const sendMessage = async (message?: string) => {
    if (isLoading) {
      return;
    }
    const messageValue = message ?? input;
    if (messageValue === "") return;
    setInput("");
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Math.random().toString(), content: messageValue, role: "user" },
    ]);
    setIsLoading(true);

    let accumulatedMessage = "";
    let runId: string | undefined = undefined;
    let sources: Source[] = [];
    let messageIndex: number | null = null;

    try {
      const sourceStepName = "FindDocs";
      let streamedResponse: Record<string, unknown> = {};
      await fetchEventSource(apiBaseUrl + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          input: {
            question: messageValue,
            chat_history: chatHistory,
          },
          config: {
            metadata: {
              conversation_id: conversationId,
            },
          },
          include_names: [sourceStepName],
        }),
        openWhenHidden: true,
        onerror(err) {
          throw err;
        },
        async onmessage(msg) {
          if (msg.event === "end") {
            setChatHistory((prevChatHistory) => [
              ...prevChatHistory,
              { human: messageValue, ai: accumulatedMessage },
            ]);
            setIsLoading(false);
            return;
          }
          if (msg.event === "data" && msg.data) {
            const chunk = JSON.parse(msg.data);
            streamedResponse = applyPatch(
              streamedResponse,
              chunk.ops,
            ).newDocument;

            if (
              Array.isArray(
                streamedResponse?.logs?.[sourceStepName]?.final_output?.output,
              )
            ) {
              sources = streamedResponse.logs[
                sourceStepName
              ].final_output.output.map((doc: Record<string, any>) => ({
                url: doc.metadata.source,
                title: doc.metadata.title,
                pageContent: doc.page_content,
              }));
            }
            if (streamedResponse.id !== undefined) {
              runId = streamedResponse.id;
            }
            if (Array.isArray(streamedResponse?.streamed_output)) {
              accumulatedMessage = streamedResponse.streamed_output.join("");
            }
            const parsedResult = await parser(accumulatedMessage);

            setMessages((prevMessages) => {
              const newMessages = [...prevMessages];
              if (
                messageIndex === null ||
                newMessages[messageIndex] === undefined
              ) {
                messageIndex = newMessages.length;
                newMessages.push({
                  id: Math.random().toString(),
                  content: parsedResult.trim(),
                  runId: runId,
                  sources: sources,
                  role: "assistant",
                });
              } else if (newMessages[messageIndex] !== undefined) {
                newMessages[messageIndex].content = parsedResult.trim();
                newMessages[messageIndex].runId = runId;
                newMessages[messageIndex].sources = sources;
              }
              return newMessages;
            });
          }
        },
      });
    } catch (e) {
      setMessages((prevMessages) => prevMessages.slice(0, -1));
      setIsLoading(false);
      setInput(messageValue);
      throw e;
    }
  };
  return { input, setInput, sendMessage, messages, isLoading };
}
