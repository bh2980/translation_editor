import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ChevronLeft, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { Project } from "@/entities/project";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/ui/form";
import { LANGUAGE_CODE_MAP, LANGUAGE_CODE_LIST } from "@/shared/constants/language-codes";
import { db } from "@/shared/lib/db";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { Checkbox } from "@/shared/ui/checkbox";
import { cn } from "@/shared/lib/ui/cn";

export default function NewProjectPage() {
  const navigate = useNavigate();
  const methods = useForm<Project>({
    defaultValues: {
      name: "새 프로젝트",
      sourceLang: "en",
      // Use array for target languages
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
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <div>
        <Button
          variant="ghost"
          className="text-muted-foreground flex items-center gap-0.5 !p-0 !pr-2 !pl-1"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} />
          뒤로가기
        </Button>
        <div className="h-2" />
        <h1 className="text-3xl font-bold tracking-tight">새 프로젝트 생성</h1>
        <p className="text-muted-foreground mt-1">
          프로젝트 정보를 설정하고 CSV 파일을 불러옵니다.
        </p>
      </div>

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
          <FormField
            control={methods.control}
            name="sourceLang"
            render={({ field }) => (
              <FormItem>
                <FormLabel>소스 언어</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="소스 언어" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LANGUAGE_CODE_MAP).map(
                      ([langCode, language]) => (
                        <SelectItem key={langCode} value={langCode}>
                          {`${language} (${langCode})`}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
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
                // preserve original order based on LANGUAGE_CODE_LIST
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
                                <CommandItem key={langCode} className="gap-2" onSelect={() => {}}>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(v) => toggle(langCode, v)}
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
    </main>
  );
}
