import { useEffect, useState } from "react";
import { LoaderCircle, Pencil, X } from "lucide-react";
import {
  getRecentProjectWorklogs,
  initializeProjectWorklogs,
  submitProjectWorklog,
  updateProjectWorklogs,
} from "../../services/worklogService";

const WORKLOG_TIME_ZONE = "Asia/Calcutta";

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

function WorklogMember({ member, filled, expanded, onToggle }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {member.userName}
          </span>
          <span className="mt-1 block text-xs text-slate-500">
            {member.projectRole}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            filled
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {filled ? "Filled" : "Not filled"}
        </span>
      </button>
      {expanded && filled && (
        <p className="border-t border-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
          {member.worklogText}
        </p>
      )}
    </li>
  );
}

export default function WorklogsDialog({
  projectId,
  mode,
  onClose,
  onInitialized,
  onSubmitted,
  onUpdated,
  canEditSettings,
  onEditSettings,
}) {
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(mode === "recent");
  const [reportError, setReportError] = useState("");
  const [expandedWorklogId, setExpandedWorklogId] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("02:00");
  const [worklogText, setWorklogText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const validTimeRange =
    endTime &&
    startTime &&
    toMinutes(endTime) - toMinutes(startTime) >= 60;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  useEffect(() => {
    if (mode !== "recent") return undefined;

    let active = true;

    getRecentProjectWorklogs(projectId)
      .then((recentReport) => {
        if (active) setReport(recentReport);
      })
      .catch((error) => {
        if (active) {
          setReportError(
            error.response?.data?.message ||
              error.response?.data?.error ||
              error.message ||
              "Unable to load recent worklogs."
          );
        }
      })
      .finally(() => {
        if (active) setLoadingReport(false);
      });

    return () => {
      active = false;
    };
  }, [mode, projectId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      (mode === "initialize" || mode === "update") &&
      !validTimeRange
    ) {
      setSubmitError("End time must be at least one hour after start time.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const configuration = {
        startTime,
        endTime,
        timeZone: WORKLOG_TIME_ZONE,
      };

      if (mode === "initialize") {
        await initializeProjectWorklogs(projectId, configuration);
        onInitialized();
      } else if (mode === "update") {
        await updateProjectWorklogs(projectId, configuration);
        onUpdated();
      } else {
        const submittedWorklog = await submitProjectWorklog(projectId, {
          worklogText: worklogText.trim(),
        });
        onSubmitted(submittedWorklog);
      }
    } catch (error) {
      const responseData = error.response?.data;
      const responseMessage =
        typeof responseData === "string"
          ? responseData
          : responseData?.message || responseData?.error;
      const normalizedMessage = responseMessage?.trim().toLowerCase();
      const fallbackMessage =
        mode === "initialize"
          ? "Unable to create project worklogs."
          : mode === "update"
            ? "Unable to update project worklogs."
            : "Unable to submit your worklog.";
      const message =
        normalizedMessage === "worklog already submitted for today"
          ? "Worklog already submitted for today"
          : responseMessage ||
            (error.message?.startsWith("Request failed with status code")
              ? fallbackMessage
              : error.message) ||
            fallbackMessage;

      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const worklogMembers = [
    ...(report?.worklogs ?? []).map((worklog) => ({
      ...worklog,
      filled: true,
      id: worklog.worklogId,
    })),
    ...(report?.missingMembers ?? []).map((member) => ({
      ...member,
      filled: false,
      id: `missing-${member.userId}`,
    })),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-worklogs-heading"
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-50 text-slate-900 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Project worklogs
            </p>
            <h2
              id="project-worklogs-heading"
              className="mt-1 text-lg font-bold"
            >
              {mode === "recent"
                ? "Recent worklogs"
                : mode === "submit"
                  ? "Fill worklog"
                  : mode === "update"
                    ? "Edit worklog settings"
                  : "Create worklogs"}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {mode === "recent" && canEditSettings && (
              <button
                type="button"
                onClick={onEditSettings}
                aria-label="Edit worklog settings"
                title="Edit worklog settings"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <Pencil size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close worklogs dialog"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {mode === "recent" ? (
          <div className="max-h-[calc(90vh-76px)] space-y-4 overflow-y-auto p-5 sm:p-7">
            {loadingReport && (
              <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500">
                <LoaderCircle size={20} className="animate-spin text-blue-600" />
                Loading recent worklogs...
              </div>
            )}
            {reportError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {reportError}
              </p>
            )}
            {!loadingReport && !reportError && report && (
              <>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-900">
                    {report.projectName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Report date: {report.reportDate}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.startTime}–{report.endTime} ({report.timeZone})
                  </p>
                </div>
                {worklogMembers.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                    No member worklog statuses are available.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {worklogMembers.map((member) => (
                      <WorklogMember
                        key={member.id}
                        member={member}
                        filled={member.filled}
                        expanded={expandedWorklogId === member.id}
                        onToggle={() =>
                          setExpandedWorklogId((current) =>
                            current === member.id ? "" : member.id
                          )
                        }
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(90vh-76px)] space-y-5 overflow-y-auto p-5 sm:p-7"
          >
            {mode === "initialize" || mode === "update" ? (
              <>
                <p className="text-sm leading-6 text-slate-600">
                  {mode === "initialize"
                    ? "Choose the daily reporting window for this project's worklogs."
                    : "Update the daily reporting window for this project's worklogs."}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Start time
                    </span>
                    <input
                      type="time"
                      required
                      step={60}
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      disabled={submitting}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      End time
                    </span>
                    <input
                      type="time"
                      required
                      step={60}
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      disabled={submitting}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                </div>
                {!validTimeRange && (
                  <p className="text-sm text-red-600" role="alert">
                    End time must be at least one hour after start time.
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Time zone: {WORKLOG_TIME_ZONE}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-slate-600">
                  Describe the work you completed for this project.
                </p>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Worklog
                  </span>
                  <textarea
                    required
                    rows={6}
                    value={worklogText}
                    onChange={(event) => setWorklogText(event.target.value)}
                    disabled={submitting}
                    placeholder="Describe the work completed..."
                    className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </>
            )}
            {submitError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {submitError}
              </p>
            )}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  submitting ||
                  (mode === "initialize" || mode === "update"
                    ? !validTimeRange
                    : !worklogText.trim())
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {mode === "initialize"
                  ? "Create worklogs"
                  : mode === "update"
                    ? "Save changes"
                    : "Submit worklog"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
