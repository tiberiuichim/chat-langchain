import React, { ReactElement } from "react";
// import { Textarea } from "./textarea";
// import type { TextareaProps } from "./textarea";

import ResizeTextarea from "react-textarea-autosize";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return <ResizeTextarea className={cn(className)} ref={ref} {...props} />;
  },
);
Textarea.displayName = "Textarea";

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
    <div className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-2 py-2 text-sm space-x-2">
      <Textarea
        className="w-full ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        {...props}
      />
      {props.trigger}
    </div>
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

// export { Textarea };
