"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { saveProject } from "@/entities/project/lib/storage"
import type { Project, AIProvider } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProjectStore } from "@/stores/project-store"

const DEFAULT_TEMPLATE = `You are a professional game localization translator.
- Translate from {{sourceLang}} to {{targetLang}}.
- Preserve placeholders and inline tags exactly (examples: {playerName}, <b>...</b>, %s, %d).
- Use glossary consistently (source -> target): 
{{glossary}}
- Keep tone/style coherent with character profiles if provided.
- Return ONLY the translated text without extra commentary.`

const PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "xai", label: "xAI (Grok)" },
  { value: "claude", label: "Anthropic Claude" },
  { value: "gemini", label: "Google Gemini" },
  { value: "local", label: "Local LLM" },
] as const

const MODEL_OPTIONS = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  xai: [
    { value: "grok-3", label: "Grok-3" },
    { value: "grok-2", label: "Grok-2" },
  ],
  claude: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
  ],
  gemini: [
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { value: "gemini-pro", label: "Gemini Pro" },
  ],
  local: [], // Custom input for local models
}

export default function AIAgentPage() {
  const params = useParams<{ id: string }>()
  const project = useProjectStore((s) => s.project)
  const load = useProjectStore((s) => s.load)
  const [provider, setProvider] = useState<AIProvider>("openai")
  const [apiKey, setApiKey] = useState("")
  const [apiEndpoint, setApiEndpoint] = useState("")
  const [model, setModel] = useState("")
  const [customModel, setCustomModel] = useState("")
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_TEMPLATE)

  useEffect(() => {
    if (!params?.id) return
    load(params.id)
  }, [params?.id, load])

  useEffect(() => {
    if (!project) return
    setProvider(project.aiAgent.provider)
    setApiKey(project.aiAgent.apiKey)
    setApiEndpoint(project.aiAgent.apiEndpoint || "")
    setModel(project.aiAgent.model)
    setCustomModel(project.aiAgent.model)
    setPromptTemplate(project.aiAgent.promptTemplate || DEFAULT_TEMPLATE)
  }, [project?.id])

  // Reset model when provider changes
  useEffect(() => {
    if (provider === "local") {
      setModel(customModel)
    } else {
      const options = MODEL_OPTIONS[provider]
      if (options && options.length > 0) {
        setModel(options[0].value)
      }
    }
  }, [provider, customModel])

  function save() {
    if (!project) return
    useProjectStore.getState().update((p) => ({
      ...p,
      aiAgent: {
        provider,
        apiKey,
        apiEndpoint: provider === "local" ? apiEndpoint : undefined,
        model: provider === "local" ? customModel : model,
        promptTemplate,
      },
    }))
  }

  function getProviderLabel(provider: AIProvider) {
    return PROVIDER_OPTIONS.find((p) => p.value === provider)?.label || provider
  }

  function getKeyLabel(provider: AIProvider) {
    switch (provider) {
      case "local":
        return "API 엔드포인트"
      default:
        return "API Key"
    }
  }

  function getKeyPlaceholder(provider: AIProvider) {
    switch (provider) {
      case "openai":
        return "sk-..."
      case "xai":
        return "xai-..."
      case "claude":
        return "sk-ant-..."
      case "gemini":
        return "AIza..."
      case "local":
        return "http://localhost:11434/v1"
      default:
        return "API 키를 입력하세요"
    }
  }

  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Agent 설정</CardTitle>
          <CardDescription>AI 제공업체, 모델, API 설정을 구성합니다.</CardDescription>
        </CardHeader>
        <CardContent className="max-w-2xl space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>AI 제공업체</Label>
              <Select value={provider} onValueChange={(v: AIProvider) => setProvider(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="제공업체 선택" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>모델</Label>
              {provider === "local" ? (
                <Input
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="예: llama3.2, qwen2.5:7b"
                />
              ) : (
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="모델 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS[provider]?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{getKeyLabel(provider)}</Label>
            {provider === "local" ? (
              <Input
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder={getKeyPlaceholder(provider)}
              />
            ) : (
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={getKeyPlaceholder(provider)}
              />
            )}
            <p className="text-xs text-muted-foreground">
              {provider === "local"
                ? "로컬 LLM 서버의 API 엔드포인트를 입력하세요 (예: Ollama, LM Studio)"
                : `${getProviderLabel(provider)} API 키를 입력하세요`}
            </p>
          </div>

          <div className="space-y-2">
            <Label>프롬프트 템플릿</Label>
            <Textarea value={promptTemplate} onChange={(e) => setPromptTemplate(e.target.value)} rows={10} />
            <p className="text-xs text-muted-foreground">
              템플릿 변수: {"{{sourceLang}}"}, {"{{targetLang}}"}, {"{{glossary}}"}
            </p>
          </div>

          <Button onClick={save}>저장</Button>
        </CardContent>
      </Card>
    </div>
  )
}
