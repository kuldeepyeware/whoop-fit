"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { Menu, UserCircle2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useFundWallet } from "@privy-io/react-auth";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { baseSepolia } from "viem/chains";

const links = [
  {
    href: "/challenges",
    name: "Challenges",
  },
  {
    href: "/users",
    name: "Users",
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { ready, authenticated, logout } = usePrivy();
  const { fundWallet } = useFundWallet();
  const { smartAccountReady, smartAccountAddress } = useSmartAccount();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
      <Link
        href={"/dashboard"}
        className="hidden text-2xl font-bold hover:text-primary/70 md:block"
      >
        Fitcentive
      </Link>
      <nav className="hidden gap-x-10 md:flex">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="text-lg font-medium hover:text-primary/70"
            prefetch={true}
          >
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
              <Link href="/dashboard" onClick={() => setIsSheetOpen(false)}>
                <span className="text-2xl font-medium hover:text-primary/70">
                  Fitcentive
                </span>
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
      <Link
        className="font-medium hover:text-primary/70 md:hidden"
        href="/dashboard"
      >
        <span className="block text-2xl">Fitcentive</span>
      </Link>
      <div className="">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UserCircle2 className="h-9 w-9 text-black" strokeWidth={1} />
          </DropdownMenuTrigger>
          {authenticated && ready && smartAccountReady && (
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!smartAccountReady}
                onClick={async () =>
                  await fundWallet(smartAccountAddress!, {
                    chain: baseSepolia,
                  })
                }
              >
                Fund Wallet
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!authenticated}
                onClick={handleLogout}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
