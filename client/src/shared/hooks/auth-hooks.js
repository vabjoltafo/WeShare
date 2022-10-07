import { useState, useCallback, useEffect, useLayoutEffect } from "react";
import Cookies from "js-cookie";

let logoutTimer;

export const useAuth = () => {
  let initializeState;
  if (Cookies.get("userData")) {
    initializeState = () => !!JSON.parse(Cookies.get("userData"))
  }

  const [token, setToken] = useState(initializeState);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);
  const [isAdmin, setIsAdmin] = useState(initializeState);

  const login = useCallback((userRole, uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    if (userRole === "admin") {
      setIsAdmin(true);
    } else if (userRole !== "admin") {
      setIsAdmin(false);
    }
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    Cookies.set(
      "userData",
      JSON.stringify({
        userRole: userRole,
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
      })
    );
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    Cookies.remove("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useLayoutEffect(() => {
    if (Cookies.get("userData")) {
      const storedData = JSON.parse(Cookies.get("userData"));
      if (
        storedData &&
        storedData.token &&
        new Date(storedData.expiration) > new Date()
      ) {
        login(
          storedData.userRole,
          storedData.userId,
          storedData.token,
          new Date(storedData.expiration)
        );
      }
    }
  }, [login]);
  return {
    token,
    userId,
    isAdmin,
    login,
    logout,
  };
};
