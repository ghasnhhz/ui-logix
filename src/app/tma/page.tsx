import { MiniApp } from "@/components/tma/mini-app";

// Rendered on demand and entirely client-driven below this point: the shipment,
// the locale and the session all come from Telegram's initData, which arrives in
// the URL fragment and never reaches the server.
export default function TmaPage() {
  return <MiniApp />;
}
