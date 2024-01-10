import React from "react";
import { Textarea } from "./ui/textarea";
import type { TextareaProps } from "./ui/textarea";

// import ResizeTextarea from "react-textarea-autosize";
// interface ResizeTextareaProps {
//   maxRows?: number;
// }

// const ResizableTextarea: React.FC<ResizeTextareaProps> = ({
//   maxRows,
//   ...props
// }) => {
//   return <ResizeTextarea maxRows={maxRows} {...props} />;
// };

interface AutoResizeTextareaProps extends TextareaProps {
  maxRows?: number;
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>((props, ref) => {
  // minH="unset"
  // overflow="auto"
  // w="100%"
  // resize="none"
  return (
    <Textarea ref={ref as React.RefObject<HTMLTextAreaElement>} {...props} />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";
