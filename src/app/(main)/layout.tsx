import React from "react";
import Navbar from "@/app/_components/common/Navbar";
import { Toaster } from "../_components/ui/toaster";

const MainLayout = ({ children }: { children: React.ReactElement }) => {
  return (
    <main>
      <Navbar />
      {children}
      <Toaster />
    </main>
  );
};

export default MainLayout;
