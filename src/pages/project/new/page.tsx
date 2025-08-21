import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ChevronLeft } from "lucide-react";

const LANGS = [
  { code: "ko", label: "Korean (ko)" },
  { code: "en", label: "English (en)" },
  { code: "ja", label: "Japanese (ja)" },
  { code: "zh-CN", label: "Chinese Simplified (zh-CN)" },
  { code: "zh-TW", label: "Chinese Traditional (zh-TW)" },
  { code: "de", label: "German (de)" },
  { code: "fr", label: "French (fr)" },
  { code: "es", label: "Spanish (es)" },
];

export default function NewProjectPage() {
  const navigate = useNavigate();

  const goToNextStep = () => {
    // Navigate to a dummy project ID
    navigate(`/project/dummy-project-id/translate`);
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

      <div className="space-y-6">
        <form className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="name">프로젝트 이름</Label>
            <Input id="name" defaultValue="새 프로젝트" />
          </div>
          <div className="space-y-2">
            <Label>소스 언어</Label>
            <Select defaultValue="ko">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="소스 언어" />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>타겟 언어</Label>
            <Select defaultValue="en">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="타겟 언어" />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>

      <div className="flex justify-end">
        <Button onClick={goToNextStep}>생성하기</Button>
      </div>
    </main>
  );
}
