import React, { useContext, useEffect, useState } from "react";

import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import "./MyFilesPost.css";
import TableData from "../components/TableData";

export default function MyFilesPost() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedFiles, setLoadedFiles] = useState();
  const auth = useContext(AuthContext);
  const userId = auth.userId;

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + `/files/user/${userId}`,
          "GET",
          null,
          { Authorization: "Bearer " + auth.token }
        );
        setLoadedFiles(responseData.filePosts);
      } catch (err) {}
    };
    fetchFiles();
  }, [sendRequest, userId, auth.token]);

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

      {userId && (
        <div className="actionsBtn">
          <NavLink to="/add-file" className="addFileBtn" title="Add File">
            <FontAwesomeIcon icon={faPlus} /> Add File
          </NavLink>
        </div>
      )}
      {!isLoading && loadedFiles && (
        <div className="tableData">
          <TableData items={loadedFiles} onDeleteFile={fileDeletedHandler} />
        </div>
      )}
    </React.Fragment>
  );
}
