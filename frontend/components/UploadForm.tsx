import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";

export type UploadFormProps = {
  files: CustomBlob[];
  onClearForm: () => void;
};

export type CustomBlob = {
  path: string;
} & Blob;

export const UploadForm: React.FC<UploadFormProps> = ({
  files,
  onClearForm,
}) => {
  const endpoint = "/api/upload";
  const [messages, setMessages] = useState<EventSourceMessage[]>([]);
  const [uploadFinished, setUploadFinished] = useState<boolean>(false);

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((f, i) => {
      formData.append(`file-${i}`, f);
    });

    const messages: EventSourceMessage[] = [];
    await fetchEventSource(endpoint, {
      method: "POST",
      headers: {
        // "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: formData,
      openWhenHidden: true,
      onerror(err: Error) {
        throw err;
      },
      async onmessage(msg) {
        console.log("msg", msg);
        setMessages([...messages, msg]);
        messages.push(msg);
        if (msg.id === "finish") {
          setUploadFinished(true);
        }
      },
    });
  };

  return (
    <div>
      {messages.length ? (
        <>
          <div>
            {messages.map((m) => (
              <div key={m.id}>{m.data}</div>
            ))}
          </div>
          {uploadFinished && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                setMessages([]);
                setUploadFinished(false);
                onClearForm();
              }}
            >
              Upload more
            </Button>
          )}
        </>
      ) : (
        <div>
          <ul>
            {files.map((f: CustomBlob) => (
              <li key={f.path}>{f.name}</li>
            ))}
          </ul>
          <Button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              console.log("submit");
              handleUpload();
            }}
          >
            Upload
          </Button>
        </div>
      )}
    </div>
  );
};
