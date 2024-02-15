import { ChatWindow } from "@/components/SimpleChatWindow";
import type { InferGetStaticPropsType, GetStaticProps } from "next";

type Settings = {
  titleText: string;
  placeholder: string;
  presetQuestions: string[];
};

async function getSettings() {
  const url = `${process.env.API_URL}/getenv`;
  const res = await fetch(url);
  const settings: Settings = await res.json();
  return settings;
}

export default async function DefaultPage() {
  const data = await getSettings();
  const titleText = "Ask me anything about (some) EEA documents!";
  const placeholder = "Ask a question. Enter multiple lines with Shift+Enter";
  const presetQuestions = [
    "How many heat pumps were sold?",
    "What is the LULUCF sector?",
    "How much did the industrial sector contribute to total gas emissions?",
    "What is the plan to tackle greenhouse emissions?",
  ];

  return (
    <ChatWindow
      endpoint="/chat/stream_log"
      titleText={data?.titleText || titleText}
      placeholder={data?.placeholder || placeholder}
      presetQuestions={data?.presetQuestions || presetQuestions}
    />
  );
}
