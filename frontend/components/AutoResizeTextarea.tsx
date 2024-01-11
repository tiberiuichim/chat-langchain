import React, { ReactElement } from "react";
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

// minH="unset"
// overflow="auto"
// w="100%"
// resize="none"

interface AutoResizeTextareaProps extends TextareaProps {
  maxRows?: number;
  trigger: ReactElement;
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>((props, ref) => {
  // focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  return (
    <div className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm space-x-2">
      <Textarea
        className="w-full ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        {...props}
      />
      {props.trigger}
    </div>
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";
