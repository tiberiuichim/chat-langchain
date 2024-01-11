"use client";

import React from "react";
import { SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { Footer } from "./Footer";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

import { useBackendChat } from "./useBackendChat";

import "highlight.js/styles/gradient-dark.css";
import "react-toastify/dist/ReactToastify.css";

export function ChatWindow(props: {
  placeholder?: string;
  titleText?: string;
  presetQuestions: string[];
  endpoint: string;
}) {
  const { placeholder, titleText, presetQuestions, endpoint } = props;

  const { sendMessage, input, setInput, messages, isLoading } = useBackendChat({
    endpoint,
  });

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
      <div className="flex flex-col-reverse w-full mb-2 overflow-auto">
        {messages.length > 0 ? (
          [...messages]
            .reverse()
            .map((m, index) => (
              <ChatMessageBubble
                sources={m.sources}
                key={m.id}
                message={m}
                aiEmoji="🦜"
                isMostRecent={index === 0}
                messageCompleted={!isLoading}
              />
            ))
        ) : (
          <EmptyState onChoice={sendMessage} questions={presetQuestions} />
        )}
      </div>
      <div className="flex w-full space-x-4">
        <AutoResizeTextarea
          value={input}
          maxRows={20}
          placeholder={messages.length > 0 ? "Ask follow-up..." : placeholder}
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
          trigger={
            <Button
              disabled={isLoading}
              type="submit"
              aria-label="Send"
              onKeyDown={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <SendIcon />
            </Button>
          }
        />
      </div>

      {messages.length === 0 ? <Footer /> : ""}
    </div>
  );
}
