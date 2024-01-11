"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { PanelTopClose } from "lucide-react";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Upload a document",
    href: "/upload",
    description: "Summarize some text",
  },
  {
    title: "Fact checker",
    href: "/factcheck",
    description:
      "A dialog agent that checks the validity of facts in your text",
  },
  {
    title: "Summarizer",
    href: "/summarizer",
    description: "Summarize some text",
  },
];

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <a
        ref={ref}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className,
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </a>
    </li>
  );
});
ListItem.displayName = "ListItem";

export const Tasks = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="IconButton flex space-x-1"
          aria-label="Customise options"
        >
          <div>What do you want to do today?</div>
          <PanelTopClose />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {components.map((component) => (
          <DropdownMenuItem key={component.title}>
            <div className="space-y-1">
              <h4>
                <Link title={component.title} href={component.href}>
                  {component.title}
                </Link>
              </h4>
              <div className="text-sm text-slate-500">
                {component.description}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
