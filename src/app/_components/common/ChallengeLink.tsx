"use client";
import { useState } from "react";

const ChallengeLink = ({
  link,
  setChallengeLink,
}: {
  link: string | null;
  setChallengeLink: (value: string | null) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setChallengeLink(null);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!link) return null;

  return (
    <div
      onClick={handleCopy}
      className={`mt-4 flex h-10 cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm transition-all duration-300 ${
        copied
          ? "bg-green-500 text-white"
          : "bg-white text-black hover:bg-white/90"
      }`}
    >
      {copied ? "Copied!" : "Copy Challenge Link"}
    </div>
  );
};

export default ChallengeLink;
