import React from "react";
import Navbar from "@/app/_components/common/Navbar";
import { Toaster } from "../_components/ui/toaster";
import Footer from "../_components/common/Footer";

const MainLayout = ({ children }: { children: React.ReactElement }) => {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen"> {children}</div>
      <Footer />
      <Toaster />
    </main>
  );
};

export default MainLayout;
