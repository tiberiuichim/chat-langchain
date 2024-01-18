"use client";

import { useState } from "react";

import Dropzone from "react-dropzone";
import { Button } from "@/components/ui/button";

type CustomBlob = {
  path: string;
} & Blob;

const UploadForm = ({ files }: { files: CustomBlob[] }) => {
  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((f, i) => {
      formData.append(`file-${i}`, f);
    });
    const resp = await fetch("/api/upload", {
      body: formData,
      method: "post",
    })
      .then((response) => {
        console.log("resp data", response);
      })
      .catch((error) => {
        console.log(error);
      });
    console.log("resp", resp);
  };

  return (
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
  );
};

export default function UploadPage() {
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [files, setFiles] = useState<unknown>();

  return (
    <div className={`rounded px-4 py-2 max-w-[80%] mb-8 flex`}>
      {showUploadForm ? (
        <UploadForm files={files} />
      ) : (
        <Dropzone
          onDrop={(acceptedFiles) => {
            console.log(acceptedFiles);
            setFiles(acceptedFiles);
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
