import { useState } from "react";
import useResponsive from "../hooks/useResponsive";
import { Avatar, Dropdown, message, Select } from "antd";
import { UserOutlined, UserAddOutlined, ImportOutlined, DownloadOutlined, LogoutOutlined, ApartmentOutlined, EditOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import useStore from "../store/UseStore";
import { useOrganizationData } from "../hooks/useOrganizationData";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";
import ImportExcel from "../components/ImportExcel";
import logo from "../assets/Logo3.png";
import CurrentInfoMarquee from "../components/marquee/CurrentInfoMarquee";
import { downloadFile } from "../utils/Api";
import { useQueryClient } from "@tanstack/react-query";
import CreateOrganization from "../pages/superadmin/CreateOrganization";
import CreateUser from "../pages/superadmin/CreateUser";
import EditOrganizationTitles from "../pages/superadmin/EditOrganizationTitles";


const Header = ({ organizations = [] }) => {
  const queryClient = useQueryClient();
  const { isMobile, responsive } = useResponsive();

  const navigate = useNavigate();
  const { user, logout,selectedOrganization,setSelectedOrganization, toggleTheme, theme } = useStore();
  const { data: orgData } = useOrganizationData();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN";
  const isDark = theme === "dark";

    const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditTitlesOpen, setIsEditTitlesOpen] = useState(false);

const handleOrgChange = (orgId) => {
  setSelectedOrganization(orgId);
  // Force dashboard refresh
  queryClient.invalidateQueries(); // refresh dashboard
};

  const handleLogout = () => {
    logout();
    message.success("Logged out successfully");
    navigate("/login");
  };

  const triggerImport = () => {
    const targetOrgId = isSuperadmin ? selectedOrganization : user?.organizationId;
    if (!targetOrgId) {
      message.warning("Please select an organization first");
      return;
    }
    document.getElementById("triggerImportBtn")?.click();
  };

  const handleDownload = async () => {
    const targetOrgId = isSuperadmin ? selectedOrganization : user?.organizationId;
    if (!targetOrgId) {
      message.warning("Please select an organization first");
      return;
    }
    try {
      await downloadFile(`/excel/download?organizationId=${targetOrgId}`, "logistics_dashboard_data.xlsx");
      message.success("Excel file downloaded successfully");
    } catch (error) {
      message.error("Failed to download Excel file");
    }
  };

  // Build menu items array
 const menuItems = [
    ...(isSuperadmin
     ? [
       {
         key: "create-org",
         icon: <ApartmentOutlined />,
         label: "Create Organization",
         onClick: () => setIsCreateOrgOpen(true),
       },
       {
         key: "create-user",
         icon: <UserAddOutlined />,
         label: "Create User",
         onClick: () => setIsCreateUserOpen(true),
       },
       {
         key: "edit-titles",
         icon: <EditOutlined />,
         label: "Edit Dashboard Titles",
         onClick: () => {
             if (!selectedOrganization) return message.warning("Please select an organization first");
             setIsEditTitlesOpen(true);
         },
       },
       {
         type: "divider",
       },
       {
         key: "import",
         icon: <ImportOutlined />,
         label: "Import Excel",
         onClick: triggerImport,
       },
       {
         key: "download",
         icon: <DownloadOutlined />,
         label: "Download Excel",
         onClick: handleDownload,
       },
     ]
      : isAdmin ? [
        {
          key: "import",
          icon: <ImportOutlined />,
          label: "Import Excel",
          onClick: triggerImport,
        },
        {
          key: "download",
          icon: <DownloadOutlined />,
          label: "Download Excel",
          onClick: handleDownload,
        },
        {
          type: "divider",
        },
      ] : []),
    {
      key: "signout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      onClick: handleLogout,
    },
  ];


  return (
    <div className={styles.header}>
      <img src={logo} alt="Logo" className={styles.logo} />
      {/* Marquee displayed on the header */}
      <CurrentInfoMarquee />
      <div style={{ display: "flex", alignItems: "center", gap: responsive({ xs: 4, sm: 6, md: 10, lg: 12, xl: 12 }), flexShrink: 0 }}>

         {/* Organization Logo */}
        {orgData?.logoLight && (
          <img
            src={orgData?.logoLight}
            alt="Org Logo"
            style={{
              height: 36,
              width: "auto",
              objectFit: "contain",
              filter: isDark ? "brightness(0) invert(1)" : "none",
              transition: "filter 0.3s ease",
            }}
          />
        )}
        
        {/* Organization selector (SUPERADMIN only) */}
        {isSuperadmin && (
          <Select
            placeholder={isMobile ? "Org" : "Select Organization"}
            value={selectedOrganization}
            onChange={handleOrgChange}
            style={{ width: responsive({ xs: 100, sm: 120, md: 180, lg: 200, xl: 220 }) }}
            size={isMobile ? "small" : "middle"}
            options={organizations.map((org) => ({
              label: org.name,
              value: org._id,
            }))}
          />
        )}
        
        <button
          onClick={toggleTheme}
          className={styles.themeToggleBtn}
        >
          <SunOutlined className={styles.sunIcon} />
          <MoonOutlined className={styles.moonIcon} />
        </button>

        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Avatar
            icon={<UserOutlined />}
            size={responsive({ xs: 26, sm: 28, md: 32, lg: 32, xl: 32 })}
            style={{ cursor: "pointer", backgroundColor: "var(--table-header-bg)", fontSize: responsive({ xs: 12, sm: 14, md: 16, lg: 16, xl: 16 }) }}
          />
        </Dropdown>

        {/* Hidden Import Excel Component */}
        <ImportExcel />
      </div>

      {/* Superadmin Modals Mounted Render */}
      <CreateOrganization isOpen={isCreateOrgOpen} onClose={() => setIsCreateOrgOpen(false)} />
      <CreateUser isOpen={isCreateUserOpen} onClose={() => setIsCreateUserOpen(false)} />
      <EditOrganizationTitles isOpen={isEditTitlesOpen} onClose={() => setIsEditTitlesOpen(false)} />
    </div>
  );
};

export default Header;
