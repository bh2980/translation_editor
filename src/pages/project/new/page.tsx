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
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Project } from "@/entities/project";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/ui/form";
import { LANGUAGE_CODE_MAP } from "@/shared/constants/language-codes";
import { db } from "@/shared/lib/db";

export default function NewProjectPage() {
  const navigate = useNavigate();
  const methods = useForm<Project>({
    defaultValues: {
      name: "새 프로젝트",
      sourceLang: "en",
      targetLang: "ko",
    },
  });

  const submitProject = async (project: Project) => {
    const id = await db.projects.add(project);

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
        </form>
      </Form>

      <div className="flex justify-end">
        <Button onClick={methods.handleSubmit(submitProject)}>생성하기</Button>
      </div>
    </main>
  );
}
