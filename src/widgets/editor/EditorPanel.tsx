"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { EditorContent } from "./EditorContent";

export type EditorMode = "popover" | "drawer-left" | "split";

export function EditorDrawerLeft({
  open,
  onOpenChange,
  entry,
  onSave,
  glossary,
  project,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  entry: any | null;
  onSave: (entry: any) => void;
  glossary: any[];
  project: any;
}) {
  const [value, setValue] = useState(entry?.target ?? "");
  useEffect(() => setValue(entry?.target ?? ""), [entry?.target]);
  if (!entry) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="truncate">{entry.key}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <EditorContent
            entry={entry}
            value={value}
            setValue={setValue}
            glossary={glossary}
            project={project}
            onSave={onSave}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function EditorSplitView({
  entry,
  onSave,
  glossary,
  project,
}: {
  entry: any | null;
  onSave: (entry: any) => void;
  glossary: any[];
  project: any;
}) {
  const [value, setValue] = useState(entry?.target ?? "");
  useEffect(() => setValue(entry?.target ?? ""), [entry?.target]);
  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        왼쪽에서 항목을 선택하세요.
      </div>
    );
  }
  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-2 text-xs text-muted-foreground">{entry.key}</div>
      <EditorContent
        entry={entry}
        value={value}
        setValue={setValue}
        glossary={glossary}
        project={project}
        onSave={onSave}
      />
    </div>
  );
}

export function EditorCellPopover({
  children,
  entry,
  onSave,
  onSaved,
  glossary,
  project,
  findSimilar,
}: {
  children: React.ReactNode;
  entry: any;
  onSave: (entry: any) => void;
  onSaved?: (saved: any) => void;
  glossary: any[];
  project: any;
  findSimilar?: (entry: any) => Promise<any[]>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(entry?.target ?? "");
  const [similar, setSimilar] = useState<any[]>([]);
  useEffect(() => setValue(entry?.target ?? ""), [entry?.target]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      if (findSimilar) {
        const list = await findSimilar(entry);
        if (active) setSimilar(list ?? []);
      } else {
        setSimilar([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, entry, findSimilar]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[min(92vw,720px)] p-4"
        align="start"
        side="bottom"
      >
        <div className="mb-2 text-xs text-muted-foreground">{entry.key}</div>
        <EditorContent
          entry={entry}
          value={value}
          setValue={setValue}
          glossary={glossary}
          project={project}
          similar={similar}
          onSave={(e) => {
            onSave(e);
            setOpen(false);
            onSaved?.(e);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
