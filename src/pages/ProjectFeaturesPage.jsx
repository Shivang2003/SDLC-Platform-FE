import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Layers3, LoaderCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TicketDetailsDialog from "../components/projects/TicketDetailsDialog";
import TicketBoard from "../components/projects/TicketBoard";
import ProjectFeaturePanel from "../components/projects/ProjectFeaturePanel";
import {
  getDevTicketDetails,
  getFeatureDevTickets,
  getFeatureTestTickets,
  getProjectFeatures,
  getTestTicketDetails,
  updateDevTicketStatus,
  updateTestTicketStatus,
} from "../services/projectService";

export default function ProjectFeaturesPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const project = location.state?.project;
  const projectName =
    project?.name ?? project?.projectName ?? "Project features";

  const [features, setFeatures] = useState([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [featuresError, setFeaturesError] = useState("");
  const [ticketStatuses, setTicketStatuses] = useState([]);
  const [devTickets, setDevTickets] = useState([]);
  const [ticketView, setTicketView] = useState("development");
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  const [ticketActionError, setTicketActionError] = useState("");
  const [pendingTicketKeys, setPendingTicketKeys] = useState(() => new Set());
  const [dragOverStatus, setDragOverStatus] = useState("");
  const [selectedTicketKey, setSelectedTicketKey] = useState("");
  const [selectedTicketType, setSelectedTicketType] = useState("development");
  const [ticketDetails, setTicketDetails] = useState(null);
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false);
  const [ticketDetailsError, setTicketDetailsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFeatures() {
      setFeaturesLoading(true);
      setFeaturesError("");
      setFeatures([]);
      setSelectedFeatureId("");
      setTicketStatuses([]);
      setDevTickets([]);
      setTicketView("development");
      setTicketsLoading(false);
      setTicketsError("");
      setTicketActionError("");
      setPendingTicketKeys(new Set());
      setDragOverStatus("");
      setSelectedTicketKey("");
      setSelectedTicketType("development");
      setTicketDetails(null);
      setTicketDetailsLoading(false);
      setTicketDetailsError("");

      try {
        const featureList = await getProjectFeatures(projectId);

        if (!active) return;

        setFeatures(featureList);
        setSelectedFeatureId(featureList[0]?.featureId ?? "");
      } catch (error) {
        if (active) {
          setFeaturesError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load this project's features."
          );
        }
      } finally {
        if (active) setFeaturesLoading(false);
      }
    }

    loadFeatures();

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (!selectedTicketKey) return undefined;

    let active = true;

    async function loadTicketDetails() {
      setTicketDetailsLoading(true);
      setTicketDetailsError("");
      setTicketDetails(null);

      try {
        const details =
          selectedTicketType === "test"
            ? await getTestTicketDetails(selectedTicketKey)
            : await getDevTicketDetails(selectedTicketKey);
        if (active) setTicketDetails(details);
      } catch (error) {
        if (active) {
          setTicketDetailsError(
            error.response?.data?.message ||
              error.message ||
              `Unable to load ${selectedTicketType === "test" ? "test" : "development"} ticket details.`
          );
        }
      } finally {
        if (active) setTicketDetailsLoading(false);
      }
    }

    loadTicketDetails();

    return () => {
      active = false;
    };
  }, [selectedTicketKey, selectedTicketType]);

  useEffect(() => {
    if (!selectedFeatureId) return undefined;

    let active = true;

    async function loadTickets() {
      setTicketsLoading(true);
      setTicketsError("");
      setTicketStatuses([]);
      setDevTickets([]);
      setTicketActionError("");
      setPendingTicketKeys(new Set());
      setDragOverStatus("");

      try {
        const ticketBoard =
          ticketView === "test"
            ? await getFeatureTestTickets(projectId, selectedFeatureId)
            : await getFeatureDevTickets(projectId, selectedFeatureId);

        if (!active) return;

        setTicketStatuses(ticketBoard.statuses ?? ticketBoard.status);
        setDevTickets(ticketBoard.tickets ?? ticketBoard.devTickets);
      } catch (error) {
        if (active) {
          setTicketsError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load this feature's tickets."
          );
        }
      } finally {
        if (active) setTicketsLoading(false);
      }
    }

    loadTickets();

    return () => {
      active = false;
    };
  }, [projectId, selectedFeatureId, ticketView]);

  const selectedFeature = features.find(
    (feature) => feature.featureId === selectedFeatureId
  );

  const handleCloseTicketDetails = useCallback(() => {
    setSelectedTicketKey("");
    setTicketDetails(null);
    setTicketDetailsError("");
  }, []);

  const handleTicketClick = (ticketKey, ticketType) => {
    setSelectedTicketKey(ticketKey);
    setSelectedTicketType(ticketType);
  };

  const handleTicketDrop = async (event, status) => {
    event.preventDefault();
    setDragOverStatus("");

    const ticketKey = event.dataTransfer.getData("text/plain");
    const ticket = devTickets.find((item) => item.key === ticketKey);

    if (
      !ticket ||
      ticket.status === status ||
      pendingTicketKeys.has(ticketKey)
    ) {
      return;
    }

    setPendingTicketKeys((current) => new Set(current).add(ticketKey));
    setTicketActionError("");

    try {
      if (ticketView === "test") {
        await updateTestTicketStatus(ticketKey, status);
      } else {
        await updateDevTicketStatus(ticketKey, status);
      }
      setDevTickets((current) =>
        current.map((item) =>
          item.key === ticketKey ? { ...item, status } : item
        )
      );
    } catch (error) {
      setTicketActionError(
        error.response?.data?.message ||
          error.message ||
          `Unable to move ${ticketKey} to ${status.replaceAll("_", " ")}.`
      );
    } finally {
      setPendingTicketKeys((current) => {
        const next = new Set(current);
        next.delete(ticketKey);
        return next;
      });
    }
  };

  const handleTicketViewChange = (view) => {
    if (view === ticketView) return;
    setSelectedTicketKey("");
    setTicketDetails(null);
    setTicketDetailsError("");
    setTicketView(view);
  };

  const handleStatusDragOver = (event, status) => {
    event.preventDefault();
    setDragOverStatus(status);
  };

  const handleStatusDragLeave = (status) => {
    setDragOverStatus((current) => (current === status ? "" : current));
  };

  return (
    <section>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Back to projects
      </button>

      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
        PROJECT WORKSPACE
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {projectName}
      </h1>

      <div className="mb-5 mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Features</h2>
        {!featuresLoading && !featuresError && (
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            {features.length} {features.length === 1 ? "feature" : "features"}
          </span>
        )}
      </div>

      {featuresLoading && (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
          <LoaderCircle size={22} className="animate-spin text-blue-600" />
          Loading features...
        </div>
      )}

      {featuresError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {featuresError}
        </div>
      )}

      {!featuresLoading && !featuresError && features.length === 0 && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 px-5 text-center">
          <div className="mb-4 rounded-xl bg-slate-100 p-4 text-slate-500">
            <Layers3 size={28} />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            No features yet
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            This project doesn&apos;t have any features.
          </p>
        </div>
      )}

      {!featuresLoading && !featuresError && features.length > 0 && (
        <div className="space-y-8">
          <ProjectFeaturePanel
            features={features}
            selectedFeature={selectedFeature}
            onSelectFeature={setSelectedFeatureId}
          />
          <div
            className="inline-flex rounded-lg border border-slate-200 bg-white p-1"
            role="group"
            aria-label="Ticket type"
          >
            <button
              type="button"
              aria-pressed={ticketView === "development"}
              onClick={() => handleTicketViewChange("development")}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                ticketView === "development"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Dev tickets
            </button>
            <button
              type="button"
              aria-pressed={ticketView === "test"}
              onClick={() => handleTicketViewChange("test")}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                ticketView === "test"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Test tickets
            </button>
          </div>
          <TicketBoard
            ticketType={ticketView === "test" ? "test" : "development"}
            featureName={selectedFeature?.name}
            statuses={ticketStatuses}
            tickets={devTickets}
            loading={ticketsLoading}
            error={ticketsError}
            actionError={ticketActionError}
            pendingTicketKeys={pendingTicketKeys}
            dragOverStatus={dragOverStatus}
            onTicketDrop={handleTicketDrop}
            onTicketClick={handleTicketClick}
            onDragOverStatus={handleStatusDragOver}
            onDragLeaveStatus={handleStatusDragLeave}
          />
        </div>
      )}

      {selectedTicketKey && (
        <TicketDetailsDialog
          ticketType={selectedTicketType}
          ticketKey={selectedTicketKey}
          loading={ticketDetailsLoading}
          error={ticketDetailsError}
          details={ticketDetails}
          onClose={handleCloseTicketDetails}
        />
      )}
    </section>
  );
}
