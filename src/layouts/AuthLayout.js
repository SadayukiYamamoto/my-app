import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f0f0" }}>
      {children}
    </div>
  );
};

export default AuthLayout;
