import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../utils/Api";
import useStore from "../store/UseStore";

export const useOrganizationData = () => {
  const { user, selectedOrganization } = useStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const organizationId = isSuperadmin ? selectedOrganization : user?.organizationId;

  return useQuery({
    queryKey: ["organization-data", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const res = await apiRequest("GET", `/users/organization/me`, {}, { params: { organizationId } });
      return res;
    },
    enabled: !!organizationId, // Only fetch if we have an ID
    staleTime: 5 * 60 * 1000,
  });
};
