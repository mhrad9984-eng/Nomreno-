import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Menu,
  User,
  Search,
  Rocket,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Lock,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
function toFa(n) {
  return String(n).replace(/[0-9]/g, (d) => FA_DIGITS[d]);
}

function safeGet(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}
function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (e) {}
}
const HISTORY_KEY = "namrino_history";
const PRO_KEY = "namrino_pro";
const USER_KEY = "namrino_user";
const SESSION_KEY = "namrino_session";
const progressKey = (id) => `namrino_progress_${id}`;
const dynamicExamKey = (id) => `namrino_dynamic_${id}`;
const resultKey = (id) => `namrino_result_${id}`;

const PlanContext = React.createContext(null);
function PlanProvider({ children }) {
  const [isPro, setIsProState] = useState(() => !!safeGet(PRO_KEY));
  const setPro = useCallback((val) => {
    safeSet(PRO_KEY, val);
    setIsProState(val);
  }, []);
  const value = useMemo(() => ({ isPro, setPro }), [isPro, setPro]);
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
function useIsPro() {
  const ctx = React.useContext(PlanContext);
  return [ctx.isPro, ctx.setPro];
}

const AuthContext = React.createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => safeGet(USER_KEY));
  const [loggedIn, setLoggedIn] = useState(() => !!safeGet(SESSION_KEY));
  const login = useCallback((contact, password) => {
    const u = safeGet(USER_KEY);
    if (!u || u.contact !== contact || u.password !== password) return false;
    safeSet(SESSION_KEY, true);
    setUser(u);
    setLoggedIn(true);
    return true;
  }, []);
  const register = useCallback((data) => {
    safeSet(USER_KEY, data);
    safeSet(SESSION_KEY, true);
    setUser(data);
    setLoggedIn(true);
  }, []);
  const logout = useCallback(() => {
    safeSet(SESSION_KEY, false);
    setLoggedIn(false);
  }, []);
  const updateProfile = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      safeSet(USER_KEY, next);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ user, loggedIn, login, register, logout, updateProfile }), [user, loggedIn, login, register, logout, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
function useAuth() {
  return React.useContext(AuthContext);
}

function parseRoute() {
  const h = window.location.hash;
  if (!h.startsWith("#/")) return { name: "home" };
  const parts = h.slice(2).split("/").filter(Boolean);
  if (parts[0] === "exam" && parts[1] && parts[2] === "run") return { name: "run", examId: decodeURIComponent(parts[1]) };
  if (parts[0] === "exam" && parts[1]) return { name: "intro", examId: decodeURIComponent(parts[1]) };
  if (parts[0] === "result" && parts[1]) return { name: "result", runId: decodeURIComponent(parts[1]) };
  if (parts[0] === "exam-result" && parts[1]) return { name: "exam-result", runId: decodeURIComponent(parts[1]) };
  if (parts[0] === "exam-history") return { name: "exam-history" };
  if (parts[0] === "market") return { name: "market" };
  if (parts[0] === "login") return { name: "login" };
  if (parts[0] === "register") return { name: "register" };
  if (parts[0] === "dashboard") return { name: "dashboard" };
  if (parts[0] === "profile") return { name: "profile" };
  return { name: "home" };
}
function navigate(path) {
  window.location.hash = "#" + path;
}
function useHashRoute() {
  const [route, setRoute] = useState({ name: "home" });
  useEffect(() => {
    setRoute(parseRoute());
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}
function goUpgrade() {
  navigate("/");
  window.setTimeout(() => document.getElementById("pro")?.scrollIntoView({ behavior: "smooth" }), 90);
}

const GRADE_RANGES = {
  "1-3": [1, 2, 3],
  "4-6": [4, 5, 6],
  "7-9": [7, 8, 9],
  "10-12": [10, 11, 12],
};
const GRADES = [
  { id: "1-3", label: "۱–۳ ابتدایی", icon: "🧸" },
  { id: "4-6", label: "۴–۶ ابتدایی", icon: "📘" },
  { id: "7-9", label: "۷–۹ متوسطه اول", icon: "📐" },
  { id: "10-12", label: "۱۰–۱۲ متوسطه دوم", icon: "🎓" },
];
const CLASS_LABELS = { 1: "اول", 2: "دوم", 3: "سوم", 4: "چهارم", 5: "پنجم", 6: "ششم", 7: "هفتم", 8: "هشتم", 9: "نهم", 10: "دهم", 11: "یازدهم", 12: "دوازدهم" };

const PRODUCTS = [
  { title: "جزوه کامل فصل به فصل ریاضی نهم", desc: "خلاصه‌نویسی + مثال حل‌شده برای هر مبحث", price: "۴۹,۰۰۰ تومان", rating: 4.8 },
  { title: "بانک تست زیست دوازدهم", desc: "بیش از ۳۰۰ سؤال دسته‌بندی‌شده با پاسخ تشریحی", price: "۶۹,۰۰۰ تومان", rating: 4.6 },
  { title: "فلش‌کارت لغات زبان هفتم", desc: "مرور سریع لغات کتاب درسی به‌صورت کارت‌های تعاملی", price: "رایگان", rating: 4.9 },
];

const LEVEL_STYLE = {
  آسان: "text-emerald-400 bg-emerald-400/10 ring-emerald-400/30",
  متوسط: "text-amber-300 bg-amber-300/10 ring-amber-300/30",
  سخت: "text-rose-400 bg-rose-400/10 ring-rose-400/30",
};

const NAV_ITEMS = [
  { label: "آزمون‌ها", href: "#exams" },
  { label: "📚 بازار دانش", route: "/market" },
  { label: "درباره ما", href: "#about" },
];

function buildOptionSet(correct, distractors) {
  const seen = new Set([correct]);
  const picked = [];
  for (const d of distractors) {
    if (!seen.has(d)) {
      seen.add(d);
      picked.push(d);
    }
    if (picked.length === 3) break;
  }
  let filler = correct + 11;
  while (picked.length < 3) {
    if (!seen.has(filler)) {
      seen.add(filler);
      picked.push(filler);
    }
    filler += 7;
  }
  const four = [correct, ...picked];
  for (let i = four.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [four[i], four[j]] = [four[j], four[i]];
  }
  return { options: four.map((n) => toFa(n)), correctAnswer: four.indexOf(correct) };
}
function buildTextOptionSet(correct, distractors) {
  const seen = new Set([correct]);
  const picked = [];
  for (const d of distractors) {
    if (!seen.has(d)) {
      seen.add(d);
      picked.push(d);
    }
    if (picked.length === 3) break;
  }
  while (picked.length < 3) picked.push(correct + "-" + picked.length);
  const four = [correct, ...picked];
  for (let i = four.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [four[i], four[j]] = [four[j], four[i]];
  }
  return { options: four, correctAnswer: four.indexOf(correct) };
}
function genAddSub(prefix, topic, count, op) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const a = 12 + i * 3 + (i % 4) * 5;
    const b = 4 + i * 2 + (i % 3) * 3;
    let text, correct, explanation;
    if (op === "add") {
      correct = a + b;
      text = `حاصل ${toFa(a)} + ${toFa(b)} چند می‌شود؟`;
      explanation = `${toFa(a)} + ${toFa(b)} = ${toFa(correct)}`;
    } else {
      const big = a + b;
      correct = a;
      text = `حاصل ${toFa(big)} − ${toFa(b)} چند می‌شود؟`;
      explanation = `${toFa(big)} − ${toFa(b)} = ${toFa(correct)}`;
    }
    const { options, correctAnswer } = buildOptionSet(correct, [correct + 2, correct - 3, correct + 5]);
    qs.push({ id: `${prefix}${i + 1}`, text, options, correctAnswer, explanation, topic });
  }
  return qs;
}
function genMulDiv(prefix, topic, count, op) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const a = 2 + (i % 9);
    const b = 3 + ((i * 2) % 8);
    let text, correct, explanation;
    if (op === "mul") {
      correct = a * b;
      text = `حاصل‌ضرب ${toFa(a)} × ${toFa(b)} چند می‌شود؟`;
      explanation = `${toFa(a)} × ${toFa(b)} = ${toFa(correct)}`;
    } else {
      const product = a * b;
      correct = a;
      text = `حاصل ${toFa(product)} ÷ ${toFa(b)} چند می‌شود؟`;
      explanation = `${toFa(product)} ÷ ${toFa(b)} = ${toFa(a)}`;
    }
    const { options, correctAnswer } = buildOptionSet(correct, [correct + 1, correct - 2, correct + 4]);
    qs.push({ id: `${prefix}${i + 1}`, text, options, correctAnswer, explanation, topic });
  }
  return qs;
}
function genEquation(prefix, topic, count) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const x = 2 + (i % 12);
    const b = 3 + (i % 7);
    const c = x + b;
    const text = `اگر x + ${toFa(b)} = ${toFa(c)} باشد، مقدار x چند است؟`;
    const explanation = `x = ${toFa(c)} − ${toFa(b)} = ${toFa(x)}`;
    const { options, correctAnswer } = buildOptionSet(x, [x + 1, x - 2, b]);
    qs.push({ id: `${prefix}${i + 1}`, text, options, correctAnswer, explanation, topic });
  }
  return qs;
}
function genRatio(prefix, topic, count) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const r1 = 2 + (i % 4);
    const r2 = r1 + 1 + (i % 3);
    const mult = 2 + (i % 5);
    const firstVal = r1 * mult;
    const secondVal = r2 * mult;
    const text = `اگر نسبت دو عدد ${toFa(r1)} به ${toFa(r2)} باشد و عدد اول ${toFa(firstVal)} باشد، عدد دوم چند است؟`;
    const explanation = `ضریب = ${toFa(firstVal)} ÷ ${toFa(r1)} = ${toFa(mult)}؛ عدد دوم = ${toFa(r2)} × ${toFa(mult)} = ${toFa(secondVal)}`;
    const { options, correctAnswer } = buildOptionSet(secondVal, [secondVal + r2, secondVal - r1, firstVal]);
    qs.push({ id: `${prefix}${i + 1}`, text, options, correctAnswer, explanation, topic });
  }
  return qs;
}
function genPercent(prefix, topic, count) {
  const qs = [];
  const percents = [10, 20, 25, 50];
  for (let i = 0; i < count; i++) {
    const p = percents[i % percents.length];
    const base = (2 + (i % 8)) * 20;
    const correct = Math.round((p / 100) * base);
    const text = `${toFa(p)}٪ از عدد ${toFa(base)} چند می‌شود؟`;
    const explanation = `${toFa(p)}٪ × ${toFa(base)} = ${toFa(correct)}`;
    const { options, correctAnswer } = buildOptionSet(correct, [correct + 5, correct - 5, correct + 10]);
    qs.push({ id: `${prefix}${i + 1}`, text, options, correctAnswer, explanation, topic });
  }
  return qs;
}
function genArea(prefix, topic, count) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const l = 4 + (i % 9);
    const w = 3 + ((i * 2) % 7);
    const correct = l * w;
    const text = `مساحت مستطیلی به طول ${toFa(l)} و عرض ${toFa(w)} چند سانتی‌متر مربع است؟`;
    const explanation = `مساحت = طول × عرض = ${toFa(l)} × ${toFa(w)} = ${toFa(correct)}`;
    const { options, correctAnswer } = buildOptionSet(correct, [correct + l, correct - w, l + w]);
    qs.push({ id: `${prefix}${i + 1}`, text, options, correctAnswer, explanation, topic });
  }
  return qs;
}
const REGULAR_VERBS = ["walk", "play", "watch", "clean", "cook", "study", "listen", "open", "close", "jump", "climb", "paint", "dance", "laugh", "smile", "visit", "travel", "wash", "brush", "help"];
function genRegularPast(prefix, topic, count) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const v = REGULAR_VERBS[i % REGULAR_VERBS.length];
    const past = v + "ed";
    const text = `Which is the past tense of "${v}"?`;
    const { options, correctAnswer } = buildTextOptionSet(past, [v + "ing", v + "s", v + "d"]);
    qs.push({ id: `${prefix}${i + 1}`, text, options, correctAnswer, explanation: `"${v}" + "-ed" = "${past}".`, topic });
  }
  return qs;
}
const IRREGULAR_VERBS = [["go", "went"], ["eat", "ate"], ["see", "saw"], ["write", "wrote"], ["run", "ran"], ["take", "took"], ["give", "gave"], ["come", "came"], ["buy", "bought"], ["drink", "drank"], ["read", "read"], ["sing", "sang"], ["swim", "swam"], ["think", "thought"], ["speak", "spoke"], ["break", "broke"], ["choose", "chose"], ["drive", "drove"], ["fly", "flew"], ["grow", "grew"]];
function genIrregularPast(prefix, topic, count) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const [v, past] = IRREGULAR_VERBS[i % IRREGULAR_VERBS.length];
    const text = `Past tense of "${v}" is:`;
    const { options, correctAnswer } = buildTextOptionSet(past, [v + "ed", v + "en", v + "ing"]);
    qs.push({ id: `${prefix}${i + 1}`, text, options, correctAnswer, explanation: `"${v}" is irregular; its past form is "${past}".`, topic });
  }
  return qs;
}
function genFactMC(prefix, topic, facts) {
  return facts.map((f, i) => {
    const { options, correctAnswer } = buildTextOptionSet(f.correct, f.wrong);
    return { id: `${prefix}${i + 1}`, text: f.q, options, correctAnswer, explanation: `پاسخ صحیح: ${f.correct}`, topic };
  });
}

const SCI7_CELL = [
  { q: "کوچک‌ترین واحد ساختاری بدن جانداران چیست؟", correct: "سلول", wrong: ["بافت", "اندام", "دستگاه"] },
  { q: "کدام بخش سلول اطلاعات ژنتیکی را نگه می‌دارد؟", correct: "هسته", wrong: ["غشا", "سیتوپلاسم", "دیواره"] },
  { q: "کدام بخش تنها در سلول گیاهی وجود دارد؟", correct: "دیواره سلولی", wrong: ["هسته", "غشا", "سیتوپلاسم"] },
  { q: "غشای سلولی چه نقشی دارد؟", correct: "کنترل ورود و خروج مواد", wrong: ["تولید انرژی", "ذخیره ژن", "تولید پروتئین"] },
  { q: "مایع درون سلول که اندامک‌ها در آن قرار دارند چه نام دارد؟", correct: "سیتوپلاسم", wrong: ["هسته", "غشا", "دیواره"] },
  { q: "کدام اندامک سلولی محل تولید انرژی است؟", correct: "میتوکندری", wrong: ["هسته", "ریبوزوم", "واکوئل"] },
  { q: "کدام اندامک در سلول گیاهی مسئول فتوسنتز است؟", correct: "کلروپلاست", wrong: ["میتوکندری", "هسته", "ریبوزوم"] },
  { q: "بزرگ‌ترین اندامک ذخیره‌ای در سلول گیاهی چیست؟", correct: "واکوئل", wrong: ["میتوکندری", "ریبوزوم", "کلروپلاست"] },
  { q: "سلول‌های عصبی جزو کدام سطح سازمان‌بندی بدن هستند؟", correct: "سلول", wrong: ["بافت", "اندام", "دستگاه"] },
  { q: "گروهی از سلول‌های مشابه که کار مشترکی انجام می‌دهند چه نام دارد؟", correct: "بافت", wrong: ["سلول", "اندام", "دستگاه"] },
  { q: "قلب نمونه‌ای از کدام سطح سازمان‌بندی بدن است؟", correct: "اندام", wrong: ["سلول", "بافت", "دستگاه"] },
  { q: "دستگاه گردش خون از هماهنگی کدام‌ها تشکیل شده؟", correct: "چند اندام", wrong: ["یک سلول", "یک بافت", "یک اندامک"] },
  { q: "کدام اندامک در ساخت پروتئین نقش دارد؟", correct: "ریبوزوم", wrong: ["میتوکندری", "واکوئل", "کلروپلاست"] },
  { q: "سلول‌های جانوری فاقد کدام ساختار هستند؟", correct: "دیواره سلولی", wrong: ["غشا", "هسته", "سیتوپلاسم"] },
  { q: "رنگ سبز برگ گیاهان به‌خاطر وجود کدام ماده در کلروپلاست است؟", correct: "کلروفیل", wrong: ["هموگلوبین", "کراتین", "انسولین"] },
  { q: "موجودی که تنها از یک سلول تشکیل شده چه نام دارد؟", correct: "موجود تک‌سلولی", wrong: ["موجود پرسلولی", "بافت", "اندام"] },
  { q: "انسان از نظر تعداد سلول، موجودی چگونه است؟", correct: "پرسلولی", wrong: ["تک‌سلولی", "بی‌سلول", "نیمه‌سلولی"] },
  { q: "کدام گزینه جزو اجزای اصلی سلول نیست؟", correct: "استخوان", wrong: ["هسته", "غشا", "سیتوپلاسم"] },
  { q: "غشای سلولی از چه چیزی محافظت می‌کند؟", correct: "محتویات درون سلول", wrong: ["نور خورشید", "صدا", "گرما"] },
  { q: "مطالعه سلول‌ها با کدام وسیله انجام می‌شود؟", correct: "میکروسکوپ", wrong: ["تلسکوپ", "ترازو", "دماسنج"] },
];
const SCI7_DIGEST_ENERGY = [
  { q: "هضم غذا از کجا آغاز می‌شود؟", correct: "دهان", wrong: ["معده", "روده", "کبد"] },
  { q: "کدام اندام صفرا تولید می‌کند؟", correct: "کبد", wrong: ["کلیه", "طحال", "لوزالمعده"] },
  { q: "جذب اصلی مواد غذایی کجا انجام می‌شود؟", correct: "روده باریک", wrong: ["معده", "مری", "روده بزرگ"] },
  { q: "معده چه نوع مایعی برای هضم ترشح می‌کند؟", correct: "اسید معده", wrong: ["صفرا", "بزاق", "آنزیم لوزالمعده"] },
  { q: "بزاق در کدام مرحله گوارش نقش دارد؟", correct: "گوارش دهانی", wrong: ["گوارش معده", "جذب روده", "دفع"] },
  { q: "آب اضافی مدفوع در کدام قسمت جذب می‌شود؟", correct: "روده بزرگ", wrong: ["روده باریک", "معده", "مری"] },
  { q: "غذا از دهان به معده از چه مسیری عبور می‌کند؟", correct: "مری", wrong: ["نای", "روده", "کبد"] },
  { q: "فتوسنتز در گیاهان چه انرژی‌ای تولید می‌کند؟", correct: "انرژی شیمیایی", wrong: ["انرژی صوتی", "انرژی هسته‌ای", "انرژی مغناطیسی"] },
  { q: "اصطکاک دست‌ها هنگام مالیدن، چه انرژی‌ای تولید می‌کند؟", correct: "گرما", wrong: ["نور", "صدا", "مغناطیس"] },
  { q: "باتری چه نوع انرژی‌ای را ذخیره می‌کند؟", correct: "انرژی شیمیایی", wrong: ["انرژی گرمایی", "انرژی نور", "انرژی صوتی"] },
  { q: "انرژی غذا در بدن انسان از چه راهی آزاد می‌شود؟", correct: "تنفس سلولی", wrong: ["فتوسنتز", "تبخیر", "انجماد"] },
  { q: "کدام گزینه یک منبع انرژی تجدیدپذیر است؟", correct: "انرژی خورشیدی", wrong: ["زغال‌سنگ", "نفت", "گاز طبیعی"] },
  { q: "لامپ روشن چه انرژی‌ای را به نور تبدیل می‌کند؟", correct: "انرژی الکتریکی", wrong: ["انرژی صوتی", "انرژی شیمیایی", "انرژی هسته‌ای"] },
  { q: "صدا نوعی از چه انرژی‌ای است؟", correct: "انرژی مکانیکی", wrong: ["انرژی شیمیایی", "انرژی هسته‌ای", "انرژی گرانشی"] },
  { q: "انرژی ذخیره‌شده در غذا چه نام دارد؟", correct: "انرژی شیمیایی", wrong: ["انرژی جنبشی", "انرژی نور", "انرژی صوتی"] },
  { q: "جسمی که در حال حرکت است دارای چه انرژی‌ای است؟", correct: "انرژی جنبشی", wrong: ["انرژی پتانسیل", "انرژی شیمیایی", "انرژی هسته‌ای"] },
  { q: "جسمی در ارتفاع بالا چه انرژی‌ای دارد؟", correct: "انرژی پتانسیل", wrong: ["انرژی جنبشی", "انرژی صوتی", "انرژی نور"] },
  { q: "کدام اندام غذا را خرد و مخلوط می‌کند؟", correct: "معده", wrong: ["کبد", "کلیه", "ریه"] },
  { q: "آنزیم‌های گوارشی چه نقشی دارند؟", correct: "تجزیه مواد غذایی", wrong: ["تولید انرژی الکتریکی", "ساخت استخوان", "تولید صدا"] },
  { q: "مواد زائد گوارش از کدام مسیر دفع می‌شوند؟", correct: "روده بزرگ", wrong: ["روده باریک", "معده", "کبد"] },
];
const SCI7_FORCE = [
  { q: "نیرو چه چیزی را می‌تواند تغییر دهد؟", correct: "سرعت یا جهت حرکت جسم", wrong: ["رنگ جسم", "بو", "دما"] },
  { q: "واحد نیرو در سیستم بین‌المللی چیست؟", correct: "نیوتن", wrong: ["متر", "ثانیه", "کیلوگرم"] },
  { q: "نیرویی که مانع لغزش دو سطح می‌شود چه نام دارد؟", correct: "اصطکاک", wrong: ["گرانش", "کشش", "مغناطیس"] },
  { q: "نیرویی که اجسام را به سمت زمین می‌کشد چیست؟", correct: "گرانش", wrong: ["اصطکاک", "کشش", "مغناطیس"] },
  { q: "اهرم، قرقره و سطح شیب‌دار جزو کدام دسته‌اند؟", correct: "ماشین‌های ساده", wrong: ["ماشین‌های پیچیده", "مدارهای الکتریکی", "منابع انرژی"] },
  { q: "سطح شیب‌دار چه کمکی می‌کند؟", correct: "کاهش نیروی لازم برای بالابردن جسم", wrong: ["افزایش وزن جسم", "تغییر رنگ جسم", "تولید صدا"] },
  { q: "قرقره ثابت چه تغییری در نیرو ایجاد می‌کند؟", correct: "تغییر جهت نیرو", wrong: ["افزایش وزن", "کاهش دما", "تغییر رنگ"] },
  { q: "اهرم از چند بخش اصلی تشکیل شده؟", correct: "تکیه‌گاه، بازو و نیرو", wrong: ["فقط تکیه‌گاه", "فقط بازو", "فقط نیرو"] },
  { q: "نیروی وارد بر جسم ساکن روی زمین را چه نیرویی خنثی می‌کند؟", correct: "نیروی عمودی سطح", wrong: ["نیروی مغناطیسی", "نیروی کشش", "نیروی صوتی"] },
  { q: "سرعت چیست؟", correct: "مسافت طی‌شده در واحد زمان", wrong: ["زمان طی‌شده در واحد مسافت", "جرم جسم", "وزن جسم"] },
  { q: "شتاب چه کمیتی را نشان می‌دهد؟", correct: "تغییر سرعت در واحد زمان", wrong: ["تغییر مکان", "مسافت طی‌شده", "زمان حرکت"] },
  { q: "کدام گزینه نمونه‌ای از نیروی تماسی است؟", correct: "اصطکاک", wrong: ["گرانش", "مغناطیس", "الکتریسیته ساکن"] },
  { q: "کدام گزینه نمونه‌ای از نیروی غیرتماسی است؟", correct: "گرانش", wrong: ["اصطکاک", "کشش طناب", "فشار دست"] },
  { q: "آچار به کدام نوع ماشین ساده شبیه است؟", correct: "اهرم", wrong: ["قرقره", "چرخ و محور", "سطح شیب‌دار"] },
  { q: "پیچ در واقع چه نوع ماشین ساده‌ای است؟", correct: "سطح شیب‌دار پیچیده", wrong: ["اهرم", "قرقره", "چرخ"] },
  { q: "افزایش سطح تماس معمولاً چه اثری بر اصطکاک دارد؟", correct: "افزایش اصطکاک", wrong: ["کاهش اصطکاک", "بی‌اثر بودن", "تغییر رنگ"] },
  { q: "روغن‌کاری چه تأثیری بر اصطکاک دارد؟", correct: "کاهش اصطکاک", wrong: ["افزایش اصطکاک", "بی‌اثر بودن", "افزایش وزن"] },
  { q: "نیرو یک کمیت چگونه است؟", correct: "برداری (دارای اندازه و جهت)", wrong: ["نرده‌ای (فقط اندازه)", "بی‌واحد", "ثابت همیشگی"] },
  { q: "تعادل نیروها چه زمانی برقرار است؟", correct: "وقتی برآیند نیروها صفر باشد", wrong: ["وقتی فقط یک نیرو وارد شود", "هیچ‌وقت", "همیشه"] },
  { q: "دوچرخه از کدام ماشین ساده برای حرکت آسان‌تر استفاده می‌کند؟", correct: "چرخ و محور", wrong: ["سطح شیب‌دار", "قرقره", "اهرم"] },
];
const SCI7_MATTER_EARTH = [
  { q: "آب در چند حالت مختلف یافت می‌شود؟", correct: "سه حالت (جامد، مایع، گاز)", wrong: ["دو حالت", "چهار حالت", "یک حالت"] },
  { q: "یخ زدن آب چه نوع تغییری است؟", correct: "تغییر فیزیکی", wrong: ["تغییر شیمیایی", "تغییر هسته‌ای", "تغییر زیستی"] },
  { q: "سوختن کاغذ چه نوع تغییری است؟", correct: "تغییر شیمیایی", wrong: ["تغییر فیزیکی", "تغییر مکانی", "تغییر دمایی ساده"] },
  { q: "کدام گزینه نشانه یک تغییر شیمیایی است؟", correct: "تولید گاز یا تغییر رنگ دائمی", wrong: ["تغییر شکل ساده", "تغییر دما بدون واکنش", "تغییر حجم ساده"] },
  { q: "زنگ‌زدن آهن چه نوع تغییری است؟", correct: "تغییر شیمیایی", wrong: ["تغییر فیزیکی", "تبخیر", "انجماد"] },
  { q: "لایه بیرونی جامد زمین چه نام دارد؟", correct: "پوسته", wrong: ["گوشته", "هسته خارجی", "هسته داخلی"] },
  { q: "لایه مذاب و داغی که زیر پوسته زمین قرار دارد چیست؟", correct: "گوشته", wrong: ["پوسته", "جو", "اقیانوس"] },
  { q: "مرکز زمین از چه موادی تشکیل شده؟", correct: "آهن و نیکل", wrong: ["آب", "هوا", "سنگ آهک"] },
  { q: "سنگ‌هایی که از سرد شدن مواد مذاب تشکیل می‌شوند چه نام دارند؟", correct: "سنگ‌های آذرین", wrong: ["سنگ‌های رسوبی", "سنگ‌های دگرگونی", "سنگ‌های آهکی"] },
  { q: "سنگ‌هایی که از رسوب لایه‌به‌لایه مواد تشکیل می‌شوند چه نام دارند؟", correct: "سنگ‌های رسوبی", wrong: ["سنگ‌های آذرین", "سنگ‌های دگرگونی", "سنگ‌های مذاب"] },
  { q: "زلزله در نتیجه حرکت کدام‌ها رخ می‌دهد؟", correct: "صفحات زمین‌ساخت", wrong: ["ابرها", "رودخانه‌ها", "بادها"] },
  { q: "کدام گزینه یک منبع انرژی تجدیدناپذیر است؟", correct: "نفت خام", wrong: ["انرژی خورشیدی", "انرژی باد", "انرژی آبی"] },
  { q: "بخار شدن آب دریا و تشکیل ابر جزو کدام چرخه است؟", correct: "چرخه آب", wrong: ["چرخه کربن", "چرخه سنگ", "چرخه غذا"] },
  { q: "کدام گزینه باعث فرسایش خاک می‌شود؟", correct: "باد و آب جاری", wrong: ["نور خورشید", "سکون هوا", "یخبندان دائم"] },
  { q: "کدام لایه از زمین محل زندگی موجودات است؟", correct: "پوسته", wrong: ["گوشته", "هسته خارجی", "هسته داخلی"] },
  { q: "آتشفشان‌ها معمولاً در مرز کدام‌ها شکل می‌گیرند؟", correct: "صفحات زمین‌ساخت", wrong: ["رودخانه‌ها", "جنگل‌ها", "دریاچه‌ها"] },
  { q: "مخلوط شدن شکر در آب چه نوع تغییری است؟", correct: "تغییر فیزیکی (قابل بازگشت)", wrong: ["تغییر شیمیایی", "تغییر هسته‌ای", "تغییر دائمی"] },
  { q: "کدام گزینه جزو منابع تجدیدپذیر انرژی نیست؟", correct: "زغال‌سنگ", wrong: ["انرژی خورشیدی", "انرژی باد", "انرژی آب"] },
  { q: "کدام یک باعث تشکیل سنگ دگرگونی می‌شود؟", correct: "فشار و گرمای زیاد", wrong: ["یخ‌زدن ساده", "حل‌شدن در آب", "سوختن"] },
  { q: "بزرگ‌ترین منبع آب شیرین کره زمین کجا ذخیره شده؟", correct: "یخچال‌های قطبی", wrong: ["اقیانوس‌ها", "دریاچه‌های نمک", "ابرها"] },
];

const BOOKS = {
  2: [
    {
      id: "math-2",
      title: "ریاضی",
      lessons: [
        {
          id: "math-2-l1",
          title: "فصل ۱ — شمارش و ارزش مکانی",
          questions: [
            { id: "m2q1", text: "عدد ۴۵ چند تا ده و چند تا یکی دارد؟", options: ["۴ ده و ۵ یکی", "۵ ده و ۴ یکی", "۴۵ ده", "۰ ده و ۴۵ یکی"], correctAnswer: 0, explanation: "رقم دهگان ۴ است و رقم یکان ۵ است.", topic: "شمارش و ارزش مکانی" },
            { id: "m2q2", text: "کدام عدد از ۳۸ بزرگ‌تر است؟", options: ["۲۹", "۴۰", "۳۵", "۳۷"], correctAnswer: 1, explanation: "۴۰ از ۳۸ بزرگ‌تر است.", topic: "شمارش و ارزش مکانی" },
            { id: "m2q3", text: "عدد بعد از ۶۹ کدام است؟", options: ["۶۸", "۷۰", "۷۱", "۶۰"], correctAnswer: 1, explanation: "با شمارش رو به جلو بعد از ۶۹، عدد ۷۰ می‌آید.", topic: "شمارش و ارزش مکانی" },
          ],
        },
        {
          id: "math-2-l2",
          title: "فصل ۱ — جمع و تفریق ساده",
          questions: [
            { id: "m2q4", text: "حاصل ۱۲ + ۷ چند می‌شود؟", options: ["۱۸", "۱۹", "۲۰", "۱۷"], correctAnswer: 1, explanation: "۱۲ + ۷ = ۱۹", topic: "جمع و تفریق ساده" },
            { id: "m2q5", text: "حاصل ۲۵ − ۹ چند می‌شود؟", options: ["۱۴", "۱۵", "۱۶", "۱۸"], correctAnswer: 2, explanation: "۲۵ − ۹ = ۱۶", topic: "جمع و تفریق ساده" },
          ],
        },
      ],
    },
  ],
  5: [
    {
      id: "math-5",
      title: "ریاضی",
      lessons: [
        {
          id: "math-5-l1",
          title: "فصل ۲ — کسرهای متعارفی",
          questions: [
            { id: "m5q1", text: "کدام کسر معادل ۱/۲ است؟", options: ["۲/۴", "۱/۳", "۳/۴", "۲/۳"], correctAnswer: 0, explanation: "۲/۴ با ساده‌شدن به ۱/۲ می‌رسد.", topic: "کسرهای متعارفی" },
            { id: "m5q2", text: "حاصل جمع ۱/۴ + ۱/۴ کدام است؟", options: ["۱/۴", "۲/۴", "۱/۸", "۲/۸"], correctAnswer: 1, explanation: "۱/۴ + ۱/۴ = ۲/۴", topic: "کسرهای متعارفی" },
            { id: "m5q3", text: "کسر ۳/۶ با کدام کسر ساده‌شده برابر است؟", options: ["۱/۲", "۱/۳", "۲/۳", "۳/۲"], correctAnswer: 0, explanation: "۳/۶ با تقسیم صورت و مخرج بر ۳ به ۱/۲ می‌رسد.", topic: "کسرهای متعارفی" },
          ],
        },
        {
          id: "math-5-l2",
          title: "فصل ۲ — اعداد اعشاری",
          questions: [
            { id: "m5q4", text: "عدد ۰٫۵ معادل کدام کسر است؟", options: ["۱/۲", "۱/۵", "۵/۱۰۰", "۱/۴"], correctAnswer: 0, explanation: "۰٫۵ همان ۱/۲ است.", topic: "اعداد اعشاری" },
            { id: "m5q5", text: "حاصل جمع ۰٫۲ + ۰٫۳ کدام است؟", options: ["۰٫۴", "۰٫۵", "۰٫۶", "۰٫۵۵"], correctAnswer: 1, explanation: "۰٫۲ + ۰٫۳ = ۰٫۵", topic: "اعداد اعشاری" },
          ],
        },
      ],
    },
  ],
  6: [
    {
      id: "farsi-6",
      title: "فارسی",
      lessons: [
        {
          id: "farsi-6-l1",
          title: "فصل ۴ — اجزای جمله",
          questions: [
            { id: "f6q1", text: "در جمله «علی کتاب را خواند»، کدام کلمه نهاد جمله است؟", options: ["کتاب", "را", "علی", "خواند"], correctAnswer: 2, explanation: "نهاد کسی یا چیزی است که کار را انجام می‌دهد؛ اینجا «علی».", topic: "اجزای جمله" },
            { id: "f6q2", text: "کدام کلمه در جمله «باران به‌شدت می‌بارید» قید است؟", options: ["باران", "به‌شدت", "می‌بارید", "شدت"], correctAnswer: 1, explanation: "«به‌شدت» چگونگی انجام کار را نشان می‌دهد، پس قید است.", topic: "اجزای جمله" },
            { id: "f6q3", text: "در جمله «مریم نامه را نوشت»، مفعول کدام است؟", options: ["مریم", "نامه را", "نوشت", "را"], correctAnswer: 1, explanation: "مفعول کسی یا چیزی است که کار روی آن انجام می‌شود؛ «نامه را».", topic: "اجزای جمله" },
          ],
        },
        {
          id: "farsi-6-l2",
          title: "فصل ۴ — نشانه‌های نگارشی",
          questions: [
            { id: "f6q4", text: "برای پایان یک جمله خبری از کدام نشانه استفاده می‌شود؟", options: ["!", "؟", ".", "،"], correctAnswer: 2, explanation: "جمله خبری با نقطه پایان می‌یابد.", topic: "نشانه‌های نگارشی" },
            { id: "f6q5", text: "کدام نشانه برای جدا کردن اجزای یک فهرست در جمله به کار می‌رود؟", options: ["،", "؟", "!", ":"], correctAnswer: 0, explanation: "ویرگول برای جدا کردن اجزای فهرست استفاده می‌شود.", topic: "نشانه‌های نگارشی" },
          ],
        },
      ],
    },
  ],
  7: [
    {
      id: "math-7",
      title: "ریاضی",
      chapters: [
        {
          id: "math-7-c1",
          title: "فصل ۱ — اعداد صحیح",
          lessons: [
            { id: "math-7-c1-l1", title: "درس ۱ — جمع و تفریق اعداد صحیح", questions: genAddSub("m7c1l1-", "جمع و تفریق اعداد صحیح", 20, "add") },
            { id: "math-7-c1-l2", title: "درس ۲ — ضرب و تقسیم اعداد صحیح", questions: genMulDiv("m7c1l2-", "ضرب و تقسیم اعداد صحیح", 20, "mul") },
          ],
        },
        {
          id: "math-7-c2",
          title: "فصل ۲ — معادله و نسبت",
          lessons: [
            { id: "math-7-c2-l1", title: "درس ۳ — معادله یک مجهولی", questions: genEquation("m7c2l1-", "معادله یک مجهولی", 20) },
            { id: "math-7-c2-l2", title: "درس ۴ — نسبت و تناسب", questions: genRatio("m7c2l2-", "نسبت و تناسب", 20) },
          ],
        },
        {
          id: "math-7-c3",
          title: "فصل ۳ — درصد و هندسه",
          lessons: [
            { id: "math-7-c3-l1", title: "درس ۵ — درصد", questions: genPercent("m7c3l1-", "درصد", 20) },
            { id: "math-7-c3-l2", title: "درس ۶ — محیط و مساحت", questions: genArea("m7c3l2-", "محیط و مساحت", 20) },
          ],
        },
      ],
    },
    {
      id: "science-7",
      title: "علوم",
      chapters: [
        { id: "science-7-c1", title: "فصل ۱ — ساختار و عملکرد سلول", lessons: [{ id: "science-7-c1-l1", title: "فصل ۱ — ساختار و عملکرد سلول", questions: genFactMC("s7c1-", "ساختار سلول", SCI7_CELL) }] },
        { id: "science-7-c2", title: "فصل ۲ — گوارش و انرژی در بدن", lessons: [{ id: "science-7-c2-l1", title: "فصل ۲ — گوارش و انرژی در بدن", questions: genFactMC("s7c2-", "گوارش و انرژی", SCI7_DIGEST_ENERGY) }] },
        { id: "science-7-c3", title: "فصل ۳ — نیرو، حرکت و ماشین‌های ساده", lessons: [{ id: "science-7-c3-l1", title: "فصل ۳ — نیرو، حرکت و ماشین‌های ساده", questions: genFactMC("s7c3-", "نیرو و حرکت", SCI7_FORCE) }] },
        { id: "science-7-c4", title: "فصل ۴ — مواد، تغییرات و زمین", lessons: [{ id: "science-7-c4-l1", title: "فصل ۴ — مواد، تغییرات و زمین", questions: genFactMC("s7c4-", "مواد و زمین", SCI7_MATTER_EARTH) }] },
      ],
    },
    {
      id: "english-7",
      title: "زبان انگلیسی",
      chapters: [
        {
          id: "english-7-c1",
          title: "فصل ۱ — افعال گذشته",
          lessons: [
            { id: "english-7-l1", title: "درس ۱ — افعال باقاعده", questions: genRegularPast("e7l1-", "افعال باقاعده", 20) },
            { id: "english-7-l2", title: "درس ۲ — افعال بی‌قاعده", questions: genIrregularPast("e7l2-", "افعال بی‌قاعده", 20) },
          ],
        },
      ],
    },
    {
      id: "farsi-7",
      title: "فارسی",
      chapters: [
        {
          id: "farsi-7-c1",
          title: "فصل ۱ — قرابت معنایی و دستور",
          lessons: [
            {
              id: "farsi-7-l1",
              title: "درس ۱ — قرابت معنایی و دستور",
              questions: [
                { id: "fa7q1", text: "کدام گزینه مترادف (هم‌معنی) کلمه «شادمان» است؟", options: ["خوشحال", "غمگین", "خسته", "ساکت"], correctAnswer: 0, explanation: "«شادمان» و «خوشحال» هم‌معنی هستند.", topic: "قرابت معنایی و دستور" },
                { id: "fa7q2", text: "در جمله «هوا بسیار سرد بود»، کدام کلمه صفت است؟", options: ["هوا", "بسیار", "سرد", "بود"], correctAnswer: 2, explanation: "«سرد» ویژگی هوا را بیان می‌کند، پس صفت است.", topic: "قرابت معنایی و دستور" },
                { id: "fa7q3", text: "متضاد (مخالف) کلمه «روشن» کدام است؟", options: ["تاریک", "بزرگ", "تند", "نو"], correctAnswer: 0, explanation: "«تاریک» مخالف «روشن» است.", topic: "قرابت معنایی و دستور" },
                { id: "fa7q4", text: "کدام گزینه جمع کلمه «کتاب» است؟", options: ["کتاب‌ها", "کتابی", "کتابچه", "کتابدار"], correctAnswer: 0, explanation: "علامت جمع فارسی «ها» به کتاب اضافه می‌شود.", topic: "قرابت معنایی و دستور" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "social-7",
      title: "مطالعات اجتماعی",
      chapters: [
        {
          id: "social-7-c1",
          title: "فصل ۱ — جغرافیا و محیط زیست",
          lessons: [
            {
              id: "social-7-l1",
              title: "درس ۱ — جغرافیا و محیط زیست",
              questions: [
                { id: "so7q1", text: "بزرگ‌ترین قاره جهان از نظر وسعت کدام است؟", options: ["آسیا", "آفریقا", "اروپا", "استرالیا"], correctAnswer: 0, explanation: "آسیا بزرگ‌ترین قاره جهان از نظر وسعت است.", topic: "جغرافیا و محیط زیست" },
                { id: "so7q2", text: "کدام یک از موارد زیر یک منبع انرژی تجدیدپذیر است؟", options: ["زغال‌سنگ", "نفت", "انرژی خورشیدی", "گاز طبیعی"], correctAnswer: 2, explanation: "انرژی خورشیدی تجدیدپذیر و پاک است.", topic: "جغرافیا و محیط زیست" },
                { id: "so7q3", text: "خط استوا کره زمین را به چند نیم‌کره تقسیم می‌کند؟", options: ["۱", "۲", "۳", "۴"], correctAnswer: 1, explanation: "خط استوا زمین را به دو نیم‌کره شمالی و جنوبی تقسیم می‌کند.", topic: "جغرافیا و محیط زیست" },
                { id: "so7q4", text: "بلندترین قله جهان در کدام رشته‌کوه قرار دارد؟", options: ["آلپ", "هیمالیا", "آند", "زاگرس"], correctAnswer: 1, explanation: "قله اورست در رشته‌کوه هیمالیا قرار دارد.", topic: "جغرافیا و محیط زیست" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "arabic-7",
      title: "عربی",
      chapters: [
        {
          id: "arabic-7-c1",
          title: "فصل ۱ — واژگان پایه",
          lessons: [
            {
              id: "arabic-7-l1",
              title: "درس ۱ — واژگان پایه",
              questions: [
                { id: "ar7q1", text: "کلمه «بيت» در عربی به چه معناست؟", options: ["خانه", "مدرسه", "کتاب", "درخت"], correctAnswer: 0, explanation: "«بيت» یعنی خانه.", topic: "واژگان پایه" },
                { id: "ar7q2", text: "کلمه «شمس» در عربی به چه معناست؟", options: ["خورشید", "ماه", "ستاره", "ابر"], correctAnswer: 0, explanation: "«شمس» یعنی خورشید.", topic: "واژگان پایه" },
                { id: "ar7q3", text: "کلمه «ماء» در عربی به چه معناست؟", options: ["آب", "آتش", "هوا", "خاک"], correctAnswer: 0, explanation: "«ماء» یعنی آب.", topic: "واژگان پایه" },
                { id: "ar7q4", text: "کلمه «قمر» در عربی به چه معناست؟", options: ["ماه", "خورشید", "ستاره", "زمین"], correctAnswer: 0, explanation: "«قمر» یعنی ماه.", topic: "واژگان پایه" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "kartech-7",
      title: "کار و فناوری",
      chapters: [
        {
          id: "kartech-7-c1",
          title: "فصل ۱ — فرآیند طراحی و ساخت",
          lessons: [
            {
              id: "kartech-7-l1",
              title: "درس ۱ — فرآیند طراحی و ساخت",
              questions: [
                { id: "kt7q1", text: "اولین قدم در فرآیند طراحی و ساخت یک وسیله چیست؟", options: ["شناسایی نیاز", "ساخت نمونه", "فروش محصول", "تبلیغ"], correctAnswer: 0, explanation: "طراحی همیشه با شناسایی نیاز آغاز می‌شود.", topic: "فرآیند طراحی و ساخت" },
                { id: "kt7q2", text: "کدام ابزار برای بریدن دقیق چوب استفاده می‌شود؟", options: ["اره", "چکش", "پیچ‌گوشتی", "متر"], correctAnswer: 0, explanation: "اره ابزار برش چوب است.", topic: "فرآیند طراحی و ساخت" },
                { id: "kt7q3", text: "در کارگاه، رعایت نکات ایمنی چه اهمیتی دارد؟", options: ["پیشگیری از حوادث", "کاهش کیفیت کار", "افزایش هزینه", "کندی کار"], correctAnswer: 0, explanation: "ایمنی از بروز حوادث جلوگیری می‌کند.", topic: "فرآیند طراحی و ساخت" },
                { id: "kt7q4", text: "طراحی محصول باید متناسب با چه چیزی باشد؟", options: ["نیاز کاربر", "سلیقه سازنده فقط", "رنگ دلخواه", "حجم انبار"], correctAnswer: 0, explanation: "طراحی خوب همیشه پاسخ به نیاز کاربر است.", topic: "فرآیند طراحی و ساخت" },
              ],
            },
          ],
        },
      ],
    },
  ],
  8: [
    {
      id: "chemistry-8",
      title: "شیمی",
      lessons: [
        {
          id: "chemistry-8-l1",
          title: "فصل ۵ — نام‌گذاری ترکیبات",
          questions: [
            { id: "c8q1", text: "فرمول شیمیایی آب کدام است؟", options: ["CO2", "H2O", "O2", "NaCl"], correctAnswer: 1, explanation: "آب از دو اتم هیدروژن و یک اتم اکسیژن ساخته شده است.", topic: "نام‌گذاری ترکیبات" },
            { id: "c8q2", text: "نمک طعام از ترکیب کدام دو عنصر ساخته می‌شود؟", options: ["سدیم و کلر", "کربن و اکسیژن", "هیدروژن و اکسیژن", "آهن و گوگرد"], correctAnswer: 0, explanation: "نمک طعام NaCl از سدیم و کلر تشکیل شده است.", topic: "نام‌گذاری ترکیبات" },
            { id: "c8q3", text: "نام ترکیب با فرمول CO2 چیست؟", options: ["مونوکسید کربن", "دی‌اکسید کربن", "اکسید کلسیم", "کربنات سدیم"], correctAnswer: 1, explanation: "CO2 دی‌اکسید کربن نام دارد.", topic: "نام‌گذاری ترکیبات" },
          ],
        },
        {
          id: "chemistry-8-l2",
          title: "فصل ۵ — فرمول شیمیایی",
          questions: [
            { id: "c8q4", text: "فرمول شیمیایی گاز اکسیژن (به‌صورت مولکولی) کدام است؟", options: ["O", "O2", "O3", "CO2"], correctAnswer: 1, explanation: "گاز اکسیژن به‌صورت مولکول دواتمی O2 وجود دارد.", topic: "فرمول شیمیایی" },
            { id: "c8q5", text: "در فرمول H2SO4 چند اتم اکسیژن وجود دارد؟", options: ["۲", "۳", "۴", "۱"], correctAnswer: 2, explanation: "در H2SO4 عدد ۴ نشان‌دهنده تعداد اتم‌های اکسیژن است.", topic: "فرمول شیمیایی" },
          ],
        },
      ],
    },
  ],
  9: [
    {
      id: "math-9",
      title: "ریاضی",
      lessons: [
        {
          id: "math-9-l1",
          title: "فصل ۳ — فرمول ریشه‌ها",
          questions: [
            { id: "m9q1", text: "مجموع ریشه‌های معادله x²−5x+6=0 کدام است؟", options: ["۵", "۶", "−۵", "۱"], correctAnswer: 0, explanation: "مجموع ریشه‌ها برابر است با ۵ (ضریب x با علامت منفی).", topic: "فرمول ریشه‌ها" },
            { id: "m9q2", text: "حاصل‌ضرب ریشه‌های معادله x²−5x+6=0 کدام است؟", options: ["۵", "۶", "−۶", "۱"], correctAnswer: 1, explanation: "حاصل‌ضرب ریشه‌ها برابر جمله ثابت یعنی ۶ است.", topic: "فرمول ریشه‌ها" },
            { id: "m9q3", text: "کدام مقدار یکی از ریشه‌های معادله x²−9=0 است؟", options: ["۳", "−۹", "۹", "۰"], correctAnswer: 0, explanation: "x²=9 پس x=3 یا x=−3 است.", topic: "فرمول ریشه‌ها" },
          ],
        },
        {
          id: "math-9-l2",
          title: "فصل ۳ — تجزیه عبارت درجه دو",
          questions: [
            { id: "m9q4", text: "عبارت x²+5x+6 به کدام صورت تجزیه می‌شود؟", options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x−2)(x−3)", "(x+6)(x−1)"], correctAnswer: 0, explanation: "حاصل‌ضرب ۲ و ۳ برابر ۶ و مجموع آن‌ها ۵ است.", topic: "تجزیه عبارت درجه دو" },
            { id: "m9q5", text: "عبارت x²−4 به کدام صورت تجزیه می‌شود؟", options: ["(x−2)(x+2)", "(x−4)(x+1)", "(x−2)²", "(x+2)²"], correctAnswer: 0, explanation: "این یک اتحاد مزدوج است: x²−4=(x−2)(x+2)", topic: "تجزیه عبارت درجه دو" },
          ],
        },
      ],
    },
  ],
  10: [
    {
      id: "physics-10",
      title: "فیزیک",
      lessons: [
        {
          id: "physics-10-l1",
          title: "فصل ۱ — سرعت و شتاب",
          questions: [
            { id: "p10q1", text: "واحد سرعت در سیستم SI کدام است؟", options: ["متر", "متر بر ثانیه", "کیلوگرم", "نیوتن"], correctAnswer: 1, explanation: "سرعت از تقسیم مسافت (متر) بر زمان (ثانیه) به دست می‌آید.", topic: "سرعت و شتاب" },
            { id: "p10q2", text: "اگر جسمی در ۴ ثانیه، ۲۰ متر جابه‌جا شود، سرعت متوسط آن چند متر بر ثانیه است؟", options: ["۴", "۵", "۸۰", "۲۰"], correctAnswer: 1, explanation: "سرعت = مسافت ÷ زمان = ۲۰ ÷ ۴ = ۵", topic: "سرعت و شتاب" },
            { id: "p10q3", text: "شتاب چه کمیتی را نشان می‌دهد؟", options: ["تغییر مکان", "تغییر سرعت در واحد زمان", "مسافت طی‌شده", "زمان حرکت"], correctAnswer: 1, explanation: "شتاب نرخ تغییر سرعت نسبت به زمان است.", topic: "سرعت و شتاب" },
          ],
        },
        {
          id: "physics-10-l2",
          title: "فصل ۱ — معادلات حرکت",
          questions: [
            { id: "p10q4", text: "در حرکت با شتاب ثابت، رابطه v=v0+at چه چیزی را محاسبه می‌کند؟", options: ["مسافت", "سرعت نهایی", "شتاب", "زمان"], correctAnswer: 1, explanation: "این رابطه سرعت نهایی را بر اساس سرعت اولیه، شتاب و زمان می‌دهد.", topic: "معادلات حرکت" },
            { id: "p10q5", text: "اگر جسمی از حال سکون با شتاب ۲ متر بر مجذور ثانیه شروع به حرکت کند، سرعت آن بعد از ۳ ثانیه چقدر است؟", options: ["۵", "۶", "۹", "۲"], correctAnswer: 1, explanation: "v = a×t = ۲ × ۳ = ۶ متر بر ثانیه", topic: "معادلات حرکت" },
          ],
        },
      ],
    },
  ],
  12: [
    {
      id: "math-12",
      title: "ریاضی",
      lessons: [
        {
          id: "math-12-l1",
          title: "فصل ۱ — قواعد مشتق‌گیری",
          questions: [
            { id: "m12q1", text: "مشتق تابع f(x)=x² کدام است؟", options: ["x", "2x", "x²", "2"], correctAnswer: 1, explanation: "طبق قاعده توان، مشتق x² برابر است با 2x.", topic: "قواعد مشتق‌گیری" },
            { id: "m12q2", text: "مشتق تابع ثابت f(x)=5 کدام است؟", options: ["۰", "۵", "۱", "x"], correctAnswer: 0, explanation: "مشتق هر تابع ثابت برابر صفر است.", topic: "قواعد مشتق‌گیری" },
            { id: "m12q3", text: "مشتق تابع f(x)=3x³ کدام است؟", options: ["9x²", "3x²", "x²", "9x"], correctAnswer: 0, explanation: "طبق قاعده توان: 3×3×x² = 9x²", topic: "قواعد مشتق‌گیری" },
          ],
        },
        {
          id: "math-12-l2",
          title: "فصل ۱ — کاربرد مشتق",
          questions: [
            { id: "m12q4", text: "مشتق یک تابع در یک نقطه، معرف کدام است؟", options: ["مساحت زیر نمودار", "شیب خط مماس", "طول تابع", "جهت محور y"], correctAnswer: 1, explanation: "مشتق در هر نقطه، شیب خط مماس بر نمودار در آن نقطه است.", topic: "کاربرد مشتق" },
            { id: "m12q5", text: "اگر f'(x)=0 در نقطه‌ای باشد، آن نقطه می‌تواند چه باشد؟", options: ["نقطه اکسترمم", "ریشه تابع", "مجانب", "دامنه"], correctAnswer: 0, explanation: "در نقاط اکسترمم (بیشینه/کمینه) مشتق تابع صفر می‌شود.", topic: "کاربرد مشتق" },
          ],
        },
      ],
    },
  ],
};

function getAllLessons(book) {
  if (!book) return [];
  if (book.chapters) return book.chapters.flatMap((c) => c.lessons);
  return book.lessons || [];
}
function resolveExam(examId) {
  if (!examId) return null;
  return safeGet(dynamicExamKey(examId));
}

const ToastContext = React.createContext(() => {});
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const showToast = useCallback((message, icon = "info") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, icon }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-xl border border-white/10 bg-namrino-navy-2/95 px-4 py-3 text-xs text-slate-200 shadow-xl shadow-black/40 backdrop-blur-md toast-in sm:text-sm">
            {t.icon === "check" ? <CheckCircle2 size={16} className="flex-shrink-0 text-namrino-cyan" /> : <Info size={16} className="flex-shrink-0 text-namrino-cyan" />}
            <span className="leading-6">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
function useToast() {
  return React.useContext(ToastContext);
}

function AnimatedBackground({ minimal = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = mql.matches;
    let width, height, dpr;
    let particles = [];
    let raf;
    let running = true;
    function isMobile() {
      return width < 640;
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function initParticles() {
      const mobile = isMobile();
      const base = mobile ? 16000 : 22000;
      let cap = mobile ? 26 : 55;
      if (minimal) cap = mobile ? 8 : 14;
      const count = Math.min(cap, Math.floor((width * height) / base));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.4,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        o: Math.random() * 0.4 + 0.12,
      }));
    }
    function drawFrame() {
      ctx.clearRect(0, 0, width, height);
      if (!minimal) {
        const linkDist = isMobile() ? 80 : 110;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < linkDist) {
              const alpha = (1 - dist / linkDist) * 0.08;
              if (alpha > 0.004) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(124, 92, 255, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            }
          }
        }
      }
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${p.o})`;
        ctx.fill();
      });
    }
    function loop() {
      if (!running) return;
      drawFrame();
      raf = requestAnimationFrame(loop);
    }
    resize();
    initParticles();
    if (!reduceMotion) loop();
    else drawFrame();
    const onResize = () => {
      resize();
      initParticles();
      if (reduceMotion) drawFrame();
    };
    const onMotionChange = (e) => {
      reduceMotion = e.matches;
      if (reduceMotion) {
        if (raf) cancelAnimationFrame(raf);
        drawFrame();
      } else {
        loop();
      }
    };
    window.addEventListener("resize", onResize);
    if (mql.addEventListener) mql.addEventListener("change", onMotionChange);
    return () => {
      running = false;
      window.removeEventListener("resize", onResize);
      if (mql.removeEventListener) mql.removeEventListener("change", onMotionChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [minimal]);
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-namrino-navy">
      <div className={`absolute -top-32 -right-20 h-[420px] w-[420px] rounded-full bg-namrino-purple-16 blur-[120px] ${minimal ? "" : "orb-float-a"}`} />
      <div className={`absolute top-1/3 -left-24 h-[380px] w-[380px] rounded-full bg-namrino-cyan-12 blur-[120px] ${minimal ? "" : "orb-float-b"}`} />
      <div className={`absolute bottom-0 right-1/4 h-[320px] w-[320px] rounded-full bg-namrino-purple-10 blur-[110px] ${minimal ? "" : "orb-float-c"}`} />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,22,0)_0%,rgba(7,11,22,0.35)_55%,rgba(7,11,22,0.9)_100%)]" />
    </div>
  );
}

function GlassCard({ children, className = "", ...rest }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/[0.035] backdrop-blur-md transition-colors duration-300 ${className}`} {...rest}>
      {children}
    </div>
  );
}
function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1 text-xs text-namrino-cyan/80">{eyebrow}</p>}
        <h2 className="text-lg font-bold text-slate-100 sm:text-xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
function FormField({ label, value, onChange, type = "text", ...rest }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-colors focus:border-namrino-purple-60"
        {...rest}
      />
    </label>
  );
}
function GradePicker({ gradeGroup, classNum, onGradeGroup, onClass }) {
  return (
    <>
      <div>
        <span className="mb-1.5 block text-xs font-medium text-slate-400">پایه</span>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onGradeGroup(gradeGroup === g.id ? null : g.id)}
              aria-pressed={gradeGroup === g.id}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${gradeGroup === g.id ? "border-namrino-purple-60 bg-namrino-purple-12 text-namrino-cyan" : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/20"}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
      {gradeGroup && (
        <div>
          <span className="mb-1.5 block text-xs font-medium text-slate-400">کلاس</span>
          <div className="flex flex-wrap gap-2">
            {GRADE_RANGES[gradeGroup].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onClass(classNum === n ? null : n)}
                aria-pressed={classNum === n}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${classNum === n ? "border-namrino-purple-60 bg-namrino-purple-12 text-namrino-cyan" : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/20"}`}
              >
                {CLASS_LABELS[n]}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
function AccountBadge({ isPro }) {
  if (isPro) {
    return <span className="inline-flex items-center gap-1 rounded-full border border-namrino-cyan/40 bg-namrino-cyan-20 px-2.5 py-1 text-[10px] font-extrabold text-namrino-cyan">PRO ✦</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-400">FREE</span>
      <button onClick={goUpgrade} className="text-[10px] font-semibold text-namrino-cyan hover:text-cyan-300">
        ارتقا به PRO
      </button>
    </span>
  );
}

function Header() {
  const route = useHashRoute();
  const { user, loggedIn } = useAuth();
  const [isPro] = useIsPro();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const firstLinkRef = useRef(null);
  const menuButtonRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const handleNavClick = (e, item) => {
    setOpen(false);
    setActive(item.href || item.route);
    if (item.route) return;
    if (route.name !== "home") {
      e.preventDefault();
      navigate("/");
      const id = item.href.replace("#", "");
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 90);
    }
  };
  const goHome = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate("/");
  };
  const goAccount = () => {
    setOpen(false);
    navigate(loggedIn ? "/dashboard" : "/login");
  };
  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-namrino-navy-70 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <button
          ref={menuButtonRef}
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-namrino-cyan md:hidden"
          aria-label="باز کردن منو"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <Menu size={22} />
        </button>
        <a href="#" onClick={goHome} className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <span className="text-lg font-extrabold tracking-tight text-slate-100">نمرینو</span>
          <AccountBadge isPro={isPro} />
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.route ? "#" + item.route : item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={`relative text-sm transition-colors after:absolute after:-bottom-1.5 after:right-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-namrino-cyan after:transition-transform after:duration-300 hover:text-namrino-cyan hover:after:scale-x-100 ${
                active === (item.href || item.route) ? "text-namrino-cyan after:scale-x-100" : "text-slate-300"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          {loggedIn ? (
            <button onClick={goAccount} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10">
              <User size={15} />
              {user?.firstName || "داشبورد"}
            </button>
          ) : (
            <button onClick={goAccount} className="rounded-xl bg-gradient-to-l from-namrino-purple to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-namrino-purple-20 transition-transform hover:scale-[1.03] active:scale-[0.98]">
              ورود / ثبت‌نام
            </button>
          )}
        </div>
        <button onClick={goAccount} className="rounded-full border border-white/10 p-2 text-slate-300 transition-colors hover:bg-white/5 md:hidden" aria-label={loggedIn ? "داشبورد" : "ورود / ثبت‌نام"}>
          <User size={18} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden="true" />
          <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="منوی اصلی" className="absolute right-0 top-0 h-full w-72 border-l border-white/10 bg-namrino-navy p-5 drawer-in">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold text-slate-100">منو</span>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-namrino-cyan" aria-label="بستن منو">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <AccountBadge isPro={isPro} />
            </div>
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item, i) => (
                <a
                  key={item.label}
                  ref={i === 0 ? firstLinkRef : null}
                  href={item.route ? "#" + item.route : item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className="rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-namrino-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-namrino-cyan"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <button onClick={goAccount} className="mt-6 w-full rounded-xl bg-gradient-to-l from-namrino-purple to-violet-600 px-4 py-2.5 text-sm font-semibold text-white">
              {loggedIn ? `داشبورد ${user?.firstName || ""}` : "ورود / ثبت‌نام"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const scrollToExams = () => document.getElementById("exams")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:pt-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-namrino-cyan fade-in-up" style={{ animationDelay: "0ms" }}>
          <span>🎓</span>
          <span>نمرینو</span>
        </div>
        <h1 className="text-balance text-3xl font-extrabold leading-[1.35] text-slate-50 fade-in-up sm:text-4xl md:text-5xl" style={{ animationDelay: "60ms" }}>
          با نمرینو بفهم چند چندی.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400 fade-in-up sm:text-base" style={{ animationDelay: "120ms" }}>
          آزمون بده، نقاط ضعفت رو پیدا کن و قدم‌به‌قدم بهتر شو.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 fade-in-up sm:flex-row" style={{ animationDelay: "180ms" }}>
          <button onClick={scrollToExams} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-namrino-purple to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-namrino-purple-30 transition-all hover:shadow-namrino-purple-45 hover:brightness-110 active:scale-[0.98] sm:w-auto">
            <Rocket size={17} className="transition-transform group-hover:-translate-y-0.5" />
            شروع آزمون
          </button>
          <a href="#exams" className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10 active:scale-[0.98] sm:w-auto">
            <Search size={17} />
            پیدا کردن آزمون
          </a>
        </div>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 fade-in-up" style={{ animationDelay: "240ms" }}>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-namrino-cyan" />پایه ۱ تا ۱۲</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-namrino-purple" />آزمون‌های متنوع</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />نتیجه فوری</span>
        </div>
      </div>
    </section>
  );
}

function StepBlock({ number, title, doneSummary, children, last }) {
  return (
    <div className={last ? "" : "mb-5 border-b border-white/6 pb-5"}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${doneSummary ? "bg-namrino-cyan-20 text-namrino-cyan" : "bg-white/8 text-slate-400"}`}>{number}</span>
        <span className="text-sm font-semibold text-slate-200">{title}</span>
        {doneSummary && <span className="text-[11px] text-slate-500">— {doneSummary}</span>}
      </div>
      {children}
    </div>
  );
}
function chipCls(active) {
  return `flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
    active ? "border-namrino-purple-60 bg-namrino-purple-12 text-namrino-cyan" : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/20"
  }`;
}

function generateBuiltExam({ classNum, book, lessons, count, modeLabel }) {
  const seen = new Set();
  const pool = [];
  lessons.forEach((l) =>
    l.questions.forEach((q) => {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        pool.push(q);
      }
    })
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const actualCount = Math.min(count, shuffled.length);
  const selected = shuffled.slice(0, actualCount);
  const id = `custom_${book.id}_${Date.now()}`;
  const chapterLabel = lessons.length > 1 ? modeLabel || `${toFa(lessons.length)} درس منتخب` : lessons[0].title;
  const exam = {
    id,
    title: `${book.title} ${CLASS_LABELS[classNum]} — ${chapterLabel}`,
    subject: book.title,
    grade: CLASS_LABELS[classNum],
    gradeNum: classNum,
    chapter: chapterLabel,
    duration: Math.max(5, Math.ceil(selected.length * 1.2)),
    difficulty: "متوسط",
    description: "این آزمون بر اساس انتخاب‌های خودت در نمرینو ساخته شده است.",
    questions: selected,
    dynamic: true,
    note: actualCount < count ? `تعداد سؤال‌های موجود برای این انتخاب ${toFa(actualCount)} مورد بود؛ آزمون با همین تعداد ساخته شد.` : null,
  };
  safeSet(dynamicExamKey(id), exam);
  return exam;
}

function ExamBuilder() {
  const [isPro] = useIsPro();
  const [gradeGroup, setGradeGroup] = useState(null);
  const [classNum, setClassNum] = useState(null);
  const [bookId, setBookId] = useState(null);
  const [wholeGrade, setWholeGrade] = useState(false);
  const [mode, setMode] = useState(null);
  const [lessonIds, setLessonIds] = useState([]);
  const [chapterId, setChapterId] = useState(null);
  const [multiChapterIds, setMultiChapterIds] = useState([]);
  const [count, setCount] = useState(null);
  const [lockNotice, setLockNotice] = useState(false);

  const books = classNum ? BOOKS[classNum] || [] : [];
  const book = !wholeGrade ? books.find((b) => b.id === bookId) || null : null;
  const allLessons = getAllLessons(book);
  const hasChapters = !!(book && book.chapters);

  const MODES = book
    ? [
        { id: "single-lesson", label: "یک درس", pro: false },
        ...(hasChapters ? [{ id: "single-chapter", label: "یک فصل کامل", pro: false }] : []),
        { id: "whole-book", label: "آزمون جامع کتاب", pro: false },
        { id: "multi-lesson", label: "چند درس دلخواه", pro: true },
        ...(hasChapters ? [{ id: "multi-chapter", label: "چند فصل دلخواه", pro: true }] : []),
      ]
    : [];

  let selectedLessons = [];
  if (wholeGrade) selectedLessons = books.flatMap((b) => getAllLessons(b));
  else if (mode === "single-lesson") selectedLessons = allLessons.filter((l) => lessonIds.includes(l.id));
  else if (mode === "single-chapter" && chapterId) selectedLessons = book.chapters.find((c) => c.id === chapterId)?.lessons || [];
  else if (mode === "whole-book") selectedLessons = allLessons;
  else if (mode === "multi-lesson") selectedLessons = allLessons.filter((l) => lessonIds.includes(l.id));
  else if (mode === "multi-chapter") selectedLessons = (book.chapters || []).filter((c) => multiChapterIds.includes(c.id)).flatMap((c) => c.lessons);

  const poolSize = selectedLessons.reduce((s, l) => s + l.questions.length, 0);
  const COUNT_OPTIONS = [5, 10, 15, 20, 30, 50, 75, 100];

  function resetFromBook() {
    setMode(null);
    setLessonIds([]);
    setChapterId(null);
    setMultiChapterIds([]);
    setCount(null);
    setLockNotice(false);
  }
  function chooseGradeGroup(id) {
    if (gradeGroup === id) {
      setGradeGroup(null);
      setClassNum(null);
      setBookId(null);
      setWholeGrade(false);
      resetFromBook();
      return;
    }
    setGradeGroup(id);
    setClassNum(null);
    setBookId(null);
    setWholeGrade(false);
    resetFromBook();
  }
  function chooseClass(n) {
    if (classNum === n) {
      setClassNum(null);
      setBookId(null);
      setWholeGrade(false);
      resetFromBook();
      return;
    }
    setClassNum(n);
    setBookId(null);
    setWholeGrade(false);
    resetFromBook();
  }
  function chooseBook(id) {
    if (!wholeGrade && bookId === id) {
      setBookId(null);
      resetFromBook();
      return;
    }
    setBookId(id);
    setWholeGrade(false);
    resetFromBook();
  }
  function chooseWholeGrade() {
    if (wholeGrade) {
      setWholeGrade(false);
      resetFromBook();
      return;
    }
    if (!isPro) {
      setLockNotice(true);
      return;
    }
    setBookId(null);
    setWholeGrade(true);
    setLockNotice(false);
    setMode("whole-grade");
    setLessonIds([]);
    setChapterId(null);
    setMultiChapterIds([]);
    setCount(null);
  }
  function chooseMode(m) {
    if (mode === m.id) {
      setMode(null);
      setLessonIds([]);
      setChapterId(null);
      setMultiChapterIds([]);
      setCount(null);
      setLockNotice(false);
      return;
    }
    if (m.pro && !isPro) {
      setLockNotice(true);
      return;
    }
    setLockNotice(false);
    setMode(m.id);
    setLessonIds([]);
    setChapterId(null);
    setMultiChapterIds([]);
    setCount(null);
  }
  function pickSingleLesson(id) {
    setLessonIds((prev) => (prev.length === 1 && prev[0] === id ? [] : [id]));
    setCount(null);
  }
  function toggleMultiLesson(id) {
    setLessonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setCount(null);
  }
  function pickSingleChapter(id) {
    setChapterId((prev) => (prev === id ? null : id));
    setCount(null);
  }
  function toggleMultiChapter(id) {
    setMultiChapterIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setCount(null);
  }
  function handleStart() {
    if ((!book && !wholeGrade) || selectedLessons.length === 0 || !count) return;
    if (!isPro && (wholeGrade || mode === "multi-lesson" || mode === "multi-chapter")) {
      setLockNotice(true);
      return;
    }
    if (!isPro && count > 20) {
      setLockNotice(true);
      return;
    }
    const modeLabel = wholeGrade ? "آزمون جامع کل پایه" : MODES.find((m) => m.id === mode)?.label;
    const effectiveBook = wholeGrade ? { id: `grade-${classNum}`, title: `همه کتاب‌های ${CLASS_LABELS[classNum]}` } : book;
    const exam = generateBuiltExam({ classNum, book: effectiveBook, lessons: selectedLessons, count, modeLabel });
    navigate(`/exam/${exam.id}`);
  }

  return (
    <section id="exams" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-10">
      <SectionTitle eyebrow={<AccountBadge isPro={isPro} />} title="🧩 آزمون خودت رو بساز" />
      <GlassCard className="p-5 sm:p-6">
        <StepBlock number="۱" title="انتخاب پایه" doneSummary={gradeGroup ? GRADES.find((g) => g.id === gradeGroup)?.label : null}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => chooseGradeGroup(g.id)}
                className={`rounded-xl border p-3 text-right transition-colors ${gradeGroup === g.id ? "border-namrino-purple-60 bg-namrino-purple-12" : "border-white/8 bg-white/[0.03] hover:border-white/20"}`}
              >
                <div className="mb-1 text-lg">{g.icon}</div>
                <div className={`text-xs font-bold ${gradeGroup === g.id ? "text-namrino-cyan" : "text-slate-200"}`}>{g.label}</div>
              </button>
            ))}
          </div>
        </StepBlock>

        {gradeGroup && (
          <StepBlock number="۲" title="انتخاب کلاس" doneSummary={classNum ? CLASS_LABELS[classNum] : null}>
            <div className="flex flex-wrap gap-2">
              {GRADE_RANGES[gradeGroup].map((n) => (
                <button key={n} onClick={() => chooseClass(n)} className={chipCls(classNum === n)}>
                  {CLASS_LABELS[n]}
                </button>
              ))}
            </div>
          </StepBlock>
        )}

        {classNum && (
          <StepBlock number="۳" title="انتخاب کتاب" doneSummary={wholeGrade ? "آزمون جامع کل پایه" : book?.title}>
            {books.length === 0 ? (
              <p className="text-xs text-slate-500">فعلاً کتابی برای این کلاس ثبت نشده — به‌زودی اضافه می‌شود.</p>
            ) : (
              <>
                <div className="mb-2.5 flex flex-wrap gap-2">
                  {books.map((b) => (
                    <button key={b.id} onClick={() => chooseBook(b.id)} className={chipCls(!wholeGrade && bookId === b.id)}>
                      {b.title}
                    </button>
                  ))}
                </div>
                <button
                  onClick={chooseWholeGrade}
                  className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                    wholeGrade ? "border-namrino-purple-60 bg-namrino-purple-12 text-namrino-cyan" : !isPro ? "border-white/8 bg-white/[0.02] text-slate-500 hover:border-white/20" : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/20"
                  }`}
                >
                  {!isPro && <Lock size={11} />}
                  📚 آزمون جامع کل پایه {CLASS_LABELS[classNum]}
                </button>
                {lockNotice && !book && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-namrino-purple-30 bg-namrino-purple-08 px-4 py-3">
                    <span className="text-xs text-slate-300">🔒 این قابلیت مخصوص کاربران PRO است.</span>
                    <button onClick={goUpgrade} className="rounded-lg bg-gradient-to-l from-namrino-purple to-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white">
                      ارتقا به PRO
                    </button>
                  </div>
                )}
              </>
            )}
          </StepBlock>
        )}

        {wholeGrade && (
          <StepBlock number="۴" title="نوع انتخاب" doneSummary="آزمون جامع کل پایه">
            <p className="text-xs text-slate-400">
              سؤال‌ها از تمام کتاب‌های پایه {CLASS_LABELS[classNum]} انتخاب می‌شوند ({toFa(poolSize)} سؤال موجود).
            </p>
          </StepBlock>
        )}

        {book && (
          <StepBlock number="۴" title="نوع انتخاب" doneSummary={mode ? MODES.find((m) => m.id === mode)?.label : null}>
            <div className="mb-3 flex flex-wrap gap-2">
              {MODES.map((m) => {
                const locked = m.pro && !isPro;
                return (
                  <button
                    key={m.id}
                    onClick={() => chooseMode(m)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                      mode === m.id ? "border-namrino-purple-60 bg-namrino-purple-12 text-namrino-cyan" : locked ? "border-white/8 bg-white/[0.02] text-slate-500" : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {locked && <Lock size={11} />}
                    {m.label}
                  </button>
                );
              })}
            </div>

            {lockNotice && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-namrino-purple-30 bg-namrino-purple-08 px-4 py-3">
                <span className="text-xs text-slate-300">🔒 این قابلیت مخصوص کاربران PRO است.</span>
                <button onClick={goUpgrade} className="rounded-lg bg-gradient-to-l from-namrino-purple to-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white">
                  ارتقا به PRO
                </button>
              </div>
            )}

            {mode === "single-lesson" && (
              <div className="flex flex-wrap gap-2">
                {allLessons.map((l) => (
                  <button key={l.id} onClick={() => pickSingleLesson(l.id)} className={chipCls(lessonIds.includes(l.id))}>
                    {l.title}
                  </button>
                ))}
              </div>
            )}
            {mode === "single-chapter" && hasChapters && (
              <div className="flex flex-wrap gap-2">
                {book.chapters.map((c) => (
                  <button key={c.id} onClick={() => pickSingleChapter(c.id)} className={chipCls(chapterId === c.id)}>
                    {c.title}
                  </button>
                ))}
              </div>
            )}
            {mode === "whole-book" && (
              <p className="text-xs text-slate-400">
                همه‌ی {toFa(allLessons.length)} درس این کتاب انتخاب شد ({toFa(poolSize)} سؤال موجود).
              </p>
            )}
            {mode === "multi-lesson" && isPro && (
              <div className="flex flex-wrap gap-2">
                {allLessons.map((l) => {
                  const sel = lessonIds.includes(l.id);
                  return (
                    <button key={l.id} onClick={() => toggleMultiLesson(l.id)} className={chipCls(sel)}>
                      {sel && <Check size={12} />}
                      {l.title}
                    </button>
                  );
                })}
              </div>
            )}
            {mode === "multi-chapter" && isPro && hasChapters && (
              <div className="flex flex-wrap gap-2">
                {book.chapters.map((c) => {
                  const sel = multiChapterIds.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => toggleMultiChapter(c.id)} className={chipCls(sel)}>
                      {sel && <Check size={12} />}
                      {c.title}
                    </button>
                  );
                })}
              </div>
            )}
          </StepBlock>
        )}

        {selectedLessons.length > 0 && (
          <StepBlock number="۵" title="تعداد سؤال" doneSummary={count ? `${toFa(count)} سؤال` : null} last>
            <div className="flex flex-wrap gap-2">
              {COUNT_OPTIONS.map((n) => {
                const proLocked = !isPro && n > 20;
                const insufficient = poolSize < n;
                const disabled = insufficient && !proLocked;
                return (
                  <button
                    key={n}
                    disabled={disabled}
                    onClick={() => {
                      if (proLocked) {
                        setLockNotice(true);
                        return;
                      }
                      setCount(n);
                    }}
                    className={`flex items-center gap-1 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                      disabled
                        ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600"
                        : proLocked
                        ? "border-white/8 bg-white/[0.02] text-slate-500 hover:border-white/20"
                        : count === n
                        ? "border-namrino-purple-60 bg-namrino-purple-12 text-namrino-cyan"
                        : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {proLocked && <Lock size={11} />}
                    {toFa(n)} سؤال{disabled ? ` (فقط ${toFa(poolSize)})` : ""}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">سؤال‌های موجود در این انتخاب: {toFa(poolSize)} مورد</p>
            {!isPro && <p className="mt-1 text-[11px] text-slate-500">حداکثر مجاز برای حساب Free: ۲۰ سؤال</p>}
          </StepBlock>
        )}

        {count && (
          <button
            onClick={handleStart}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-namrino-purple to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-namrino-purple-30 transition-transform hover:scale-[1.01] active:scale-[0.98]"
          >
            <Rocket size={17} /> شروع آزمون
          </button>
        )}
      </GlassCard>
    </section>
  );
}

function ProgressChart({ points }) {
  const max = 100;
  const w = 300;
  const h = 90;
  const pts = points.length >= 2 ? points : [points[0] ?? 0, points[0] ?? 0];
  const step = w / (pts.length - 1);
  const [hover, setHover] = useState(null);
  const coords = pts.map((p, i) => ({ x: i * step, y: h - (p / max) * h, v: p }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * w;
    let nearest = 0, best = Infinity;
    coords.forEach((c, i) => { const d = Math.abs(c.x - relX); if (d < best) { best = d; nearest = i; } });
    setHover(nearest);
  };
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full touch-none" preserveAspectRatio="none" onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
        <path d={area} fill="url(#progressFill)" />
        <path d={path} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {hover !== null && (
          <>
            <line x1={coords[hover].x} x2={coords[hover].x} y1="0" y2={h} stroke="rgba(34,211,238,0.25)" strokeWidth="1" />
            <circle cx={coords[hover].x} cy={coords[hover].y} r="3.5" fill="#22d3ee" />
          </>
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -top-7 rounded-md border border-white/10 bg-namrino-navy-2 px-2 py-1 text-[11px] text-slate-200 shadow-lg" style={{ left: `${(coords[hover].x / w) * 100}%`, transform: "translateX(-50%)" }}>
          {toFa(coords[hover].v)}٪
        </div>
      )}
    </div>
  );
}
function readHistory() {
  return safeGet(HISTORY_KEY) || [];
}
function Progress() {
  const [history, setHistory] = useState(readHistory);
  useEffect(() => { setHistory(readHistory()); }, []);
  const hasData = history.length > 0;
  const stats = hasData
    ? { count: history.length, avg: Math.round(history.reduce((s, h) => s + h.percentage, 0) / history.length), best: Math.max(...history.map((h) => h.percentage)) }
    : { count: 18, avg: 74, best: 92 };
  const chartPoints = hasData ? history.slice(-7).map((h) => h.percentage) : [30, 45, 40, 60, 55, 72, 80];
  return (
    <section id="progress" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-10">
      <SectionTitle title="📈 پیشرفت تو" />
      <GlassCard className="p-5 sm:p-6">
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="text-center sm:text-right"><div className="text-lg font-extrabold text-slate-100 sm:text-xl">{toFa(stats.count)}</div><div className="mt-1 text-[11px] text-slate-500 sm:text-xs">تعداد آزمون‌ها</div></div>
          <div className="text-center sm:text-right"><div className="text-lg font-extrabold text-slate-100 sm:text-xl">{toFa(stats.avg)}٪</div><div className="mt-1 text-[11px] text-slate-500 sm:text-xs">میانگین نمره</div></div>
          <div className="text-center sm:text-right"><div className="text-lg font-extrabold text-slate-100 sm:text-xl">{toFa(stats.best)}٪</div><div className="mt-1 text-[11px] text-slate-500 sm:text-xs">بهترین نتیجه</div></div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><TrendingUp size={14} className="text-namrino-cyan" />روند پیشرفت {hasData ? "آزمون‌های اخیر" : "هفت آزمون اخیر"}</div>
        <div className="mt-2"><ProgressChart points={chartPoints} /></div>
      </GlassCard>
    </section>
  );
}

function Pro() {
  const toast = useToast();
  const [isPro, setPro] = useIsPro();
  const features = ["آزمون‌های بیشتر (تا ۱۰۰ سؤال)", "انتخاب هم‌زمان چند درس یا چند فصل", "تحلیل پیشرفته", "تحلیل دقیق نقاط ضعف", "آزمون مخصوص نقاط ضعف", "بررسی دوباره سؤالات غلط", "مشاهده روند پیشرفت", "مقایسه نتایج با آزمون‌های قبلی", "تخفیف در بازار دانش"];
  return (
    <section id="pro" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-10">
      <GlassCard className="relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-namrino-purple-15 blur-3xl" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-namrino-cyan">💎 نمرینو PRO</div>
          <p className="mb-6 max-w-md text-lg font-bold leading-8 text-slate-100">بیشتر تمرین کن، دقیق‌تر بفهم کجای کاری.</p>
          <ul className="mb-7 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {features.map((f) => <li key={f} className="flex items-center gap-2 text-xs text-slate-300 sm:text-sm"><ShieldCheck size={14} className="flex-shrink-0 text-namrino-cyan" />{f}</li>)}
          </ul>
          <button
            onClick={() => {
              const next = !isPro;
              setPro(next);
              toast(next ? "🎉 حالت آزمایشی PRO فعال شد — در ساخت آزمون امتحانش کن." : "حالت آزمایشی PRO غیرفعال شد.", next ? "check" : "info");
            }}
            className="w-full rounded-xl bg-gradient-to-l from-namrino-purple to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-namrino-purple-20 transition-transform hover:scale-[1.01] active:scale-[0.98] sm:w-auto sm:px-8"
          >
            {isPro ? "بازگشت به حالت رایگان" : "فعال‌سازی PRO آزمایشی"}
          </button>
          <p className="mt-2 text-[10px] text-slate-600">این فقط یک حالت آزمایشی برای تست تفاوت Free/PRO است؛ پرداخت واقعی در این نسخه وجود ندارد.</p>
        </div>
      </GlassCard>
    </section>
  );
}

function FinalCTA() {
  const scrollToExams = () => document.getElementById("exams")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14">
      <GlassCard className="flex flex-col items-center gap-5 border-namrino-purple-20 bg-gradient-to-b from-namrino-purple-08 to-transparent p-10 text-center sm:p-14">
        <h2 className="text-2xl font-extrabold text-slate-50 sm:text-3xl">آماده‌ای بفهمی چند چندی؟</h2>
        <p className="text-sm text-slate-400 sm:text-base">همین الان اولین آزمونت رو خودت بساز.</p>
        <button onClick={scrollToExams} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-namrino-purple to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-namrino-purple-30 transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Rocket size={17} />
          ساخت آزمون رایگان
        </button>
      </GlassCard>
    </section>
  );
}

function Footer() {
  const links = [
    { label: "آزمون‌ها", href: "#exams" },
    { label: "📚 بازار دانش", route: "/market" },
    { label: "درباره ما", href: "#about" },
    { label: "قوانین", href: "#" },
    { label: "حریم خصوصی", href: "#" },
    { label: "پشتیبانی", href: "#" },
  ];
  return (
    <footer id="about" className="relative mt-6 scroll-mt-24 border-t border-white/6 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2"><span className="text-lg">🎓</span><span className="text-base font-extrabold text-slate-100">نمرینو</span></div>
        <p className="max-w-sm text-xs leading-6 text-slate-500">با نمرینو بفهم چند چندی.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
          {links.map((l) => <a key={l.label} href={l.route ? "#" + l.route : l.href} className="transition-colors hover:text-slate-300">{l.label}</a>)}
        </div>
        <p className="text-xs text-slate-600">با نمرینو در بیست گرفتن شکی نیست.</p>
        <p className="text-[11px] text-slate-700">© {new Date().getFullYear()} نمرینو — تمام حقوق محفوظ است.</p>
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <ExamBuilder />
      <Progress />
      <Pro />
      <FinalCTA />
    </>
  );
}

function MarketPage() {
  const toast = useToast();
  return (
    <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <button onClick={() => (window.history.length > 1 ? window.history.back() : navigate("/"))} className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200">
        <ChevronRight size={16} /> بازگشت
      </button>
      <SectionTitle title="📚 از دانش همدیگه استفاده کنید" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {PRODUCTS.map((p) => (
          <GlassCard key={p.title} className="overflow-hidden hover:border-white/20">
            <div className="flex h-28 items-center justify-center bg-gradient-to-br from-namrino-purple-14 to-namrino-cyan-08"><Sparkles size={22} className="text-slate-400" /></div>
            <div className="p-4">
              <h3 className="mb-1 text-sm font-bold text-slate-100">{p.title}</h3>
              <p className="mb-3 text-xs leading-6 text-slate-500">{p.desc}</p>
              <div className="mb-3 flex items-center gap-1 text-xs text-amber-300"><Star size={12} fill="currentColor" />{p.rating}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{p.price}</span>
                <button onClick={() => toast("این بخش در نسخه آزمایشی به‌زودی فعال می‌شود.")} className="rounded-lg bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-namrino-purple-25">مشاهده</button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500"><ShieldCheck size={12} className="text-namrino-cyan" />فقط محتوای اصیل یا دارای مجوز فروش در بازار دانش نمرینو پذیرفته می‌شود.</p>
    </div>
  );
}

function RequireAuth({ children }) {
  const { loggedIn } = useAuth();
  useEffect(() => {
    if (!loggedIn) navigate("/login");
  }, [loggedIn]);
  if (!loggedIn) return <div className="px-4 py-24 text-center text-sm text-slate-500">در حال انتقال به صفحه ورود…</div>;
  return children;
}

function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    if (!contact || !password) {
      setError("لطفاً شماره/ایمیل و رمز عبور را وارد کن.");
      return;
    }
    const ok = login(contact, password);
    if (!ok) {
      setError("شماره/ایمیل یا رمز عبور اشتباه است — یا هنوز ثبت‌نام نکرده‌ای.");
      return;
    }
    setError("");
    toast("خوش برگشتی! 👋", "check");
    navigate("/dashboard");
  }
  return (
    <div className="relative mx-auto max-w-md px-4 py-14">
      <GlassCard className="p-6 sm:p-8">
        <h1 className="mb-1 text-xl font-extrabold text-slate-100">ورود به نمرینو</h1>
        <p className="mb-6 text-xs text-slate-500">برای دیدن داشبورد و تاریخچه‌ی آزمون‌هات وارد شو.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <FormField label="شماره موبایل یا ایمیل" value={contact} onChange={setContact} />
          <FormField label="رمز عبور" value={password} onChange={setPassword} type="password" />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button type="submit" className="mt-2 rounded-xl bg-gradient-to-l from-namrino-purple to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-namrino-purple-30 transition-transform hover:scale-[1.01] active:scale-[0.98]">
            ورود
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-500">
          حساب نداری؟ <a href="#/register" className="font-semibold text-namrino-cyan hover:text-cyan-300">ثبت‌نام کن</a>
        </p>
      </GlassCard>
    </div>
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [gradeGroup, setGradeGroup] = useState(null);
  const [classNum, setClassNum] = useState(null);
  const [error, setError] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    if (!firstName || !lastName || !contact || !password || !classNum) {
      setError("لطفاً همه فیلدها از جمله پایه و کلاس را کامل کن.");
      return;
    }
    register({ firstName, lastName, contact, password, gradeGroup, classNum, createdAt: Date.now() });
    setError("");
    toast(`خوش اومدی ${firstName}! حساب شما ساخته شد.`, "check");
    navigate("/dashboard");
  }
  return (
    <div className="relative mx-auto max-w-md px-4 py-14">
      <GlassCard className="p-6 sm:p-8">
        <h1 className="mb-1 text-xl font-extrabold text-slate-100">ساخت حساب در نمرینو</h1>
        <p className="mb-6 text-xs text-slate-500">چند قدم کوچک تا شروع.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="نام" value={firstName} onChange={setFirstName} />
            <FormField label="نام خانوادگی" value={lastName} onChange={setLastName} />
          </div>
          <FormField label="شماره موبایل یا ایمیل" value={contact} onChange={setContact} />
          <FormField label="رمز عبور" value={password} onChange={setPassword} type="password" />
          <GradePicker
            gradeGroup={gradeGroup}
            classNum={classNum}
            onGradeGroup={(id) => { setGradeGroup(id); setClassNum(null); }}
            onClass={setClassNum}
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button type="submit" className="mt-2 rounded-xl bg-gradient-to-l from-namrino-purple to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-namrino-purple-30 transition-transform hover:scale-[1.01] active:scale-[0.98]">
            ایجاد حساب
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-500">
          قبلاً ثبت‌نام کردی؟ <a href="#/login" className="font-semibold text-namrino-cyan hover:text-cyan-300">وارد شو</a>
        </p>
      </GlassCard>
    </div>
  );
}

function HistoryRow({ item }) {
  let dateLabel = "";
  try {
    dateLabel = new Date(item.completedAt).toLocaleDateString("fa-IR");
  } catch (e) {
    dateLabel = "";
  }
  const scoreOf20 = Math.round((item.percentage / 100) * 20 * 100) / 100;
  const scoreOf20Fa = toFa(scoreOf20).replace(".", "٫");
  return (
    <GlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-100">{item.examTitle}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          {item.subject && <span>{item.subject}</span>}
          {item.chapter && <span>{item.chapter}</span>}
          {typeof item.total === "number" && <span>{toFa(item.total)} سؤال</span>}
          {dateLabel && <span>{dateLabel}</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span className="text-emerald-400">درست: {toFa(item.correct)}</span>
          <span className="text-rose-400">غلط: {toFa(item.incorrect)}</span>
          <span className="text-slate-500">نمره: {scoreOf20Fa} از ۲۰</span>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        <span className={`text-sm font-extrabold ${item.percentage >= 70 ? "text-emerald-400" : "text-rose-400"}`}>{toFa(item.percentage)}٪</span>
        <button onClick={() => navigate(`/exam-result/${item.runId}`)} className="rounded-lg bg-white/8 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:bg-namrino-purple-25">
          مشاهده نتیجه
        </button>
      </div>
    </GlassCard>
  );
}

function DashboardPage() {
  const { user, logout } = useAuth();
  const [isPro] = useIsPro();
  const [history, setHistory] = useState(readHistory);
  useEffect(() => { setHistory(readHistory()); }, []);
  const stats = history.length > 0
    ? { count: history.length, avg: Math.round(history.reduce((s, h) => s + h.percentage, 0) / history.length) }
    : { count: 0, avg: 0 };
  const recent = [...history].reverse().slice(0, 5);
  const lastExam = recent[0] || null;
  function handleLogout() {
    logout();
    navigate("/");
  }
  function goBuildExam() {
    navigate("/");
    window.setTimeout(() => document.getElementById("exams")?.scrollIntoView({ behavior: "smooth" }), 90);
  }
  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1.5"><AccountBadge isPro={isPro} /></div>
          <h1 className="text-xl font-extrabold text-slate-100">سلام {user?.firstName || "دانش‌آموز"} 👋</h1>
          <p className="mt-1 text-xs text-slate-500">{user?.classNum ? `کلاس ${CLASS_LABELS[user.classNum]}` : "پایه ثبت‌نشده"}</p>
        </div>
        <button onClick={handleLogout} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10">
          خروج
        </button>
      </div>
      {!isPro && (
        <GlassCard className="mb-6 flex flex-wrap items-center justify-between gap-3 border-namrino-purple-30 bg-namrino-purple-08 p-4">
          <span className="text-xs text-slate-300">با ارتقا به PRO، تحلیل پیشرفته، مرور اشتباهات و آزمون‌های نامحدودتر باز می‌شود.</span>
          <button onClick={goUpgrade} className="flex-shrink-0 rounded-lg bg-gradient-to-l from-namrino-purple to-violet-600 px-4 py-2 text-xs font-semibold text-white">ارتقا به PRO</button>
        </GlassCard>
      )}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <GlassCard className="p-4 text-center">
          <div className="text-sm font-bold text-slate-100">{user?.firstName || "-"} {user?.lastName || ""}</div>
          <div className="mt-1 text-[11px] text-slate-500">نام کاربر</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-sm font-bold text-slate-100">{user?.classNum ? CLASS_LABELS[user.classNum] : "-"}</div>
          <div className="mt-1 text-[11px] text-slate-500">پایه و کلاس</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-sm font-bold text-slate-100">{toFa(stats.count)}</div>
          <div className="mt-1 text-[11px] text-slate-500">آزمون انجام‌شده</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="truncate text-sm font-bold text-slate-100">{lastExam ? lastExam.examTitle : "-"}</div>
          <div className="mt-1 text-[11px] text-slate-500">آخرین آزمون</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className={`text-sm font-bold ${lastExam ? (lastExam.percentage >= 70 ? "text-emerald-400" : "text-rose-400") : "text-slate-100"}`}>{lastExam ? `${toFa(lastExam.percentage)}٪` : "-"}</div>
          <div className="mt-1 text-[11px] text-slate-500">آخرین نمره</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-sm font-bold text-slate-100">{toFa(stats.avg)}٪</div>
          <div className="mt-1 text-[11px] text-slate-500">میانگین نتایج</div>
        </GlassCard>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-200">آخرین آزمون‌ها و نتایج</h2>
        <a href="#/exam-history" className="text-xs font-semibold text-namrino-cyan hover:text-cyan-300">مشاهده همه ←</a>
      </div>
      {recent.length === 0 ? (
        <GlassCard className="p-6 text-center text-sm text-slate-500">هنوز آزمونی انجام نداده‌ای — از صفحه اصلی یک آزمون بساز.</GlassCard>
      ) : (
        <div className="flex flex-col gap-2.5">
          {recent.map((h) => <HistoryRow key={h.runId} item={h} />)}
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-2.5">
        <a href="#/exam-history" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10">تاریخچه کامل</a>
        <a href="#/profile" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10">پروفایل</a>
        <button onClick={goBuildExam} className="rounded-lg bg-gradient-to-l from-namrino-purple to-violet-600 px-4 py-2 text-xs font-semibold text-white">ساخت آزمون جدید</button>
      </div>
    </div>
  );
}

function ExamHistoryPage() {
  const [history, setHistory] = useState(readHistory);
  useEffect(() => { setHistory(readHistory()); }, []);
  const sorted = [...history].reverse();
  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <button onClick={() => navigate("/dashboard")} className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200">
        <ChevronRight size={16} /> بازگشت به داشبورد
      </button>
      <SectionTitle title="🗂️ تاریخچه آزمون‌ها" />
      {sorted.length === 0 ? (
        <GlassCard className="p-6 text-center text-sm text-slate-500">هنوز آزمونی انجام نداده‌ای.</GlassCard>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((h) => <HistoryRow key={h.runId} item={h} />)}
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [contact, setContact] = useState(user?.contact || "");
  const [gradeGroup, setGradeGroup] = useState(user?.gradeGroup || null);
  const [classNum, setClassNum] = useState(user?.classNum || null);
  function handleSave(e) {
    e.preventDefault();
    updateProfile({ firstName, lastName, contact, gradeGroup, classNum });
    toast("تغییرات پروفایل ذخیره شد.", "check");
  }
  function handleLogout() {
    logout();
    navigate("/");
  }
  return (
    <div className="relative mx-auto max-w-md px-4 py-10 sm:py-14">
      <button onClick={() => navigate("/dashboard")} className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200">
        <ChevronRight size={16} /> بازگشت به داشبورد
      </button>
      <GlassCard className="p-6 sm:p-8">
        <h1 className="mb-6 text-xl font-extrabold text-slate-100">پروفایل من</h1>
        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="نام" value={firstName} onChange={setFirstName} />
            <FormField label="نام خانوادگی" value={lastName} onChange={setLastName} />
          </div>
          <FormField label="شماره موبایل یا ایمیل" value={contact} onChange={setContact} />
          <GradePicker
            gradeGroup={gradeGroup}
            classNum={classNum}
            onGradeGroup={(id) => { setGradeGroup(id); setClassNum(null); }}
            onClass={setClassNum}
          />
          <button type="submit" className="mt-2 rounded-xl bg-gradient-to-l from-namrino-purple to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-namrino-purple-30 transition-transform hover:scale-[1.01] active:scale-[0.98]">
            ذخیره تغییرات
          </button>
        </form>
        <button onClick={handleLogout} className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10">
          خروج از حساب
        </button>
      </GlassCard>
    </div>
  );
}

