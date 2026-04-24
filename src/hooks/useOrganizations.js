import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../utils/Api";

export const useOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () =>
      apiRequest("GET", "/users/superadmin/organizations"),
  });
};