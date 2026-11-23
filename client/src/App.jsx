import { useEffect, useState } from "react";

const MODES = [
  { value: "", label: "Campur (TWK + TIU + TKP)" },
  { value: "TWK", label: "TWK saja" },
  { value: "TIU", label: "TIU saja" },
  { value: "TKP", label: "TKP saja" },
];

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

export default function App() {
  const [view, setView] = useState("home");
  const [mode, setMode] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (view !== "quiz") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [view]);

  async function start() {
    setLoading(true);
    setError("");
    try {
      const qs = await api(`/api/questions/random?count=10${mode ? `&category=${mode}` : ""}`);
      if (qs.length === 0) {
        setError("Bank soal kosong. Jalankan npm run db:seed di folder server.");
        return;
      }
      setQuestions(qs);
      setAnswers({});
      setIndex(0);
      setSeconds(0);
      setView("quiz");
    } catch {
      setError("Gagal mengambil soal. Pastikan API Vercel dan database sudah aktif.");
    } finally {
      setLoading(false);
    }
  }

  async function finish() {
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
      setView("result");
      loadHistory();
    } catch {
      setError("Gagal mengirim jawaban.");
    } finally {
      setLoading(false);
    }
  }

  // ---------- QUIZ ----------
  if (view === "quiz") {
    const q = questions[index];
    const answered = Object.keys(answers).length;
    return (
      <div className="container">
        <div className="topbar">
          <span>
            Soal {index + 1} / {questions.length}
          </span>
          <span>⏱ {fmt(seconds)}</span>
        </div>

        <div className="card">
          <div className="tag">
            {q.category}
            {q.subCategory ? ` · ${q.subCategory}` : ""}
          </div>
          <p className="question">{q.text}</p>
          <div className="options">
            {q.options.map((o) => (
              <button
                key={o.id}
                className={`option ${answers[q.id] === o.id ? "selected" : ""}`}
                onClick={() => setAnswers({ ...answers, [q.id]: o.id })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="nav-dots">
          {questions.map((x, i) => (
            <button
              key={x.id}
              className={`dot ${i === index ? "current" : ""} ${
                answers[x.id] !== undefined ? "done" : ""
              }`}
              onClick={() => setIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="actions">
          <button
            className="btn secondary"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            Sebelumnya
          </button>
          {index < questions.length - 1 ? (
            <button className="btn" onClick={() => setIndex(index + 1)}>
              Berikutnya
            </button>
          ) : (
            <button className="btn primary" disabled={loading} onClick={finish}>
              Selesai ({answered}/{questions.length} terjawab)
            </button>
          )}
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  // ---------- HASIL ----------
  if (view === "result" && result) {
    return (
      <div className="container">
        <h1>Hasil Latihan</h1>
        <div className="card">
          <p className="big">Skor total: {result.totalScore}</p>
          <table>
            <thead>
              <tr>
                <th>Subtes</th>
                <th>Skor</th>
                <th>Maks</th>
                <th>Benar / terbaik</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.totals)
                .filter(([, t]) => t.total > 0)
                .map(([cat, t]) => (
                  <tr key={cat}>
                    <td>{cat}</td>
                    <td>{t.score}</td>
                    <td>{t.max}</td>
                    <td>
                      {t.correct}/{t.total}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="hint">
            Waktu: {fmt(seconds)}. TWK/TIU: 5 poin per soal benar. TKP: 1-5 poin tergantung
            jawaban.
          </p>
        </div>

        <h2>Pembahasan</h2>
        {result.review.map((r, i) => (
          <div className="card" key={r.questionId}>
            <div className="tag">
              {i + 1}. {r.category}
            </div>
            <p className="question">{r.text}</p>
            <ul className="review-options">
              {r.options.map((o) => (
                <li
                  key={o.id}
                  className={`${o.id === r.bestOptionId ? "best" : ""} ${
                    o.id === r.chosenOptionId ? "chosen" : ""
                  }`}
                >
                  {o.label}
                  {r.category === "TKP" && <em> (skor {o.score})</em>}
                  {o.id === r.chosenOptionId && " ← pilihan lu"}
                </li>
              ))}
            </ul>
            {r.chosenOptionId === null && <p className="error">Tidak dijawab</p>}
            <p className="explanation">{r.explanation}</p>
          </div>
        ))}

        <button className="btn primary" onClick={() => setView("home")}>
          Latihan lagi
        </button>
      </div>
    );
  }

  // ---------- HOME ----------
  return (
    <div className="container">
      <h1>Latihan SKD CPNS</h1>

      <div className="card">
        <h2>Mulai sesi baru (10 soal acak)</h2>
        {MODES.map((m) => (
          <label key={m.value} className="radio">
            <input
              type="radio"
              name="mode"
              checked={mode === m.value}
              onChange={() => setMode(m.value)}
            />
            {m.label}
          </label>
        ))}
        <button className="btn primary" disabled={loading} onClick={start}>
          {loading ? "Memuat..." : "Mulai"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h2>Riwayat terakhir</h2>
        {history.length === 0 ? (
          <p className="hint">Belum ada riwayat.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}
