import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/userinfo', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated === true || data.authenticated === 'true') {
          setUserInfo(data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setUserInfo(null);
        setIsAuthenticated(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, isAuthenticated, setIsAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};