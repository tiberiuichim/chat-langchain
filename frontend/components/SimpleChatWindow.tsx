"use client";
import React, { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { PlayIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { applyPatch } from "fast-json-patch";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { Footer } from "./Footer";
import { useMarked } from "./useMarked";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import type { Source } from "./ChatMessageBubble";
import type { Message } from "ai/react";

import "highlight.js/styles/gradient-dark.css";
import "react-toastify/dist/ReactToastify.css";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function ChatWindow(props: {
  placeholder?: string;
  titleText?: string;
  presetQuestions: string[];
  endpoint: string;
}) {
  const conversationId = uuidv4();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<
    { human: string; ai: string }[]
  >([]);

  const { placeholder, titleText, presetQuestions, endpoint } = props;

  const { parser } = useMarked();

  const sendMessage = async (message?: string) => {
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
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
    let sources: Source[] | undefined = undefined;
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

  const sendInitialQuestion = async (question: string) => {
    await sendMessage(question);
  };

  return (
    <div className="flex flex-col items-center p-8 rounded grow max-h-full">
      {messages.length > 0 && (
        <div className="flex flex-col items-center py-8">
          <div className="text-2xl font-medium text-white">{titleText}</div>
          <div className="text-xl font-medium text-white">
            Note: chat results may not be acurate
          </div>
        </div>
      )}
      <div
        className="flex flex-col-reverse w-full mb-2 overflow-auto"
        ref={messageContainerRef}
      >
        {messages.length > 0 ? (
          [...messages]
            .reverse()
            .map((m, index) => (
              <ChatMessageBubble
                sources={[]}
                key={m.id}
                message={{ ...m }}
                aiEmoji="🦜"
                isMostRecent={index === 0}
                messageCompleted={!isLoading}
              ></ChatMessageBubble>
            ))
        ) : (
          <EmptyState
            onChoice={sendInitialQuestion}
            questions={presetQuestions}
          />
        )}
      </div>
      <div className="flex w-full space-x-4">
        <AutoResizeTextarea
          value={input}
          maxRows={50}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            } else if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              setInput(input + "\n");
            }
          }}
        />
        <Button
          disabled={isLoading}
          type="submit"
          aria-label="Send"
          onKeyDown={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlayIcon />
          )}
        </Button>
      </div>

      {messages.length === 0 ? <Footer /> : ""}
    </div>
  );
}
