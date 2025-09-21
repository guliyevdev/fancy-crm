// src/context/UserContext.js
import React, { createContext, useContext, useState } from "react";
import Authservices from "../services/authServices";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Lazy fetch: yalnız lazım olanda çağırılır
    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            const data = await Authservices.getUserOwnInfo();
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch user info:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, fetchUserInfo }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
