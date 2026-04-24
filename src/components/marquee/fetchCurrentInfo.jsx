import { apiRequest } from "../../utils/Api";
import useStore from "../../store/UseStore";

export const fetchCurrentInfo = async () => {
  const { user, selectedOrganization } = useStore.getState();
  const isSuperadmin = user?.role === "SUPERADMIN";

  if (isSuperadmin && !selectedOrganization) {
    return [];
  }

  const params = {
    ...(isSuperadmin && { organizationId: selectedOrganization }),
  };

  return apiRequest("GET", "/excel/latest-oneliner", null, { params });
};