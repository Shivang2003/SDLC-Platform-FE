import api from "../lib/axios";

export const getProjectWorklogStatus = async (projectId) => {
  const response = await api.get(`/worklog/project/${projectId}/exists`);
  const status = response.data;

  if (
    !status ||
    typeof status.exists !== "boolean" ||
    (status.exists && typeof status.enabled !== "boolean") ||
    (status.enabled !== undefined && typeof status.enabled !== "boolean")
  ) {
    throw new Error("Unexpected response while checking project worklogs.");
  }

  return { ...status, enabled: status.enabled ?? false };
};

export const getRecentProjectWorklogs = async (projectId) => {
  const response = await api.get(`/worklog/project/${projectId}/recent`);
  const report = response.data;

  if (
    !report ||
    !Array.isArray(report.worklogs) ||
    !Array.isArray(report.missingMembers)
  ) {
    throw new Error("Unexpected response while loading recent project worklogs.");
  }

  return report;
};

export const initializeProjectWorklogs = async (projectId, configuration) => {
  const response = await api.post(
    `/worklog/project/${projectId}/initialize`,
    configuration
  );
  return response.data;
};

export const updateProjectWorklogs = async (projectId, configuration) => {
  const response = await api.put(
    `/worklog/project/${projectId}/update`,
    configuration
  );
  return response.data;
};

export const submitProjectWorklog = async (projectId, worklog) => {
  const response = await api.post(
    `/worklog/project/${projectId}/submit`,
    worklog
  );
  return response.data;
};
