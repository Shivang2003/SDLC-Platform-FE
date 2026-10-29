import { useEffect, useState } from "react";
import {
  addTicketComment,
  getProjectMentions,
  getTicketComments,
} from "../services/projectService";

export default function useTicketComments(projectId, ticketId, ticketType) {
  const [mentionsRefresh, setMentionsRefresh] = useState(0);
  const [mentionsResult, setMentionsResult] = useState(null);
  const [commentsRefresh, setCommentsRefresh] = useState(0);
  const [commentsResult, setCommentsResult] = useState(null);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [editorInstance, setEditorInstance] = useState(0);

  const mentionsRequestKey = `${projectId}:${mentionsRefresh}`;
  const currentMentions =
    mentionsResult?.requestKey === mentionsRequestKey ? mentionsResult : null;
  const commentsRequestKey = `${ticketId}:${commentsRefresh}`;
  const currentComments =
    commentsResult?.requestKey === commentsRequestKey ? commentsResult : null;

  useEffect(() => {
    if (!ticketId) return undefined;

    let active = true;
    const requestKey = `${ticketId}:${commentsRefresh}`;

    getTicketComments(ticketId)
      .then((comments) => {
        if (active) setCommentsResult({ requestKey, comments });
      })
      .catch((error) => {
        if (active) {
          setCommentsResult({
            requestKey,
            error:
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              "Unable to load ticket comments.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [ticketId, commentsRefresh]);

  useEffect(() => {
    if (!projectId) return undefined;

    let active = true;
    const requestKey = `${projectId}:${mentionsRefresh}`;

    getProjectMentions(projectId)
      .then((mentions) => {
        if (active) setMentionsResult({ requestKey, mentions });
      })
      .catch((error) => {
        if (active) {
          setMentionsResult({
            requestKey,
            error:
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              "Unable to load comment mentions.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [projectId, mentionsRefresh]);

  const submitComment = async (delta) => {
    setSending(true);
    setSubmitError("");

    try {
      await addTicketComment(ticketId, ticketType, delta);
      setEditorInstance((current) => current + 1);
      setCommentsRefresh((current) => current + 1);
    } catch (error) {
      setSubmitError(
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Unable to add this comment."
      );
    } finally {
      setSending(false);
    }
  };

  return {
    comments: currentComments?.comments ?? [],
    commentsError: currentComments?.error ?? "",
    commentsLoading: Boolean(ticketId && !currentComments),
    editorInstance,
    mentions: currentMentions?.mentions ?? null,
    mentionsError: currentMentions?.error ?? "",
    mentionsLoading: Boolean(projectId && !currentMentions),
    retryMentions: () => setMentionsRefresh((current) => current + 1),
    sending,
    submitComment,
    submitError,
  };
}
