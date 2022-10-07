import React from "react";
import { Link } from "react-router-dom";

import Card from "../../shared/components/UIElements/Card";
import Avatar from "../../shared/components/UIElements/Avatar";
import "./UserItem.css";

export default function UserItem(props) {
  return (
    <li className="user-item">
      <Card className="user-item__content">
        <Link to={`/users/${props.id}`}>
          <div className="user-item__image">
            <Avatar image={process.env.REACT_APP_ASSET_URL + `/${props.image}`} alt={props.name} />
          </div>
          <div className="user-item__info">
            <h2>{props.name}</h2>
            <h3>
              {props.filesCount} {props.filesCount === 1 ? "File" : "Files"}
            </h3>
            
            <p>{props.email}</p>
          </div>
        </Link>
      </Card>
    </li>
  );
}
