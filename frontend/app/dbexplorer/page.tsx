"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { PanelTopClose } from "lucide-react";

export default function DBExplorerPage() {
  const [records, setRecords] = useState([]);
  const [indexes, setIndexes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const handler = async () => {
      const resp = await fetch("/api/dbexplore", { method: "post" });
      const json = await resp.json();
      console.log("resp", json);
      const indexes = json.indexes.classes.map((v) => v.class) || [];
      setIndexes(indexes);
    };

    handler();

    return () => {
      //
    };
  }, []);

  return (
    <div>
      <h3>Explore db</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            aria-label="Send"
            onKeyDown={(e) => {
              e.preventDefault();
              // sendMessage();
            }}
            className="rounded-md border flex space-x-2"
          >
            <div>{activeIndex ? activeIndex : "Select an index"}</div>
            <PanelTopClose className="text-slate-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {indexes.map((name) => (
            <DropdownMenuItem key={name}>
              <div
                className="text-sm text-slate-500"
                onClick={() => setActiveIndex(name)}
              >
                {name}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
