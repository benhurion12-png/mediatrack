"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  Menu,
  MessageCircleMore,
  Package,
  Pill,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdherenceCalendar } from "./adherence-calendar";
import { useMediaTrack, currentDateLabel } from "./app-provider";
import { BrandLogo } from "./brand-logo";
import { DistrictMap } from "./district-map";
import { mlModel, predictRisk } from "@/lib/ml";
import type { IntakeRecord, Patient, Role } from "@/lib/types";

export type MediaTrackView =
  | "landing"
  | "login"
  | "doctor-dashboard"
  | "doctor-map"
  | "doctor-patients"
  | "doctor-patient"
  | "doctor-analytics"
  | "patient-dashboard"
  | "patient-calendar"
  | "patient-medications"
  | "representative-dashboard"
  | "representative-calendar"
  | "representative-notifications";

const rolePaths: Record<Role, string> = {
  doctor: "/doctor",
  patient: "/patient",
  representative: "/representative",
};

const roleLabels: Record<Role, string> = {
  doctor: "Врач",
  patient: "Пациент",
  representative: "Представитель",
};

function LandingPage() {
  return (
    <main className="landing">
      <header className="landing__header container">
        <BrandLogo />
        <nav className="landing__nav" aria-label="Главная навигация">
          <a href="#opportunities">Возможности</a>
          <a href="#how-it-works">Как это работает</a>
          <a href="#clinics">Для клиник</a>
        </nav>
        <Link href="/login" className="button button--outline button--small">Войти в систему</Link>
      </header>

      <section className="hero container">
        <div className="hero__copy">
          <div className="hero__badge"><Sparkles size={15} /> Забота, которую видно в реальном времени</div>
          <h1>Лекарства принимаются вовремя. <span>Близкие спокойны.</span></h1>
          <p>MediaTrack объединяет пациента, врача и семью в одной системе контроля назначений — от напоминания до понятной аналитики.</p>
          <div className="hero__actions">
            <Link href="/login" className="button button--primary">Открыть MediaTrack <ChevronRight size={18} /></Link>
            <a href="#how-it-works" className="button button--ghost">Посмотреть, как работает</a>
          </div>
          <div className="hero__trust">
            <span><ShieldCheck size={18} /> Данные остаются в браузере</span>
            <span><CheckCircle2 size={18} /> Три связанных кабинета</span>
          </div>
        </div>
        <div className="hero__visual" aria-label="Пример интерфейса MediaTrack">
          <div className="hero-card hero-card--main">
            <div className="hero-card__top">
              <div className="avatar avatar--blue">ВС</div>
              <span><b>Валентина Соколова</b><small>Сегодня, 9 ноября</small></span>
              <div className="status-badge status-badge--good">Всё по плану</div>
            </div>
            <div className="next-dose">
              <div className="pill-icon"><Pill size={24} /></div>
              <div><small>Следующий приём</small><strong>Амлодипин 5 мг</strong><span>1 таблетка</span></div>
              <time>09:00</time>
            </div>
            <button className="button button--success button--wide"><Check size={20} /> Лекарство принято</button>
            <div className="mini-week">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, index) => (
                <span key={day} className={index < 5 ? "done" : index === 5 ? "today" : ""}><i>{index + 3}</i>{day}</span>
              ))}
            </div>
          </div>
          <div className="floating-card floating-card--doctor">
            <span className="floating-icon"><Stethoscope size={18} /></span>
            <div><small>Врач видит результат</small><b>Приём подтверждён</b></div>
            <CheckCircle2 size={20} />
          </div>
          <div className="floating-card floating-card--family">
            <span className="floating-icon floating-icon--pink"><HeartPulse size={18} /></span>
            <div><small>Уведомление семье</small><b>Всё в порядке</b></div>
          </div>
          <div className="hero__orb hero__orb--one" /><div className="hero__orb hero__orb--two" />
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-strip__inner">
          <span>Создано для ежедневной заботы</span>
          <div><b>94%</b><small>приёмов подтверждаются вовремя</small></div>
          <div><b>3 роли</b><small>синхронизированы в одном интерфейсе</small></div>
          <div><b>24/7</b><small>доступ к истории назначений</small></div>
        </div>
      </section>

      <section className="section container" id="opportunities">
        <div className="section-heading">
          <span className="eyebrow">Одна платформа — общий контекст</span>
          <h2>Каждый видит именно то, что важно</h2>
          <p>Простые действия пациента превращаются в понятную картину для врача и своевременный сигнал для близких.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card feature-card--blue"><span><Stethoscope /></span><h3>Врачу</h3><p>Динамика соблюдения назначений, карта участков и раннее выявление риска пропуска.</p><a href="/login">Открыть кабинет <ChevronRight size={16} /></a></article>
          <article className="feature-card feature-card--green"><span><Pill /></span><h3>Пациенту</h3><p>Крупные подсказки, понятное расписание и одно действие для подтверждения приёма.</p><a href="/login">Посмотреть интерфейс <ChevronRight size={16} /></a></article>
          <article className="feature-card feature-card--pink"><span><HeartPulse /></span><h3>Близким</h3><p>Общий календарь, уведомления о пропусках и возможность подтвердить фактический приём.</p><a href="/login">Узнать больше <ChevronRight size={16} /></a></article>
        </div>
      </section>

      <section className="section section--soft" id="how-it-works">
        <div className="container process">
          <div className="section-heading section-heading--left"><span className="eyebrow">Как это работает</span><h2>От напоминания до уверенности — три шага</h2></div>
          <div className="process__grid">
            <div><i>01</i><span><Bell /></span><h3>Напоминаем</h3><p>MediaTrack показывает препарат, дозировку и время следующего приёма.</p></div>
            <div><i>02</i><span><CheckCircle2 /></span><h3>Фиксируем</h3><p>Пациент подтверждает приём, календарь и остаток обновляются мгновенно.</p></div>
            <div><i>03</i><span><TrendingUp /></span><h3>Предупреждаем</h3><p>Врач и представитель видят отклонения и получают локальное уведомление.</p></div>
          </div>
        </div>
      </section>

      <section className="section container clinic-cta" id="clinics">
        <div><span className="eyebrow eyebrow--light">Для медицинских организаций</span><h2>Контроль назначений без лишней сложности</h2><p>Готовый демонстрационный контур для 24 пациентов, двух врачебных участков и связанных ролей.</p></div>
        <Link href="/login" className="button button--white">Перейти к демонстрации <ChevronRight size={18} /></Link>
      </section>

      <footer className="landing__footer container"><BrandLogo /><p>Медицинские назначения под надёжным контролем.</p><span>© 2026 MediaTrack</span></footer>
    </main>
  );
}

function LoginPage() {
  const router = useRouter();
  const { setRole } = useMediaTrack();
  const enter = (role: Role) => { setRole(role); router.push(rolePaths[role]); };
  return (
    <main className="login-page">
      <div className="login-page__top"><BrandLogo /><Link href="/" className="text-link">Вернуться на главную</Link></div>
      <div className="login-panel">
        <div className="login-panel__intro"><span className="eyebrow">Демонстрационный вход</span><h1>Выберите свою роль</h1><p>Все кабинеты работают с едиными данными. Можно свободно переключаться между ролями.</p></div>
        <div className="role-grid">
          <button onClick={() => enter("doctor")} className="role-card role-card--doctor"><span><Stethoscope /></span><div><h2>Врач</h2><p>Пациенты, карта участков, назначения и AI Analytics</p></div><ChevronRight /></button>
          <button onClick={() => enter("patient")} className="role-card role-card--patient"><span><Pill /></span><div><h2>Пациент</h2><p>Следующий приём, календарь и остатки препаратов</p></div><ChevronRight /></button>
          <button onClick={() => enter("representative")} className="role-card role-card--representative"><span><HeartPulse /></span><div><h2>Представитель</h2><p>Контроль близкого, уведомления и корректировки</p></div><ChevronRight /></button>
        </div>
        <div className="privacy-note"><ShieldCheck size={19} /><span><b>Без регистрации</b> — данные хранятся локально в этом браузере.</span></div>
      </div>
    </main>
  );
}

const navByRole = {
  doctor: [
    { href: "/doctor", label: "Обзор", icon: LayoutDashboard },
    { href: "/doctor/map", label: "Участки", icon: MapPinned },
    { href: "/doctor/patients", label: "Пациенты", icon: UsersRound },
    { href: "/doctor/analytics", label: "AI Analytics", icon: Bot },
  ],
  patient: [
    { href: "/patient", label: "Сегодня", icon: LayoutDashboard },
    { href: "/patient/calendar", label: "Календарь", icon: CalendarDays },
    { href: "/patient/medications", label: "Мои лекарства", icon: Pill },
  ],
  representative: [
    { href: "/representative", label: "Обзор", icon: LayoutDashboard },
    { href: "/representative/calendar", label: "Календарь", icon: CalendarDays },
    { href: "/representative/notifications", label: "Уведомления", icon: Bell },
  ],
};

const viewPath: Record<Exclude<MediaTrackView, "landing" | "login">, string> = {
  "doctor-dashboard": "/doctor", "doctor-map": "/doctor/map", "doctor-patients": "/doctor/patients", "doctor-patient": "/doctor/patients", "doctor-analytics": "/doctor/analytics",
  "patient-dashboard": "/patient", "patient-calendar": "/patient/calendar", "patient-medications": "/patient/medications",
  "representative-dashboard": "/representative", "representative-calendar": "/representative/calendar", "representative-notifications": "/representative/notifications",
};

function roleForView(view: MediaTrackView): Role {
  if (view.startsWith("patient-")) return "patient";
  if (view.startsWith("representative-")) return "representative";
  return "doctor";
}

function titleForView(view: MediaTrackView) {
  const titles: Record<string, string> = {
    "doctor-dashboard": "Обзор пациентов", "doctor-map": "Врачебные участки", "doctor-patients": "Пациенты", "doctor-patient": "Медицинская карточка", "doctor-analytics": "AI Analytics",
    "patient-dashboard": "Доброе утро!", "patient-calendar": "Календарь приёма", "patient-medications": "Мои лекарства",
    "representative-dashboard": "Состояние близкого", "representative-calendar": "Календарь соблюдения", "representative-notifications": "Центр уведомлений",
  };
  return titles[view] || "MediaTrack";
}

function AppShell({ view, children }: { view: Exclude<MediaTrackView, "landing" | "login">; children: ReactNode }) {
  const app = useMediaTrack();
  const router = useRouter();
  const role = roleForView(view);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unread = app.notifications.filter((notification) => !notification.read).length;
  const userName = role === "doctor" ? "Анна Лебедева" : role === "patient" ? app.patients.find((item) => item.id === app.activePatientId)?.name : "Ирина Соколова";
  const userInitials = userName?.split(" ").slice(0, 2).map((part) => part[0]).join("") || "MT";

  const changeRole = (nextRole: Role) => {
    app.setRole(nextRole);
    router.push(rolePaths[nextRole]);
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar__brand"><BrandLogo /><button className="icon-button sidebar__close" onClick={() => setSidebarOpen(false)}><X size={19} /></button></div>
        <nav className="sidebar__nav">
          <small>РАБОЧЕЕ ПРОСТРАНСТВО</small>
          {navByRole[role].map((item) => {
            const Icon = item.icon;
            const activePath = viewPath[view];
            const active = item.href === activePath || (view === "doctor-patient" && item.href === "/doctor/patients");
            return <Link key={item.href} href={item.href} className={active ? "is-active" : ""}><Icon size={20} /><span>{item.label}</span>{item.label === "AI Analytics" && <em>AI</em>}</Link>;
          })}
        </nav>
        <div className="sidebar__bottom">
          <div className="sidebar__help"><MessageCircleMore size={20} /><div><b>Нужна помощь?</b><span>Подсказки по системе</span></div></div>
          <button className="reset-button" onClick={app.resetDemo}><RotateCcw size={17} /> Сбросить демо-данные</button>
          <div className="sidebar__profile"><div className="avatar avatar--blue">{userInitials}</div><div><b>{userName}</b><span>{roleLabels[role]}</span></div></div>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Закрыть меню" />}
      <div className="app-main">
        <header className="topbar">
          <div className="topbar__title"><button className="icon-button topbar__menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div><h1>{titleForView(view)}</h1><span>{currentDateLabel(app.virtualNow)} · виртуальное время {app.virtualNow.slice(11, 16)}</span></div></div>
          <div className="topbar__actions">
            <select value={role} onChange={(event) => changeRole(event.target.value as Role)} aria-label="Сменить роль">
              <option value="doctor">Врач</option><option value="patient">Пациент</option><option value="representative">Представитель</option>
            </select>
            <button className="notification-button" onClick={() => setNotificationsOpen(true)} aria-label="Открыть уведомления"><Bell size={20} />{unread > 0 && <span>{unread}</span>}</button>
          </div>
        </header>
        <main className="workspace">{children}</main>
      </div>
      <nav className={`mobile-bottom-nav mobile-bottom-nav--${role}`} aria-label="Основная навигация">
        {navByRole[role].map((item) => {
          const Icon = item.icon;
          const active = item.href === viewPath[view] || (view === "doctor-patient" && item.href === "/doctor/patients");
          return (
            <Link key={item.href} href={item.href} className={active ? "is-active" : ""}>
              <span><Icon size={21} />{item.label === "AI Analytics" && <i>AI</i>}</span>
              <small>{item.label === "AI Analytics" ? "Аналитика" : item.label}</small>
            </Link>
          );
        })}
      </nav>
      {notificationsOpen && <NotificationDrawer onClose={() => setNotificationsOpen(false)} />}
      {app.toast && <div className="toast"><CheckCircle2 size={20} /><span>{app.toast}</span><button onClick={app.clearToast}><X size={16} /></button></div>}
    </div>
  );
}

function NotificationDrawer({ onClose }: { onClose: () => void }) {
  const app = useMediaTrack();
  return (
    <><button className="drawer-backdrop" onClick={onClose} aria-label="Закрыть уведомления" /><aside className="notification-drawer">
      <div className="drawer__head"><div><span className="eyebrow">Notification Center</span><h2>Уведомления</h2></div><button className="icon-button" onClick={onClose}><X size={20} /></button></div>
      <button className="button button--soft button--wide" onClick={() => void app.requestNotificationPermission()}><Bell size={17} /> Включить уведомления браузера</button>
      <div className="notification-list">
        {app.notifications.map((notification) => <div key={notification.id} className={`notification-item ${notification.read ? "" : "is-unread"}`}><span className={`notification-icon notification-icon--${notification.type}`}>{notification.type === "missed" ? <AlertTriangle /> : notification.type === "low-stock" ? <Package /> : <Bell />}</span><div><b>{notification.title}</b><p>{notification.body}</p><small>{notification.createdAt.slice(0, 10)} · {notification.createdAt.slice(11, 16)}</small></div></div>)}
      </div>
      <button className="text-button" onClick={app.markNotificationsRead}>Отметить всё прочитанным</button>
    </aside></>
  );
}

function StatCard({ icon, label, value, note, tone = "blue" }: { icon: ReactNode; label: string; value: string | number; note: string; tone?: string }) {
  return <article className="stat-card"><span className={`stat-card__icon stat-card__icon--${tone}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>;
}

function adherenceFor(records: IntakeRecord[], patientId?: string) {
  const filtered = patientId ? records.filter((record) => record.patientId === patientId) : records;
  if (!filtered.length) return 0;
  return Math.round((filtered.filter((record) => record.status === "confirmed" || record.status === "late").length / filtered.length) * 100);
}

function buildTrend(records: IntakeRecord[], days = 30, patientId?: string) {
  const filtered = patientId ? records.filter((record) => record.patientId === patientId) : records;
  const byDay = new Map<string, IntakeRecord[]>();
  filtered.forEach((record) => byDay.set(record.date, [...(byDay.get(record.date) || []), record]));
  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-days).map(([date, dayRecords]) => ({
    date: date.slice(8),
    fullDate: date,
    value: Math.round((dayRecords.filter((record) => record.status !== "missed").length / dayRecords.length) * 100),
  }));
}

function ScenarioLab() {
  const app = useMediaTrack();
  const patient = app.patients.find((item) => item.id === app.activePatientId) || app.patients[0];
  const medication = patient.medications[0];
  return <section className="scenario-lab"><div className="scenario-lab__title"><span><Zap size={20} /></span><div><h3>Демонстрация сценариев</h3><p>Виртуальное время позволяет проверить синхронизацию ролей.</p></div></div><div className="scenario-lab__actions">
    <button onClick={app.simulateMiss} className="button button--danger-soft">Смоделировать пропуск</button>
    <button onClick={() => app.confirmIntake({ patientId: patient.id, medicationId: medication.id, scheduledTime: medication.times[0], source: "simulation" })} className="button button--soft">Подтвердить приём</button>
    <button onClick={() => app.confirmIntake({ patientId: patient.id, medicationId: medication.id, scheduledTime: medication.times[0], actualTime: "09:10", source: "representative", comment: "Подтверждено родственником" })} className="button button--soft">Через представителя</button>
    <button onClick={app.nextDemoDay} className="button button--outline">Следующий день</button>
  </div></section>;
}

function DoctorDashboard() {
  const app = useMediaTrack();
  const trend = buildTrend(app.records);
  const predictions = app.patients.map((patient) => ({ patient, risk: predictRisk(patient, app.records) })).sort((a, b) => b.risk.probability - a.risk.probability);
  const highRisk = predictions.filter((item) => item.risk.level === "Высокий").length;
  const today = app.virtualNow.slice(0, 10);
  const todayRecords = app.records.filter((record) => record.date === today);
  const missed = todayRecords.filter((record) => record.status === "missed").length;
  const lowStock = app.patients.flatMap((patient) => patient.medications).filter((medication) => medication.stock < medication.times.length * 7).length;
  return <>
    <section className="workspace-intro"><div><span className="eyebrow">Участковый врач</span><h2>Доброе утро, Анна Викторовна</h2><p>Главное по вашим пациентам на сегодня.</p></div><Link href="/doctor/patients" className="button button--primary"><UsersRound size={18} /> Все пациенты</Link></section>
    <div className="stats-grid">
      <StatCard icon={<UsersRound />} label="Прикреплено пациентов" value={app.patients.length} note="2 врачебных участка" tone="blue" />
      <StatCard icon={<CheckCircle2 />} label="Подтверждено сегодня" value={todayRecords.filter((record) => record.status !== "missed").length || 38} note={`${adherenceFor(app.records)}% за весь период`} tone="green" />
      <StatCard icon={<AlertTriangle />} label="Пропущено" value={missed || 3} note="Требуют внимания" tone="red" />
      <StatCard icon={<Bot />} label="Высокий ML-риск" value={highRisk} note="Прогноз на следующий приём" tone="purple" />
      <StatCard icon={<Package />} label="Низкий остаток" value={lowStock} note="Менее чем на 7 дней" tone="orange" />
    </div>
    <div className="dashboard-grid dashboard-grid--wide">
      <section className="panel chart-panel"><div className="panel__head"><div><span className="eyebrow">Последние 30 дней</span><h3>Соблюдение назначений</h3></div><div className="status-badge status-badge--good"><TrendingUp size={14} /> {adherenceFor(app.records)}%</div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 700, height: 250 }}><AreaChart data={trend}><defs><linearGradient id="adherenceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F7DFF" stopOpacity={0.3}/><stop offset="100%" stopColor="#4F7DFF" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8ECF4"/><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill:"#8792A5",fontSize:12}}/><YAxis domain={[50,100]} tickLine={false} axisLine={false} tick={{fill:"#8792A5",fontSize:12}}/><Tooltip contentStyle={{borderRadius:14,border:"1px solid #E4E9F2",boxShadow:"0 10px 30px rgba(32,51,84,.12)"}}/><Area type="monotone" dataKey="value" stroke="#4F7DFF" strokeWidth={3} fill="url(#adherenceFill)"/></AreaChart></ResponsiveContainer></div></section>
      <section className="panel"><div className="panel__head"><div><span className="eyebrow">Приоритет</span><h3>Требуют внимания</h3></div><Link href="/doctor/analytics" className="text-link">Вся аналитика</Link></div><div className="attention-list">{predictions.slice(0,4).map(({patient,risk}) => <Link key={patient.id} href={`/doctor/patients/${patient.id}`} className="attention-row"><div className="avatar">{patient.initials}</div><div><b>{patient.name}</b><span>{risk.factors[0]}</span></div><em className={`risk risk--${risk.level === "Высокий" ? "high" : "medium"}`}>{Math.round(risk.probability*100)}%</em><ChevronRight size={17}/></Link>)}</div></section>
    </div>
    <ScenarioLab />
  </>;
}

function DoctorPatients() {
  const app = useMediaTrack();
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState<"all" | "13" | "17">("all");
  const patients = app.patients.filter((patient) => (district === "all" || String(patient.district) === district) && `${patient.name} ${patient.address}`.toLowerCase().includes(query.toLowerCase()));
  return <><section className="workspace-intro"><div><span className="eyebrow">Реестр</span><h2>Все прикреплённые пациенты</h2><p>Назначения, соблюдение расписания и прогноз риска.</p></div></section>
    <section className="panel table-panel"><div className="table-toolbar"><label className="search-field"><Search size={18}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Поиск по имени или адресу" /></label><div className="segmented"><button className={district === "all" ? "is-active" : ""} onClick={()=>setDistrict("all")}>Все</button><button className={district === "13" ? "is-active" : ""} onClick={()=>setDistrict("13")}>Участок 13</button><button className={district === "17" ? "is-active" : ""} onClick={()=>setDistrict("17")}>Участок 17</button></div></div>
    <div className="patient-table"><div className="patient-table__head"><span>Пациент</span><span>Участок</span><span>Назначения</span><span>Соблюдение</span><span>ML-риск</span><span /></div>{patients.map((patient)=>{const risk=predictRisk(patient,app.records); const adherence=adherenceFor(app.records,patient.id); return <Link href={`/doctor/patients/${patient.id}`} key={patient.id} className="patient-table__row"><span className="person-cell"><i className="avatar">{patient.initials}</i><span><b>{patient.name}</b><small>{patient.age} лет · {patient.address.replace("Петропавловск, ","")}</small></span></span><span><i className={`district-tag district-tag--${patient.district}`}>№ {patient.district}</i></span><span>{patient.medications.length} препарата</span><span className="progress-cell"><i><u style={{width:`${adherence}%`}} /></i><b>{adherence}%</b></span><span><em className={`risk risk--${risk.level === "Высокий" ? "high" : risk.level === "Средний" ? "medium" : "low"}`}>{Math.round(risk.probability*100)}%</em></span><ChevronRight size={17}/></Link>})}</div></section></>;
}

function DoctorMap() {
  const app = useMediaTrack();
  const [selected, setSelected] = useState<13|17>(13);
  const handleDistrict = useCallback((district:13|17)=>setSelected(district),[]);
  const patients = app.patients.filter((patient)=>patient.district===selected);
  const missed = patients.filter((patient)=>adherenceFor(app.records,patient.id)<85).length;
  return <div className="map-page"><div className="map-page__canvas"><DistrictMap onSelectDistrict={handleDistrict}/><div className="map-legend"><b>Врачебные участки</b><span><i className="map-dot map-dot--13"/>Участок №13</span><span><i className="map-dot map-dot--17"/>Участок №17</span></div></div><aside className="district-panel"><div className="district-panel__head"><span className={`district-big district-big--${selected}`}>{selected}</span><div><span className="eyebrow">Врачебный участок</span><h2>Участок №{selected}</h2><p>{selected===13?"Анна Викторовна Лебедева":"Михаил Олегович Ким"}</p></div></div><div className="district-summary"><div><b>{selected===13?5:8}</b><span>жилых домов</span></div><div><b>{patients.length}</b><span>пациентов</span></div><div><b>{missed}</b><span>с пропусками</span></div></div><h3>Пациенты участка</h3><div className="district-patients">{patients.map((patient)=><Link key={patient.id} href={`/doctor/patients/${patient.id}`}><div className="avatar">{patient.initials}</div><span><b>{patient.name}</b><small>{patient.medications.length} назначения · {adherenceFor(app.records,patient.id)}%</small></span><ChevronRight size={17}/></Link>)}</div></aside></div>;
}

function PatientHeader({ patient }: { patient: Patient }) {
  return <section className="patient-profile"><div className="avatar avatar--large">{patient.initials}</div><div><span className="eyebrow">Пациент</span><h2>{patient.name}</h2><p>{patient.age} лет · участок №{patient.district} · {patient.doctor}</p></div><div className="status-badge status-badge--good"><CheckCircle2 size={15}/> Наблюдение активно</div></section>;
}

function DoctorPatient({ patientId }: { patientId?: string }) {
  const app = useMediaTrack();
  const { setActivePatient } = app;
  useEffect(() => {
    if (patientId) setActivePatient(patientId);
  }, [patientId, setActivePatient]);
  const patient = app.patients.find((item)=>item.id===patientId) || app.patients[0];
  const [modalOpen,setModalOpen]=useState(false);
  const risk=predictRisk(patient,app.records);
  const trend=buildTrend(app.records,30,patient.id);
  return <><PatientHeader patient={patient}/><div className="stats-grid stats-grid--four"><StatCard icon={<Activity/>} label="Соблюдение" value={`${adherenceFor(app.records,patient.id)}%`} note="За последние 60 дней" tone="green"/><StatCard icon={<Bot/>} label="Вероятность пропуска" value={`${Math.round(risk.probability*100)}%`} note={risk.level+" риск"} tone="purple"/><StatCard icon={<Pill/>} label="Активные назначения" value={patient.medications.length} note="Обновлено сегодня" tone="blue"/><StatCard icon={<Package/>} label="Минимальный остаток" value={`${Math.min(...patient.medications.map(m=>m.stock))} таб.`} note="По всем препаратам" tone="orange"/></div>
    <div className="dashboard-grid"><section className="panel"><div className="panel__head"><div><span className="eyebrow">Текущая терапия</span><h3>Назначенные препараты</h3></div><button className="button button--primary button--small" onClick={()=>setModalOpen(true)}><Plus size={17}/> Добавить</button></div><div className="medication-list">{patient.medications.map((medication)=><div key={medication.id} className="medication-row"><span className="medication-row__icon" style={{background:`${medication.color}18`,color:medication.color}}><Pill/></span><div><b>{medication.name} {medication.dose}</b><span>{medication.times.map(time=>`${time} · 1 таблетка`).join("  /  ")}</span></div><div className="stock"><small>Остаток</small><strong>{medication.stock}</strong><span>таблеток</span></div></div>)}</div></section>
    <section className="panel chart-panel chart-panel--small"><div className="panel__head"><div><span className="eyebrow">Динамика</span><h3>Соблюдение расписания</h3></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 250 }}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8ECF4"/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis domain={[40,100]} tickLine={false} axisLine={false}/><Tooltip/><Line type="monotone" dataKey="value" stroke="#4F7DFF" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div></section></div>
    <section className="panel"><AdherenceCalendar patient={patient} records={app.records} virtualNow={app.virtualNow} large/></section>
    {modalOpen&&<PrescriptionModal patient={patient} onClose={()=>setModalOpen(false)}/>}</>;
}

function PrescriptionModal({patient,onClose}:{patient:Patient;onClose:()=>void}){
  const app=useMediaTrack();
  const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);const stock=Number(form.get("stock"))||30;app.addMedication(patient.id,{name:String(form.get("name")),dose:String(form.get("dose")),times:[String(form.get("time"))],tabletsPerDose:1,stock,initialStock:stock,color:"#0EA5A4"});onClose();};
  return <><button className="modal-backdrop" onClick={onClose} aria-label="Закрыть окно"/><div className="modal"><div className="modal__head"><div><span className="eyebrow">Новое назначение</span><h2>Добавить препарат</h2></div><button className="icon-button" onClick={onClose}><X/></button></div><form onSubmit={submit} className="form-grid"><label><span>Название</span><input required name="name" placeholder="Например, Лозартан"/></label><label><span>Дозировка</span><input required name="dose" placeholder="50 мг"/></label><label><span>Время приёма</span><input required name="time" type="time" defaultValue="09:00"/></label><label><span>Количество таблеток</span><input required name="stock" type="number" defaultValue="30" min="1"/></label><div className="modal__actions"><button type="button" onClick={onClose} className="button button--ghost">Отмена</button><button className="button button--primary">Сохранить назначение</button></div></form></div></>;
}

function DoctorAnalytics(){
  const app=useMediaTrack();
  const ranked=app.patients.map(patient=>({patient,risk:predictRisk(patient,app.records)})).sort((a,b)=>b.risk.probability-a.risk.probability);
  return <><section className="analytics-hero"><div><span className="eyebrow eyebrow--light">AI Analytics</span><h2>Раннее выявление риска пропуска</h2><p>Логистическая регрессия обучается в браузере на синтетической выборке и пересчитывает прогноз при изменении истории пациента.</p></div><span className="ai-orb"><Bot size={42}/></span></section><div className="stats-grid stats-grid--four"><StatCard icon={<Bot/>} label="Модель" value="LogReg" note="7 признаков" tone="purple"/><StatCard icon={<TrendingUp/>} label="ROC-AUC" value={mlModel.auc.toFixed(2)} note="Тестовая выборка" tone="green"/><StatCard icon={<Activity/>} label="Brier score" value={mlModel.brier.toFixed(3)} note="Калибровка прогноза" tone="blue"/><StatCard icon={<AlertTriangle/>} label="Высокий риск" value={ranked.filter(item=>item.risk.level==="Высокий").length} note="Требуют внимания" tone="red"/></div>
    <section className="panel table-panel analytics-risk-panel"><div className="panel__head"><div><span className="eyebrow">Рейтинг риска</span><h3>Вероятность пропуска следующего приёма</h3></div></div><div className="risk-table">{ranked.map(({patient,risk},index)=>{const riskPercent=Math.round(risk.probability*100);return <Link href={`/doctor/patients/${patient.id}`} key={patient.id} className="risk-table__row"><b className="rank">{String(index+1).padStart(2,"0")}</b><div className="avatar">{patient.initials}</div><div className="risk-table__person"><b>{patient.name}</b><span>{risk.factors.join(" · ")}</span></div><div className="risk-meter"><i><u style={{width:`${riskPercent}%`}}/></i><b>{riskPercent}%</b></div><em className={`risk risk--${risk.level==="Высокий"?"high":risk.level==="Средний"?"medium":"low"}`}>{risk.level}</em><ChevronRight size={17}/></Link>})}</div></section><div className="model-note"><ShieldCheck size={21}/><p><b>Важно:</b> модель демонстрационная и не является клинически валидированной системой. Она не рекомендует изменение дозировок или лечения.</p></div></>;
}

function activePatientFrom(app: ReturnType<typeof useMediaTrack>) {
  return app.patients.find((patient) => patient.id === app.activePatientId) || app.patients[0];
}

function nextMedication(patient: Patient, virtualNow: string) {
  const time = virtualNow.slice(11, 16);
  const scheduled = patient.medications.flatMap((medication) => medication.times.map((doseTime) => ({ medication, time: doseTime })));
  return scheduled.find((dose) => dose.time >= time) || scheduled[0];
}

function PatientDashboard() {
  const app = useMediaTrack();
  const patient = activePatientFrom(app);
  const next = nextMedication(patient, app.virtualNow);
  const today = app.virtualNow.slice(0, 10);
  const recordId = `${patient.id}-${next.medication.id}-${today}-${next.time}`;
  const confirmed = app.records.some((record) => record.id === recordId && record.status !== "missed" && record.status !== "pending");
  const confirm = () => app.confirmIntake({ patientId: patient.id, medicationId: next.medication.id, scheduledTime: next.time, source: "patient" });
  return <>
    <section className="patient-welcome"><div><span className="eyebrow">Ваш план на сегодня</span><h2>Доброе утро, {patient.name.split(" ")[0]}!</h2><p>Сегодня запланировано {patient.medications.reduce((sum, med) => sum + med.times.length, 0)} приёма. Мы напомним о каждом.</p></div><div className="patient-welcome__date"><CalendarDays/><span>{new Intl.DateTimeFormat("ru-RU",{weekday:"long",day:"numeric",month:"long"}).format(new Date(app.virtualNow))}</span></div></section>
    <section className={`next-med-card ${confirmed ? "is-confirmed" : ""}`}>
      <div className="next-med-card__label"><Clock3 size={19}/><span>{confirmed ? "Приём подтверждён" : "Следующее лекарство"}</span></div>
      <div className="next-med-card__content"><span className="next-med-card__icon"><Pill size={38}/></span><div><small>{next.medication.name}</small><h2>{next.medication.dose}</h2><p>1 таблетка · после еды</p></div><time>{next.time}</time></div>
      <button className={`big-confirm ${confirmed ? "is-done" : ""}`} onClick={confirm}><CheckCircle2 size={29}/>{confirmed ? "Лекарство уже принято" : "Я принял(а) лекарство"}</button>
      <p className="next-med-card__hint">{confirmed ? "Отлично! Календарь и остаток препарата обновлены." : "Нажмите после того, как примете таблетку. Повторное нажатие не спишет её ещё раз."}</p>
    </section>
    <div className="patient-home-grid"><section className="panel"><AdherenceCalendar patient={patient} records={app.records} virtualNow={app.virtualNow}/><Link href="/patient/calendar" className="panel-link">Открыть полный календарь <ChevronRight size={17}/></Link></section><section className="panel"><div className="panel__head"><div><span className="eyebrow">Запас дома</span><h3>Остатки лекарств</h3></div><Link href="/patient/medications" className="text-link">Подробнее</Link></div><div className="stock-list">{patient.medications.map((medication)=>{const days=Math.floor(medication.stock/medication.times.length);return <div key={medication.id}><span className="medication-row__icon" style={{background:`${medication.color}18`,color:medication.color}}><Pill/></span><div><b>{medication.name}</b><span>{medication.dose} · примерно на {days} дн.</span><i><u style={{width:`${Math.min(100,medication.stock/medication.initialStock*100)}%`,background:medication.color}}/></i></div><strong>{medication.stock}<small> таб.</small></strong></div>})}</div></section></div>
    <section className="patient-alert"><span><Bell/></span><div><b>Напоминания включены</b><p>Следующее уведомление появится за 10 минут до приёма.</p></div><button className="button button--outline button--small" onClick={()=>void app.requestNotificationPermission()}>Разрешить в браузере</button></section>
  </>;
}

function PatientCalendar() {
  const app = useMediaTrack();
  const patient = activePatientFrom(app);
  return <><section className="workspace-intro"><div><span className="eyebrow">История соблюдения</span><h2>Мой календарь приёма</h2><p>Зелёные дни — всё принято вовремя. Жёлтые — с задержкой, красные — есть пропуск.</p></div><div className="adherence-circle"><strong>{adherenceFor(app.records,patient.id)}%</strong><span>за 60 дней</span></div></section><section className="panel"><AdherenceCalendar patient={patient} records={app.records} virtualNow={app.virtualNow} large/></section></>;
}

function PatientMedications() {
  const app=useMediaTrack();
  const patient=activePatientFrom(app);
  const history=app.records.filter(record=>record.patientId===patient.id).slice(-18).reverse();
  const medName=(id:string)=>patient.medications.find(m=>m.id===id);
  return <><section className="workspace-intro"><div><span className="eyebrow">Назначения врача</span><h2>Мои лекарства</h2><p>Расписание, дозировки и текущий запас препаратов.</p></div></section><div className="med-cards">{patient.medications.map(medication=><article key={medication.id} className="med-card"><div className="med-card__top"><span style={{background:`${medication.color}18`,color:medication.color}}><Pill/></span><div><h3>{medication.name}</h3><p>{medication.dose}</p></div><i className="status-badge status-badge--good">Активно</i></div><div className="med-card__schedule"><div><Clock3/><span><small>Время</small><b>{medication.times.join(" и ")}</b></span></div><div><ListChecks/><span><small>Как принимать</small><b>По 1 таблетке</b></span></div></div><div className="med-card__stock"><span><small>Осталось</small><b>{medication.stock} таблеток</b></span><i><u style={{width:`${Math.min(100,medication.stock/medication.initialStock*100)}%`,background:medication.color}}/></i></div></article>)}</div><section className="panel"><div className="panel__head"><div><span className="eyebrow">Журнал</span><h3>История подтверждений</h3></div></div><div className="history-list">{history.map(record=>{const med=medName(record.medicationId);return <div key={record.id}><span className={`history-status history-status--${record.status}`}>{record.status==="missed"?<X/>:<Check/>}</span><div><b>{med?.name} {med?.dose}</b><span>{new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long"}).format(new Date(`${record.date}T12:00:00`))} · назначено {record.scheduledTime}</span></div><em>{record.actualTime?`Принято в ${record.actualTime}`:"Не подтверждено"}</em></div>})}</div></section></>;
}

function RepresentativeDashboard() {
  const app=useMediaTrack();
  const patient=activePatientFrom(app);
  const [dialog,setDialog]=useState(false);
  const today=app.virtualNow.slice(0,10);
  const missed=app.records.filter(record=>record.patientId===patient.id&&record.date===today&&record.status==="missed");
  return <><section className="representative-hero"><div className="avatar avatar--large">{patient.initials}</div><div><span className="eyebrow">Вы наблюдаете</span><h2>{patient.name}</h2><p>{patient.age} лет · {patient.address}</p></div><div className="representative-hero__status"><span className={missed.length?"status-badge status-badge--danger":"status-badge status-badge--good"}>{missed.length?<><AlertTriangle size={15}/> Нужна помощь</>:<><CheckCircle2 size={15}/> Всё по плану</>}</span><small>Обновлено сейчас</small></div></section>
    {missed.length>0&&<section className="missed-banner"><span><AlertTriangle/></span><div><b>Приём лекарства не подтверждён</b><p>{patient.medications.find(med=>med.id===missed[0].medicationId)?.name} был назначен на {missed[0].scheduledTime}. Вы можете внести фактическое время.</p></div><button className="button button--danger" onClick={()=>setDialog(true)}>Подтвердить за пациента</button></section>}
    <div className="stats-grid stats-grid--four"><StatCard icon={<CheckCircle2/>} label="Соблюдение" value={`${adherenceFor(app.records,patient.id)}%`} note="За последние 60 дней" tone="green"/><StatCard icon={<Pill/>} label="Лекарств" value={patient.medications.length} note="Активные назначения" tone="blue"/><StatCard icon={<Bell/>} label="Новых уведомлений" value={app.notifications.filter(n=>n.patientId===patient.id&&!n.read).length} note="По этому пациенту" tone="orange"/><StatCard icon={<Package/>} label="Минимальный запас" value={`${Math.min(...patient.medications.map(m=>m.stock))} таб.`} note="Проверьте остатки" tone="purple"/></div>
    <div className="patient-home-grid"><section className="panel"><AdherenceCalendar patient={patient} records={app.records} virtualNow={app.virtualNow}/><Link href="/representative/calendar" className="panel-link">Открыть общий календарь <ChevronRight size={17}/></Link></section><section className="panel"><div className="panel__head"><div><span className="eyebrow">Сегодня</span><h3>Расписание лекарств</h3></div></div><div className="family-schedule">{patient.medications.flatMap(m=>m.times.map(time=>({m,time}))).sort((a,b)=>a.time.localeCompare(b.time)).map(({m,time})=>{const record=app.records.find(r=>r.id===`${patient.id}-${m.id}-${today}-${time}`);return <div key={`${m.id}-${time}`}><time>{time}</time><span className="medication-row__icon" style={{background:`${m.color}18`,color:m.color}}><Pill/></span><div><b>{m.name} {m.dose}</b><span>1 таблетка</span></div><em className={`schedule-status schedule-status--${record?.status||"pending"}`}>{record?.status==="confirmed"?"Принято":record?.status==="late"?"Позже":record?.status==="missed"?"Пропущено":"Ожидается"}</em></div>})}</div><button className="button button--outline button--wide" onClick={()=>setDialog(true)}>Подтвердить за пациента</button></section></div><ScenarioLab/>{dialog&&<RepresentativeConfirmModal patient={patient} onClose={()=>setDialog(false)}/>}</>;
}

function RepresentativeConfirmModal({patient,onClose}:{patient:Patient;onClose:()=>void}){
  const app=useMediaTrack();
  const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);const medication=patient.medications.find(m=>m.id===form.get("medication"))||patient.medications[0];app.confirmIntake({patientId:patient.id,medicationId:medication.id,scheduledTime:medication.times[0],actualTime:String(form.get("time")),source:"representative",comment:String(form.get("comment"))});onClose();};
  return <><button className="modal-backdrop" onClick={onClose}/><div className="modal"><div className="modal__head"><div><span className="eyebrow">Корректировка истории</span><h2>Подтвердить за пациента</h2></div><button className="icon-button" onClick={onClose}><X/></button></div><div className="correction-note"><AlertTriangle size={19}/><p>Первоначальный факт пропуска и эта корректировка сохранятся в локальном журнале.</p></div><form onSubmit={submit} className="form-grid"><label><span>Какое лекарство принято</span><select name="medication">{patient.medications.map(m=><option key={m.id} value={m.id}>{m.name} {m.dose}</option>)}</select></label><label><span>Фактическое время приёма</span><input name="time" type="time" defaultValue="09:10" required/></label><label className="form-grid__full"><span>Комментарий</span><textarea name="comment" placeholder="Например: пациент принял лекарство, но забыл нажать кнопку" rows={3}/></label><div className="modal__actions"><button type="button" className="button button--ghost" onClick={onClose}>Отмена</button><button className="button button--primary">Сохранить подтверждение</button></div></form></div></>;
}

function RepresentativeCalendar(){const app=useMediaTrack();const patient=activePatientFrom(app);return <><section className="workspace-intro"><div><span className="eyebrow">Общий календарь</span><h2>Соблюдение назначений</h2><p>Вы видите тот же календарь, что и {patient.name.split(" ")[0]}. Корректировки отображаются сразу.</p></div><div className="adherence-circle"><strong>{adherenceFor(app.records,patient.id)}%</strong><span>выполнено</span></div></section><section className="panel"><AdherenceCalendar patient={patient} records={app.records} virtualNow={app.virtualNow} large/></section></>}

function RepresentativeNotifications(){const app=useMediaTrack();const patient=activePatientFrom(app);const notifications=app.notifications.filter(n=>n.patientId===patient.id);return <><section className="workspace-intro"><div><span className="eyebrow">Центр уведомлений</span><h2>События по пациенту</h2><p>Напоминания, пропуски, поздние подтверждения и низкие остатки.</p></div><button className="button button--outline" onClick={()=>void app.requestNotificationPermission()}><Bell size={18}/> Включить в браузере</button></section><section className="panel"><div className="notification-page-list">{notifications.length?notifications.map(notification=><div key={notification.id} className={`notification-page-item notification-page-item--${notification.type}`}><span>{notification.type==="missed"?<AlertTriangle/>:notification.type==="low-stock"?<Package/>:notification.type==="success"?<CheckCircle2/>:<Bell/>}</span><div><b>{notification.title}</b><p>{notification.body}</p><small>{new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long"}).format(new Date(notification.createdAt))} · {notification.createdAt.slice(11,16)}</small></div><em>{notification.read?"Прочитано":"Новое"}</em></div>):<div className="empty-state"><CheckCircle2/><h3>Новых событий нет</h3><p>Все приёмы идут по расписанию.</p></div>}</div></section><ScenarioLab/></>}

function AppContent({view,patientId}:{view:Exclude<MediaTrackView,"landing"|"login">;patientId?:string}){
  const pages:Record<Exclude<MediaTrackView,"landing"|"login">,ReactNode>={
    "doctor-dashboard":<DoctorDashboard/>,"doctor-map":<DoctorMapPage/>,"doctor-patients":<DoctorPatients/>,"doctor-patient":<DoctorPatient patientId={patientId}/>,"doctor-analytics":<DoctorAnalytics/>,
    "patient-dashboard":<PatientDashboard/>,"patient-calendar":<PatientCalendar/>,"patient-medications":<PatientMedications/>,
    "representative-dashboard":<RepresentativeDashboard/>,"representative-calendar":<RepresentativeCalendar/>,"representative-notifications":<RepresentativeNotifications/>,
  };
  return <AppShell view={view}>{pages[view]}</AppShell>;
}

function DoctorMapPage(){return <DoctorMap/>}

export function MediaTrackPage({view,patientId}:{view:MediaTrackView;patientId?:string}){
  if(view==="landing")return <LandingPage/>;
  if(view==="login")return <LoginPage/>;
  return <AppContent view={view} patientId={patientId}/>;
}
