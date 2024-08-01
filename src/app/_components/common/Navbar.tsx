"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const links = [
  {
    href: "/challenges",
    name: "Challenges",
  },
  {
    href: "/selfchallenges",
    name: "Self Challenges",
  },
  {
    href: "/users",
    name: "Users",
  },
];

const Navbar = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
      <Link href={"/"} className="text-2xl font-bold">
        Whoop Fit
      </Link>
      <nav className="flex gap-x-10">
        {links.map((link, index) => (
          <Link key={index} href={link.href} className="text-lg font-medium">
            {link.name}
          </Link>
        ))}
      </nav>
      <div>
        <ConnectButton
          showBalance={false}
          chainStatus={"none"}
          accountStatus={"address"}
        />
      </div>
    </header>
  );
};

export default Navbar;
