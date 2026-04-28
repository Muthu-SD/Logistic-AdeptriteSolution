import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../utils/Api";
import useStore from "../store/UseStore";
import useResponsive from "../hooks/useResponsive";
import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "../styles/MainLayout.module.css";
import Dashboard from "../pages/dashboard/Dashboard";

const MainLayout = () => {
  const { isSuperadmin } = useStore();
  const { isMobile, isTablet } = useResponsive();
  const [organizations, setOrganizations] = useState([]);

  // ======================
  // SIDEBAR STATE (local)
  // ======================
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile || isTablet);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Sync collapsed default when breakpoint changes
  useEffect(() => {
    if (isMobile) {
      setSidebarMobileOpen(false);
    } else {
      setSidebarCollapsed(isTablet);
    }
  }, [isMobile, isTablet]);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const handleMobileClose = useCallback(() => {
    setSidebarMobileOpen(false);
  }, []);

  useEffect(() => {
    if (isSuperadmin()) {
      apiRequest("GET", "/users/superadmin/organizations")
        .then(setOrganizations)
        .catch(() => setOrganizations([]));
    }
  }, [isSuperadmin]);

  // Determine layout class based on sidebar state
  const contentClass = [
    styles.mainContent,
    !isMobile && sidebarCollapsed ? styles.contentCollapsed : "",
    !isMobile && !sidebarCollapsed ? styles.contentExpanded : "",
    isMobile ? styles.contentMobile : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.appLayout}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={sidebarMobileOpen}
        onMobileClose={handleMobileClose}
        isMobile={isMobile}
      />
      <div className={contentClass}>
        <Header
          organizations={organizations}
          onToggleSidebar={handleToggleSidebar}
          isMobile={isMobile}
          sidebarCollapsed={sidebarCollapsed}
          sidebarMobileOpen={sidebarMobileOpen}
        />
        <Dashboard />
      </div>
    </div>
  );
};

export default MainLayout;
