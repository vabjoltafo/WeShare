import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";

import UserInfo from "../components/UserInfo";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./UserProfile.css";
import TableData from "../../filespost/components/TableData";

export default function UserProfile() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedFiles, setLoadedFiles] = useState();
  const [loadedUser, setLoadedUser] = useState();
  const auth = useContext(AuthContext);

  const userId = useParams().userId;
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
        setLoadedUser(responseData.userInfo);
      } catch (err) {}
    };
    fetchFiles();
  }, [sendRequest, userId, auth.token]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}

      <div className="userProfile">
        {!isLoading && loadedUser && (
          <div className="userInfo">
            <UserInfo user={loadedUser} />
          </div>
        )}

        {!isLoading && loadedFiles && (
          <div className="tableData">
            <TableData items={loadedFiles} />
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
