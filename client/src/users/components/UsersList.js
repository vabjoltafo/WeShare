import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import UserItem from "./UserItem";
import Card from "../../shared/components/UIElements/Card";
import "./UsersList.css";

export default function UsersList(props) {
  const [searchInput, setSearchInput] = useState("");
  return (
    <React.Fragment>
      <div className="usersList">
        <div className="actionsBtn">
          <NavLink className="addUserLink" to="/add-user" title="Add User">
            <FontAwesomeIcon icon={faPlus} />
          </NavLink>
          <input
            type="text"
            placeholder="Search Users  "
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <ul className="users-list">
          {props.items
            .filter(
              (user) =>
                user.name.toLowerCase().includes(searchInput) ||
                user.name.toUpperCase().includes(searchInput)
            )
            .map((user) => (
              <UserItem
                key={user.id}
                id={user.id}
                image={user.image}
                name={user.name}
                email={user.email}
                filesCount={user.files.length}
              />
            ))}
        </ul>
        {props.items.filter(
          (user) =>
            user.name.toLowerCase().includes(searchInput) ||
            user.name.toUpperCase().includes(searchInput)
        ).length === 0 && (
          <Card>
            <h2>No files found.</h2>
          </Card>
        )}
      </div>
    </React.Fragment>
  );
}
