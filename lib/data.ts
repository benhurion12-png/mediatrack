import type { AppNotification, DemoState, IntakeRecord, Medication, Patient } from "./types";

const names = [
  "Валентина Петровна Соколова",
  "Александр Иванович Морозов",
  "Галина Сергеевна Орлова",
  "Виктор Андреевич Ким",
  "Нина Павловна Жукова",
  "Марат Ерланович Садыков",
  "Людмила Николаевна Белова",
  "Сергей Михайлович Волков",
  "Тамара Ильинична Кузнецова",
  "Бахыт Амангельдиевна Омарова",
  "Анатолий Григорьевич Лебедев",
  "Раиса Фёдоровна Новикова",
  "Елена Васильевна Попова",
  "Иван Семёнович Смирнов",
  "Зоя Алексеевна Фёдорова",
  "Николай Петрович Павлов",
  "Светлана Юрьевна Тихонова",
  "Алексей Дмитриевич Егоров",
  "Мария Константиновна Громова",
  "Ермек Нурланович Абдрахманов",
  "Вера Романовна Мельникова",
  "Пётр Никитич Захаров",
  "Клара Максимовна Осипова",
  "Данияр Серикович Исмаилов",
];

const streets = [
  "ул. Конституции Казахстана, 12",
  "ул. Жамбыла, 44",
  "ул. Интернациональная, 18",
  "ул. Ауэзова, 153",
  "ул. Букетова, 27",
  "ул. Парковая, 31",
  "ул. Назарбаева, 106",
  "ул. Абая, 68",
  "ул. Мира, 221",
  "ул. Пушкина, 15",
  "ул. Сатпаева, 39",
  "ул. Уалиханова, 8",
  "ул. Шухова, 21",
];

const medTemplates = [
  { name: "Амлодипин", dose: "5 мг", times: ["09:00"], stock: 28, color: "#4F7DFF" },
  { name: "Метформин", dose: "500 мг", times: ["09:00", "20:00"], stock: 60, color: "#8B5CF6" },
  { name: "Лозартан", dose: "50 мг", times: ["08:30"], stock: 24, color: "#0EA5A4" },
  { name: "Аторвастатин", dose: "20 мг", times: ["21:00"], stock: 18, color: "#F59E0B" },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function medicationFor(patientIndex: number, templateIndex: number): Medication {
  const source = medTemplates[templateIndex % medTemplates.length];
  return {
    id: `p${patientIndex + 1}-m${templateIndex + 1}`,
    name: source.name,
    dose: source.dose,
    times: source.times,
    tabletsPerDose: 1,
    stock: Math.max(6, source.stock - ((patientIndex * 3 + templateIndex * 2) % 13)),
    initialStock: source.stock,
    color: source.color,
  };
}

export const doctors = ["Анна Викторовна Лебедева", "Михаил Олегович Ким"];

export const initialPatients: Patient[] = names.map((name, index) => {
  const medicationCount = index % 3 === 0 ? 3 : 2;
  const medications = Array.from({ length: medicationCount }, (_, medicationIndex) =>
    medicationFor(index, index === 0 ? medicationIndex : (index + medicationIndex) % medTemplates.length),
  );

  return {
    id: `patient-${String(index + 1).padStart(2, "0")}`,
    name,
    initials: initials(name),
    age: 61 + ((index * 7) % 27),
    address: `Петропавловск, ${streets[index % streets.length]}`,
    district: index < 10 ? 13 : 17,
    buildingId: `building-${(index % 13) + 1}`,
    doctor: doctors[index < 10 ? 0 : 1],
    representative: index === 0 ? "Ирина Александровна Соколова" : `${["Елена", "Андрей", "Ольга", "Роман"][index % 4]} ${["Сергеевна", "Иванович", "Петровна", "Алексеевич"][index % 4]}`,
    phone: `+7 7${String(10 + index).padStart(2, "0")} 555-${String(1200 + index * 37).slice(-4)}`,
    diagnosis: ["Артериальная гипертензия", "Сахарный диабет II типа", "Ишемическая болезнь сердца"][index % 3],
    medications,
  };
});

function seededValue(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function createInitialRecords(): IntakeRecord[] {
  const records: IntakeRecord[] = [];
  const end = new Date("2026-11-08T12:00:00Z");

  initialPatients.forEach((patient, patientIndex) => {
    for (let offset = 59; offset >= 0; offset -= 1) {
      const date = new Date(end);
      date.setUTCDate(end.getUTCDate() - offset);
      const day = dateOnly(date);

      patient.medications.forEach((medication, medicationIndex) => {
        medication.times.forEach((time, timeIndex) => {
          const tendency = 0.95 - (patientIndex % 7) * 0.045;
          const random = seededValue(patientIndex * 10000 + offset * 101 + medicationIndex * 17 + timeIndex);
          const isMissed = random > tendency;
          const isLate = !isMissed && random < 0.09 + (patientIndex % 4) * 0.02;
          const minuteDelay = 4 + Math.floor(seededValue(offset + patientIndex * 5) * 36);
          const [hour, minute] = time.split(":").map(Number);
          const actualMinutes = hour * 60 + minute + (isLate ? minuteDelay : Math.floor(random * 9));

          records.push({
            id: `${patient.id}-${medication.id}-${day}-${time}`,
            patientId: patient.id,
            medicationId: medication.id,
            date: day,
            scheduledTime: time,
            actualTime: isMissed
              ? undefined
              : `${String(Math.floor(actualMinutes / 60)).padStart(2, "0")}:${String(actualMinutes % 60).padStart(2, "0")}`,
            status: isMissed ? "missed" : isLate ? "late" : "confirmed",
            source: "patient",
          });
        });
      });
    }
  });

  return records;
}

const initialNotifications: AppNotification[] = [
  {
    id: "notification-1",
    patientId: "patient-01",
    type: "reminder",
    title: "Скоро приём лекарства",
    body: "Амлодипин 5 мг — в 09:00",
    createdAt: "2026-11-09T08:50:00+05:00",
    read: false,
  },
  {
    id: "notification-2",
    patientId: "patient-06",
    type: "missed",
    title: "Приём не подтверждён",
    body: "Марат Садыков не подтвердил Лозартан в 08:30",
    createdAt: "2026-11-09T09:00:00+05:00",
    read: false,
  },
  {
    id: "notification-3",
    patientId: "patient-09",
    type: "low-stock",
    title: "Заканчивается препарат",
    body: "Запаса Метформина осталось менее чем на 7 дней",
    createdAt: "2026-11-09T08:15:00+05:00",
    read: true,
  },
];

export function createInitialState(): DemoState {
  return {
    patients: initialPatients,
    records: createInitialRecords(),
    notifications: initialNotifications,
    virtualNow: "2026-11-09T09:05:00+05:00",
    activePatientId: "patient-01",
  };
}

export const buildings = streets.map((address, index) => ({
  id: `building-${index + 1}`,
  address,
  district: index < 5 ? 13 : 17,
  coordinates: [69.13 + (index % 5) * 0.009, 54.865 + Math.floor(index / 5) * 0.009] as [number, number],
}));
