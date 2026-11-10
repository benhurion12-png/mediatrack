"use client";

import { Download, Share, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISSED_KEY = "mediatrack-install-dismissed";

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
}

export function PwaManager() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const dismissed = window.localStorage.getItem(DISMISSED_KEY) === "true";
    const iosHintTimer = window.setTimeout(() => {
      if (!dismissed && isIosDevice()) {
        setShowIosHint(true);
        setVisible(true);
      }
    }, 0);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => {
      window.clearTimeout(iosHintTimer);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setInstallEvent(null);
  };

  if (!visible) return null;

  return (
    <aside className="pwa-install" aria-label="Установка приложения MediaTrack">
      <Image src="/mediatrack-logo.svg" alt="" width={44} height={44} />
      <div>
        <b>MediaTrack на телефоне</b>
        <span>{showIosHint ? "Нажмите «Поделиться», затем «На экран Домой»" : "Установите приложение для быстрого доступа"}</span>
      </div>
      {showIosHint ? <Share className="pwa-install__ios" size={21} /> : <button onClick={() => void install()}><Download size={18} /> Установить</button>}
      <button className="pwa-install__close" onClick={dismiss} aria-label="Закрыть"><X size={16} /></button>
    </aside>
  );
}
