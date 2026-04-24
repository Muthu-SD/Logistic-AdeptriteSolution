import { apiRequest } from "../../../utils/Api";
import useStore from "../../../store/UseStore";

export const fetchCountryWiseVolumeData = async (monthYear = "all") => {
  const { user, selectedOrganization } = useStore.getState();
  const isSuperadmin = user?.role === "SUPERADMIN";

  if (isSuperadmin && !selectedOrganization) {
    return [];
  }

  const params = {
    monthYear,
    ...(isSuperadmin && { organizationId: selectedOrganization }),
  };

  return apiRequest("GET", "/excel/country-wise-volume", null, { params });
};

export const fetchCountryWiseVolumeFullData = async (
  groupBy = "Month",
  startDate,
  endDate
) => {
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

  const response = await apiRequest(
    "GET",
    "/excel/country-wise-volume",
    null,
    { params }
  );

  const normalized = response?.data ?? response;
  return Array.isArray(normalized) ? normalized : [];
};