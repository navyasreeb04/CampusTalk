import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const rawUser = localStorage.getItem("campustalk_user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("campustalk_token"));
  const [user, setUser] = useState(getStoredUser());
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(localStorage.getItem("campustalk_token")));

  useEffect(() => {
    let isMounted = true;

    const syncCurrentUser = async () => {
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        setIsAuthLoading(true);
        const { data } = await api.get("/users/me");

        if (!isMounted) {
          return;
        }

        setUser(data.user);
        localStorage.setItem("campustalk_user", JSON.stringify(data.user));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        localStorage.removeItem("campustalk_token");
        localStorage.removeItem("campustalk_user");
        setToken(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    syncCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem("campustalk_token", nextToken);
    localStorage.setItem("campustalk_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    setIsAuthLoading(false);
  };

  const updateUser = (nextUser) => {
    localStorage.setItem("campustalk_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("campustalk_token");
    localStorage.removeItem("campustalk_user");
    setToken(null);
    setUser(null);
    setIsAuthLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        isAuthLoading,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
