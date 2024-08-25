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
    <div className="font-inter text-black">
      <header className="py-20 text-center">
        <div className="container mx-auto px-5">
          <h1 className="mb-5 h-14 text-5xl font-extrabold text-white">
            Sovereign, Incentivized Health
          </h1>
          <h2 className="mb-10 mt-28 w-full text-center text-lg font-normal text-white md:mt-0 md:text-2xl">
            Pairing measurable biometric data with financial{" "}
            <br className="hidden md:block" />
            incentives to achieve lasting health goals.
          </h2>
          <Link
            className="rounded-lg bg-white p-4 px-6 text-lg font-bold text-[#2967c7] hover:bg-white/90"
            href={authenticated ? "/dashboard" : "/login"}
          >
            Enter App
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-5">
        <div id="features" className="mt-20 grid gap-10 md:grid-cols-3">
          <div className="rounded-3xl bg-white/10 p-10 shadow-lg backdrop-blur-md transition-all hover:-translate-y-2 hover:transform hover:shadow-xl">
            <div className="mb-5 text-5xl">🤝</div>
            <h3 className="mb-4 text-2xl font-semibold text-transparent text-white">
              1. Sponsor
            </h3>
            <p className="text-white">
              Invest in friends, employees, or family. If their biometrics
              improve, they get your investment; otherwise, get your money back.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-10 shadow-lg backdrop-blur-md transition-all hover:-translate-y-2 hover:transform hover:shadow-xl">
            <div className="mb-5 text-5xl">⚔️</div>
            <h3 className="mb-4 text-2xl font-semibold text-transparent text-white">
              2. Challenge
            </h3>
            <p className="text-white">
              Share your profile to invite others to challenge you, connect with
              friends through their profile links, and even compete with
              celebrities in health challenges!
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-10 shadow-lg backdrop-blur-md transition-all hover:-translate-y-2 hover:transform hover:shadow-xl">
            <div className="mb-5 text-5xl">🔐</div>
            <h3 className="mb-4 text-2xl font-semibold text-transparent text-white">
              3. Sell
            </h3>
            <p className="text-white">
              Earn rewards by selling your anonymized biometric information.
              Your data, your choice.
            </p>
            <br />
            <p className="text-white">
              <i>Coming soon</i>
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-10 text-center text-white">
        <div className="container mx-auto px-5">
          <p>&copy; 2024 Fitcentive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
