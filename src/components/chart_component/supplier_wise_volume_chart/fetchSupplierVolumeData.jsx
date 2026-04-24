import { apiRequest } from "../../../utils/Api";
import useStore from "../../../store/UseStore";

// Dashboard view - uses old monthYear param (unchanged behavior)
export const fetchSupplierWiseVolumeData = async (monthYear = "all") => {
  const { user, selectedOrganization } = useStore.getState();
  const isSuperadmin = user?.role === "SUPERADMIN";

  if (isSuperadmin && !selectedOrganization) {
    return [];
  }

  const params = {
    monthYear,
    ...(isSuperadmin && { organizationId: selectedOrganization }),
  };

  return apiRequest("GET", "/excel/supplier-wise-volume", null, { params });
};

// Full view - uses groupBy + date range params
export const fetchSupplierWiseVolumeFullData = async (groupBy = "Month", startDate, endDate) => {
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

  const response = await apiRequest("GET", "/excel/supplier-wise-volume", null, { params });
  const normalized = response?.data ?? response;
  return Array.isArray(normalized) ? normalized : [];
};