import  { useRef, useState } from "react";
import { message, Spin } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleOutlined } from "@ant-design/icons";
import styles from ".././styles/ImportExcel.module.css";
import { apiRequest } from "../utils/Api";
import useStore from "../store/UseStore";

const ImportExcel = ({ onSuccess }) => {
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { user, selectedOrganization } = useStore();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // 🚫 Regular users should never upload
  if (user?.role !== "SUPERADMIN" && user?.role !== "ADMIN") {
    return null;
  }
  
  const { mutate: uploadExcel } = useMutation({
    mutationFn: (formData) => apiRequest("POST", "/excel/upload", formData), // token auto-attached via interceptor
    onSuccess: () => {
      setUploading(false);
      setUploadSuccess(true);
      message.success("Excel uploaded successfully!");

      setTimeout(() => {
        // queryClient.invalidateQueries({ queryKey: ["current-shipment-data"] });// Invalidate queries to refresh data and same queryKey name as in the API
        // queryClient.invalidateQueries({ queryKey: ["transit-lead-time-data"] });
        // queryClient.invalidateQueries({ queryKey: ["supplier-wise-volume"] });
        // queryClient.invalidateQueries({ queryKey: ["country-wise-volume"] });
        // queryClient.invalidateQueries({ queryKey: ["total-shipments-handled"] });
        // queryClient.invalidateQueries({ queryKey: ["shipment-under-clearance-table"] });
        // queryClient.invalidateQueries({ queryKey: ["outstanding-overdue-table"] });
        // queryClient.invalidateQueries({ queryKey: ["shipment-in-pipeline-table"] });
        // queryClient.invalidateQueries({ queryKey: ["current-info-marquee"] });
        queryClient.invalidateQueries();
        setUploadSuccess(false);
        onSuccess?.(); // Call the onSuccess callback if provided
      }, 1500);
    },
    onError: (err) => {
      setUploading(false);
      message.error(err || "Upload failed");
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;// If no file selected, exit early

    const targetOrgId = user?.role === "SUPERADMIN" ? selectedOrganization : user?.organizationId;

    if (!targetOrgId) {
      message.warning("Please select an organization first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);// Append the selected file to FormData

    formData.append("organizationId", targetOrgId);

    setUploading(true);
    uploadExcel(formData);// Trigger the upload request
    fileInputRef.current.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }} // Hide the file input
        accept=".xlsx, .xls" // Restrict accepted file formats
        onChange={handleFileChange} // Handle file change event
      />
      <button
        style={{ display: "none" }} // Hide the button
        onClick={() => fileInputRef.current?.click()} // Trigger the file input click event
        id="triggerImportBtn"
      />

      {(uploading || uploadSuccess) && (
        <div className={styles.fullscreenOverlay}>
          {uploading && <Spin size="large" />}
          {uploadSuccess && (
            <CheckCircleOutlined
              className={styles.successTick}
              style={{ fontSize: 64, color: "limegreen" }}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ImportExcel;
