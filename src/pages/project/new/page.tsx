import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { ChevronLeft } from "lucide-react";
import CreateProjectForm from "@/features/project/CreateProjectForm";

export default function NewProjectPage() {
  const navigate = useNavigate();

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
        <p className="text-muted-foreground mt-1">프로젝트 정보를 설정하고 CSV 파일을 불러옵니다.</p>
      </div>

      <CreateProjectForm />
    </main>
  );
}
