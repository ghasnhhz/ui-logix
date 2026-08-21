import type {
  TelegramBackButton,
  TelegramEvent,
  TelegramMainButton,
  TelegramWebApp,
} from "./types";

// D-050. Telegram will not load localhost, so without a stand-in every render
// costs a tunnel round trip through a phone. This is a development affordance
// and never an auth path: initData stays empty, so the server-side HMAC check
// has nothing to verify and rejects it by construction.

export const MOCK_CHROME_EVENT = "ulx:mock-chrome";

const announce = () => window.dispatchEvent(new Event(MOCK_CHROME_EVENT));

type ButtonState = {
  text: string;
  color: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
};

/** The MainButton as the mock holds it — read by the in-page fallback bar. */
export type MockChrome = {
  main: ButtonState;
  mainClick: (() => void) | null;
  backVisible: boolean;
  backClick: (() => void) | null;
};

const chrome: MockChrome = {
  main: {
    text: "",
    color: "#2563EB",
    isVisible: false,
    isActive: true,
    isProgressVisible: false,
  },
  mainClick: null,
  backVisible: false,
  backClick: null,
};

export const mockChrome = () => chrome;

const mainButton: TelegramMainButton = {
  get text() {
    return chrome.main.text;
  },
  get color() {
    return chrome.main.color;
  },
  get isVisible() {
    return chrome.main.isVisible;
  },
  get isActive() {
    return chrome.main.isActive;
  },
  get isProgressVisible() {
    return chrome.main.isProgressVisible;
  },
  setText: (text) => {
    chrome.main.text = text;
    announce();
  },
  setParams: (params) => {
    if (params.text !== undefined) chrome.main.text = params.text;
    if (params.color !== undefined) chrome.main.color = params.color;
    if (params.is_active !== undefined) chrome.main.isActive = params.is_active;
    if (params.is_visible !== undefined) chrome.main.isVisible = params.is_visible;
    announce();
  },
  show: () => {
    chrome.main.isVisible = true;
    announce();
  },
  hide: () => {
    chrome.main.isVisible = false;
    announce();
  },
  enable: () => {
    chrome.main.isActive = true;
    announce();
  },
  disable: () => {
    chrome.main.isActive = false;
    announce();
  },
  showProgress: () => {
    chrome.main.isProgressVisible = true;
    announce();
  },
  hideProgress: () => {
    chrome.main.isProgressVisible = false;
    announce();
  },
  onClick: (handler) => {
    chrome.mainClick = handler;
  },
  offClick: (handler) => {
    if (chrome.mainClick === handler) chrome.mainClick = null;
  },
};

const backButton: TelegramBackButton = {
  get isVisible() {
    return chrome.backVisible;
  },
  show: () => {
    chrome.backVisible = true;
    announce();
  },
  hide: () => {
    chrome.backVisible = false;
    announce();
  },
  onClick: (handler) => {
    chrome.backClick = handler;
  },
  offClick: (handler) => {
    if (chrome.backClick === handler) chrome.backClick = null;
  },
};

/** Installs the stub on `window.Telegram`. Call only when it is absent. */
export function installMock() {
  const listeners = new Map<TelegramEvent, Set<() => void>>();
  const fire = (event: TelegramEvent) =>
    listeners.get(event)?.forEach((handler) => handler());

  const app: TelegramWebApp = {
    initData: "",
    initDataUnsafe: {
      user: {
        id: 0,
        first_name: "Alisher",
        last_name: "Nazarov",
        username: "anazarov",
        language_code: navigator.language.slice(0, 2),
      },
    },
    version: "8.0",
    platform: "mock",
    get viewportHeight() {
      return window.innerHeight;
    },
    get viewportStableHeight() {
      return window.innerHeight;
    },
    isExpanded: true,
    safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    MainButton: mainButton,
    BackButton: backButton,
    isVersionAtLeast: () => true,
    ready: () => {},
    expand: () => {},
    close: () => {},
    setHeaderColor: () => {},
    setBackgroundColor: () => {},
    disableVerticalSwipes: () => {},
    onEvent: (event, handler) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
    },
    offEvent: (event, handler) => listeners.get(event)?.delete(handler),
  };

  window.Telegram = { WebApp: app };
  window.__ulxTmaMock = true;
  window.addEventListener("resize", () => fire("viewportChanged"));
}
