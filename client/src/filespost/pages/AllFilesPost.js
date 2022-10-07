import React, { useEffect, useState, useContext } from "react";

import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import TableData from '../components/TableData';
import './AllFilesPost.css';

export default function UserFilesPost() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedFiles, setLoadedFiles] = useState();
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/files/all", "GET", null, { Authorization: 'Bearer ' + auth.token }
        );
        setLoadedFiles(responseData.files);
      } catch (err) {}
    };
    fetchFiles();
  }, [sendRequest, auth.token]);
  

  const fileDeletedHandler = (deletedFileId) => {
    setLoadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== deletedFileId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}

<div className="actionsBtn">
          <NavLink to="/add-file" className="addFileBtn" title="Add File">
            <FontAwesomeIcon icon={faPlus} /> Add File
          </NavLink>
        </div>
      {!isLoading && loadedFiles && (
        <div className="tableData">
          <TableData items={loadedFiles} onDeleteFile={fileDeletedHandler} />
        </div>
      )}
    </React.Fragment>
  );
}
