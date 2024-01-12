import { ChatWindow } from "@/components/SimpleChatWindow";

export default function DefaultPage() {
  return (
    <>
      <ChatWindow
        endpoint="/chat/stream_log"
        titleText="Ask me anything about (some) EEA documents!"
        placeholder="What is the trend for emissions in the building sector?"
        presetQuestions={[
          "How many heat pumps were sold?",
          "What is the LULUCF sector?",
          "How much did the industrial sector contribute to total gas emissions?",
          "What is the plan to tackle greenhouse emissions?",
        ]}
      />
    </>
  );
}
