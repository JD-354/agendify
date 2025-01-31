import React, { useState } from "react";
import Login from "../components/Login";
import Registro from "../components/Registro";
const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const toggleAuthPanel = () => {
    setIsLogin(!isLogin); 
  };

  return (
    <div>
      {isLogin ? (
        <Login toggleToRegister={toggleAuthPanel} />
      ) : (
        <Registro toggleToLogin={toggleAuthPanel} />
      )}
    </div>
  );
};

export default Auth;
