import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Select from "../../shared/components/FormElements/Select";
import Button from "../../shared/components/FormElements/Button";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import "./AddUser.css";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

export default function AddUser() {
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);

  const [formState, inputHandler] = useForm(
    {
      name: {
        value: "",
        isValid: false,
      },
      image: {
        value: null,
        isValid: true,
      },
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
      role: {
        value: "",
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

  const addUserSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', formState.inputs.name.value);
      formData.append('email', formState.inputs.email.value);
      formData.append('password', formState.inputs.password.value);
      formData.append('role', formState.inputs.role.value);
      formData.append('image', formState.inputs.image.value);
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + "/users/add-user",
        "POST",
        formData,
        { Authorization: 'Bearer ' + auth.token }
      );
      navigate('/users')
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <div className="addUserForm">
        <h1>Add User</h1>
        <Card className="addUser">
          {isLoading && <LoadingSpinner asOverlay />}
          <form onSubmit={addUserSubmitHandler}>
            <Input
              element="input"
              id="name"
              type="text"
              label="Name"
              validators={[VALIDATOR_REQUIRE()]}
              onInput={inputHandler}
            />
            <ImageUpload center id="image" onInput={inputHandler} />
            <Input
              element="input"
              id="email"
              type="email"
              label="E-Mail"
              validators={[VALIDATOR_EMAIL()]}
              onInput={inputHandler}
            />
            <Input
              element="input"
              id="password"
              type="password"
              label="Password"
              validators={[VALIDATOR_MINLENGTH(5)]}
              onInput={inputHandler}
            />
            <Select
              id="role"
              arrayOfData={userRoles}
              onInput={inputHandler}
              validators={[VALIDATOR_REQUIRE()]}
            />
            <Button type="submit" disabled={!formState.isValid}>Add User</Button>
          </form>
        </Card>
      </div>
    </React.Fragment>
  );
}
