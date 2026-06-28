import React, { useCallback, useEffect, useState } from "react";
import { Project, ProjectImage } from "@/lib/projectTypes";
import { fetchAdminProjects, fetchAdminProjectById } from "@/lib/projectsApi";
import ProjectList from "@/admin/projects/ProjectList";
import ProjectForm from "@/admin/projects/ProjectForm";
import ProjectImageManager from "@/admin/projects/ProjectImageManager";

type View = "list" | "create" | "edit";

export default function AdminProjects() {
  const [view,     setView]     = useState<View>("list");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [editing,  setEditing]  = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await fetchAdminProjects();
    setLoading(false);
    if (err) { setError(err); return; }
    setProjects(data);
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  function handleAdd() {
    setEditing(null);
    setView("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEdit(project: Project) {
    setEditing(project);
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBackToList() {
    setEditing(null);
    setView("list");
    loadProjects();
  }

  function handleDeleted(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleFormSave(saved: Project) {
    if (view === "create") {
      // Immediately move to edit so images can be uploaded
      setEditing(saved);
      setView("edit");
      setProjects((prev) => [saved, ...prev]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setEditing(saved);
      setProjects((prev) =>
        prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p))
      );
    }
  }

  function handleImagesChange(images: ProjectImage[]) {
    if (!editing) return;
    const updated = { ...editing, project_images: images };
    setEditing(updated);
    setProjects((prev) =>
      prev.map((p) => (p.id === editing.id ? updated : p))
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  if (view === "list") {
    return (
      <div className="max-w-7xl mx-auto">
        <ProjectList
          projects={projects}
          loading={loading}
          error={error}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onRefresh={loadProjects}
          onDeleted={handleDeleted}
        />
      </div>
    );
  }

  // ── Create / Edit view ────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <ProjectForm
        project={editing ?? undefined}
        onSave={handleFormSave}
        onCancel={handleBackToList}
      />

      {/* Image manager — visible only once project exists */}
      {editing ? (
        <ProjectImageManager
          projectId={editing.id}
          initialImages={editing.project_images ?? []}
          onImagesChange={handleImagesChange}
        />
      ) : (
        <div className="bg-secondary/40 border border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
          Save the project above to unlock image upload.
        </div>
      )}
    </div>
  );
}
