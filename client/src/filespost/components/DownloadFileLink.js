import React, { useContext } from "react";
import { AuthContext } from "../../shared/context/auth-context";

export default function DownloadFileLink({ fileId, fileName }) {
  const auth = useContext(AuthContext);

  fetch(`${process.env.REACT_APP_BACKEND_URL}/files/download/${fileId}`, {
    headers: { Authorization: "Bearer " + auth.token },
  })
    .then((response) => response.blob())
    .then(function (blob) {
      document.getElementById("anchor").href = URL.createObjectURL(blob);
    });
  return (
    <a
      id="anchor"
      href="!#"
      target="_blank"
      download={fileName.split('\\')[2]}
      rel="noreferrer"
    >
      {fileName.split('\\')[2]}
    </a>
  );
}
