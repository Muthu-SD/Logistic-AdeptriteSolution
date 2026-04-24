import { apiRequest } from "../../../utils/Api";
import useStore from "../../../store/UseStore";

export const fetchTransitLeadTimeData = async (groupBy = "Month", startDate, endDate) => {
  const { user, selectedOrganization } = useStore.getState();
  const isSuperadmin = user?.role === "SUPERADMIN";

  if (isSuperadmin && !selectedOrganization) {
    return [];
  }

  const params = {
    groupBy,
    ...(isSuperadmin && { organizationId: selectedOrganization }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  return apiRequest("GET", "/excel/transit-lead-time", null, { params });
};