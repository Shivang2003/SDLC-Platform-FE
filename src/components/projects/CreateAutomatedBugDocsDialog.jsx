import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";

const responseExample = `{
  "key": "<generated bug key>",
  "title": "Auto-generated: <test ticket title>",
  "description": "Automatically generated because the test case failed.",
  "stepsToReproduce": null,
  "expectedResult": null,
  "actualResult": null,
  "status": "OPEN",
  "priority": "<Priority enum value>",
  "severity": "<Severity enum value>",
  "testCaseKey": "<test ticket key>",
  "featureId": "<feature id>",
  "projectId": "<project id>",
  "currentRevision": 1,
  "createdAt": "<ISO date-time>",
  "updatedAt": "<ISO date-time>"
}`;

export default function CreateAutomatedBugDocsDialog({ testTicketKey, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const endpoint = `/test-ticket/${encodeURIComponent(testTicketKey)}/create-automated-bugs`;
  const requestExample = `POST ${endpoint}
Content-Type: application/json`;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(requestExample);
      setCopied(true);
    } catch (error) {
      setCopied(false);
      setCopyError(error.message || "Unable to copy the request example.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="automated-bug-docs-heading"
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Test ticket API
            </p>
            <h2
              id="automated-bug-docs-heading"
              className="mt-1 text-lg font-bold"
            >
              Create Automated Bug API
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API documentation"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </header>

        <div className="space-y-6 overflow-y-auto p-5 sm:p-7">
          <section aria-labelledby="automated-bug-endpoint">
            <h3
              id="automated-bug-endpoint"
              className="text-sm font-bold text-slate-900"
            >
              Endpoint
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                POST
              </span>
              <code className="break-all rounded bg-slate-100 px-2.5 py-1.5 text-sm text-slate-800">
                {endpoint}
              </code>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Content-Type: <code>application/json</code>
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Creates a Bug Ticket for a failed Test Ticket and links it to
              that Test Ticket and its associated project and feature.
            </p>
          </section>

          <section aria-labelledby="automated-bug-request">
            <h3
              id="automated-bug-request"
              className="text-sm font-bold text-slate-900"
            >
              Request
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-700">
              No request body required.
            </p>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
                <span className="text-xs font-medium text-slate-300">
                  Example Request
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 text-xs leading-6 text-slate-100">
                <code>{requestExample}</code>
              </pre>
            </div>
            {copyError && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {copyError}
                </p>
            )}
          </section>

          <section aria-labelledby="automated-bug-response">
            <h3
              id="automated-bug-response"
              className="text-sm font-bold text-slate-900"
            >
              Response
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              On success, returns <code>201 Created</code> with the generated
              Bug Ticket.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-800">
              <code>{responseExample}</code>
            </pre>
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
              Backend implementation note: the automated endpoint currently
              delegates to a service that requires priority and severity, but
              the endpoint does not assign those values. The service may reject
              the request before returning this successful response.
            </p>
          </section>

          <section aria-labelledby="automated-bug-validations">
            <h3
              id="automated-bug-validations"
              className="text-sm font-bold text-slate-900"
            >
              Validations
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>The Test Ticket must exist and have execution status FAIL.</li>
              <li>
                A matching auto-generated Bug Ticket must not already be linked
                to the Test Ticket.
              </li>
              <li>
                The Test Ticket must be linked to an existing Dev Ticket.
              </li>
              <li>
                The authenticated user must have project access to create a bug
                ticket.
              </li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
