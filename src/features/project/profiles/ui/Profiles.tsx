"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { Profile } from "@/types"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Plus, Trash2, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProjectStore } from "@/stores/project-store"

export default function ProfilesPage() {
  const params = useParams<{ id: string }>()
  const project = useProjectStore((s) => s.project)
  const load = useProjectStore((s) => s.load)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!params?.id) return
    load(params.id)
  }, [params?.id, load])

  // Update selected profile when profiles change
  useEffect(() => {
    if (!project?.profiles || project.profiles.length === 0) {
      setSelectedProfile(null)
      return
    }

    // If current selection is no longer in the list, select first one
    if (selectedProfile && !project.profiles.find((p) => p.id === selectedProfile.id)) {
      setSelectedProfile(project.profiles[0])
    }
  }, [project?.profiles, selectedProfile])

  function updateProfiles(profiles: Profile[]) {
    if (!project) return
    useProjectStore.getState().update((p) => ({ ...p, profiles }))
  }

  function addProfile() {
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name: "새 캐릭터",
      role: "",
      voice: "",
      description: "",
    }
    const newProfiles = [...(project?.profiles ?? []), newProfile]
    updateProfiles(newProfiles)
    setSelectedProfile(newProfile)
  }

  function deleteProfile(profileId: string) {
    if (!project) return
    const newProfiles = project.profiles.filter((p) => p.id !== profileId)
    updateProfiles(newProfiles)

    // If we deleted the selected profile, select another one
    if (selectedProfile?.id === profileId) {
      setSelectedProfile(newProfiles.length > 0 ? newProfiles[0] : null)
    }

    toast({
      title: "프로필 삭제됨",
      description: "캐릭터 프로필이 삭제되었습니다.",
    })
  }

  function updateSelectedProfile(updates: Partial<Profile>) {
    if (!project || !selectedProfile) return

    const updatedProfile = { ...selectedProfile, ...updates }
    const newProfiles = project.profiles.map((p) => (p.id === selectedProfile.id ? updatedProfile : p))

    updateProfiles(newProfiles)
    setSelectedProfile(updatedProfile)
  }

  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">캐릭터 프로필</h2>
        <p className="text-sm text-muted-foreground">게임 캐릭터의 말투, 배경, 스타일을 정의하세요.</p>
      </header>

      <div className="grid h-[70vh] gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Sidebar - Character List */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">캐릭터 목록</CardTitle>
              <Button size="sm" onClick={addProfile} className="gap-1">
                <Plus size={14} />
                추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {project.profiles.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>캐릭터가 없습니다.</p>
                  <p>새 캐릭터를 추가해보세요.</p>
                </div>
              ) : (
                project.profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`group flex cursor-pointer items-center justify-between rounded-md px-4 py-3 transition-colors hover:bg-muted/50 ${
                      selectedProfile?.id === profile.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{profile.name || "이름 없음"}</div>
                      {profile.role && <div className="truncate text-xs text-muted-foreground">{profile.role}</div>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProfile(profile.id)
                      }}
                    >
                      <Trash2 size={12} className="text-red-600" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Profile Details */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">{selectedProfile ? "캐릭터 세부 정보" : "캐릭터를 선택하세요"}</CardTitle>
          </CardHeader>
          <CardContent className="h-full overflow-auto">
            {selectedProfile ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">이름</label>
                  <Input
                    value={selectedProfile.name}
                    onChange={(e) => updateSelectedProfile({ name: e.target.value })}
                    placeholder="캐릭터 이름을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">역할</label>
                  <Input
                    value={selectedProfile.role}
                    onChange={(e) => updateSelectedProfile({ role: e.target.value })}
                    placeholder="예: 주인공, 조력자, 악역 등"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">말투/보이스</label>
                  <Input
                    value={selectedProfile.voice}
                    onChange={(e) => updateSelectedProfile({ voice: e.target.value })}
                    placeholder="예: 정중한 말투, 반말, 사투리 등"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">설명</label>
                  <Textarea
                    value={selectedProfile.description}
                    onChange={(e) => updateSelectedProfile({ description: e.target.value })}
                    placeholder="캐릭터의 배경, 성격, 특징 등을 자세히 설명해주세요"
                    rows={8}
                  />
                </div>

                <div className="pt-4">
                  <Button variant="destructive" onClick={() => deleteProfile(selectedProfile.id)} className="gap-2">
                    <Trash2 size={16} />이 캐릭터 삭제
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <User className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p className="text-lg font-medium">캐릭터를 선택하세요</p>
                  <p className="text-sm">
                    왼쪽에서 캐릭터를 선택하거나
                    <br />새 캐릭터를 추가해보세요.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
