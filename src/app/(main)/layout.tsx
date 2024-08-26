import React from "react";
import Navbar from "@/app/_components/common/Navbar";
import { Toaster } from "../_components/ui/toaster";
import Footer from "../_components/common/Footer";

const MainLayout = ({ children }: { children: React.ReactElement }) => {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="calc(100vh - 64px) flex-grow"> {children}</div>
      <Footer />
      <Toaster />
    </main>
  );
};

export default MainLayout;
