import React from "react";
import Navbar from "@/app/_components/common/Navbar";

const MainLayout = ({ children }: { children: React.ReactElement }) => {
  return (
    <main>
      <Navbar />
      {children}
    </main>
  );
};

export default MainLayout;
