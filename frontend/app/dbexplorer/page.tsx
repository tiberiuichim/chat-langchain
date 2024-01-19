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
import { RecordsExplorer } from "@/components/RecordsExplorer";
import { RecordsPagination } from "@/components/RecordsPagination";
import usePagination from "@/lib/usePagination";

export default function DBExplorerPage() {
  const [records, setRecords] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [indexes, setIndexes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const p = usePagination({
    pageSize: 10,
    totalPage: recordsCount,
    page: currentPage,
  });

  useEffect(() => {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const fetchIndexes = async () => {
      const resp = await fetch("/api/dbexplore", { method: "post", headers });
      const json = await resp.json();
      console.log("resp", json);
      const indexes = json.classes.map((v) => v.class) || [];
      setIndexes(indexes);
    };

    const fetchRecords = async () => {
      const resp = await fetch("/api/dbexplore", {
        method: "post",
        body: JSON.stringify({ index: activeIndex }),
        headers,
      });
      const json = await resp.json();
      console.log("resp", json);
      // const indexes = json.indexes.classes.map((v) => v.class) || [];
      // setIndexes(indexes);
    };

    if (indexes.length === 0) {
      fetchIndexes();
    }

    if (activeIndex) {
      fetchRecords();
    }

    return () => {
      //
    };
  }, [indexes.length, activeIndex]);

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
      <RecordsExplorer records={records} />
      <RecordsPagination pagination={p} />
    </div>
  );
}
