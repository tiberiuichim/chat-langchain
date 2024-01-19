"use client";

import { useState } from "react";

import Dropzone from "react-dropzone";
import { UploadForm } from "@/components/UploadForm";
import type { CustomBlob } from "@/components/UploadForm";
import { Card, CardHeader } from "@/components/ui/card";

import { UploadCloudIcon } from "lucide-react";

export default function UploadPage() {
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [files, setFiles] = useState<CustomBlob[]>([]);

  return (
    <div className={`rounded px-4 py-2 max-w-[80%] mb-8 flex`}>
      <section>
        <Card className="p-3">
          {showUploadForm ? (
            <UploadForm
              files={files}
              onClearForm={() => {
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
                <div {...getRootProps()}>
                  <input {...getInputProps()} />

                  <div className="w-full flex flex-col items-center p-1 text-slate-600">
                    <UploadCloudIcon size="64" />
                  </div>
                  <p>Drop some files here, or click to select files</p>
                </div>
              )}
            </Dropzone>
          )}
        </Card>
      </section>
    </div>
  );
}
