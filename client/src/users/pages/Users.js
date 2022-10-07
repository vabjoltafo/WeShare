import React, { useEffect, useState, useContext } from "react";

import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import TableData from "../components/TableData";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./Users.css";

export default function Users() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/users/",
          "GET",
          null,
          { Authorization: "Bearer " + auth.token }
        );
        setLoadedUsers(responseData.users);
      } catch (err) {}
    };
    fetchUsers();
  }, [sendRequest, auth.token]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      <div className="actionsBtn">
        <NavLink to="/add-user" className="addFileBtn" title="Add File">
          <FontAwesomeIcon icon={faPlus} /> Add User
        </NavLink>
      </div>
      {!isLoading && loadedUsers && (
        <div className="tableData">
          <TableData items={loadedUsers} />
        </div>
      )}
    </React.Fragment>
  );
}
