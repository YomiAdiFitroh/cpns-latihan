import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TWK / TIU: pilihan ganda. Jawaban benar = skor 5, sisanya 0 (seperti SKD asli).
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

const questions = [
  // ---------- TWK ----------
  mc("TWK", "Konstitusi", "Ketentuan bahwa \"Negara Indonesia adalah negara hukum\" terdapat dalam UUD 1945 pasal...",
    ["Pasal 1 ayat (1)", "Pasal 1 ayat (2)", "Pasal 1 ayat (3)", "Pasal 2 ayat (1)"], 2,
    "Pasal 1 ayat (3) menyatakan Indonesia adalah negara hukum. Ayat (1) mengatur bentuk negara, ayat (2) kedaulatan rakyat."),
  mc("TWK", "Lembaga Negara", "Lembaga negara yang berwenang menguji undang-undang terhadap UUD 1945 adalah...",
    ["Mahkamah Agung", "Mahkamah Konstitusi", "Dewan Perwakilan Rakyat", "Komisi Yudisial"], 1,
    "Mahkamah Konstitusi menguji UU terhadap UUD 1945. Mahkamah Agung menguji peraturan di bawah UU terhadap UU."),
  mc("TWK", "Sejarah", "Pidato Soekarno tentang dasar negara dalam sidang BPUPKI, yang kemudian diperingati sebagai Hari Lahir Pancasila, disampaikan pada tanggal...",
    ["29 Mei 1945", "1 Juni 1945", "22 Juni 1945", "18 Agustus 1945"], 1,
    "Pidato disampaikan 1 Juni 1945. 22 Juni adalah Piagam Jakarta, 18 Agustus adalah pengesahan UUD 1945 oleh PPKI."),
  mc("TWK", "Sejarah", "Semboyan \"Bhinneka Tunggal Ika\" terdapat dalam kitab...",
    ["Negarakertagama", "Pararaton", "Sutasoma", "Arjunawiwaha"], 2,
    "Terdapat dalam Kakawin Sutasoma karya Mpu Tantular dari masa Majapahit."),
  mc("TWK", "Konstitusi", "Pemilihan Presiden dan Wakil Presiden secara langsung oleh rakyat diatur dalam UUD 1945 pasal...",
    ["Pasal 7A", "Pasal 6A", "Pasal 8", "Pasal 9"], 1,
    "Pasal 6A ayat (1). Pasal 7A mengatur pemberhentian, Pasal 8 mengatur kekosongan jabatan."),
  mc("TWK", "Pancasila", "Lambang pohon beringin pada Garuda Pancasila melambangkan sila...",
    ["Sila pertama", "Sila kedua", "Sila ketiga", "Sila keempat"], 2,
    "Pohon beringin melambangkan sila ketiga, Persatuan Indonesia."),

  // ---------- TIU ----------
  mc("TIU", "Numerik", "Tentukan angka selanjutnya: 2, 5, 11, 23, 47, ...",
    ["93", "94", "95", "96"], 2, "Pola dikali 2 lalu ditambah 1: 47 x 2 + 1 = 95."),
  mc("TIU", "Numerik", "Harga sebuah barang Rp500.000 didiskon 20%, lalu didiskon lagi 10% dari harga setelah diskon pertama. Harga akhirnya adalah...",
    ["Rp350.000", "Rp370.000", "Rp400.000", "Rp360.000"], 3,
    "500.000 x 0,8 x 0,9 = 360.000. Diskon bertingkat tidak boleh dijumlah langsung."),
  mc("TIU", "Numerik", "Andi dapat menyelesaikan suatu pekerjaan dalam 12 hari, Budi dalam 6 hari. Jika keduanya bekerja bersama, pekerjaan selesai dalam...",
    ["3 hari", "4 hari", "6 hari", "9 hari"], 1, "1/12 + 1/6 = 1/4 per hari, jadi 4 hari."),
  mc("TIU", "Logika", "Semua dokter adalah sarjana. Budi bukan sarjana. Kesimpulan yang pasti benar adalah...",
    ["Budi adalah dokter", "Budi bukan dokter", "Budi mungkin dokter", "Semua sarjana adalah dokter"], 1,
    "Semua dokter pasti sarjana, jadi yang bukan sarjana pasti bukan dokter."),
  mc("TIU", "Verbal", "Antonim dari kata \"lazim\" adalah...",
    ["Biasa", "Wajar", "Umum", "Janggal"], 3, "Lazim berarti umum atau biasa, lawannya janggal."),
  mc("TIU", "Verbal", "Dingin : Beku = Panas : ...",
    ["Hangat", "Api", "Mendidih", "Matahari"], 2,
    "Beku adalah tingkat ekstrem dari dingin, mendidih adalah tingkat ekstrem dari panas."),
  mc("TIU", "Numerik", "Rata-rata dari 5 bilangan adalah 12. Jika satu bilangan dihapus, rata-rata 4 bilangan sisanya menjadi 10. Bilangan yang dihapus adalah...",
    ["20", "18", "22", "24"], 0, "Total awal 60, total sisa 40, selisihnya 20."),
  mc("TIU", "Numerik", "Seorang pengendara berangkat dengan kecepatan 60 km/jam dan pulang lewat rute yang sama dengan kecepatan 40 km/jam. Kecepatan rata-rata seluruh perjalanan adalah...",
    ["50 km/jam", "45 km/jam", "52 km/jam", "48 km/jam"], 3,
    "Rata-rata harmonik: (2 x 60 x 40) / (60 + 40) = 48 km/jam. Jawaban 50 adalah jebakan."),
  mc("TIU", "Numerik", "Tentukan angka selanjutnya: 3, 4, 6, 9, 13, 18, ...",
    ["23", "24", "25", "26"], 1, "Selisihnya +1, +2, +3, +4, +5, berikutnya +6, jadi 24."),
  mc("TIU", "Verbal", "Padanan kata (sinonim) yang paling tepat untuk \"hipotesis\" adalah...",
    ["Kesimpulan", "Fakta", "Teori", "Dugaan sementara"], 3, "Hipotesis adalah dugaan sementara yang masih harus diuji."),
  mc("TIU", "Numerik", "Harga 3 pensil dan 2 buku adalah Rp19.000, sedangkan harga 1 pensil dan 2 buku adalah Rp13.000. Harga 2 pensil dan 1 buku adalah...",
    ["Rp10.000", "Rp12.000", "Rp11.000", "Rp13.000"], 2,
    "2 pensil = 19.000 - 13.000 = 6.000, jadi pensil 3.000 dan buku 5.000. 2 pensil + 1 buku = 11.000."),
  mc("TIU", "Logika", "Semua ASN adalah warga negara. Sebagian warga negara adalah petani. Kesimpulan yang pasti benar adalah...",
    ["Semua ASN adalah petani", "Sebagian ASN adalah petani", "Tidak ada ASN yang petani", "Tidak dapat disimpulkan hubungan antara ASN dan petani"], 3,
    "Premis kedua tidak menjamin petani itu ASN atau bukan."),
  mc("TIU", "Numerik", "Tentukan angka selanjutnya: 2, 3, 4, 6, 6, 12, 8, ...",
    ["16", "18", "20", "24"], 3, "Suku ganjil naik +2 (2, 4, 6, 8), suku genap dikali 2 (3, 6, 12, 24)."),
  mc("TIU", "Numerik", "Gaji Andi naik 20% sehingga menjadi Rp6.000.000. Gaji Andi semula adalah...",
    ["Rp4.800.000", "Rp5.000.000", "Rp5.200.000", "Rp4.500.000"], 1,
    "Naik 20% berarti 120% dari semula: 6.000.000 / 1,2 = 5.000.000."),
  mc("TIU", "Numerik", "Uang A dan B berbanding 2:3, sedangkan uang B dan C berbanding 4:5. Jika total uang mereka bertiga Rp700.000, uang C adalah...",
    ["Rp300.000", "Rp250.000", "Rp280.000", "Rp320.000"], 0,
    "A:B:C = 8:12:15 (35 bagian). 700.000 / 35 = 20.000, C = 15 x 20.000 = 300.000."),
  mc("TIU", "Numerik", "Dua kereta berangkat bersamaan dari dua kota yang berjarak 360 km dan saling mendekat. Kecepatan kereta pertama 50 km/jam dan kereta kedua 70 km/jam. Mereka akan bertemu setelah...",
    ["4 jam", "2,5 jam", "3 jam", "3,5 jam"], 2, "Saling mendekat: kecepatan dijumlah. 360 / (50 + 70) = 3 jam."),
  mc("TIU", "Numerik", "Rata-rata nilai 20 siswa adalah 75. Kemudian bergabung 5 siswa baru dengan rata-rata nilai 80. Rata-rata nilai seluruh siswa sekarang adalah...",
    ["77", "76", "77,5", "78"], 1, "Total (20 x 75) + (5 x 80) = 1.900, dibagi 25 siswa = 76."),
  mc("TIU", "Numerik", "Umur ayah sekarang 3 kali umur anaknya. Dua belas tahun lagi, umur ayah menjadi 2 kali umur anaknya. Umur ayah sekarang adalah...",
    ["30 tahun", "33 tahun", "39 tahun", "36 tahun"], 3,
    "Anak = c, ayah = 3c. 3c + 12 = 2(c + 12) sehingga c = 12 dan ayah = 36."),

  // ---------- TKP ----------
  tkp("Profesionalisme",
    "Atasan memberi tugas mendadak di luar jam kerja, padahal Anda sudah punya acara keluarga. Sikap Anda adalah...",
    [
      ["Menanyakan tingkat urgensinya, lalu mengatur agar tugas selesai tanpa mengabaikan acara keluarga, misalnya lebih awal atau dibantu rekan", 5],
      ["Menyelesaikan tugas dahulu, lalu meminta maaf kepada keluarga", 4],
      ["Mengerjakan seadanya agar bisa segera berangkat ke acara keluarga", 3],
      ["Meminta rekan lain mengerjakannya tanpa menjelaskan alasan", 2],
      ["Menolak tugas karena sudah di luar jam kerja", 1],
    ],
    "Jawaban terbaik: komunikasi jelas dengan atasan sambil mencari solusi, bukan menolak atau mengorbankan salah satu pihak."),
  tkp("Jejaring Kerja",
    "Rekan kerja Anda tidak sengaja membuat kesalahan pada laporan yang akan dikirim ke pimpinan. Anda akan...",
    [
      ["Memberi tahu rekan secara pribadi dan membantu memperbaikinya sebelum dikirim", 5],
      ["Memperbaikinya sendiri tanpa memberi tahu rekan", 4],
      ["Melaporkan kesalahan itu langsung ke atasan", 3],
      ["Membiarkannya karena itu tanggung jawab rekan tersebut", 2],
      ["Menceritakannya kepada rekan lain", 1],
    ],
    "Menegur dan membantu secara langsung menjaga kerja sama tim dan mencegah kesalahan sampai ke pimpinan."),
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
  tkp("Teknologi Informasi",
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
  tkp("Integritas",
    "Atasan meminta Anda menandatangani laporan perjalanan dinas yang nominalnya dinaikkan. Anda akan...",
    [
      ["Menolak dengan sopan, menjelaskan aturannya, dan menyarankan laporan sesuai kondisi sebenarnya", 5],
      ["Menolak dan melaporkannya ke unit pengawas internal", 4],
      ["Menghindar dengan alasan sedang sibuk", 3],
      ["Menandatangani, tetapi menyimpan bukti sebagai jaga-jaga", 2],
      ["Menandatangani karena itu perintah atasan", 1],
    ],
    "Integritas berarti menolak manipulasi data dengan cara yang santun dan memberi alternatif yang benar."),
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
  console.log(`Seed selesai: ${questions.length} soal`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
