import { LoaderCircle } from "lucide-react";
import Editor from "../editor/MentionEditor";

export default function TicketCommentComposer({
  editorInstance,
  mentions,
  mentionsLoading,
  mentionsError,
  onRetryMentions,
  onSubmit,
  sending,
  submitError,
}) {
  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <h3 className="mb-2 text-sm font-bold text-slate-900">Add a comment</h3>
      {mentionsLoading && (
        <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={18} className="animate-spin text-blue-600" />
          Loading mention options...
        </div>
      )}
      {mentionsError && (
        <div className="space-y-3">
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {mentionsError}
          </p>
          <button
            type="button"
            onClick={onRetryMentions}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      )}
      {!mentionsLoading && !mentionsError && mentions && (
        <div>
          <div className="rounded-lg border border-slate-200">
            <Editor
              key={editorInstance}
              requiredMentions={mentions}
              onSubmitDelta={onSubmit}
              submitting={sending}
              compact
            />
          </div>
          {submitError && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {submitError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
