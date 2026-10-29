import { useEffect, useState } from "react";
import {
  getFeatureDevTickets,
  getFeatureTestTickets,
  updateDevTicketStatus,
  updateTestTicketStatus,
} from "../services/projectService";

export default function useFeatureTicketBoard(
  projectId,
  featureId,
  ticketView,
  ticketRefresh
) {
  const [ticketStatuses, setTicketStatuses] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  const [ticketActionError, setTicketActionError] = useState("");
  const [pendingTicketKeys, setPendingTicketKeys] = useState(() => new Set());
  const [dragOverStatus, setDragOverStatus] = useState("");
  useEffect(() => {
    let active = true;

    if (!featureId) return undefined;

    async function loadTickets() {
      setTicketsLoading(true);
      setTicketsError("");
      setTicketStatuses([]);
      setTickets([]);
      setTicketActionError("");
      setPendingTicketKeys(new Set());
      setDragOverStatus("");

      try {
        const ticketBoard =
          ticketView === "test"
            ? await getFeatureTestTickets(projectId, featureId)
            : await getFeatureDevTickets(projectId, featureId);

        if (!active) return;

        setTicketStatuses(ticketBoard.statuses ?? ticketBoard.status);
        setTickets(ticketBoard.tickets ?? ticketBoard.devTickets);
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
  }, [featureId, projectId, ticketRefresh, ticketView]);

  const handleTicketDrop = async (event, status) => {
    event.preventDefault();
    setDragOverStatus("");

    const ticketKey = event.dataTransfer.getData("text/plain");
    const ticket = tickets.find((item) => item.key === ticketKey);

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
      setTickets((current) =>
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

  const handleStatusDragOver = (event, status) => {
    event.preventDefault();
    setDragOverStatus(status);
  };

  const handleStatusDragLeave = (status) => {
    setDragOverStatus((current) => (current === status ? "" : current));
  };

  return {
    ticketStatuses: featureId ? ticketStatuses : [],
    tickets: featureId ? tickets : [],
    ticketsLoading: Boolean(featureId && ticketsLoading),
    ticketsError: featureId ? ticketsError : "",
    ticketActionError: featureId ? ticketActionError : "",
    pendingTicketKeys: featureId ? pendingTicketKeys : new Set(),
    dragOverStatus: featureId ? dragOverStatus : "",
    handleTicketDrop,
    handleStatusDragOver,
    handleStatusDragLeave,
  };
}
