// D-054. `User.email` is required and unique, and Telegram never hands out an
// address — so a Telegram account needs a synthesised one. `.invalid` is
// reserved by RFC 2606: it can never be registered and nothing can ever be
// delivered to it, so a collision with a real address is impossible by
// construction rather than unlikely, and no mailer will ever try to reach it.
export const SYNTHETIC_EMAIL_DOMAIN = "telegram.u-logix.invalid";

/** `telegramId` is unique, so the address derived from it is unique too. */
export const syntheticEmail = (telegramId: string) =>
  `tg-${telegramId}@${SYNTHETIC_EMAIL_DOMAIN}`;
