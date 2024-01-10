import { ChatWindow } from "@/components/SimpleChatWindow";

export default function AgentsPage() {
  // const InfoCard = (
  //   <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
  //     <h1 className="text-3xl md:text-4xl mb-4">Simple retrieval agent</h1>
  //   </div>
  // );
  // emptyStateComponent={InfoCard}
  // showIngestForm={false}
  // emoji="🐶"

  return (
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
    ></ChatWindow>
  );
}
