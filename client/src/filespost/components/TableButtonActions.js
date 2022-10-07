import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom'

import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import Modal from "../../shared/components/UIElements/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faXmark, faTrashCan, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import './TableButtonActions.css'

export default function TableButtonActions({ data }, props) {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);

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
        process.env.REACT_APP_BACKEND_URL + `/files/${data.id}`,
        "DELETE",
        null,
        { Authorization: "Bearer " + auth.token }
      );
      props.onDelete(data.id);
      navigate("/");
    } catch (err) {}
  };

  return (
    <>
    <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="file-item__actions"
        footer={
          <React.Fragment>
            <Button inverse small onClick={cancelDeleteHandler}>
              <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button danger small onClick={confirmDeleteHandler}>
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>
          </React.Fragment>
        }
      >
        <p>Do you want to proceed and delete this file?</p>
      </Modal>
      <Button marginRight edit to={`/${data.id}/edit`}>
        <FontAwesomeIcon icon={faPenToSquare} />
      </Button>
      <Button danger onClick={showDeleteWarningHandler}>
        <FontAwesomeIcon icon={faTrashCan} />
      </Button>
    </>
  );
}
