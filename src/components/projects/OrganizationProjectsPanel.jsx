import { LoaderCircle, Plus } from "lucide-react";
import ProjectGrid from "./ProjectGrid";
import ProjectsEmptyState from "./ProjectsEmptyState";

export default function OrganizationProjectsPanel({
  projects,
  loading,
  error,
  onCreateProject,
}) {
  return (
    <section
      id="organization-panel-projects"
      role="tabpanel"
      aria-labelledby="organization-tab-projects"
      className="pt-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
        <div className="flex items-center gap-3">
          {!loading && !error && (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          )}
          <button
            type="button"
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus size={17} />
            Create project
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
          <LoaderCircle size={22} className="animate-spin text-blue-600" />
          Loading projects...
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && projects.length === 0 && (
        <ProjectsEmptyState
          title="No projects yet"
          description="This organization doesn't have any projects. Projects will appear here when they are created."
        />
      )}
      {!loading && !error && projects.length > 0 && (
        <ProjectGrid projects={projects} />
      )}
    </section>
  );
}
