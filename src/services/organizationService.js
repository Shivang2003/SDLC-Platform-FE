
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

export const getAllUsers = async () => {
  const response = await api.get("/user/allUsers");
  const users = response.data;

  if (
    !Array.isArray(users) ||
    users.some(
      (user) =>
        !user ||
        typeof user.userId !== "string" ||
        typeof user.userName !== "string"
    )
  ) {
    throw new Error("Unexpected response while loading users.");
  }

  return users;
};

export const addOrganizationMember = async (organizationId, member) => {
  const response = await api.post(
    `/organization/${organizationId}/add-member`,
    member
  );
  return response.data;
};
