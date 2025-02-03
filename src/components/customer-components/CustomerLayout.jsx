import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerHeader from "./CustomerHeader";
import CustomerFooter from "./CustomerFooter";
import ScrollToTop from "../common-components/ScrollToTop";
import ScrollToTopButton from "../common-components/ScrollToTopButton";

const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-900">
      <ScrollToTop />
      <CustomerHeader />

      <main className="flex-grow w-full">
        <Outlet />
        <ScrollToTopButton />
      </main>

      <CustomerFooter />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default CustomerLayout;
