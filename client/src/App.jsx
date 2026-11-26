import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";

const SIZES = [10, 20, 30];
// SKD asli: 110 soal dalam 100 menit (Kepmen PANRB 674/2026).
// Waktu sesi dihitung proporsional lalu dibulatkan ke menit penuh (10 soal = 9 menit, 20 = 18, 30 = 27).
const minutesFor = (n) => Math.max(1, Math.round((n * 100) / 110));
const limitFor = (n) => minutesFor(n) * 60;

const SKD_TOTALS = {
  TWK: { count: 30, max: 150, passing: 65 },
  TIU: { count: 35, max: 175, passing: 80 },
  TKP: { count: 45, max: 225, passing: 166 },
};
const LETTERS = ["A", "B", "C", "D", "E"];
const CONFETTI_COLORS = ["#d62839", "#ffd84d", "#1f9d6b", "#3a5bd9", "#1b1f3b"];

const MODES = [
  { value: "", icon: "🎲", title: "Campur", desc: "Komposisinya sama kayak SKD asli (TWK 30 : TIU 35 : TKP 45)" },
  { value: "TWK", icon: "🏛️", title: "TWK", desc: "Nasionalisme, integritas, bela negara, empat konsensus, Bahasa Indonesia" },
  { value: "TIU", icon: "🧠", title: "TIU", desc: "Verbal, numerik, dan figural" },
  { value: "TKP", icon: "🤝", title: "TKP", desc: "Pelayanan publik, jejaring kerja, sosial budaya, TIK, profesionalisme, anti radikalisme" },
];

// Popup SweetAlert2 yang senada dengan tema: tombolnya memakai kelas .btn milik kita
const swal = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: "swal-popup",
    confirmButton: "btn primary",
    cancelButton: "btn",
  },
});

const toast = Swal.mixin({
  toast: true,
  position: "bottom",
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  customClass: { popup: "swal-toast" },
});

async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error("Request gagal");
  return res.json();
}

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Angka yang naik pelan-pelan dari 0 sampai target
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reducedMotion()) {
      setValue(target);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function ScoreRing({ score, max, tone }) {
  const pct = max > 0 ? score / max : 0;
  const shown = useCountUp(score);
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 100);
    return () => clearTimeout(t);
  }, []);
  const R = 85;
  const C = 2 * Math.PI * R;
  return (
    <div className={`ring ${tone}`} role="img" aria-label={`Skor ${score} dari ${max}`}>
      {/* width dan height sengaja diisi supaya ukurannya tetap wajar walau CSS gagal dimuat */}
      <svg viewBox="0 0 200 200" width="230" height="230">
        <circle className="ring-track" cx="100" cy="100" r={R} fill="none" stroke="#d3d9e8" strokeWidth="14" />
        <circle
          className="ring-fill"
          cx="100"
          cy="100"
          r={R}
          fill="none"
          strokeWidth="14"
          strokeDasharray={C}
          strokeDashoffset={filled ? C * (1 - pct) : C}
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="ring-text">
        <strong>{shown}</strong>
        <span>dari {max}</span>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        duration: 2.4 + Math.random() * 1.8,
        drift: (Math.random() - 0.5) * 180,
        spin: Math.random() * 720,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--drift": `${p.drift}px`,
            "--spin": `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

function verdictFor(pct) {
  if (pct >= 0.85) {
    return { title: "Gila, ini sudah level siap tempur 🔥", note: "Pertahankan ritmenya, jangan kendor." };
  }
  if (pct >= 0.7) {
    return { title: "Mantap, tinggal dipoles dikit lagi", note: "Cek pembahasan soal yang salah, biasanya polanya itu-itu aja." };
  }
  if (pct >= 0.5) {
    return { title: "Lumayan, yuk naikin lagi", note: "Fokus ke subtes yang skornya paling rendah." };
  }
  return { title: "Awal yang oke, yuk ulang pelan-pelan", note: "Baca pembahasannya dulu, lalu coba sesi baru." };
}

// Materi yang perlu diulang: soal kosong, salah, atau TKP dengan skor 3 ke bawah
function weakTopics(review) {
  const map = new Map();
  for (const r of review) {
    const chosen = r.options.find((o) => o.id === r.chosenOptionId);
    const best = r.options.find((o) => o.id === r.bestOptionId);
    const weak = !chosen || (r.category === "TKP" ? chosen.score <= 3 : chosen.id !== best.id);
    if (!weak) continue;
    const key = `${r.category}: ${r.subCategory || "Umum"}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export default function App() {
  const [view, setView] = useState("home");
  const [mode, setMode] = useState("");
  const [size, setSize] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [limit, setLimit] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [used, setUsed] = useState(0);
  const [endedBy, setEndedBy] = useState("manual");
  const [submitted, setSubmitted] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const deadlineRef = useRef(0);
  const lockRef = useRef(false);
  const warnedRef = useRef(false);

  async function loadHistory() {
    try {
      setHistory(await api("/api/attempts"));
    } catch {
      /* riwayat opsional, abaikan kalau gagal */
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // Hitung mundur berdasarkan jam sebenarnya, jadi tidak meleset walau tab sempat tidur
  useEffect(() => {
    if (view !== "quiz" || submitted) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);
    };
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [view, submitted]);

  // Waktu habis -> kumpulkan otomatis
  useEffect(() => {
    if (view === "quiz" && remaining === 0 && !lockRef.current) finish("timeout");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, view]);

  // Peringatan saat sisa waktu 1 menit
  useEffect(() => {
    if (view === "quiz" && !submitted && limit > 90 && remaining === 60 && !warnedRef.current) {
      warnedRef.current = true;
      toast.fire({ icon: "warning", title: "Sisa 1 menit! Cek soal yang masih kosong." });
    }
  }, [remaining, view, submitted, limit]);

  async function start() {
    setLoading(true);
    try {
      const qs = await api(`/api/questions/random?count=${size}${mode ? `&category=${mode}` : ""}`);
      if (qs.length === 0) {
        swal.fire({
          icon: "info",
          title: "Bank soalnya masih kosong",
          text: "Jalankan npm run db:seed di folder server dulu ya.",
          confirmButtonText: "Oke",
        });
        return;
      }
      const lim = limitFor(qs.length);
      lockRef.current = false;
      warnedRef.current = false;
      deadlineRef.current = Date.now() + lim * 1000;
      setQuestions(qs);
      setAnswers({});
      setIndex(0);
      setResult(null);
      setError("");
      setUsed(0);
      setSubmitted(false);
      setOverlay(false);
      setLimit(lim);
      setRemaining(lim);
      setView("quiz");
    } catch {
      swal.fire({
        icon: "error",
        title: "Belum nyambung ke server",
        text: "Coba muat ulang halaman ini atau cek koneksi internetmu.",
        confirmButtonText: "Oke",
      });
    } finally {
      setLoading(false);
    }
  }

  async function finish(reason) {
    if (lockRef.current) return;
    lockRef.current = true;
    // Kalau waktu habis saat popup konfirmasi masih terbuka, tutup popup-nya
    if (reason === "timeout") Swal.close();
    const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
    setUsed(limit - left);
    setSubmitted(true);
    setEndedBy(reason);
    if (reason === "timeout") setOverlay(true);
    setLoading(true);
    setError("");
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        optionId: answers[q.id] ?? null,
      }));
      const r = await api("/api/submit", {
        method: "POST",
        body: JSON.stringify({ answers: payload }),
      });
      setResult(r);
      if (reason === "manual") setView("result");
      loadHistory();
    } catch {
      lockRef.current = false;
      if (reason === "timeout") {
        // Layar waktu habis menampilkan tombol kirim ulang
        setError("Jawabanmu belum terkirim. Cek koneksi internet, lalu coba lagi.");
      } else {
        setSubmitted(false);
        swal.fire({
          icon: "error",
          title: "Jawabanmu belum terkirim",
          text: "Cek koneksi internetmu, lalu coba kumpulkan lagi. Jawabanmu masih aman di layar ini.",
          confirmButtonText: "Oke",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitManually() {
    if (lockRef.current) return;
    const blank = questions.length - Object.keys(answers).length;
    const { isConfirmed } = await swal.fire({
      icon: blank > 0 ? "warning" : "question",
      title: blank > 0 ? "Masih ada soal kosong" : "Kumpulkan jawaban?",
      text:
        blank > 0
          ? `${blank} soal belum kamu jawab dan nilainya 0. Tetap mau dikumpulkan?`
          : "Semua soal sudah terjawab. Setelah dikumpulkan, jawabanmu nggak bisa diubah lagi.",
      showCancelButton: true,
      confirmButtonText: "Kumpulkan",
      cancelButtonText: "Balik dulu",
      reverseButtons: true,
      focusCancel: blank > 0,
    });
    if (!isConfirmed || lockRef.current) return;
    finish("manual");
  }

  async function quit() {
    if (lockRef.current) return;
    const { isConfirmed } = await swal.fire({
      icon: "question",
      title: "Keluar dari sesi?",
      text: "Progres sesi ini nggak akan disimpan.",
      showCancelButton: true,
      confirmButtonText: "Keluar",
      cancelButtonText: "Lanjut latihan",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!isConfirmed || lockRef.current) return;
    lockRef.current = true;
    setView("home");
  }

  // ---------- QUIZ ----------
  if (view === "quiz") {
    const q = questions[index];
    const answeredCount = Object.keys(answers).length;
    const pctLeft = limit > 0 ? (remaining / limit) * 100 : 0;
    const timerClass = remaining <= 10 ? "critical" : remaining <= 60 ? "urgent" : "";

    return (
      <>
        <div className={`timerbar ${timerClass}`}>
          <div className="timerbar-inner">
            <span className="progress-text">
              Soal {index + 1} dari {questions.length}
            </span>
            <span className="timer-digits" aria-label={`Sisa waktu ${fmt(remaining)}`}>
              {fmt(remaining)}
            </span>
          </div>
          <div className="timer-track">
            <div className="timer-fill" style={{ width: `${pctLeft}%` }} />
          </div>
        </div>

        <main className="container">
          <section className="question-card">
            <div className="tags">
              <span className="tag">{q.category}</span>
              {q.subCategory && <span className="tag soft">{q.subCategory}</span>}
            </div>
            <p className="question">{q.text}</p>
            <div className="options">
              {q.options.map((o, i) => (
                <button
                  key={o.id}
                  disabled={submitted}
                  aria-pressed={answers[q.id] === o.id}
                  className={`option ${answers[q.id] === o.id ? "selected" : ""}`}
                  onClick={() => setAnswers({ ...answers, [q.id]: o.id })}
                >
                  <span className="bubble">{LETTERS[i]}</span>
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="ljk" aria-label="Nomor soal">
            {questions.map((x, i) => (
              <button
                key={x.id}
                disabled={submitted}
                className={`ljk-dot ${answers[x.id] !== undefined ? "done" : ""} ${
                  i === index ? "current" : ""
                }`}
                aria-label={`Soal ${i + 1}${answers[x.id] !== undefined ? ", sudah dijawab" : ""}`}
                onClick={() => setIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="actions">
            <button
              className="btn"
              disabled={index === 0 || submitted}
              onClick={() => setIndex(index - 1)}
            >
              Sebelumnya
            </button>
            <button
              className="btn"
              disabled={index === questions.length - 1 || submitted}
              onClick={() => setIndex(index + 1)}
            >
              Berikutnya
            </button>
            <span className="spacer" />
            <button className="btn primary" disabled={loading || submitted} onClick={submitManually}>
              {loading && submitted
                ? "Lagi dikumpulkan..."
                : `Kumpulkan (${answeredCount}/${questions.length})`}
            </button>
          </div>

          <button className="linklike" disabled={submitted} onClick={quit}>
            Keluar dari sesi
          </button>
        </main>

        {overlay && (
          <div className="timeout" role="alertdialog" aria-modal="true" aria-labelledby="timeout-title">
            <div className="timeout-inner">
              <div className="timeout-clock">00:00</div>
              <h2 id="timeout-title">Waktu habis!</h2>
              <p>
                Tenang, jawabanmu otomatis terkumpul. {answeredCount} dari {questions.length} soal sempat
                kamu isi.
              </p>
              {result ? (
                <button
                  className="btn big"
                  onClick={() => {
                    setOverlay(false);
                    setView("result");
                  }}
                >
                  Lihat hasilnya
                </button>
              ) : error ? (
                <>
                  <p>{error}</p>
                  <button className="btn big" onClick={() => finish("timeout")}>
                    Kirim ulang
                  </button>
                </>
              ) : (
                <p className="sending">
                  <span className="spinner" /> Lagi ngumpulin jawabanmu...
                </p>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // ---------- HASIL ----------
  if (view === "result" && result) {
    const present = Object.entries(result.totals).filter(([, t]) => t.total > 0);
    const fullMix = present.length === 3;
    const maxTotal = present.reduce((s, [, t]) => s + t.max, 0);
    const pct = maxTotal > 0 ? result.totalScore / maxTotal : 0;
    const timedOut = endedBy === "timeout";

    let verdict = verdictFor(pct);
    let tone = pct >= 0.7 ? "good" : pct >= 0.5 ? "mid" : "low";
    let celebrate = pct >= 0.7;
    if (fullMix) {
      celebrate = result.passedAll;
      tone = result.passedAll ? "good" : "low";
      verdict = result.passedAll
        ? {
            title: "Aman! Semua subtes lewat ambang batas 🎉",
            note: "Ini estimasi dari sesi pendek ya. Ujian aslinya 110 soal, jadi tetap rutin latihan.",
          }
        : {
            title: "Hampir, masih ada subtes di bawah ambang",
            note: "Cek yang bertanda merah, lalu ulangi materinya.",
          };
    }
    const weak = weakTopics(result.review);

    return (
      <main className="container">
        {celebrate && <Confetti />}

        <section className="result-top">
          <div className="ring-wrap">
            <ScoreRing score={result.totalScore} max={maxTotal} tone={tone} />
            <div className={`stamp ${timedOut ? "stamp-red" : "stamp-ink"}`}>
              {timedOut ? "Waktu habis" : "Terkumpul"}
            </div>
          </div>
          <h1>{verdict.title}</h1>
          <p className="lead centered">
            {timedOut ? "Waktunya habis duluan, jadi jawabanmu dikumpulkan otomatis. " : ""}
            {verdict.note}
          </p>
          <p className="hint">
            Waktu terpakai {fmt(used)} dari {fmt(limit)}
          </p>
        </section>

        <section className="panel">
          <h2>Skor per subtes</h2>
          <div className="legend">
            <i /> Garis merah = ambang batas SKD 2026 (kebutuhan umum), sudah disesuaikan dengan jumlah soal
          </div>
          <div className="cats">
            {present.map(([cat, t]) => (
              <div className="cat" key={cat}>
                <div className="cat-head">
                  <strong>{cat}</strong>
                  <span>
                    {t.score} / {t.max}
                    <span className={`badge ${t.passed ? "ok" : "no"}`}>
                      {t.passed ? "Lewat ambang" : "Di bawah ambang"}
                    </span>
                  </span>
                </div>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ "--w": `${t.max > 0 ? (t.score / t.max) * 100 : 0}%` }}
                  />
                  <div className="bar-mark" style={{ "--p": `${(t.passing / t.max) * 100}%` }} />
                </div>
                <small className="hint">
                  Ambang setara untuk {t.total} soal: {t.passing} poin. Ambang resmi {t.officialPassing} dari{" "}
                  {SKD_TOTALS[cat].max} untuk {SKD_TOTALS[cat].count} soal.{" "}
                  {cat === "TKP"
                    ? `${t.correct} dari ${t.total} soal kamu pilih jawaban terbaik.`
                    : `${t.correct} dari ${t.total} soal benar.`}
                </small>
              </div>
            ))}
          </div>
          <p className="hint">
            TWK dan TIU: 5 poin per jawaban benar. TKP: 1 sampai 5 poin tergantung jawaban. Soal kosong
            bernilai 0. Sesi pendek cuma estimasi kasar dibanding 110 soal penuh.
          </p>

          {weak.length > 0 && (
            <div className="weak">
              <strong>Yang perlu diulang</strong>
              <ul>
                {weak.slice(0, 5).map(([key, n]) => (
                  <li key={key}>
                    {key} ({n} soal)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <h2>Pembahasan</h2>
        {result.review.map((r, i) => {
          const status =
            r.chosenOptionId === null ? "skip" : r.chosenOptionId === r.bestOptionId ? "ok" : "bad";
          return (
            <article className={`review ${status}`} key={r.questionId}>
              <div className="tags">
                <span className="tag">{r.category}</span>
                {r.subCategory && <span className="tag soft">{r.subCategory}</span>}
                <span className="tag soft">Soal {i + 1}</span>
              </div>
              <p className="question">{r.text}</p>
              <ul className="review-options">
                {r.options.map((o) => {
                  const isBest = o.id === r.bestOptionId;
                  const isChosen = o.id === r.chosenOptionId;
                  return (
                    <li key={o.id} className={`${isBest ? "best" : ""} ${isChosen && !isBest ? "wrong" : ""}`}>
                      <span className="mark">{isBest ? "✓" : isChosen ? "✗" : "•"}</span>
                      <span>
                        {o.label}
                        {r.category === "TKP" && <em> (skor {o.score})</em>}
                        {isChosen && <strong className="chip"> Pilihanmu</strong>}
                        {isBest && <strong className="chip chip-good"> Terbaik</strong>}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {status === "skip" && <p className="error">Soal ini belum kamu jawab.</p>}
              <p className="explanation">{r.explanation}</p>
            </article>
          );
        })}

        <button className="btn primary big" onClick={() => setView("home")}>
          Latihan lagi, yuk
        </button>
      </main>
    );
  }

  // ---------- HOME ----------
  const bestScore = history.reduce((m, h) => Math.max(m, h.totalScore), 0);

  return (
    <main className="container">
      <header className="hero">
        <span className="pill">Kisi-kisi SKD 2026</span>
        <h1>
          Latihan <span className="hl">SKD CPNS</span>
        </h1>
        <p className="lead">
          Latihan soal yang nggak bikin tegang. Pilih subtes, atur jumlah soalnya, terus gas kerjakan.
          Habis itu cek pembahasannya biar makin paham.
        </p>
      </header>

      <section className="panel">
        <div className="format-box">
          <p>
            <strong>Biar kebayang ujian aslinya (Kepmen PANRB 674/2026):</strong> 110 soal dalam 100
            menit, dengan TWK 30 soal, TIU 35 soal, dan TKP 45 soal.
          </p>
          <p>Skor TWK dan TIU: 5 poin per jawaban benar. TKP: 1 sampai 5 poin. Kosong: 0.</p>
          <p>Ambang batas kebutuhan umum: TWK 65, TIU 80, TKP 166. Ketiganya harus terpenuhi.</p>
        </div>

        <h2>Mau latihan apa hari ini?</h2>
        <div className="modes" role="radiogroup" aria-label="Pilih subtes">
          {MODES.map((m) => (
            <label key={m.value} className={`mode ${mode === m.value ? "active" : ""}`}>
              <input
                type="radio"
                name="mode"
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
              />
              <span className="bubble" aria-hidden="true" />
              <span className="mode-text">
                <strong>
                  {m.icon} {m.title}
                </strong>
                <small>{m.desc}</small>
              </span>
            </label>
          ))}
        </div>

        <h2>Mau berapa soal?</h2>
        <div className="modes three" role="radiogroup" aria-label="Jumlah soal">
          {SIZES.map((n) => (
            <label key={n} className={`mode ${size === n ? "active" : ""}`}>
              <input type="radio" name="size" checked={size === n} onChange={() => setSize(n)} />
              <span className="bubble" aria-hidden="true" />
              <span className="mode-text">
                <strong>{n} soal</strong>
                <small>{minutesFor(n)} menit</small>
              </span>
            </label>
          ))}
        </div>

        <button className="btn primary big" disabled={loading} onClick={start}>
          {loading ? "Nyiapin soal..." : "Gas mulai latihan"}
        </button>
      </section>

      <section className="panel">
        <h2>Riwayat latihanmu</h2>
        {history.length === 0 ? (
          <p className="hint">Belum ada riwayat. Selesaikan satu sesi dulu, yuk.</p>
        ) : (
          <>
            <p className="hint">Skor tertinggimu sejauh ini: {bestScore}</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>TWK</th>
                    <th>TIU</th>
                    <th>TKP</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td>{new Date(h.createdAt).toLocaleString("id-ID")}</td>
                      <td>{h.twkScore}</td>
                      <td>{h.tiuScore}</td>
                      <td>{h.tkpScore}</td>
                      <td>
                        <strong>{h.totalScore}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}