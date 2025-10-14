// src/context/UserContext.js
import React, { createContext, useContext, useState } from "react";
import Authservices from "../services/authServices";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userInfo");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const data = await Authservices.getUserOwnInfo();
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
      setUser(null);
      localStorage.removeItem("userInfo");
    } finally {
      setLoading(false);
    }
  };

  const setUserAfterLogin = (userInfo, accessToken, refreshToken) => {
    setUser(userInfo);
    Cookies.set("accessToken", accessToken, { expires: 0.3 }); // 0.3 gün
    Cookies.set("refreshToken", refreshToken, { expires: 7 });
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    localStorage.removeItem("userInfo");
  };

  return (
    <UserContext.Provider
      value={{ user, loading, fetchUserInfo, setUserAfterLogin, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
