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

const pageSize = 10;

export default function DBExplorerPage() {
  const [records, setRecords] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  // const [currentPage, setCurrentPage] = useState(0);
  const [indexes, setIndexes] = useState([]);
  const [activeIndex, setActiveIndex] = useState("");

  const totalPage = Math.ceil(recordsCount / pageSize);
  const p = usePagination({
    pageSize,
    totalPage,
    page: 1,
  });

  useEffect(() => {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    // const fetchIndexes = async () => {
    //   const resp = await fetch("/api/dbexplore", { method: "post", headers });
    //   const json = await resp.json();
    //   console.log("resp", json);
    //   const indexes = json.classes.map((v) => v.class) || [];
    //   setIndexes(indexes);
    // };

    const fetchRecords = async () => {
      const resp = await fetch("/api/dbexplore", {
        method: "post",
        body: JSON.stringify({
          index: activeIndex,
          page: p.currentPage,
          pageSize,
        }),
        headers,
      });
      const json = await resp.json();
      const { Get, Aggregate } = json;
      const fallbackIndex = activeIndex || Object.keys(Get)[0];
      if (!activeIndex && fallbackIndex !== activeIndex) {
        setActiveIndex(fallbackIndex);
      }
      setRecordsCount(Aggregate[fallbackIndex][0].meta.count);
      setRecords(Get[fallbackIndex]);
      console.log("resp", json);
      // const indexes = json.indexes.classes.map((v) => v.class) || [];
      // setIndexes(indexes);
    };

    fetchRecords();

    return () => {
      //
    };
  }, [indexes.length, activeIndex, p.currentPage]);

  return (
    <div>
      <h3>Explore db</h3>
      <div className="flex space-x-2">
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
        {recordsCount > 0 && <div>{`(${recordsCount} records)`}</div>}
      </div>
      <RecordsExplorer records={records} />
      <RecordsPagination pagination={p} />
      <div>
        {p.currentPage} / {totalPage}
      </div>
    </div>
  );
}
