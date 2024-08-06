"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  return (
    <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
      <Link href={"/"} className="hidden text-2xl font-bold md:block">
        Whoop Fit
      </Link>
      <nav className="hidden gap-x-10 md:flex">
        {links.map((link, index) => (
          <Link key={index} href={link.href} className="text-lg font-medium">
            {link.name}
          </Link>
        ))}
      </nav>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger className="block md:hidden">
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px]">
          <SheetHeader className="space-y-8">
            <SheetTitle>
              <Link href="/" onClick={() => setIsSheetOpen(false)}>
                <span className="text-2xl font-medium">Whoop Fit</span>
              </Link>
            </SheetTitle>
            <SheetDescription className="space-y-2">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <div className="">
        <ConnectButton showBalance={false} chainStatus={"none"} />
      </div>
    </header>
  );
};

export default Navbar;
