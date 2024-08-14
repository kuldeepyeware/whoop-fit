import React from "react";
import LandingNavbar from "../_components/common/LandingNavbar";

const MainLayout = ({ children }: { children: React.ReactElement }) => {
  return (
    <main>
      <LandingNavbar />
      {children}
    </main>
  );
};

export default MainLayout;
