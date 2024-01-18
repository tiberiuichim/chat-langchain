"use client";

import { useState } from "react";

import Dropzone from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";

type CustomBlob = {
  path: string;
} & Blob;

const UploadForm = ({
  files,
  clear,
}: {
  files: CustomBlob[];
  clear: () => void;
}) => {
  const endpoint = "/api/upload";
  const [messages, setMessages] = useState<EventSourceMessage[]>([]);
  const [uploadFinished, setUploadFinished] = useState<boolean>(false);

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((f, i) => {
      formData.append(`file-${i}`, f);
    });

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
              <span key={m.id}>{m.data}</span>
            ))}
          </div>
          {uploadFinished && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                setMessages([]);
                setUploadFinished(false);
                clear();
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

export default function UploadPage() {
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [files, setFiles] = useState<CustomBlob[]>([]);

  return (
    <div className={`rounded px-4 py-2 max-w-[80%] mb-8 flex`}>
      {showUploadForm ? (
        <UploadForm
          files={files}
          clear={() => {
            setFiles([]);
            setShowUploadForm(false);
          }}
        />
      ) : (
        <Dropzone
          onDrop={(acceptedFiles) => {
            console.log(acceptedFiles);
            setFiles(acceptedFiles as unknown as CustomBlob[]);
            setShowUploadForm(true);
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
      )}
    </div>
  );
}
