
import api from "../lib/axios";

export const getOrganizationProjects = async (organizationId) => {
  const response = await api.get(
    `/organization/${organizationId}/projects`
  );

  return Array.isArray(response.data)
    ? response.data
    : response.data.projects ?? [];
};
