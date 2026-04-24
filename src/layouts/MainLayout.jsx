import { useEffect, useState } from "react";
import { apiRequest } from "../utils/Api";
import useStore from "../store/UseStore";
import Header from "./Header";
import styles from "../styles/MainLayout.module.css";
import Dashboard from "../pages/dashboard/Dashboard";

const MainLayout = () => {
  const { isSuperadmin } = useStore();
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    if (isSuperadmin()) {
      apiRequest("GET", "/users/superadmin/organizations")
        .then(setOrganizations)
        .catch(() => setOrganizations([]));
    }
  }, [isSuperadmin]);

  return (
    <>
      <div className={styles.headerContainer}>
        <Header organizations={organizations} />
        {/* <div > */}
        <Dashboard />
        {/* </div> */}
      </div>
    </>
  );
};

export default MainLayout;
