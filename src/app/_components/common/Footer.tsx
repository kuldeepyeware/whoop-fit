import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#001636 text-white">
      {/* Mobile footer */}
      <div className="px-4 py-6 md:hidden">
        <div className="flex flex-col space-y-4">
          {/* <div className="flex flex-col space-y-2">
            <Link href="" className="text-sm hover:underline">
              Privacy Policy
            </Link>
            <Link href="" className="text-sm hover:underline">
              Terms of Service
            </Link>
          </div> */}
          <Link
            href="https://docs.google.com/forms/d/e/1FAIpQLSeevXIMEPaNFhqhWw3bTjZHrs6wgDMhoJERHbVZnACAnamJ0Q/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-white px-4 py-2 text-center text-sm font-medium text-[#001636]"
          >
            Provide Feedback
          </Link>
          <div className="mt-4 text-xs">
            <p>&copy; 2024 Fitcentive. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Desktop footer */}
      <div className="hidden px-4 py-4 md:block">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between space-y-4 p-4 md:flex-row md:space-x-4 md:space-y-0">
            <div>
              <p className="text-white">
                &copy; 2024 Fitcentive. All rights reserved.
              </p>
            </div>
            <div>
              <Link
                href="https://docs.google.com/forms/d/e/1FAIpQLSeevXIMEPaNFhqhWw3bTjZHrs6wgDMhoJERHbVZnACAnamJ0Q/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-white px-4 py-2 text-center text-[#001636] transition-colors hover:bg-opacity-90"
              >
                Provide Feedback
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
