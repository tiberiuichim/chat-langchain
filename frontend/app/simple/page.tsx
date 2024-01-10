import { SimpleChatWindow } from "@/components/SimpleChatWindow";

export default function AgentsPage() {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">
        Simple retrieval agent
      </h1>
    </div>
  );
  return (
    <SimpleChatWindow
      endpoint="/chat/stream_log"
      emptyStateComponent={InfoCard}
      showIngestForm={false}
      placeholder={
        'Ask a question'
      }
      emoji="🐶"
      titleText="EEA Docs Finder"
    ></SimpleChatWindow>
  );
}

