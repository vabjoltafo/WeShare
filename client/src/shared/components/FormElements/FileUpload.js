import React, { useRef, useState, useEffect } from "react";

import Button from "./Button";
import "./FileUpload.css";

const FileUpload = (props) => {
  const [file, setFile] = useState();
  const [isValid, setIsValid] = useState(false);

  const filePickerRef = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = (event) =>{
    let pickedFile;
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    props.onInput(props.id, pickedFile, fileIsValid);
  }

  const pickFileHandler = () =>{
    filePickerRef.current.click();
  }
  return (
    <div className="form-control">
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: "none" }}
        type="file"
        accept=".pdf, .doc, .docx"
        onChange={pickedHandler}
      />
      <div className={`file-upload ${props.center && 'center'}`}>
      {file && <p className="file">{file.name}</p>}
          {!file && <p>Please pick a file.</p>}
        <Button type="button" onClick={pickFileHandler}>Pick File</Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default FileUpload;
