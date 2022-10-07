import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import Card from "../../shared/components/UIElements/Card";
import "./EmailVerify.css";
export default function EmailVerify() {
  const [validUrl, setValidUrl] = useState(false);
  const params = useParams();

  useEffect(() => {
    const verifyEmailUrl = async () => {
      try {
        await fetch(
          `http://localhost:5000/api/users/user/${params.uid}/verify/${params.emailToken}`
        );
        setValidUrl(true);
      } catch (error) {
        console.log(error);
        setValidUrl(false);
      }
    };
    verifyEmailUrl();
  }, [params]);
  return (
    <>
      {validUrl && (
        <div className="emailVerifyContainer">
          <Card className="emailVerify">
            <div className="loginLink">
              <h1>Your email has been successfully verified!</h1>
              <Link className="login-link" to="/login">
                Login
              </Link>
            </div>
          </Card>
        </div>
      )}
      {!validUrl && (
        <div className="emailVerifyContainer">
          <Card>
            <div>
              <h1>We couldn't verify your email! Please contact with the support!</h1>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
