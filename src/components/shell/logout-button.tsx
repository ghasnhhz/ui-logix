"use client";

import { useState } from "react";
import { Power } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function LogoutButton() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      aria-label={t("logout")}
      title={t("logout")}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/");
        // The shell reads the session on the server, so the tree has to be
        // re-rendered before the landing page paints.
        router.refresh();
      }}
      className="flex size-7 flex-none cursor-pointer items-center justify-center rounded-[6px] text-navy-dim transition-colors duration-150 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Power className="size-[15px]" aria-hidden="true" />
    </button>
  );
}
