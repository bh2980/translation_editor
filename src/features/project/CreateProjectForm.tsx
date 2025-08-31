import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Project } from "@/entities/project";
import { db } from "@/shared/lib/db";
import { cn } from "@/shared/lib/ui/cn";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/ui/form";
import { Checkbox } from "@/shared/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { LANGUAGE_CODE_LIST, LANGUAGE_CODE_MAP } from "@/shared/constants/language-codes";

export function CreateProjectForm() {
  const navigate = useNavigate();
  const methods = useForm<Project>({
    defaultValues: {
      name: "새 프로젝트",
      sourceLang: "en",
      targetLang: ["ko"],
    },
  });

  const submitProject = async (project: Project) => {
    const id = await db.projects.add({
      ...project,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    navigate(`/project/${id}/translate`);
  };

  return (
    <>
      <Form {...methods}>
        <form className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={methods.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2 col-span-2">
                <FormLabel>프로젝트 이름</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Source language: searchable single-select */}
          <FormField
            control={methods.control}
            name="sourceLang"
            render={({ field }) => {
              const [open, setOpen] = useState(false);
              const selected = field.value;
              const label = selected
                ? `${LANGUAGE_CODE_MAP[selected]} (${selected})`
                : "소스 언어 선택";
              return (
                <FormItem>
                  <FormLabel>소스 언어</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between", !selected && "text-muted-foreground")}
                      >
                        {label}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput placeholder="언어 검색..." />
                        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {LANGUAGE_CODE_LIST.map((langCode) => {
                              const language = LANGUAGE_CODE_MAP[langCode];
                              return (
                                <CommandItem
                                  key={langCode}
                                  onSelect={() => {
                                    field.onChange(langCode);
                                    setOpen(false);
                                  }}
                                >
                                  {`${language} (${langCode})`}
                                  {selected === langCode ? (
                                    <Check className="ml-auto h-4 w-4 opacity-60" />
                                  ) : null}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              );
            }}
          />

          {/* Target languages: multi-select with searchable list */}
          <FormField
            control={methods.control}
            name="targetLang"
            render={({ field }) => {
              const selected = (field.value as typeof LANGUAGE_CODE_LIST[number][] | undefined) ?? [];
              const toggle = (code: typeof LANGUAGE_CODE_LIST[number], checked: boolean | string) => {
                const isChecked = checked === true || checked === "indeterminate";
                const next = isChecked
                  ? Array.from(new Set([...selected, code]))
                  : selected.filter((c) => c !== code);
                const ordered = LANGUAGE_CODE_LIST.filter((c) => next.includes(c));
                field.onChange(ordered);
              };
              const buttonLabel = selected.length
                ? selected.map((c) => `${LANGUAGE_CODE_MAP[c]} (${c})`).join(", ")
                : "대상 언어 선택";
              return (
                <FormItem>
                  <FormLabel>대상 언어</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between", !selected.length && "text-muted-foreground")}
                      >
                        {buttonLabel}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput placeholder="언어 검색..." />
                        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {LANGUAGE_CODE_LIST.map((langCode) => {
                              const language = LANGUAGE_CODE_MAP[langCode];
                              const checked = selected.includes(langCode);
                              return (
                                <CommandItem
                                  key={langCode}
                                  className="gap-2"
                                  onSelect={() => toggle(langCode, !checked)}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggle(langCode, !checked);
                                    }}
                                  />
                                  <span className="flex-1">{`${language} (${langCode})`}</span>
                                  {checked ? <Check className="h-4 w-4 opacity-60" /> : null}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              );
            }}
          />
        </form>
      </Form>

      <div className="flex justify-end">
        <Button onClick={methods.handleSubmit(submitProject)}>생성하기</Button>
      </div>
    </>
  );
}

export default CreateProjectForm;

