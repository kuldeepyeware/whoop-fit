"use client";

import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useEffect } from "react";

const LandingPage = () => {
  const router = useRouter();
  const { authenticated } = usePrivy();

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/login");
  }, [router]);

  return (
    <div className="font-inter bg-white text-black">
      <header className="bg-white py-20 text-center">
        <div className="container mx-auto px-5">
          <h1 className="mb-5 h-14 bg-gradient-to-r from-[#ceddf6] to-[#1756c6] bg-clip-text text-5xl font-extrabold text-transparent">
            Sovereign, Incentivized Health
          </h1>
          <h2 className="mb-10 text-2xl font-normal">
            Pairing measurable biometric data with monetary <br />
            incentives to achieve lasting health goals.
          </h2>
          <Link
            className="rounded-md bg-[#1756c6]/90 p-4 text-lg font-medium text-white hover:bg-[#1756c6]/50"
            href={authenticated ? "/dashboard" : "/login"}
          >
            Enter App
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-5">
        <div id="features" className="mt-20 grid gap-10 md:grid-cols-3">
          <div className="rounded-3xl bg-card p-10 shadow-lg transition-all hover:-translate-y-2 hover:transform hover:shadow-xl">
            <div className="mb-5 text-5xl">🤝</div>
            <h3 className="mb-4 bg-gradient-to-r from-[#1756c6] to-[#ceddf6] bg-clip-text text-2xl font-semibold text-transparent">
              1. Sponsor
            </h3>
            <p>
              Invest in friends, employees, or family. If their biometrics
              improve, they get your investment; otherwise, get your money back.
            </p>
          </div>
          <div className="rounded-3xl bg-card p-10 shadow-lg transition-all hover:-translate-y-2 hover:transform hover:shadow-xl">
            <div className="mb-5 text-5xl">⚔️</div>
            <h3 className="mb-4 bg-gradient-to-r from-[#1756c6] to-[#ceddf6] bg-clip-text text-2xl font-semibold text-transparent">
              2. Challenge
            </h3>
            <p>
              Share your profile to invite others to challenge you, connect with
              friends through their profile links, and even compete with
              celebrities in health challenges!
            </p>
          </div>
          <div className="rounded-3xl bg-card p-10 shadow-lg transition-all hover:-translate-y-2 hover:transform hover:shadow-xl">
            <div className="mb-5 text-5xl">🔐</div>
            <h3 className="mb-4 bg-gradient-to-r from-[#1756c6] to-[#ceddf6] bg-clip-text text-2xl font-semibold text-transparent">
              3. Sell
            </h3>
            <p>
              Earn rewards by selling your anonymized biometric information.
              Your data, your choice.
            </p>
            <br />
            <p>
              <i>Coming soon</i>
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-10 text-center text-gray-500">
        <div className="container mx-auto px-5">
          <p>&copy; 2024 Fitcentive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
