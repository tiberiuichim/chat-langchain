import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Source } from "./types";

type SourceProps = {
  source: Source;
  index: number;
};

export const SourceDetails: React.FC<SourceProps> = ({ source, index }) => {
  // & quot; & quot;
  // {source.metadata?.loc?.lines !== undefined && (
  //   <div>
  //     <br />
  //     Lines {source.metadata?.loc?.lines?.from} to{" "}
  //     {source.metadata?.loc?.lines?.to}
  //   </div>
  // )}

  return (
    <Collapsible className="space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <CollapsibleTrigger asChild>
          <div className="flex">
            <h4 className="text-sm font-semibold">
              {index + 1}. {source.title || "untitled document"}
            </h4>
            <Button variant="ghost" size="xs" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>{" "}
          </div>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <ScrollArea className="h-[200px] rounded-md border p-4 rounded-md border px-4 py-3 font-mono text-sm">
          {source.pageContent}
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};
