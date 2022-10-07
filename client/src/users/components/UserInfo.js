import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faPenToSquare, faXmark, } from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import Modal from "../../shared/components/UIElements/Modal";
import "./UserInfo.css";

export default function UserInfo(props) {
  const { error, sendRequest, clearError } = useHttpClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const auth = useContext(AuthContext);
  const userId = auth.userId;
  const navigate = useNavigate();

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/users/user/${props.user._id}`,
        "DELETE",
        null,
        { Authorization: 'Bearer ' + auth.token }
      );
      navigate("/users");
      props.onDelete(props.user._id);
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="file-item__actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>
          </React.Fragment>
        }
      >
        <p>Do you want to proceed and delete this user?</p>
      </Modal>
      <div className="user">
        <div className="user-info">
          <img
            src={process.env.REACT_APP_ASSET_URL + `/${props.user.image}`}
            alt=""
            style={{ width: "6rem", height: "6rem", borderRadius: "50%" }}
          />
          <div className="userData">
          <h2>{props.user.name}</h2>
            <h4>{props.user.email}</h4>
            <p style={{ textTransform: "capitalize" }}>
              {props.user.role}
            </p>
            <p>Files: {props.user.files.length}</p>
          </div>
        </div>
        <div className="buttonActions">
          {(auth.isAdmin || userId === props.user._id) && (
            <Button edit to={`/users/${props.user._id}/edit`}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
          )}
          {auth.isAdmin && userId && (
            <Button danger onClick={showDeleteWarningHandler}>
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
