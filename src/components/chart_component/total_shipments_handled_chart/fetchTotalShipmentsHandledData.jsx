import { apiRequest } from "../../../utils/Api";
import useStore from "../../../store/UseStore";

// Dashboard view - uses year param
export const fetchTotalShipmentsHandledData = async (year = "all") => {
  const { user, selectedOrganization } = useStore.getState();
  const isSuperadmin = user?.role === "SUPERADMIN";

  if (isSuperadmin && !selectedOrganization) {
    return [];
  }

  const params = {
    year,
    ...(isSuperadmin && { organizationId: selectedOrganization }),
  };

  return apiRequest("GET", "/excel/total-shipments-handled", null, { params });
};

// Full view - uses groupBy + date range params
export const fetchTotalShipmentsHandledFullData = async (groupBy = "Month", startDate, endDate) => {
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

  return apiRequest("GET", "/excel/total-shipments-handled", null, { params });
};