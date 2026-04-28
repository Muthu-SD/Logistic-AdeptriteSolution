import { useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdLocalShipping,
  MdAnalytics,
  MdSummarize,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
} from "react-icons/md";
import logo from "../assets/Logo3.png";
import styles from "../styles/Sidebar.module.css";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: MdDashboard, enabled: true },
  { key: "shipments", label: "Shipments", icon: MdLocalShipping, enabled: false },
  { key: "analytics", label: "Analytics", icon: MdAnalytics, enabled: false },
  { key: "reports", label: "Reports", icon: MdSummarize, enabled: false },
];

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose, isMobile }) => {
  const location = useLocation();

  // Dashboard is always the active item (single-page app)
  const activeKey = "dashboard";

  // Build sidebar classes
  const sidebarClasses = [
    styles.sidebar,
    !isMobile && collapsed ? styles.collapsed : "",
    isMobile ? (mobileOpen ? styles.mobileOpen : styles.mobileHidden) : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobile && mobileOpen && (
        <div className={styles.backdrop} onClick={onMobileClose} />
      )}

      <aside className={sidebarClasses}>
        {/* ---- Logo Section ---- */}
        <div className={styles.logoSection}>
          <img
            src={logo}
            alt="Adeptrite Solutions"
            className={styles.sidebarLogo}
          />
          {(isMobile || !collapsed) && (
            <div className={styles.brandText}>
              <span className={styles.brandName}>Adeptrite</span>
              <span className={styles.brandSub}>Solutions</span>
            </div>
          )}
          {isMobile && (
            <button
              className={styles.closeBtn}
              onClick={onMobileClose}
              aria-label="Close sidebar"
            >
              <MdClose />
            </button>
          )}
        </div>

        {/* ---- Section Label ---- */}
        <div className={styles.sectionLabel}>Menu</div>

        {/* ---- Navigation Items ---- */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeKey;
            const isDisabled = !item.enabled;

            const itemClasses = [
              styles.navItem,
              isActive ? styles.active : "",
              isDisabled ? styles.disabled : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={item.key} className={itemClasses}>
                <div className={styles.navItemIcon}>
                  <Icon />
                </div>
                <span className={styles.navItemLabel}>{item.label}</span>
                {/* Tooltip for collapsed state */}
                <span className={styles.tooltip}>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className={styles.separator} />

        {/* ---- Version Badge ---- */}
        <div className={styles.bottomSection}>
          <div className={styles.versionBadge}>
            <span>v1.0.0</span>
          </div>
        </div>

        {/* ---- Collapse Toggle (desktop/tablet only) ---- */}
        {!isMobile && (
          <button
            className={styles.collapseBtn}
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
