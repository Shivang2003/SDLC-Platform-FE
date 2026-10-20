
import { useEffect, useState } from "react";
import { LoaderCircle, FolderKanban } from "lucide-react";
import { useParams } from "react-router-dom";
import { getOrganizations } from "../services/organizationService";
import { getOrganizationProjects } from "../services/projectService";
import ProjectGrid from "../components/projects/ProjectGrid";
import ProjectsEmptyState from "../components/projects/ProjectsEmptyState";

export default function ProjectsPage() {
  const { organizationId } = useParams();

  const [organization, setOrganization] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setLoading(true);
      setError("");
      setProjects([]);
      setOrganization(null);

      try {
        const [organizations, projectList] = await Promise.all([
          getOrganizations(),
          getOrganizationProjects(organizationId),
        ]);

        if (!active) return;

        const selectedOrganization = organizations.find(
          (item) => String(item.id ?? item._id) === organizationId
        );

        setOrganization(selectedOrganization ?? null);
        setProjects(projectList);
      } catch (error) {
        if (active) {
          setError(
            error.response?.data?.message ||
              "Unable to load this organization's projects."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (organizationId) {
      loadProjects();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [organizationId]);

  if (!organizationId) {
    return (
      <ProjectsEmptyState
        title="Select an organization"
        description="Choose an organization from the sidebar to view its projects."
      />
    );
  }

  return (
    <section>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
        ORGANIZATION WORKSPACE
      </p>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {organization?.name ?? "Organization projects"}
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        View and manage projects belonging to this organization.
      </p>

      <div className="mb-5 mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Projects
        </h2>

        {!loading && !error && (
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        )}
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
