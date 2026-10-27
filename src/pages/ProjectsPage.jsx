
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, UserPlus } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  addOrganizationMember,
  getAllUsers,
  getOrganizations,
} from "../services/organizationService";
import {
  getOrganizationDashboardSummary,
  getOrganizationBugStats,
  getOrganizationDevTicketStats,
  createOrganizationProject,
  getOrganizationProjects,
} from "../services/projectService";
import ProjectGrid from "../components/projects/ProjectGrid";
import ProjectsEmptyState from "../components/projects/ProjectsEmptyState";
import OrganizationSummaryCards from "../components/projects/OrganizationSummaryCards";
import DevTicketStatusChart from "../components/projects/DevTicketStatusChart";
import BugPriorityChart from "../components/projects/BugPriorityChart";
import AddOrganizationMemberDialog from "../components/organizations/AddOrganizationMemberDialog";
import CreateProjectDialog from "../components/projects/CreateProjectDialog";

export default function ProjectsPage() {
  const { organizationId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [organization, setOrganization] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [devTicketStats, setDevTicketStats] = useState(null);
  const [devTicketStatsLoading, setDevTicketStatsLoading] = useState(true);
  const [devTicketStatsError, setDevTicketStatsError] = useState("");
  const [bugStats, setBugStats] = useState(null);
  const [bugStatsLoading, setBugStatsLoading] = useState(true);
  const [bugStatsError, setBugStatsError] = useState("");
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState("");
  const [projectRefresh, setProjectRefresh] = useState(0);
  const activeTab =
    searchParams.get("view") === "projects" ? "projects" : "summary";

  const handleOpenAddMember = async () => {
    setAddMemberDialogOpen(true);
    setUsersLoading(true);
    setUsersError("");
    setAddMemberError("");

    try {
      setUsers(await getAllUsers());
    } catch (error) {
      setUsersError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load users."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAddMember = async (member) => {
    setAddingMember(true);
    setAddMemberError("");

    try {
      await addOrganizationMember(organizationId, member);
      setAddMemberDialogOpen(false);
      toast.success(`${member.userName} added to the organization.`);
    } catch (error) {
      setAddMemberError(
        error.response?.data?.message ||
          error.message ||
          "Unable to add this organization member."
      );
    } finally {
      setAddingMember(false);
    }
  };

  const handleCreateProject = async (project) => {
    setCreatingProject(true);
    setCreateProjectError("");

    try {
      await createOrganizationProject(organizationId, project);
      setCreateProjectDialogOpen(false);
      toast.success("Project created successfully.");
      setProjectRefresh((current) => current + 1);
    } catch (error) {
      setCreateProjectError(
        error.response?.data?.message ||
          error.message ||
          "Unable to create the project."
      );
    } finally {
      setCreatingProject(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setProjectsLoading(true);
      setProjectsError("");
      setProjects([]);
      setOrganization(null);

      try {
        const [organizations, projectList] = await Promise.all([
          getOrganizations(),
          getOrganizationProjects(organizationId),
        ]);

        if (!active) return;

        const selectedOrganization = organizations.find(
          (item) =>
            String(item.organizationId ?? item.id ?? item._id) ===
            organizationId
        );

        setOrganization(selectedOrganization ?? null);
        setProjects(projectList);
      } catch (error) {
        if (active) {
          setProjectsError(
            error.response?.data?.message ||
              "Unable to load this organization's projects."
          );
        }
      } finally {
        if (active) setProjectsLoading(false);
      }
    }

    if (organizationId) {
      loadProjects();
    }

    return () => {
      active = false;
    };
  }, [organizationId, projectRefresh]);

  useEffect(() => {
    let active = true;

    async function loadBugStats() {
      setBugStatsLoading(true);
      setBugStatsError("");
      setBugStats(null);

      try {
        const stats = await getOrganizationBugStats(organizationId);
        if (active) setBugStats(stats);
      } catch (error) {
        if (active) {
          setBugStatsError(
            error.response?.data?.message ||
              "Unable to load bug statistics."
          );
        }
      } finally {
        if (active) setBugStatsLoading(false);
      }
    }

    if (organizationId) {
      loadBugStats();
    }

    return () => {
      active = false;
    };
  }, [organizationId]);

  useEffect(() => {
    let active = true;

    async function loadDevTicketStats() {
      setDevTicketStatsLoading(true);
      setDevTicketStatsError("");
      setDevTicketStats(null);

      try {
        const stats = await getOrganizationDevTicketStats(organizationId);
        if (active) setDevTicketStats(stats);
      } catch (error) {
        if (active) {
          setDevTicketStatsError(
            error.response?.data?.message ||
              "Unable to load development ticket statistics."
          );
        }
      } finally {
        if (active) setDevTicketStatsLoading(false);
      }
    }

    if (organizationId) {
      loadDevTicketStats();
    }

    return () => {
      active = false;
    };
  }, [organizationId]);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setSummaryLoading(true);
      setSummaryError("");
      setSummary(null);

      try {
        const dashboardSummary =
          await getOrganizationDashboardSummary(organizationId);

        if (active) setSummary(dashboardSummary);
      } catch (error) {
        if (active) {
          setSummaryError(
            error.response?.data?.message ||
              "Unable to load this organization's dashboard summary."
          );
        }
      } finally {
        if (active) setSummaryLoading(false);
      }
    }

    if (organizationId) {
      loadSummary();
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

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {organization?.name ?? "Organization projects"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View organization metrics and manage its projects.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddMember}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <UserPlus size={17} />
          Add member
        </button>
      </div>

      <div
        className="mt-8 flex gap-6 border-b border-slate-200"
        role="tablist"
        aria-label="Organization views"
      >
        {[
          { id: "summary", label: "Summary" },
          { id: "projects", label: "Projects" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`organization-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`organization-panel-${tab.id}`}
            onClick={() => {
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                next.set("view", tab.id);
                return next;
              });
            }}
            className={`-mb-px border-b-2 px-1 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "summary" && (
        <section
          id="organization-panel-summary"
          role="tabpanel"
          aria-labelledby="organization-tab-summary"
          className="pt-6"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Organization summary
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A snapshot of projects, tickets, tests, and bugs.
            </p>
          </div>

          {summaryLoading && (
            <OrganizationSummaryCards loading />
          )}

          {summaryError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {summaryError}
            </div>
          )}

          {!summaryLoading && !summaryError && summary && (
            <OrganizationSummaryCards summary={summary} />
          )}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {devTicketStatsError ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {devTicketStatsError}
              </div>
            ) : (
              <DevTicketStatusChart
                stats={devTicketStats}
                loading={devTicketStatsLoading}
              />
            )}
            {bugStatsError ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {bugStatsError}
              </div>
            ) : (
              <BugPriorityChart stats={bugStats} loading={bugStatsLoading} />
            )}
          </div>
        </section>
      )}

      {activeTab === "projects" && (
        <section
          id="organization-panel-projects"
          role="tabpanel"
          aria-labelledby="organization-tab-projects"
          className="pt-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
            <div className="flex items-center gap-3">
              {!projectsLoading && !projectsError && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {projects.length}{" "}
                  {projects.length === 1 ? "project" : "projects"}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setCreateProjectError("");
                  setCreateProjectDialogOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Plus size={17} />
                Create project
              </button>
            </div>
          </div>

          {projectsLoading && (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
              <LoaderCircle size={22} className="animate-spin text-blue-600" />
              Loading projects...
            </div>
          )}

          {projectsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {projectsError}
            </div>
          )}

          {!projectsLoading && !projectsError && projects.length === 0 && (
            <ProjectsEmptyState
              title="No projects yet"
              description="This organization doesn't have any projects. Projects will appear here when they are created."
            />
          )}

          {!projectsLoading && !projectsError && projects.length > 0 && (
            <ProjectGrid projects={projects} />
          )}
        </section>
      )}

      {addMemberDialogOpen && (
        <AddOrganizationMemberDialog
          users={users}
          usersLoading={usersLoading}
          usersError={usersError}
          submitting={addingMember}
          submitError={addMemberError}
          onClose={() => setAddMemberDialogOpen(false)}
          onSubmit={handleAddMember}
        />
      )}

      {createProjectDialogOpen && (
        <CreateProjectDialog
          onClose={() => setCreateProjectDialogOpen(false)}
          onSubmit={handleCreateProject}
          submitting={creatingProject}
          error={createProjectError}
        />
      )}
    </section>
  );
}
