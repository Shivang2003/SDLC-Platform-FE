
import api from "../lib/axios";

export const getOrganizationProjects = async (organizationId) => {
  const response = await api.get(
    `/organization/${organizationId}/projects`
  );

  return Array.isArray(response.data)
    ? response.data
    : response.data.projects ?? [];
};

export const getOrganizationDashboardSummary = async (organizationId) => {
  const response = await api.get(
    `/organization/${organizationId}/dashboard/summary`
  );
  const summary = response.data;
  const summaryFields = [
    "completedDevTickets",
    "failedTests",
    "openBugs",
    "passedTests",
    "totalBugTickets",
    "totalDevTickets",
    "totalFeatures",
    "totalProjects",
    "totalTestTickets",
  ];

  if (
    !summary ||
    summaryFields.some((field) => typeof summary[field] !== "number")
  ) {
    throw new Error("Unexpected response while loading dashboard summary.");
  }

  return summary;
};

export const getOrganizationDevTicketStats = async (organizationId) => {
  const response = await api.get(
    `/organization/${organizationId}/dashboard/dev-ticket-stats`
  );
  const stats = response.data;

  if (
    !stats ||
    typeof stats !== "object" ||
    Array.isArray(stats) ||
    Object.values(stats).some((count) => typeof count !== "number")
  ) {
    throw new Error("Unexpected response while loading development ticket stats.");
  }

  return stats;
};

export const getOrganizationBugStats = async (organizationId) => {
  const response = await api.get(
    `/organization/${organizationId}/dashboard/bug-stats`
  );
  const stats = response.data;
  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  if (
    !stats ||
    priorities.some((priority) => typeof stats[priority] !== "number")
  ) {
    throw new Error("Unexpected response while loading bug statistics.");
  }

  return stats;
};

export const getProjectFeatures = async (projectId) => {
  const response = await api.get(`/project/${projectId}/features`);
  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.features)) {
    return data.features;
  }

  throw new Error("Unexpected response while loading project features.");
};

export const getFeatureDevTickets = async (projectId, featureId) => {
  const response = await api.get(
    `/project/${projectId}/features/${featureId}/dev-tickets`
  );
  const data = response.data;

  if (
    Array.isArray(data?.status) &&
    Array.isArray(data?.devTickets)
  ) {
    return data;
  }

  throw new Error("Unexpected response while loading feature tickets.");
};

export const getProjectMembers = async (projectId) => {
  const response = await api.get(`/project/${projectId}/project-members`);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  throw new Error("Unexpected response while loading project members.");
};

export const createDevTicket = async (featureId, ticket) => {
  const response = await api.post(
    `/feature/${featureId}/create-dev-ticket`,
    ticket
  );

  return response.data;
};

export const getFeatureDevTicketOptions = async (projectId, featureId) => {
  const response = await api.get(
    `/dev-ticket/${projectId}/${featureId}/dev-tickets`
  );

  if (
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  throw new Error("Unexpected response while loading development tickets.");
};

export const createTestTicket = async (featureId, devTicketId, ticket) => {
  const response = await api.post(
    `/feature/${featureId}/${encodeURIComponent(devTicketId)}/create-test-ticket`,
    ticket
  );

  return response.data;
};

export const getFeatureTestTickets = async (projectId, featureId) => {
  const response = await api.get(
    `/project/${projectId}/features/${featureId}/test-tickets`
  );
  const data = response.data;

  if (
    Array.isArray(data?.status) &&
    Array.isArray(data?.devTickets)
  ) {
    return {
      statuses: data.status,
      tickets: data.devTickets,
    };
  }

  throw new Error("Unexpected response while loading feature test tickets.");
};

export const updateDevTicketStatus = async (ticketKey, status) => {
  const response = await api.patch(
    `/dev-ticket/${encodeURIComponent(ticketKey)}/status`,
    { status }
  );

  return response.data;
};

export const updateTestTicketStatus = async (ticketKey, status) => {
  const response = await api.patch(
    `/test-ticket/${encodeURIComponent(ticketKey)}/status`,
    { executionStatus: status }
  );

  return response.data;
};

export const getDevTicketDetails = async (ticketKey) => {
  const response = await api.get(
    `/dev-ticket/${encodeURIComponent(ticketKey)}/details`
  );
  const data = response.data;

  if (
    data?.devTicket &&
    Array.isArray(data.testTickets)
  ) {
    return data;
  }

  throw new Error("Unexpected response while loading development ticket details.");
};

export const editDevTicket = async (ticketKey, ticket) => {
  const response = await api.patch(
    `/dev-ticket/${encodeURIComponent(ticketKey)}/edit`,
    ticket
  );

  return response.data;
};

export const getTestTicketDetails = async (ticketKey) => {
  const response = await api.get(
    `/test-ticket/${encodeURIComponent(ticketKey)}/details`
  );
  const data = response.data;

  if (
    data?.testTicket &&
    Array.isArray(data.bugTickets)
  ) {
    return data;
  }

  throw new Error("Unexpected response while loading test ticket details.");
};
