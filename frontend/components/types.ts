// export type Message = {
//   id: string;
//   createdAt?: Date;
//   content: string;
//   role: "system" | "user" | "assistant" | "function";
//   runId?: string;
//   sources?: Source[];
//   name?: string;
//   function_call?: { name: string };
// };
import type { Message } from "ai/react";

export type Message = {
  sources: Source[];
} & Message;

export type Source = {
  url: string;
  title: string;
  pageContent?: string;
  metadata?: {
    loc: {
      lines: {
        from: number;
        to: number;
      };
    };
  };
};
