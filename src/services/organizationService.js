
import api from "../lib/axios";

export const createOrganization = async (organization) => {
  const response = await api.post("/organization/create", organization);
  return response.data;
};

export const getOrganizations = async () => {
  const response = await api.get("/user/organizations");
  return Array.isArray(response.data)
    ? response.data
    : response.data.organizations ?? [];
};
