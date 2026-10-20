
import api from "../lib/axios";

export const getOrganizations = async () => {
  const response = await api.get("/user/organizations");
  return Array.isArray(response.data)
    ? response.data
    : response.data.organizations ?? [];
};
