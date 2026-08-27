"use client";

import { Check, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTelegram } from "../telegram-provider";

/**
 * Who Telegram says is holding the phone. Display only — `initDataUnsafe` is
 * unverified by definition, and the `telegramId` that reaches the database
 * comes from the server's own check of `initData`. Both sheet modes render it,
 * which is why it lives here rather than inside one of them.
 */
export function TelegramRow() {
  const { user } = useTelegram();
  const t = useTranslations("tma.gate");

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  if (!displayName) return null;

  return (
    <div className="mt-3.5 flex items-center gap-[11px] rounded-card border border-border p-3">
      <span
        className="flex size-[34px] flex-none items-center justify-center rounded-full bg-[#229ED9] text-white"
        aria-hidden="true"
      >
        <Send className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold">{displayName}</p>
        <p className="truncate text-[10.5px] text-ink-400">
          {user?.username ? `@${user.username} · ` : ""}
          {t("viaTelegram")}
        </p>
      </div>
      <Check className="size-4 flex-none text-success-ink" aria-hidden="true" />
    </div>
  );
}
