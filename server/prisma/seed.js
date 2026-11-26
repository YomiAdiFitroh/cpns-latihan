import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TWK / TIU: pilihan ganda. Jawaban benar = skor 5, sisanya 0 (aturan SKD 2026).
const mc = (category, subCategory, text, options, correctIndex, explanation) => ({
  category,
  subCategory,
  text,
  explanation,
  options: options.map((label, i) => ({ label, score: i === correctIndex ? 5 : 0 })),
});

// TKP: tiap opsi punya skor 1-5, jadi tidak ada satu jawaban "benar" mutlak.
const tkp = (subCategory, text, options, explanation) => ({
  category: "TKP",
  subCategory,
  text,
  explanation,
  options: options.map(([label, score]) => ({ label, score })),
});

const KONSENSUS = "Empat Konsensus Kebangsaan";

const questions = [
  // =====================================================
  // TWK (18 soal): nasionalisme, integritas, bela negara,
  // empat konsensus kebangsaan, Bahasa Indonesia
  // =====================================================
  mc("TWK", KONSENSUS, "Ketentuan bahwa \"Negara Indonesia adalah negara hukum\" terdapat dalam UUD 1945 pasal...",
    ["Pasal 1 ayat (1)", "Pasal 1 ayat (2)", "Pasal 1 ayat (3)", "Pasal 2 ayat (1)"], 2,
    "Pasal 1 ayat (3) menyatakan Indonesia adalah negara hukum. Ayat (1) mengatur bentuk negara, ayat (2) kedaulatan rakyat."),
  mc("TWK", KONSENSUS, "Lembaga negara yang berwenang menguji undang-undang terhadap UUD 1945 adalah...",
    ["Mahkamah Agung", "Mahkamah Konstitusi", "Dewan Perwakilan Rakyat", "Komisi Yudisial"], 1,
    "Mahkamah Konstitusi menguji UU terhadap UUD 1945. Mahkamah Agung menguji peraturan di bawah UU terhadap UU."),
  mc("TWK", KONSENSUS, "Pemilihan Presiden dan Wakil Presiden secara langsung oleh rakyat diatur dalam UUD 1945 pasal...",
    ["Pasal 7A", "Pasal 6A", "Pasal 8", "Pasal 9"], 1,
    "Pasal 6A ayat (1). Pasal 7A mengatur pemberhentian, Pasal 8 mengatur kekosongan jabatan."),
  mc("TWK", KONSENSUS, "Pidato Soekarno tentang dasar negara dalam sidang BPUPKI, yang kemudian diperingati sebagai Hari Lahir Pancasila, disampaikan pada tanggal...",
    ["29 Mei 1945", "1 Juni 1945", "22 Juni 1945", "18 Agustus 1945"], 1,
    "Pidato disampaikan 1 Juni 1945. 22 Juni adalah Piagam Jakarta, 18 Agustus adalah pengesahan UUD 1945 oleh PPKI."),
  mc("TWK", KONSENSUS, "Lambang pohon beringin pada Garuda Pancasila melambangkan sila...",
    ["Pertama", "Kedua", "Ketiga", "Keempat"], 2,
    "Pohon beringin melambangkan sila ketiga, Persatuan Indonesia."),
  mc("TWK", KONSENSUS, "Musyawarah untuk mufakat dalam pengambilan keputusan bersama merupakan pengamalan sila ke...",
    ["Pertama", "Kedua", "Ketiga", "Keempat"], 3,
    "Sila keempat: Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan."),
  mc("TWK", KONSENSUS, "Semboyan \"Bhinneka Tunggal Ika\" terdapat dalam kitab...",
    ["Negarakertagama", "Pararaton", "Sutasoma", "Arjunawiwaha"], 2,
    "Terdapat dalam Kakawin Sutasoma karya Mpu Tantular dari masa Majapahit."),
  mc("TWK", KONSENSUS, "Menurut Pasal 1 ayat (1) UUD 1945, bentuk negara Indonesia adalah...",
    ["Negara kesatuan berbentuk republik", "Negara serikat berbentuk republik", "Negara kesatuan berbentuk kerajaan", "Negara serikat berbentuk kerajaan"], 0,
    "Pasal 1 ayat (1): Negara Indonesia ialah Negara Kesatuan yang berbentuk Republik."),
  mc("TWK", "Nasionalisme", "Seorang warga bangga pada budaya daerahnya dan sekaligus menghargai budaya daerah lain tanpa merendahkannya. Sikap ini mencerminkan...",
    ["Nasionalisme yang menghargai keberagaman", "Chauvinisme", "Primordialisme", "Separatisme"], 0,
    "Nasionalisme mencakup cinta tanah air dan penghargaan terhadap keberagaman dalam persatuan."),
  mc("TWK", "Nasionalisme", "Paham yang menganggap bangsa sendiri paling unggul dan merendahkan bangsa lain disebut...",
    ["Patriotisme", "Chauvinisme", "Kosmopolitanisme", "Humanisme"], 1,
    "Chauvinisme adalah cinta tanah air yang berlebihan disertai sikap merendahkan bangsa lain."),
  mc("TWK", "Integritas", "Seorang ASN menemukan kesalahan input anggaran yang menguntungkan unit kerjanya dan belum diketahui siapa pun. Sikap yang mencerminkan integritas adalah...",
    ["Segera melaporkannya kepada atasan dan memperbaikinya", "Membiarkannya karena tidak ada yang menyadari", "Menunggu sampai ada pemeriksaan", "Memanfaatkannya dahulu, lalu memperbaikinya nanti"], 0,
    "Integritas berarti jujur, bertanggung jawab, dan konsisten antara pikiran, perkataan, dan tindakan."),
  mc("TWK", "Integritas", "Perilaku yang mencerminkan keselarasan antara perkataan dan tindakan adalah...",
    ["Menolak hadiah dari pihak yang sedang mengurus izin, sesuai aturan gratifikasi yang ia ajarkan kepada bawahan", "Mengajarkan disiplin kepada bawahan, tetapi sendiri sering datang terlambat", "Berjanji menyelesaikan tugas tepat waktu, lalu mengabaikannya", "Mengaku jujur, tetapi menyembunyikan kesalahan"], 0,
    "Integritas tampak dari kesesuaian ucapan dengan perbuatan."),
  mc("TWK", "Bela Negara", "Kewajiban setiap warga negara ikut serta dalam upaya pembelaan negara diatur dalam UUD 1945 pasal...",
    ["Pasal 27 ayat (3)", "Pasal 28 ayat (1)", "Pasal 29 ayat (2)", "Pasal 31 ayat (1)"], 0,
    "Pasal 27 ayat (3) mengatur hak dan kewajiban bela negara. Pasal 30 ayat (1) mengatur hak dan kewajiban ikut serta dalam pertahanan dan keamanan negara."),
  mc("TWK", "Bela Negara", "Berikut yang merupakan wujud bela negara nonmiliter adalah...",
    ["Mengikuti latihan kemiliteran di perbatasan", "Meningkatkan profesionalisme dan prestasi di bidang pekerjaan", "Membentuk kelompok bersenjata untuk menjaga lingkungan", "Menolak membayar pajak sebagai bentuk protes"], 1,
    "Bela negara tidak selalu bersenjata. Bekerja profesional dan berprestasi turut menjaga ketahanan bangsa."),
  mc("TWK", "Bahasa Indonesia", "Kata yang penulisannya baku adalah...",
    ["Resiko", "Risiko", "Rizico", "Rissiko"], 1,
    "Bentuk baku menurut KBBI adalah \"risiko\"."),
  mc("TWK", "Bahasa Indonesia", "Kalimat yang efektif adalah...",
    ["Para peserta-peserta rapat dimohon segera masuk ruangan.", "Peserta rapat dimohon segera masuk ruangan.", "Para peserta rapat-rapat dimohon segera masuk ruangan.", "Peserta-peserta rapat semuanya dimohon segera masuk ruangan."], 1,
    "Hindari pemborosan kata (pleonasme). Bentuk jamak sudah cukup dinyatakan satu kali."),
  mc("TWK", "Bahasa Indonesia", "Penulisan yang sesuai ejaan adalah...",
    ["Buku itu di letakkan di atas meja.", "Buku itu diletakkan di atas meja.", "Buku itu di letakkan diatas meja.", "Buku itu diletakkan diatas meja."], 1,
    "\"di-\" sebagai awalan ditulis serangkai (diletakkan), sedangkan \"di\" sebagai kata depan ditulis terpisah (di atas)."),
  mc("TWK", "Bahasa Indonesia", "Pelayanan publik yang cepat dan ramah meningkatkan kepercayaan masyarakat kepada pemerintah. Warga yang dilayani dengan baik cenderung patuh membayar pajak dan menaati aturan. Sebaliknya, layanan yang berbelit memicu keluhan dan menurunkan kepercayaan.\n\nGagasan utama paragraf di atas adalah...",
    ["Kualitas pelayanan publik memengaruhi kepercayaan masyarakat", "Warga wajib membayar pajak", "Layanan berbelit selalu merugikan pemerintah", "Pemerintah harus menurunkan pajak"], 0,
    "Gagasan utama adalah inti yang dibahas di seluruh paragraf: hubungan kualitas layanan dengan kepercayaan masyarakat."),

  // =====================================================
  // TIU (35 soal): verbal, numerik, figural
  // =====================================================
  // --- Silogisme ---
  mc("TIU", "Silogisme", "Semua dokter adalah sarjana. Budi bukan sarjana. Kesimpulan yang pasti benar adalah...",
    ["Budi adalah dokter", "Budi bukan dokter", "Budi mungkin dokter", "Semua sarjana adalah dokter"], 1,
    "Semua dokter pasti sarjana, jadi yang bukan sarjana pasti bukan dokter."),
  mc("TIU", "Silogisme", "Semua ASN adalah warga negara. Sebagian warga negara adalah petani. Kesimpulan yang pasti benar adalah...",
    ["Semua ASN adalah petani", "Sebagian ASN adalah petani", "Tidak ada ASN yang petani", "Tidak dapat disimpulkan hubungan antara ASN dan petani"], 3,
    "Premis kedua tidak menjamin petani itu ASN atau bukan."),
  mc("TIU", "Silogisme", "Semua pegawai yang disiplin mendapat penghargaan. Sebagian pegawai di kantor itu disiplin. Kesimpulan yang pasti benar adalah...",
    ["Sebagian pegawai di kantor itu mendapat penghargaan", "Semua pegawai di kantor itu mendapat penghargaan", "Tidak ada pegawai di kantor itu yang mendapat penghargaan", "Semua yang mendapat penghargaan adalah pegawai kantor itu"], 0,
    "Yang disiplin pasti dapat penghargaan, dan sebagian pegawai kantor itu disiplin, jadi sebagian pegawai kantor itu dapat penghargaan."),
  mc("TIU", "Silogisme", "Tidak ada ASN yang boleh menerima gratifikasi. Sebagian pegawai kantor X adalah ASN. Kesimpulan yang pasti benar adalah...",
    ["Sebagian pegawai kantor X tidak boleh menerima gratifikasi", "Semua pegawai kantor X boleh menerima gratifikasi", "Tidak ada pegawai kantor X yang berstatus ASN", "Semua yang tidak boleh menerima gratifikasi adalah pegawai kantor X"], 0,
    "Sebagian pegawai kantor X adalah ASN, dan semua ASN tidak boleh menerima gratifikasi."),

  // --- Penalaran induktif ---
  mc("TIU", "Penalaran induktif", "Tiga kantor kecamatan yang menerapkan antrean online memangkas waktu tunggu rata-rata hingga separuhnya. Dua kantor kelurahan lain melaporkan hasil serupa. Kesimpulan yang paling mungkin benar adalah...",
    ["Antrean online cenderung mempercepat layanan di berbagai kantor pelayanan", "Antrean online pasti memangkas waktu tunggu di semua kantor tanpa kecuali", "Semua kantor kelurahan sudah menerapkan antrean online", "Antrean online menurunkan jumlah pemohon"], 0,
    "Induksi menghasilkan kesimpulan yang berpeluang benar, bukan kepastian mutlak. Hindari kata \"pasti\" dan \"semua\"."),
  mc("TIU", "Penalaran induktif", "Selama 5 minggu terakhir, jumlah pengunjung perpustakaan setiap hari Senin selalu lebih banyak daripada hari lain. Perkiraan yang paling berpeluang benar untuk Senin minggu depan adalah...",
    ["Jumlah pengunjung cenderung lebih banyak daripada hari lain", "Jumlah pengunjung pasti persis sama dengan Senin lalu", "Perpustakaan akan sepi pengunjung", "Senin pasti hari dengan pengunjung terbanyak sepanjang tahun"], 0,
    "Pola yang berulang memberi dasar perkiraan, tetapi tidak menjamin hasilnya persis sama."),

  // --- Analitis ---
  mc("TIU", "Analitis", "Lima orang (A, B, C, D, E) duduk berjajar dalam satu baris. A duduk di ujung kiri. B duduk tepat di sebelah kanan A. D duduk di ujung kanan. C tidak duduk bersebelahan dengan B. Siapa yang duduk di tengah?",
    ["B", "C", "D", "E"], 3,
    "Urutannya A, B, ?, ?, D. C tidak boleh di sebelah B, jadi C di posisi 4 dan E di posisi 3 (tengah)."),
  mc("TIU", "Analitis", "Empat ASN (Rina, Sari, Tono, Udin) bertugas piket pada hari Senin sampai Kamis, satu orang per hari. Rina bertugas sebelum Sari. Tono bertugas pada hari Rabu. Udin bertugas pada hari Senin. Rina bertugas pada hari...",
    ["Senin", "Selasa", "Rabu", "Kamis"], 1,
    "Udin Senin dan Tono Rabu. Sisa Selasa dan Kamis untuk Rina dan Sari. Rina sebelum Sari, jadi Rina Selasa."),
  mc("TIU", "Analitis", "Sebuah tim 3 orang dipilih dari P, Q, R, dan S dengan syarat: (1) jika P dipilih maka Q dipilih; (2) R dan S tidak boleh dipilih bersamaan; (3) S tidak dipilih jika P dipilih. Susunan tim yang valid adalah...",
    ["P, Q, R", "P, Q, S", "P, R, S", "Q, R, S"], 0,
    "P, Q, S melanggar syarat 3. P, R, S melanggar syarat 1 dan 2. Q, R, S melanggar syarat 2."),

  // --- Berhitung ---
  mc("TIU", "Berhitung", "Harga sebuah barang Rp500.000 didiskon 20%, lalu didiskon lagi 10% dari harga setelah diskon pertama. Harga akhirnya adalah...",
    ["Rp350.000", "Rp370.000", "Rp400.000", "Rp360.000"], 3,
    "500.000 x 0,8 x 0,9 = 360.000. Diskon bertingkat tidak boleh dijumlah langsung."),
  mc("TIU", "Berhitung", "Rata-rata dari 5 bilangan adalah 12. Jika satu bilangan dihapus, rata-rata 4 bilangan sisanya menjadi 10. Bilangan yang dihapus adalah...",
    ["20", "18", "22", "24"], 0, "Total awal 60, total sisa 40, selisihnya 20."),
  mc("TIU", "Berhitung", "Gaji Andi naik 20% sehingga menjadi Rp6.000.000. Gaji Andi semula adalah...",
    ["Rp4.800.000", "Rp5.000.000", "Rp5.200.000", "Rp4.500.000"], 1,
    "Naik 20% berarti 120% dari semula: 6.000.000 / 1,2 = 5.000.000."),
  mc("TIU", "Berhitung", "Rata-rata nilai 20 siswa adalah 75. Kemudian bergabung 5 siswa baru dengan rata-rata nilai 80. Rata-rata nilai seluruh siswa sekarang adalah...",
    ["77", "76", "77,5", "78"], 1, "Total (20 x 75) + (5 x 80) = 1.900, dibagi 25 siswa = 76."),
  mc("TIU", "Berhitung", "Hasil dari 3/4 + 2/5 - 1/2 adalah...",
    ["13/20", "11/20", "7/10", "3/5"], 0, "Samakan penyebut 20: 15/20 + 8/20 - 10/20 = 13/20."),
  mc("TIU", "Berhitung", "Nilai dari 15% dari 240 ditambah 25% dari 160 adalah...",
    ["72", "76", "80", "84"], 1, "15% x 240 = 36 dan 25% x 160 = 40, jumlahnya 76."),

  // --- Deret angka ---
  mc("TIU", "Deret angka", "Tentukan angka selanjutnya: 2, 5, 11, 23, 47, ...",
    ["93", "94", "95", "96"], 2, "Pola dikali 2 lalu ditambah 1: 47 x 2 + 1 = 95."),
  mc("TIU", "Deret angka", "Tentukan angka selanjutnya: 3, 4, 6, 9, 13, 18, ...",
    ["23", "24", "25", "26"], 1, "Selisihnya +1, +2, +3, +4, +5, berikutnya +6, jadi 24."),
  mc("TIU", "Deret angka", "Tentukan angka selanjutnya: 2, 3, 4, 6, 6, 12, 8, ...",
    ["16", "18", "20", "24"], 3, "Suku ganjil naik +2 (2, 4, 6, 8), suku genap dikali 2 (3, 6, 12, 24)."),
  mc("TIU", "Deret angka", "Tentukan angka selanjutnya: 1, 2, 6, 24, 120, ...",
    ["360", "600", "720", "840"], 2, "Dikali 2, 3, 4, 5, lalu 6: 120 x 6 = 720."),
  mc("TIU", "Deret angka", "Tentukan angka selanjutnya: 5, 7, 11, 17, 25, ...",
    ["33", "35", "37", "39"], 1, "Selisihnya +2, +4, +6, +8, berikutnya +10, jadi 35."),

  // --- Perbandingan kuantitatif ---
  mc("TIU", "Perbandingan kuantitatif", "Penjualan bulan ini: Toko A Rp12 juta, Toko B Rp15 juta, Toko C Rp9 juta. Pernyataan yang benar adalah...",
    ["Penjualan Toko B lebih besar 25% daripada Toko A", "Penjualan Toko C sepertiga dari Toko B", "Total penjualan Toko A dan C kurang dari Toko B", "Penjualan Toko A lebih besar daripada Toko B"], 0,
    "(15 - 12) / 12 = 25%. C/B = 9/15 = 0,6, dan A + C = 21 lebih besar dari 15."),
  mc("TIU", "Perbandingan kuantitatif", "Merek X: 500 gram Rp20.000. Merek Y: 750 gram Rp27.000. Merek Z: 1.000 gram Rp38.000. Merek dengan harga per 100 gram paling murah adalah...",
    ["Merek X", "Merek Y", "Merek Z", "Merek X dan Z sama murah"], 1,
    "Per 100 gram: X Rp4.000, Y Rp3.600, Z Rp3.800."),
  mc("TIU", "Perbandingan kuantitatif", "Nilai ujian: Andi 80, Budi 70, Citra 90. Selisih nilai Citra dan Budi dibandingkan selisih nilai Andi dan Budi adalah...",
    ["Sama besar", "Dua kali lebih besar", "Setengahnya", "Tiga kali lebih besar"], 1,
    "Selisih Citra dan Budi 20, selisih Andi dan Budi 10, jadi dua kali lebih besar."),

  // --- Soal cerita ---
  mc("TIU", "Soal cerita", "Andi dapat menyelesaikan suatu pekerjaan dalam 12 hari, Budi dalam 6 hari. Jika keduanya bekerja bersama, pekerjaan selesai dalam...",
    ["3 hari", "4 hari", "6 hari", "9 hari"], 1, "1/12 + 1/6 = 1/4 per hari, jadi 4 hari."),
  mc("TIU", "Soal cerita", "Seorang pengendara berangkat dengan kecepatan 60 km/jam dan pulang lewat rute yang sama dengan kecepatan 40 km/jam. Kecepatan rata-rata seluruh perjalanan adalah...",
    ["50 km/jam", "45 km/jam", "52 km/jam", "48 km/jam"], 3,
    "Rata-rata harmonik: (2 x 60 x 40) / (60 + 40) = 48 km/jam. Jawaban 50 adalah jebakan."),
  mc("TIU", "Soal cerita", "Harga 3 pensil dan 2 buku adalah Rp19.000, sedangkan harga 1 pensil dan 2 buku adalah Rp13.000. Harga 2 pensil dan 1 buku adalah...",
    ["Rp10.000", "Rp12.000", "Rp11.000", "Rp13.000"], 2,
    "2 pensil = 19.000 - 13.000 = 6.000, jadi pensil 3.000 dan buku 5.000. 2 pensil + 1 buku = 11.000."),
  mc("TIU", "Soal cerita", "Uang A dan B berbanding 2:3, sedangkan uang B dan C berbanding 4:5. Jika total uang mereka bertiga Rp700.000, uang C adalah...",
    ["Rp300.000", "Rp250.000", "Rp280.000", "Rp320.000"], 0,
    "A:B:C = 8:12:15 (35 bagian). 700.000 / 35 = 20.000, C = 15 x 20.000 = 300.000."),
  mc("TIU", "Soal cerita", "Dua kereta berangkat bersamaan dari dua kota yang berjarak 360 km dan saling mendekat. Kecepatan kereta pertama 50 km/jam dan kereta kedua 70 km/jam. Mereka akan bertemu setelah...",
    ["4 jam", "2,5 jam", "3 jam", "3,5 jam"], 2, "Saling mendekat: kecepatan dijumlah. 360 / (50 + 70) = 3 jam."),
  mc("TIU", "Soal cerita", "Umur ayah sekarang 3 kali umur anaknya. Dua belas tahun lagi, umur ayah menjadi 2 kali umur anaknya. Umur ayah sekarang adalah...",
    ["30 tahun", "33 tahun", "39 tahun", "36 tahun"], 3,
    "Anak = c, ayah = 3c. 3c + 12 = 2(c + 12) sehingga c = 12 dan ayah = 36."),
  mc("TIU", "Soal cerita", "Seorang ASN berjalan 2 km ke halte dengan kecepatan 4 km/jam, lalu naik bus sejauh 30 km dengan kecepatan 60 km/jam. Total waktu perjalanannya adalah...",
    ["45 menit", "1 jam", "1,5 jam", "75 menit"], 1,
    "Jalan kaki 2 / 4 = 0,5 jam, naik bus 30 / 60 = 0,5 jam. Totalnya 1 jam."),
  mc("TIU", "Soal cerita", "Pak Dedi membeli 5 kg beras seharga Rp12.000 per kg dan 2 kg gula seharga Rp15.000 per kg dengan uang Rp100.000. Uang kembaliannya adalah...",
    ["Rp5.000", "Rp10.000", "Rp15.000", "Rp20.000"], 1,
    "5 x 12.000 = 60.000 dan 2 x 15.000 = 30.000. Total 90.000, kembalian 10.000."),
  mc("TIU", "Soal cerita", "Sebanyak 40 liter larutan mengandung garam dengan kadar 10%. Air yang harus ditambahkan agar kadar garamnya menjadi 8% adalah...",
    ["5 liter", "8 liter", "10 liter", "12 liter"], 2,
    "Garam 4 liter tetap. Agar kadarnya 8%, total larutan 4 / 0,08 = 50 liter, jadi tambah 10 liter."),

  // --- Figural (versi simbol; soal asli berupa gambar) ---
  mc("TIU", "Figural serial", "Perhatikan pola simbol berikut.\n▲ ▶ ▼ ◀ ▲ ▶ ?\nSimbol selanjutnya adalah...",
    ["▲", "▶", "▼", "◀"], 2,
    "Simbol berputar searah jarum jam: atas, kanan, bawah, kiri, lalu berulang. Setelah ▶ datang ▼."),
  mc("TIU", "Figural analogi", "Perhatikan hubungan simbol berikut.\n▲ : ▼ = ◀ : ?\nPasangan yang tepat adalah...",
    ["▲", "▶", "▼", "◀"], 1,
    "▲ diputar 180 derajat menjadi ▼, maka ◀ diputar 180 derajat menjadi ▶."),
  mc("TIU", "Figural matriks", "Lengkapi pola matriks berikut.\n■ ▲ ●\n▲ ● ■\n● ■ ?\nSimbol yang melengkapi adalah...",
    ["▲", "■", "●", "◆"], 0,
    "Setiap baris dan kolom memuat ■, ▲, dan ● masing-masing satu kali. Baris ketiga sudah punya ● dan ■, jadi yang kurang ▲."),

  // =====================================================
  // TKP (20 soal): pelayanan publik, jejaring kerja, sosial budaya,
  // adaptasi TIK, profesionalisme, anti radikalisme
  // =====================================================
  tkp("Profesionalisme",
    "Atasan memberi tugas mendadak di luar jam kerja, padahal Anda sudah punya acara keluarga. Sikap Anda adalah...",
    [
      ["Menanyakan tingkat urgensinya, lalu mengatur agar tugas selesai tanpa mengabaikan acara keluarga, misalnya lebih awal atau dibantu rekan", 5],
      ["Menyelesaikan tugas dahulu, lalu meminta maaf kepada keluarga", 4],
      ["Mengerjakan seadanya agar bisa segera berangkat ke acara keluarga", 3],
      ["Meminta rekan lain mengerjakannya tanpa menjelaskan alasan", 2],
      ["Menolak tugas karena sudah di luar jam kerja", 1],
    ],
    "Komunikasi jelas dengan atasan sambil mencari solusi lebih baik daripada menolak atau mengorbankan salah satu pihak."),
  tkp("Jejaring Kerja",
    "Rekan kerja Anda tidak sengaja membuat kesalahan pada laporan yang akan dikirim ke pimpinan. Anda akan...",
    [
      ["Memberi tahu rekan secara pribadi dan membantu memperbaikinya sebelum dikirim", 5],
      ["Memperbaikinya sendiri tanpa memberi tahu rekan", 4],
      ["Melaporkan kesalahan itu langsung ke atasan", 3],
      ["Membiarkannya karena itu tanggung jawab rekan tersebut", 2],
      ["Menceritakannya kepada rekan lain", 1],
    ],
    "Menegur dan membantu langsung menjaga kerja sama tim dan mencegah kesalahan sampai ke pimpinan."),
  tkp("Pelayanan Publik",
    "Seorang warga marah karena berkasnya ditolak akibat persyaratan kurang lengkap. Anda akan...",
    [
      ["Mendengarkan dengan tenang, menjelaskan alasannya, dan memandu cara melengkapi persyaratan", 5],
      ["Menjelaskan alasannya sesuai aturan, lalu mempersilakan warga ke antrean berikutnya", 4],
      ["Meminta warga menemui atasan Anda", 3],
      ["Menjawab dengan tegas agar warga tidak membuat keributan", 2],
      ["Mengabaikan sampai warga tenang sendiri", 1],
    ],
    "Pelayanan publik menuntut empati dan solusi: dengarkan, jelaskan, lalu bantu warga menyelesaikan masalahnya."),
  tkp("Adaptasi TIK",
    "Instansi Anda menerapkan aplikasi baru yang belum Anda kuasai. Anda akan...",
    [
      ["Mempelajarinya secara mandiri lewat panduan, lalu bertanya kepada yang lebih paham jika ada kendala", 5],
      ["Mengikuti pelatihan yang tersedia dan bertanya jika bingung", 4],
      ["Menunggu rekan yang sudah menguasainya membantu", 3],
      ["Tetap memakai cara lama selama masih bisa", 2],
      ["Meminta agar aplikasi tersebut diganti", 1],
    ],
    "Inisiatif belajar mandiri disertai kemauan bertanya adalah sikap adaptif yang paling dinilai."),
  tkp("Profesionalisme",
    "Beberapa pekerjaan dengan tenggat yang sama menumpuk di meja Anda. Anda akan...",
    [
      ["Menyusun prioritas berdasarkan urgensi, melaporkannya ke atasan, dan meminta bantuan jika perlu", 5],
      ["Mengerjakan semuanya sendiri sampai larut malam", 4],
      ["Mengerjakan yang paling mudah terlebih dahulu", 3],
      ["Meminta perpanjangan waktu untuk semua tugas tanpa alasan jelas", 2],
      ["Mengerjakan sebisanya tanpa memberi tahu siapa pun", 1],
    ],
    "Prioritas yang jelas dan komunikasi ke atasan lebih baik daripada kerja keras tanpa strategi."),
  tkp("Profesionalisme",
    "Atasan meminta Anda menandatangani laporan perjalanan dinas yang nominalnya dinaikkan. Anda akan...",
    [
      ["Menolak dengan sopan, menjelaskan aturannya, dan menyarankan laporan sesuai kondisi sebenarnya", 5],
      ["Menolak dan melaporkannya ke unit pengawas internal", 4],
      ["Menghindar dengan alasan sedang sibuk", 3],
      ["Menandatangani, tetapi menyimpan bukti sebagai jaga-jaga", 2],
      ["Menandatangani karena itu perintah atasan", 1],
    ],
    "Akuntabilitas dan integritas berarti menolak manipulasi data dengan cara santun dan memberi alternatif yang benar."),

  // --- Pelayanan publik ---
  tkp("Pelayanan Publik",
    "Antrean di loket Anda panjang dan menjelang jam istirahat masih ada belasan warga yang menunggu. Anda akan...",
    [
      ["Meminta rekan membantu membuka loket tambahan atau mempercepat layanan, dan melayani semua warga yang sudah mengantre", 5],
      ["Melayani semua warga yang sudah mengantre dengan menunda istirahat", 4],
      ["Melayani sebagian, lalu meminta sisanya kembali setelah istirahat", 3],
      ["Istirahat tepat waktu sesuai jadwal", 2],
      ["Menutup loket lebih awal", 1],
    ],
    "Pelayanan tanpa pamrih dan responsif, disertai upaya memperbaiki cara kerja agar antrean lebih cepat."),
  tkp("Pelayanan Publik",
    "Seorang lansia kesulitan mengisi formulir pelayanan digital dan tampak bingung. Anda akan...",
    [
      ["Membantu langkah demi langkah dengan sabar sambil menjelaskan agar ke depannya ia bisa mandiri", 5],
      ["Mengisikan formulir itu untuknya", 4],
      ["Mengarahkannya ke petugas lain yang lebih paham", 3],
      ["Menyarankannya datang bersama anaknya", 2],
      ["Memintanya menunggu sampai bisa mengisi sendiri", 1],
    ],
    "Sikap ramah dan membantu sambil memberdayakan warga adalah pelayanan terbaik."),

  // --- Jejaring kerja ---
  tkp("Jejaring Kerja",
    "Dua unit kerja berselisih soal pembagian data untuk laporan bersama yang tenggatnya dekat. Anda ditunjuk sebagai koordinator. Anda akan...",
    [
      ["Mempertemukan kedua unit, menyepakati format dan jadwal data, lalu memantau penyerahannya", 5],
      ["Meminta atasan masing-masing unit memutuskan", 4],
      ["Mengumpulkan data dari unit yang bersedia lebih dulu", 3],
      ["Menunda laporan sampai kedua unit berdamai", 2],
      ["Mengerjakan laporan tanpa data salah satu unit", 1],
    ],
    "Kolaborasi internal dibangun dengan memfasilitasi kesepakatan, bukan menghindar atau memihak."),
  tkp("Jejaring Kerja",
    "Mitra eksternal sering terlambat mengirim dokumen yang Anda butuhkan sehingga pekerjaan tim terhambat. Anda akan...",
    [
      ["Menghubungi mitra untuk memahami kendalanya, menyepakati tenggat baru yang realistis, dan mengingatkan secara berkala", 5],
      ["Mengirim pengingat tertulis setiap kali tenggat mendekat", 4],
      ["Melaporkan keterlambatan itu ke atasan", 3],
      ["Mencari mitra lain tanpa berdiskusi", 2],
      ["Menyalahkan mitra di depan tim", 1],
    ],
    "Kolaborasi eksternal dijaga dengan komunikasi dan kesepakatan yang jelas."),

  // --- Sosial budaya ---
  tkp("Sosial Budaya",
    "Di kantor baru, rekan satu tim Anda berbeda suku dan agama, dan mereka punya pantangan makanan yang berbeda dari Anda saat makan siang bersama. Sikap Anda adalah...",
    [
      ["Menanyakan dengan sopan makanan yang cocok, lalu memilih tempat makan yang bisa dinikmati semua orang", 5],
      ["Mengikuti pilihan rekan tanpa banyak bicara", 4],
      ["Makan siang terpisah agar tidak merepotkan", 3],
      ["Meminta rekan menyesuaikan pilihan Anda", 2],
      ["Menyindir pantangan rekan itu", 1],
    ],
    "Menghargai keragaman latar belakang dan mencari solusi bersama membangun komunitas kerja yang harmonis."),
  tkp("Sosial Budaya",
    "Warga di wilayah kerja Anda punya tradisi gotong royong yang jadwalnya bertabrakan dengan jam pelayanan kantor. Anda akan...",
    [
      ["Berkoordinasi dengan tokoh masyarakat untuk mengatur jadwal agar tidak mengganggu tradisi, sambil memastikan layanan tetap berjalan", 5],
      ["Mengusulkan kepada atasan agar jadwal pelayanan disesuaikan", 4],
      ["Tetap melayani sesuai jadwal tanpa memedulikan tradisi tersebut", 3],
      ["Meminta warga meninggalkan tradisi itu selama jam kerja", 2],
      ["Menutup kantor tanpa pemberitahuan", 1],
    ],
    "Hubungan sosial yang positif dibangun dengan dialog dan penghargaan pada tradisi setempat."),
  tkp("Sosial Budaya",
    "Rekan Anda sering dibicarakan karena logat daerahnya yang kental. Saat seorang rekan lain menirukan logat itu dengan nada mengejek, Anda akan...",
    [
      ["Menegur dengan baik bahwa itu tidak pantas dan mengajak rekan tersebut tetap diterima dalam tim", 5],
      ["Diam-diam menghibur rekan yang diejek", 4],
      ["Mengalihkan pembicaraan", 3],
      ["Ikut tertawa agar tidak dikucilkan", 2],
      ["Ikut menirukan logat itu", 1],
    ],
    "Sikap aktif menghentikan ejekan menjaga komunitas yang harmonis dan saling menghargai."),

  // --- Adaptasi TIK ---
  tkp("Adaptasi TIK",
    "Kantor mewajibkan seluruh surat-menyurat memakai aplikasi persuratan elektronik, tetapi rekan senior Anda kesulitan menggunakannya. Anda akan...",
    [
      ["Mendampingi rekan belajar langkah demi langkah dan menyarankan pelatihan singkat bagi unit", 5],
      ["Membantu mengunggah surat milik rekan itu setiap kali dibutuhkan", 4],
      ["Menyarankan rekan bertanya ke bagian IT", 3],
      ["Membiarkan rekan memakai surat kertas sementara", 2],
      ["Mengeluh kepada atasan bahwa rekan itu menghambat", 1],
    ],
    "Adaptasi TIK yang bijak mencakup membantu rekan ikut beradaptasi."),
  tkp("Adaptasi TIK",
    "Anda menerima pesan berantai di grup kantor berisi tautan \"pembaruan data pegawai\" yang meminta kata sandi akun. Anda akan...",
    [
      ["Tidak membuka tautan, melaporkan pesan itu ke admin atau bagian IT, dan mengingatkan anggota grup agar waspada", 5],
      ["Tidak membuka tautan dan menghapus pesan", 4],
      ["Menanyakan ke grup apakah tautan itu asli", 3],
      ["Membuka tautan hanya untuk melihat isinya", 2],
      ["Mengisi kata sandi agar data tidak terhapus", 1],
    ],
    "Memanfaatkan TIK secara bijak dan etis termasuk waspada terhadap penipuan siber dan melaporkannya."),

  // --- Profesionalisme ---
  tkp("Profesionalisme",
    "Anda menyadari laporan yang sudah Anda kirim kemarin berisi kesalahan angka yang belum disadari siapa pun. Anda akan...",
    [
      ["Segera memberi tahu atasan, mengirim perbaikan, dan memeriksa ulang proses agar tidak terulang", 5],
      ["Mengirim revisi laporan dengan catatan perubahan", 4],
      ["Memperbaiki hanya jika ada yang menanyakan", 3],
      ["Membiarkan karena selisihnya kecil", 2],
      ["Menyalahkan sistem jika nanti ditanya", 1],
    ],
    "Akuntabilitas berarti mengakui kesalahan lebih dulu dan memperbaikinya."),
  tkp("Profesionalisme",
    "Anda diminta mengerjakan tugas di bidang yang belum Anda kuasai dengan tenggat satu minggu. Anda akan...",
    [
      ["Mempelajari materinya, berkonsultasi dengan yang ahli, dan melaporkan progres secara berkala", 5],
      ["Mengerjakan sesuai kemampuan dan mengajukan revisi bila ada kekurangan", 4],
      ["Meminta rekan mengerjakan sebagian", 3],
      ["Menolak karena bukan bidang Anda", 2],
      ["Mengerjakan seadanya agar cepat selesai", 1],
    ],
    "Komitmen dan kemauan meningkatkan keahlian lebih dinilai daripada menolak tugas."),

  // --- Anti radikalisme ---
  tkp("Anti Radikalisme",
    "Seorang rekan membagikan di grup kantor sebuah ajakan yang berisi ujaran kebencian terhadap kelompok agama tertentu. Anda akan...",
    [
      ["Menegur secara pribadi dengan baik, mengingatkan nilai kebangsaan, dan melaporkannya ke atasan bila berulang", 5],
      ["Menghapus pesan itu dan menegur di grup", 4],
      ["Keluar dari grup", 3],
      ["Membiarkan karena itu pendapat pribadi", 2],
      ["Ikut menyebarkannya", 1],
    ],
    "Menolak ujaran kebencian dan menegurnya dengan bijak sesuai prinsip anti radikalisme."),
  tkp("Anti Radikalisme",
    "Seorang kenalan mengajak Anda bergabung dengan kelompok tertutup yang menolak Pancasila dan ingin mengubah dasar negara dengan kekerasan. Anda akan...",
    [
      ["Menolak dengan tegas, menyampaikan pandangan Anda, dan melaporkannya kepada pihak berwenang", 5],
      ["Menolak dan menjauhi kenalan itu", 4],
      ["Menghadiri sekali hanya untuk melihat", 3],
      ["Menolak tanpa memberi alasan", 2],
      ["Bergabung karena penasaran", 1],
    ],
    "Menolak kekerasan dan pemaksaan kehendak serta setia pada ideologi bangsa."),
  tkp("Anti Radikalisme",
    "Dalam diskusi di kantor, perbedaan pandangan politik antara dua rekan mulai memanas. Anda akan...",
    [
      ["Menengahi dengan mengingatkan bahwa perbedaan pilihan politik itu wajar, lalu mengalihkan ke topik pekerjaan", 5],
      ["Meminta keduanya menghentikan diskusi", 4],
      ["Meninggalkan ruangan", 3],
      ["Memihak rekan yang sependapat dengan Anda", 2],
      ["Memanas-manasi agar diskusi berlanjut", 1],
    ],
    "Menerima perbedaan yang tidak bertentangan dengan ideologi bangsa dan menjaga suasana tetap kondusif."),
];

async function main() {
  // Mengosongkan bank soal lalu mengisi ulang. Riwayat latihan (Attempt) tetap aman.
  await prisma.question.deleteMany();
  for (const q of questions) {
    await prisma.question.create({
      data: {
        category: q.category,
        subCategory: q.subCategory,
        text: q.text,
        explanation: q.explanation,
        options: { create: q.options },
      },
    });
  }
  const count = (c) => questions.filter((q) => q.category === c).length;
  console.log(
    `Seed selesai: ${questions.length} soal (TWK ${count("TWK")}, TIU ${count("TIU")}, TKP ${count("TKP")})`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());