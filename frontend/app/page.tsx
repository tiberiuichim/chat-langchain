"use client";

import { Loader2 } from "lucide-react";
import { ChatWindow } from "@/components/SimpleChatWindow";
import { useBackendSettings } from "@/lib/useBackendSettings";

const frontmatter = `
<div className="text-3xl text-black">Chat with EEA reports</div>
<div className="text-md text-black mt-2">
  Try one of the questions bellow
</div>
`;

export default function DefaultPage() {
  const { query } = useBackendSettings();
  const { data } = query;

  // const titleText = "Ask me anything about (some) EEA documents!";
  // const placeholder = "Ask a question. Enter multiple lines with Shift+Enter";
  // const presetQuestions = [
  //   "How many heat pumps were sold?",
  //   "What is the LULUCF sector?",
  //   "How much did the industrial sector contribute to total gas emissions?",
  //   "What is the plan to tackle greenhouse emissions?",
  // ];

  return data ? (
    <ChatWindow
      endpoint="/chat/stream_log"
      titleText={data?.titleText || ""}
      placeholder={data?.placeholder || ""}
      presetQuestions={data?.presetQuestions || []}
      frontmatter={data?.frontmatter || frontmatter}
    />
  ) : (
    <Loader2 />
  );
}
