"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { IntakeRecord, Patient } from "@/lib/types";

interface CalendarProps {
  patient: Patient;
  records: IntakeRecord[];
  virtualNow: string;
  large?: boolean;
}

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function statusForDay(records: IntakeRecord[], day: string) {
  const dayRecords = records.filter((record) => record.date === day);
  if (!dayRecords.length) return "empty";
  if (dayRecords.some((record) => record.status === "missed")) return "missed";
  if (dayRecords.some((record) => record.status === "late" || record.status === "pending")) return "partial";
  return "confirmed";
}

export function AdherenceCalendar({ patient, records, virtualNow, large = false }: CalendarProps) {
  const initial = new Date(virtualNow);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(virtualNow.slice(0, 10));
  const date = new Date(initial.getFullYear(), initial.getMonth() + monthOffset, 1);
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const patientRecords = useMemo(
    () => records.filter((record) => record.patientId === patient.id),
    [patient.id, records],
  );
  const cells = Array.from({ length: Math.ceil((leading + daysInMonth) / 7) * 7 }, (_, index) => {
    const dayNumber = index - leading + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    return { dayNumber, key, status: statusForDay(patientRecords, key) };
  });
  const selectedRecords = selectedDay ? patientRecords.filter((record) => record.date === selectedDay) : [];
  const medicationName = (medicationId: string) =>
    patient.medications.find((medication) => medication.id === medicationId)?.name || "Препарат";

  return (
    <div className={`calendar ${large ? "calendar--large" : ""}`}>
      <div className="calendar__head">
        <div>
          <span className="eyebrow">Календарь приёма</span>
          <h3>{new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(date)}</h3>
        </div>
        <div className="calendar__nav">
          <button className="icon-button" onClick={() => setMonthOffset((value) => value - 1)} aria-label="Предыдущий месяц">
            <ChevronLeft size={18} />
          </button>
          <button className="icon-button" onClick={() => setMonthOffset((value) => value + 1)} aria-label="Следующий месяц">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="calendar__grid calendar__weekdays">
        {weekdayLabels.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="calendar__grid calendar__days">
        {cells.map((cell, index) =>
          cell ? (
            <button
              key={cell.key}
              className={`calendar__day calendar__day--${cell.status} ${selectedDay === cell.key ? "is-selected" : ""}`}
              onClick={() => setSelectedDay(cell.key)}
              aria-label={`${cell.dayNumber}, статус: ${cell.status}`}
            >
              <span>{cell.dayNumber}</span>
              <i />
            </button>
          ) : (
            <span key={`empty-${index}`} className="calendar__blank" />
          ),
        )}
      </div>
      <div className="calendar__legend">
        <span><i className="legend-dot legend-dot--green" />Выполнено</span>
        <span><i className="legend-dot legend-dot--yellow" />Частично</span>
        <span><i className="legend-dot legend-dot--red" />Есть пропуск</span>
        <span><i className="legend-dot legend-dot--gray" />Нет назначений</span>
      </div>
      {selectedDay && large && (
        <div className="calendar__details">
          <strong>{new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(`${selectedDay}T12:00:00`))}</strong>
          {selectedRecords.length ? (
            selectedRecords.map((record) => (
              <div className="calendar__record" key={record.id}>
                <span className={`status-dot status-dot--${record.status}`} />
                <span><b>{medicationName(record.medicationId)}</b><small>{record.scheduledTime} · {record.actualTime ? `подтверждено в ${record.actualTime}` : "не подтверждено"}</small></span>
                <em>{record.status === "confirmed" ? "Выполнено" : record.status === "missed" ? "Пропущено" : "С опозданием"}</em>
              </div>
            ))
          ) : (
            <p className="muted">На этот день записи отсутствуют.</p>
          )}
        </div>
      )}
    </div>
  );
}
