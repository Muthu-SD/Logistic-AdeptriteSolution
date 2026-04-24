import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set,get) => ({
      // ======================
      // AUTH STATE
      // ======================
      user: null,  // { id, email, role, organizationId }
      token: null,

      // ======================
      // SUPERADMIN STATE
      // ======================
      selectedOrganization: null,


      // ======================
      // THEME STATE
      // ======================
      theme: "light", // 'light' or 'dark'

      // ======================
      // SETTERS
      // ======================
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      
      setAuth: ({ user, token }) => set({ user, token }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setSelectedOrganization: (orgId) => set({ selectedOrganization: orgId }),

      // ======================
      // HELPERS
      // ======================
      isAuthenticated: () => Boolean(get().token),

      isSuperadmin: () => get().user?.role === "SUPERADMIN",

      organizationId: () => get().user?.organizationId || null,

      // ======================
      // LOGOUT
      // ======================
      logout: () => set({ user: null, token: null,selectedOrganization: null }),

    }),
    {
      name: "auth-storage", // key for localStorage
      getStorage: () => localStorage,
    }
  )
);

export default useStore;
