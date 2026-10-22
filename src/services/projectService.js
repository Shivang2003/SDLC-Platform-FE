
import api from "../lib/axios";

export const getOrganizationProjects = async (organizationId) => {
  const response = await api.get(
    `/organization/${organizationId}/projects`
  );

  return Array.isArray(response.data)
    ? response.data
    : response.data.projects ?? [];
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
