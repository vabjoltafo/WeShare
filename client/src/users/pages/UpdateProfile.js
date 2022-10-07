import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

import Input from "../../shared/components/FormElements/Input";
import Select from "../../shared/components/FormElements/Select";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import Button from "../../shared/components/FormElements/Button";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import Card from "../../shared/components/UIElements/Card";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import "./UpdateProfile.css";
import Modal from "../../shared/components/UIElements/Modal";

export default function UpdateProfile() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUser, setLoadedUser] = useState();
  const [showChangeModal, setShowChangeModal] = useState();
  const userId = useParams().userId;
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const showChangePasswordModal = () => {
    setShowChangeModal(true);
  };

  const closeUpdateModal = () => {
    setShowChangeModal(false);
  };

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: {
        value: "",
        isValid: false,
      },
      email: {
        value: "",
        isValid: false,
      },
      role: {
        value: "",
        isValid: false,
      },
      image: {
        value: null,
        isValid: true,
      },
      currentpassword: {
        value: null,
        isValid: false,
      },
      newpassword: {
        value: null,
        isValid: false,
      },
      confirmnewpassword: {
        value: null,
        isValid: false,
      },
    },
    false
  );

  const userRoles = [
    {
      id: "user",
      name: "User",
    },
    {
      id: "admin",
      name: "Admin",
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + `/users/${userId}`,
          "GET",
          null,
          { Authorization: "Bearer " + auth.token }
        );
        setLoadedUser(responseData.user);
        setFormData(
          {
            name: {
              value: responseData.user.name,
              isValid: true,
            },
            email: {
              value: responseData.user.email,
              isValid: true,
            },
            role: {
              value: responseData.user.role,
              isValid: true,
            },
            image: {
              value: responseData.user.image,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchUser();
  }, [sendRequest, userId, setFormData, auth.token]);

  const userUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", formState.inputs.name.value);
      formData.append("email", formState.inputs.email.value);
      formData.append("image", formState.inputs.image.value);
      formData.append("role", formState.inputs.role.value);
      if (
        !formState.inputs.confirmnewpassword ||
        !formState.inputs.currentpassword ||
        !formState.inputs.newpassword
      ) {
      } else {
        formData.append(
          "currentPassword",
          formState.inputs.currentpassword.value
        );
        formData.append("newPassword", formState.inputs.newpassword.value);
        formData.append(
          "confirmNewPassword",
          formState.inputs.confirmnewpassword.value
        );
      }
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/users/${userId}`,
        "PATCH",
        formData,
        { Authorization: "Bearer " + auth.token }
      );
      navigate(`/users/${userId}`);
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedUser && !error) {
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
        show={showChangeModal}
        onCancel={closeUpdateModal}
        header="Change Password"
        footerClass="file-item__actions"
        footer={
          <React.Fragment>
            <Input
              id="currentpassword"
              element="input"
              type="password"
              label="Current Password"
              validators={[VALIDATOR_MINLENGTH(5)]}
              initialValid={true}
              onInput={inputHandler}
            />
            <Input
              id="newpassword"
              element="input"
              type="password"
              label="New Password"
              validators={[VALIDATOR_MINLENGTH(5)]}
              initialValid={true}
              onInput={inputHandler}
            />
            <Input
              id="confirmnewpassword"
              element="input"
              type="password"
              label="Confirm New Password"
              validators={[VALIDATOR_MINLENGTH(5)]}
              initialValid={true}
              onInput={inputHandler}
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
      <div className="updateUserForm">
        <Card className="updateUser">
          {!isLoading && inputHandler && (
            <form onSubmit={userUpdateSubmitHandler}>
              <Input
                id="name"
                element="input"
                type="text"
                label="Name"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter a valid name!"
                onInput={inputHandler}
                initialValue={loadedUser.name}
                initialValid={true}
              />
              <Input
                id="email"
                element="textarea"
                type="text"
                label="Email"
                validators={[VALIDATOR_EMAIL()]}
                errorText="Please enter a valid email!"
                onInput={inputHandler}
                initialValue={loadedUser.email}
                initialValid={true}
              />
              <ImageUpload center id="image" onInput={inputHandler} />
              {auth.isAdmin && (
                <Select
                  id="role"
                  arrayOfData={userRoles}
                  onInput={inputHandler}
                  initialValid={true}
                  initialValue={loadedUser.role}
                  validators={[VALIDATOR_REQUIRE()]}
                />
              )}
              {auth.userId === userId && (
                <div className="changePassword">
                  <Button type="button" edit onClick={showChangePasswordModal}>
                    <FontAwesomeIcon icon={faPenToSquare} /> Change Password
                  </Button>
                </div>
              )}
              <div className="buttonActions">
                <Button danger to={`/users/${userId}`}>
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
