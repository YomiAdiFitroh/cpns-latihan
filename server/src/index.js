import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

const CATEGORIES = ["TWK", "TIU", "TKP"];

// Aturan resmi SKD CPNS 2026 (Kepmen PANRB Nomor 674 Tahun 2026)
// 110 soal dalam 100 menit. Ambang batas di bawah ini untuk kebutuhan umum.
const SKD_TOTAL = 110;
const SKD = {
  TWK: { count: 30, max: 150, passing: 65 },
  TIU: { count: 35, max: 175, passing: 80 },
  TKP: { count: 45, max: 225, passing: 166 },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Jumlah soal per subtes mengikuti perbandingan SKD asli (30 : 35 : 45)
function quotaFor(count) {
  const twk = Math.round((count * SKD.TWK.count) / SKD_TOTAL);
  const tiu = Math.round((count * SKD.TIU.count) / SKD_TOTAL);
  return { TWK: twk, TIU: tiu, TKP: Math.max(0, count - twk - tiu) };
}

// GET /api/questions/random?count=10&category=TWK|TIU|TKP
// Tanpa category = campur dengan komposisi SKD asli, urutan TWK -> TIU -> TKP seperti CAT BKN.
// Skor opsi sengaja TIDAK dikirim ke client supaya jawaban tidak bisa diintip.
app.get("/api/questions/random", async (req, res) => {
  try {
    const count = Math.min(Math.max(parseInt(req.query.count, 10) || 10, 1), SKD_TOTAL);
    const only = CATEGORIES.includes(req.query.category) ? req.query.category : undefined;

    const byCat = {};
    for (const cat of CATEGORIES) {
      if (only && cat !== only) {
        byCat[cat] = [];
        continue;
      }
      const rows = await prisma.question.findMany({
        where: { category: cat },
        select: { id: true },
      });
      byCat[cat] = shuffle(rows.map((r) => r.id));
    }

    let picked = [];
    if (only) {
      picked = byCat[only].slice(0, count);
    } else {
      const quota = quotaFor(count);
      for (const cat of CATEGORIES) picked.push(...byCat[cat].slice(0, quota[cat]));
      // Kalau bank soal sebuah subtes kurang, isi sisanya dari soal lain
      if (picked.length < count) {
        const rest = shuffle(CATEGORIES.flatMap((cat) => byCat[cat].slice(quota[cat])));
        picked.push(...rest.slice(0, count - picked.length));
      }
    }

    const questions = await prisma.question.findMany({
      where: { id: { in: picked } },
      include: { options: { select: { id: true, label: true } } },
    });

    const rank = (c) => CATEGORIES.indexOf(c);
    const pos = new Map(picked.map((id, i) => [id, i]));
    const ordered = [...questions].sort(
      (a, b) => rank(a.category) - rank(b.category) || pos.get(a.id) - pos.get(b.id)
    );

    res.json(
      ordered.map((q) => ({
        id: q.id,
        category: q.category,
        subCategory: q.subCategory,
        text: q.text,
        options: shuffle(q.options),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil soal" });
  }
});

// POST /api/submit  body: { answers: [{ questionId, optionId | null }] }
app.post("/api/submit", async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers kosong" });
    }

    const ids = answers.map((a) => Number(a.questionId)).filter(Number.isInteger);
    const questions = await prisma.question.findMany({
      where: { id: { in: ids } },
      include: { options: true },
    });
    const byId = new Map(questions.map((q) => [q.id, q]));

    const blank = () => ({ score: 0, max: 0, correct: 0, total: 0 });
    const totals = { TWK: blank(), TIU: blank(), TKP: blank() };
    const review = [];

    for (const a of answers) {
      const q = byId.get(Number(a.questionId));
      if (!q) continue;

      // Tidak dijawab = 0 poin (TWK, TIU, maupun TKP)
      const chosen = q.options.find((o) => o.id === a.optionId) || null;
      const best = q.options.reduce((m, o) => (o.score > m.score ? o : m));

      const t = totals[q.category];
      t.total += 1;
      t.max += 5;
      t.score += chosen ? chosen.score : 0;
      if (chosen && chosen.id === best.id) t.correct += 1;

      review.push({
        questionId: q.id,
        category: q.category,
        subCategory: q.subCategory,
        text: q.text,
        explanation: q.explanation,
        chosenOptionId: chosen ? chosen.id : null,
        bestOptionId: best.id,
        options: q.options.map((o) => ({ id: o.id, label: o.label, score: o.score })),
      });
    }

    // Ambang batas resmi diskalakan sesuai jumlah soal di sesi ini.
    // Untuk 110 soal penuh, hasilnya sama persis dengan ambang batas resmi.
    const present = CATEGORIES.filter((c) => totals[c].total > 0);
    for (const cat of present) {
      const t = totals[cat];
      t.passing = Math.ceil((SKD[cat].passing * t.max) / SKD[cat].max);
      t.passed = t.score >= t.passing;
      t.officialPassing = SKD[cat].passing;
    }
    const passedAll = present.length > 0 && present.every((c) => totals[c].passed);

    const totalScore = totals.TWK.score + totals.TIU.score + totals.TKP.score;

    const attempt = await prisma.attempt.create({
      data: {
        totalQuestions: review.length,
        twkScore: totals.TWK.score,
        tiuScore: totals.TIU.score,
        tkpScore: totals.TKP.score,
        totalScore,
      },
    });

    res.json({ attemptId: attempt.id, totals, totalScore, passedAll, review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan hasil" });
  }
});

// GET /api/attempts -> 20 riwayat terakhir
app.get("/api/attempts", async (_req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil riwayat" });
  }
});

// Sajikan hasil build React hanya kalau folder client/dist ada (mode Render / satu layanan)
const clientDist = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Di Vercel server tidak perlu listen sendiri, cukup export app
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
}

export default app;