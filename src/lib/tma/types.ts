// Hand-written from the Bot API WebApp surface we actually call. It is not the
// whole API — anything added here has to be guarded with isVersionAtLeast at the
// call site, because a Telegram client three versions old still runs the app.

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type TelegramInitDataUnsafe = {
  user?: TelegramUser;
  auth_date?: number;
  hash?: string;
  start_param?: string;
};

export type SafeAreaInset = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type MainButtonParams = {
  text?: string;
  color?: string;
  text_color?: string;
  is_active?: boolean;
  is_visible?: boolean;
};

export type TelegramMainButton = {
  readonly text: string;
  readonly color: string;
  readonly isVisible: boolean;
  readonly isActive: boolean;
  readonly isProgressVisible: boolean;
  setText(text: string): void;
  setParams(params: MainButtonParams): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  onClick(handler: () => void): void;
  offClick(handler: () => void): void;
};

export type TelegramBackButton = {
  readonly isVisible: boolean;
  show(): void;
  hide(): void;
  onClick(handler: () => void): void;
  offClick(handler: () => void): void;
};

export type TelegramEvent =
  | "viewportChanged"
  | "themeChanged"
  | "safeAreaChanged"
  | "contentSafeAreaChanged";

export type TelegramWebApp = {
  readonly initData: string;
  readonly initDataUnsafe: TelegramInitDataUnsafe;
  readonly version: string;
  readonly platform: string;
  readonly viewportHeight: number;
  readonly viewportStableHeight: number;
  readonly isExpanded: boolean;
  readonly safeAreaInset?: SafeAreaInset;
  readonly contentSafeAreaInset?: SafeAreaInset;
  readonly MainButton: TelegramMainButton;
  readonly BackButton: TelegramBackButton;
  isVersionAtLeast(version: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  disableVerticalSwipes?(): void;
  onEvent(event: TelegramEvent, handler: () => void): void;
  offEvent(event: TelegramEvent, handler: () => void): void;
};

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
    // Set by the dev mock only (D-050). Production never defines it.
    __ulxTmaMock?: boolean;
  }
}
