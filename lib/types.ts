export type Role = "doctor" | "patient" | "representative";
export type IntakeStatus = "confirmed" | "missed" | "late" | "pending";

export interface Medication {
  id: string;
  name: string;
  dose: string;
  times: string[];
  tabletsPerDose: number;
  stock: number;
  initialStock: number;
  color: string;
}

export interface Patient {
  id: string;
  name: string;
  initials: string;
  age: number;
  address: string;
  district: 13 | 17;
  buildingId: string;
  doctor: string;
  representative: string;
  phone: string;
  diagnosis: string;
  medications: Medication[];
}

export interface IntakeCorrection {
  at: string;
  source: "representative";
  actualTime: string;
  comment: string;
}

export interface IntakeRecord {
  id: string;
  patientId: string;
  medicationId: string;
  date: string;
  scheduledTime: string;
  actualTime?: string;
  status: IntakeStatus;
  source?: "patient" | "representative" | "simulation";
  correction?: IntakeCorrection;
}

export interface AppNotification {
  id: string;
  patientId: string;
  type: "reminder" | "missed" | "late" | "low-stock" | "success";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface DemoState {
  patients: Patient[];
  records: IntakeRecord[];
  notifications: AppNotification[];
  virtualNow: string;
  activePatientId: string;
}
