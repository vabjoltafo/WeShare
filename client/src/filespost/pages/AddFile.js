import React, { useContext } from "react";
import { useNavigate } from 'react-router-dom'

import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Button from "../../shared/components/FormElements/Button";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import { VALIDATOR_REQUIRE } from "../../shared/util/validators";
import FileUpload from "../../shared/components/FormElements/FileUpload";
import "./AddFile.css";

export default function AddFile() {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      file: {
        value: null,
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const navigate = useNavigate();

  const addFileSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append('title', formState.inputs.title.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('creator', auth.userId);
      formData.append('file', formState.inputs.file.value);
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + "/files/",
        "POST",
        formData,
        { Authorization: 'Bearer ' + auth.token }
      );
      navigate('/');
    } catch (err) {}
  };
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <div className="addFileForm">
        <h1>Add File</h1>
        <Card className="addFile">
          <form onSubmit={addFileSubmitHandler}>
            {isLoading && <LoadingSpinner asOverlay />}
            <Input
              element="input"
              id="title"
              type="text"
              label="Title"
              validators={[VALIDATOR_REQUIRE()]}
              onInput={inputHandler}
              errorText="Please enter a title!"
            />
            <Input
              element="textarea"
              id="description"
              label="Description"
              validators={[VALIDATOR_REQUIRE]}
              onInput={inputHandler}
              errorText="Please enter a description!"
            />
            <FileUpload
              onInput={inputHandler}
              id="file"
              type="file"
              validators={[VALIDATOR_REQUIRE]}
              errorText="Please upload a file!"
            />
            <Button type="submit" disabled={!formState.isValid}>Add File</Button>
          </form>
        </Card>
      </div>
    </React.Fragment>
  );
}
