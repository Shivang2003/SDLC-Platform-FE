import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Layers3,
  LoaderCircle,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getFeatureDevTickets,
  getProjectFeatures,
  updateDevTicketStatus,
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
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  const [ticketActionError, setTicketActionError] = useState("");
  const [pendingTicketKeys, setPendingTicketKeys] = useState(() => new Set());
  const [dragOverStatus, setDragOverStatus] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFeatures() {
      setFeaturesLoading(true);
      setFeaturesError("");
      setFeatures([]);
      setSelectedFeatureId("");
      setTicketStatuses([]);
      setDevTickets([]);
      setTicketsLoading(false);
      setTicketsError("");
      setTicketActionError("");
      setPendingTicketKeys(new Set());
      setDragOverStatus("");

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
    if (!selectedFeatureId) {
      return undefined;
    }

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
        const ticketBoard = await getFeatureDevTickets(
          projectId,
          selectedFeatureId
        );

        if (!active) return;

        setTicketStatuses(ticketBoard.status);
        setDevTickets(ticketBoard.devTickets);
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
  }, [projectId, selectedFeatureId]);

  const selectedFeature = features.find(
    (feature) => feature.featureId === selectedFeatureId
  );

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
      await updateDevTicketStatus(ticketKey, status);
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
          <div className="grid gap-5 lg:grid-cols-[minmax(250px,0.8fr)_minmax(0,1.5fr)]">
            <nav
              aria-label="Project features"
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3"
            >
              {features.map((feature) => {
                const isSelected = feature.featureId === selectedFeatureId;

                return (
                  <button
                    key={feature.featureId}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedFeatureId(feature.featureId)}
                    className={`flex items-start gap-3 rounded-lg p-4 text-left transition ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 ring-1 ring-blue-100"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isSelected ? (
                        <Check size={17} />
                      ) : (
                        <Layers3 size={17} />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block break-words text-sm font-semibold">
                        {feature.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {feature.featureId}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <article className="min-h-64 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              {selectedFeature && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                    {selectedFeature.featureId}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                    {selectedFeature.name}
                  </h3>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {selectedFeature.description || "No description provided."}
                  </p>
                </>
              )}
            </article>
          </div>

          <section aria-labelledby="ticket-board-heading">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  id="ticket-board-heading"
                  className="text-lg font-semibold text-slate-900"
                >
                  Development tickets
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tickets for {selectedFeature?.name}
                </p>
              </div>
              {!ticketsLoading && !ticketsError && (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {devTickets.length}{" "}
                  {devTickets.length === 1 ? "ticket" : "tickets"}
                </span>
              )}
            </div>

            {ticketsLoading && (
              <div className="flex min-h-48 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
                <LoaderCircle
                  size={22}
                  className="animate-spin text-blue-600"
                />
                Loading tickets...
              </div>
            )}

            {ticketsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {ticketsError}
              </div>
            )}

            {ticketActionError && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {ticketActionError}
              </div>
            )}

            {!ticketsLoading &&
              !ticketsError &&
              ticketStatuses.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
                  No ticket statuses are available for this feature.
                </div>
              )}

            {!ticketsLoading && !ticketsError && ticketStatuses.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {ticketStatuses.map((status) => {
                  const statusTickets = devTickets.filter(
                    (ticket) => ticket.status === status
                  );

                  return (
                    <section
                      key={status}
                      aria-label={`${status.replaceAll("_", " ")} tickets`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverStatus(status);
                      }}
                      onDragLeave={() => setDragOverStatus("")}
                      onDrop={(event) => handleTicketDrop(event, status)}
                      className={`w-72 shrink-0 rounded-xl p-3 transition-colors ${
                        dragOverStatus === status
                          ? "bg-blue-100 ring-2 ring-blue-300"
                          : "bg-slate-100"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          {status.replaceAll("_", " ")}
                        </h3>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
                          {statusTickets.length}
                        </span>
                      </div>
                      <div className="flex min-h-36 flex-col gap-3">
                        {statusTickets.map((ticket) => (
                          <article
                            key={ticket.key}
                            draggable={!pendingTicketKeys.has(ticket.key)}
                            onDragStart={(event) => {
                              event.dataTransfer.setData(
                                "text/plain",
                                ticket.key
                              );
                              event.dataTransfer.effectAllowed = "move";
                            }}
                            className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${
                              pendingTicketKeys.has(ticket.key)
                                ? "cursor-wait opacity-60"
                                : "cursor-grab active:cursor-grabbing"
                            }`}
                          >
                            <p className="text-xs font-semibold text-blue-700">
                              {ticket.key}
                            </p>
                            <h4 className="mt-2 break-words text-sm font-semibold leading-5 text-slate-800">
                              {ticket.name}
                            </h4>
                            <div className="mt-4 flex items-center justify-between gap-2">
                              <span className="rounded bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                                {ticket.priority}
                              </span>
                              {pendingTicketKeys.has(ticket.key) && (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin text-blue-600"
                                  aria-label="Updating ticket status"
                                />
                              )}
                              {ticket.updatedAt && (
                                <time
                                  dateTime={ticket.updatedAt}
                                  className="text-right text-[11px] text-slate-400"
                                >
                                  {new Date(
                                    ticket.updatedAt
                                  ).toLocaleDateString()}
                                </time>
                              )}
                            </div>
                          </article>
                        ))}
                        {statusTickets.length === 0 && (
                          <p className="py-6 text-center text-xs text-slate-400">
                            No tickets
                          </p>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
