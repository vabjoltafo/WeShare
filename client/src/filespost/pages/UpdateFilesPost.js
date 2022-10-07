import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

import Input from "../../shared/components/FormElements/Input";
import FileUpload from "../../shared/components/FormElements/FileUpload";
import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import Card from "../../shared/components/UIElements/Card";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import "./UpdateFilesPost.css";

export default function UpdateFilesPost() {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedFile, setLoadedFile] = useState();
  const [showUpdateModal, setShowUpdateModal] = useState();
  const fileId = useParams().fileId;
  const navigate = useNavigate();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      file: {
        value: null,
        isValid: false,
      },
    },
    false
  );

  const showFileUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
  };

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + `/files/${fileId}`,
          "GET",
          null,
          { Authorization: "Bearer " + auth.token }
        );
        setLoadedFile(responseData.filePost);
        setFormData(
          {
            title: {
              value: responseData.filePost.title,
              isValid: true,
            },
            description: {
              value: responseData.filePost.description,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchFile();
  }, [sendRequest, fileId, setFormData, auth.token]);

  const fileUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", formState.inputs.title.value);
      formData.append("description", formState.inputs.description.value);
      if (!formState.inputs.file) {
      } else {
        formData.append("file", formState.inputs.file.value);
      }
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/files/${fileId}`,
        "PATCH",
        formData,
        { Authorization: "Bearer " + auth.token }
      );
      navigate("/");
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedFile && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find file!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showUpdateModal}
        onCancel={closeUpdateModal}
        header="Choose your new file."
        footerClass="file-item__actions"
        footer={
          <React.Fragment>
            <FileUpload
              onInput={inputHandler}
              id="file"
              type="file"
              validators={[VALIDATOR_REQUIRE]}
              errorText="Please upload a file!"
            />
            <div className="buttonActions">
              <Button inverse onClick={closeUpdateModal}>
              <FontAwesomeIcon icon={faTimes} />
            </Button>
            <Button confirm onClick={closeUpdateModal}>
              <FontAwesomeIcon icon={faCheck} />
            </Button>
            </div>
            
          </React.Fragment>
        }
      ></Modal>
      <div className="updateFileForm">
        <Card className="updateFile">
          {!isLoading && loadedFile && (
            <form onSubmit={fileUpdateSubmitHandler}>
              <Input
                id="title"
                element="input"
                type="text"
                label="Title"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter a valid title!"
                onInput={inputHandler}
                initialValue={loadedFile.title}
                initialValid={true}
              />
              <Input
                id="description"
                element="textarea"
                type="text"
                label="Description"
                validators={[VALIDATOR_MINLENGTH(5)]}
                errorText="Please enter a valid description! Minimum 5 characters."
                onInput={inputHandler}
                initialValue={loadedFile.description}
                initialValid={true}
              />
              <Button type="button" edit onClick={showFileUpdateModal}>
                <FontAwesomeIcon icon={faPenToSquare} /> Update File
              </Button>
              <div className="buttonActions">
                <Button danger to="/">
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
                <Button confirm type="submit" disabled={!formState.isValid}>
                  <FontAwesomeIcon icon={faCheck} />
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </React.Fragment>
  );
}
