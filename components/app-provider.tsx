"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createInitialState } from "@/lib/data";
import type {
  AppNotification,
  DemoState,
  IntakeRecord,
  Medication,
  Role,
} from "@/lib/types";

const STORAGE_KEY = "mediatrack-demo-state-v1";
const CHANNEL_NAME = "mediatrack-demo-sync";

interface ConfirmInput {
  patientId: string;
  medicationId: string;
  scheduledTime: string;
  actualTime?: string;
  source: "patient" | "representative" | "simulation";
  comment?: string;
}

interface AppContextValue extends DemoState {
  hydrated: boolean;
  role: Role;
  setRole: (role: Role) => void;
  setActivePatient: (patientId: string) => void;
  confirmIntake: (input: ConfirmInput) => boolean;
  simulateMiss: () => void;
  nextDemoDay: () => void;
  resetDemo: () => void;
  markNotificationsRead: () => void;
  requestNotificationPermission: () => Promise<NotificationPermission | "unsupported">;
  addMedication: (patientId: string, medication: Omit<Medication, "id">) => void;
  toast: string | null;
  clearToast: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function safeParseState(value: string | null): DemoState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as DemoState;
    if (!Array.isArray(parsed.patients) || !Array.isArray(parsed.records)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createInitialState());
  const [role, setRoleState] = useState<Role>("doctor");
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const skipBroadcastRef = useRef(false);

  useEffect(() => {
    const stored = safeParseState(window.localStorage.getItem(STORAGE_KEY));
    const storedRole = window.localStorage.getItem("mediatrack-role") as Role | null;
    const hydrationTimer = window.setTimeout(() => {
      if (stored) setState(stored);
      if (storedRole && ["doctor", "patient", "representative"].includes(storedRole)) {
        setRoleState(storedRole);
      }
      setHydrated(true);
    }, 0);

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;
      channel.onmessage = (event: MessageEvent<DemoState>) => {
        skipBroadcastRef.current = true;
        setState(event.data);
      };
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const nextState = safeParseState(event.newValue);
      if (nextState) {
        skipBroadcastRef.current = true;
        setState(nextState);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearTimeout(hydrationTimer);
      channelRef.current?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (skipBroadcastRef.current) {
      skipBroadcastRef.current = false;
      return;
    }
    channelRef.current?.postMessage(state);
  }, [hydrated, state]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const pushBrowserNotification = useCallback((notification: AppNotification) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, { body: notification.body, icon: "/mediatrack-logo.svg" });
    }
  }, []);

  const setRole = useCallback((nextRole: Role) => {
    setRoleState(nextRole);
    window.localStorage.setItem("mediatrack-role", nextRole);
  }, []);

  const setActivePatient = useCallback((patientId: string) => {
    setState((current) => ({ ...current, activePatientId: patientId }));
  }, []);

  const confirmIntake = useCallback(
    (input: ConfirmInput) => {
      let changed = false;
      let duplicate = false;
      setState((current) => {
        const date = current.virtualNow.slice(0, 10);
        const recordId = `${input.patientId}-${input.medicationId}-${date}-${input.scheduledTime}`;
        const existing = current.records.find((record) => record.id === recordId);
        if (existing && existing.status !== "missed" && existing.status !== "pending") {
          duplicate = true;
          return current;
        }

        const nowTime = input.actualTime || current.virtualNow.slice(11, 16);
        const late = nowTime > input.scheduledTime;
        const nextRecord: IntakeRecord = {
          id: recordId,
          patientId: input.patientId,
          medicationId: input.medicationId,
          date,
          scheduledTime: input.scheduledTime,
          actualTime: nowTime,
          status: late || existing?.status === "missed" ? "late" : "confirmed",
          source: input.source,
          correction:
            input.source === "representative"
              ? {
                  at: current.virtualNow,
                  source: "representative",
                  actualTime: nowTime,
                  comment: input.comment || "Подтверждено представителем",
                }
              : existing?.correction,
        };

        const records = existing
          ? current.records.map((record) => (record.id === recordId ? nextRecord : record))
          : [...current.records, nextRecord];
        const patients = current.patients.map((patient) =>
          patient.id !== input.patientId
            ? patient
            : {
                ...patient,
                medications: patient.medications.map((medication) =>
                  medication.id !== input.medicationId
                    ? medication
                    : { ...medication, stock: Math.max(0, medication.stock - medication.tabletsPerDose) },
                ),
              },
        );
        const patient = patients.find((item) => item.id === input.patientId);
        const medication = patient?.medications.find((item) => item.id === input.medicationId);
        const notification: AppNotification = {
          id: `notification-${Date.now()}`,
          patientId: input.patientId,
          type: late ? "late" : "success",
          title: late ? "Поздний приём подтверждён" : "Приём подтверждён",
          body: `${medication?.name || "Лекарство"} принято в ${nowTime}`,
          createdAt: current.virtualNow,
          read: false,
        };
        changed = true;
        window.setTimeout(() => pushBrowserNotification(notification), 0);
        return { ...current, patients, records, notifications: [notification, ...current.notifications] };
      });
      window.setTimeout(() => {
        if (duplicate) showToast("Этот приём уже подтверждён — повторного списания не было");
        else if (changed) showToast("Приём сохранён. Данные всех кабинетов обновлены");
      }, 0);
      return changed;
    },
    [pushBrowserNotification, showToast],
  );

  const simulateMiss = useCallback(() => {
    setState((current) => {
      const patient = current.patients.find((item) => item.id === current.activePatientId) || current.patients[0];
      const medication = patient.medications[0];
      const date = current.virtualNow.slice(0, 10);
      const scheduledTime = medication.times[0];
      const recordId = `${patient.id}-${medication.id}-${date}-${scheduledTime}`;
      const missed: IntakeRecord = {
        id: recordId,
        patientId: patient.id,
        medicationId: medication.id,
        date,
        scheduledTime,
        status: "missed",
        source: "simulation",
      };
      const notification: AppNotification = {
        id: `notification-${Date.now()}`,
        patientId: patient.id,
        type: "missed",
        title: "Приём не подтверждён",
        body: `${patient.name}: ${medication.name} ${medication.dose} не подтверждён в течение 30 минут`,
        createdAt: `${date}T09:30:00+05:00`,
        read: false,
      };
      pushBrowserNotification(notification);
      return {
        ...current,
        virtualNow: `${date}T09:35:00+05:00`,
        records: [...current.records.filter((record) => record.id !== recordId), missed],
        notifications: [notification, ...current.notifications],
      };
    });
    showToast("Смоделирован пропуск. Виртуальное время: 09:35");
  }, [pushBrowserNotification, showToast]);

  const nextDemoDay = useCallback(() => {
    setState((current) => {
      const next = new Date(current.virtualNow);
      next.setDate(next.getDate() + 1);
      next.setHours(8, 50, 0, 0);
      return { ...current, virtualNow: next.toISOString() };
    });
    showToast("Виртуальное время переведено на следующий день");
  }, [showToast]);

  const resetDemo = useCallback(() => {
    const next = createInitialState();
    setState(next);
    window.localStorage.removeItem(STORAGE_KEY);
    showToast("Демонстрационные данные восстановлены");
  }, [showToast]);

  const markNotificationsRead = useCallback(() => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({ ...notification, read: true })),
    }));
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported" as const;
    const permission = await Notification.requestPermission();
    showToast(permission === "granted" ? "Браузерные уведомления включены" : "Уведомления остались выключены");
    return permission;
  }, [showToast]);

  const addMedication = useCallback(
    (patientId: string, medication: Omit<Medication, "id">) => {
      setState((current) => ({
        ...current,
        patients: current.patients.map((patient) =>
          patient.id === patientId
            ? {
                ...patient,
                medications: [...patient.medications, { ...medication, id: `${patientId}-m${Date.now()}` }],
              }
            : patient,
        ),
      }));
      showToast("Назначение добавлено и сохранено локально");
    },
    [showToast],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      hydrated,
      role,
      setRole,
      setActivePatient,
      confirmIntake,
      simulateMiss,
      nextDemoDay,
      resetDemo,
      markNotificationsRead,
      requestNotificationPermission,
      addMedication,
      toast,
      clearToast: () => setToast(null),
    }),
    [
      state,
      hydrated,
      role,
      setRole,
      setActivePatient,
      confirmIntake,
      simulateMiss,
      nextDemoDay,
      resetDemo,
      markNotificationsRead,
      requestNotificationPermission,
      addMedication,
      toast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useMediaTrack() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useMediaTrack must be used inside AppProvider");
  return context;
}

export function currentDateLabel(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function dateKeyFromVirtual(value: string) {
  return formatDate(new Date(value));
}
