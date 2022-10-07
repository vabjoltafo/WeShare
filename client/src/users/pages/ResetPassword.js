import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import "./Login.css";
import { VALIDATOR_MINLENGTH } from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";

export default function Login() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const navigate = useNavigate();
  const params = useParams();

  const [formState, inputHandler] = useForm(
    {
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

  const resetPasswordHandler = async (event) => {
    event.preventDefault();
    try {
      
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/users/user/${params.uid}/reset-password/${params.emailToken}`,
        "PATCH",
        JSON.stringify({
          newPassword: formState.inputs.newpassword.value,
          confirmNewPassword: formState.inputs.confirmnewpassword.value,
        }),
        {
          "Content-Type": "application/json",
        }
      );
      navigate("/login");
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />

      <div className="login-form">
        <h1>Reset Password</h1>
        <Card className="login">
          {isLoading && <LoadingSpinner asOverlay />}
          <form onSubmit={resetPasswordHandler}>
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
            <Button>Submit</Button>
          </form>
        </Card>
      </div>
    </React.Fragment>
  );
}
