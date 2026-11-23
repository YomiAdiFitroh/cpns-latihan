# Latihan SKD CPNS

React (Vite) + Node.js (Express) + PostgreSQL (Prisma). Tiap sesi = 10 soal acak.

## Setup
1. Buat database PostgreSQL kosong, misalnya `cpns_latihan`.
2. Edit `server/.env`, sesuaikan `DATABASE_URL` (user, password, host, port, nama database).

## Jalankan (PowerShell)

Terminal 1:
    cd server
    npm install
    npx prisma db push
    npm run db:seed
    npm run dev

Terminal 2:
    cd client
    npm install
    npm run dev

Buka http://localhost:5173

## Deploy ke Vercel
Deploy folder `server` sebagai project backend dan folder `client` sebagai project frontend.

1. Pada project backend, set Root Directory ke `server` dan tambahkan environment variable `DATABASE_URL` ke database PostgreSQL production.
2. Pada project frontend, set Root Directory ke `client`.
3. Deploy ulang backend agar endpoint `/api/*` tersedia, lalu deploy ulang frontend. Proxy frontend di `client/vercel.json` mengarah ke `https://cpns-latihan.vercel.app`.
4. Jalankan migrasi dan seed database production sebelum mulai latihan.

## Tambah soal
Tambah baris `mc(...)` (TWK/TIU) atau `tkp(...)` di array `questions` pada `server/prisma/seed.js`,
lalu jalankan `npm run db:seed` lagi. Seed mengosongkan dan mengisi ulang bank soal; riwayat skor tetap aman.
