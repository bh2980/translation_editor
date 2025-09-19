"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { EditorContent } from "./EditorContent";

export function EditorDrawer({
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="truncate">{entry?.key ?? ""}</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          {entry ? (
            <EditorContent
              entry={entry}
              value={value}
              setValue={setValue}
              glossary={glossary}
              project={project}
              onSave={onSave}
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              항목을 선택하세요.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
