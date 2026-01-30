// @ts-ignore
import { writeFile, mkdir, rm } from "fs/promises";
// @ts-ignore
import path from "path";

// @ts-ignore
const OUTPUT_DIR = path.join(process.cwd(), "outputs");

// clear output dir
await rm(OUTPUT_DIR, { recursive: true });

// Ganti sesuai endpoint MCP / LangChain server kamu
const API_URL = "http://localhost:6000/chat";
const servers = ["http://localhost:4000", "http://localhost:4040"];

// Semua prompt dipecah per tool
const prompts: { name: string; prompt: string }[] = [
  // 🧮 Matematika
  {
    name: "math_add",
    prompt: "Jumlahkan dua angka: 12 dan 30.",
  },
  {
    name: "math_age",
    prompt: "Hitung umur seseorang yang lahir pada tanggal 1 Januari 2000.",
  },
  {
    name: "math_word_count",
    prompt: 'Hitung jumlah kata dari teks: "MCP multi agent testing".',
  },

  // 🔤 Teks
  {
    name: "text_reverse",
    prompt: 'Balikkan urutan karakter dari teks: "LangChain MCP".',
  },
  {
    name: "text_uppercase",
    prompt: 'Ubah teks "hello world mcp" menjadi huruf besar.',
  },
  {
    name: "text_lowercase",
    prompt: 'Ubah teks "hello world mcp" menjadi huruf kecil.',
  },
  {
    name: "text_titlecase",
    prompt: 'Ubah teks "hello world mcp" menjadi Title Case.',
  },

  // 🌤️ Cuaca
  {
    name: "weather_jakarta",
    prompt: "Ambil informasi cuaca berdasarkan kota Jakarta.",
  },

  // ⏰ Tanggal & Waktu
  {
    name: "time_now_jakarta",
    prompt: "Tampilkan waktu saat ini berdasarkan zona waktu Asia/Jakarta.",
  },
  {
    name: "date_add_7_days",
    prompt: "Tambahkan 7 hari ke tanggal 2026-01-01 dan tampilkan hasilnya.",
  },
  {
    name: "date_day_of_week",
    prompt: "Tampilkan hari dalam minggu dari tanggal 2026-01-08.",
  },

  // 🔁 Konversi
  {
    name: "convert_temp",
    prompt: "Konversikan suhu dari 25 derajat Celsius ke Fahrenheit.",
  },
  {
    name: "convert_distance",
    prompt: "Konversikan jarak dari 10 kilometer ke mil.",
  },
  {
    name: "convert_weight",
    prompt: "Konversikan berat dari 70 kilogram ke pound.",
  },

  // 🎲 Random
  {
    name: "random_number",
    prompt: "Hasilkan angka acak dalam rentang 1 sampai 100.",
  },
  {
    name: "random_string",
    prompt: "Hasilkan string acak dengan panjang 10 karakter.",
  },
  {
    name: "random_color",
    prompt: "Hasilkan warna acak dalam format hex.",
  },

  // 🕹️ Permainan
  {
    name: "game_coin",
    prompt: "Lakukan lempar koin virtual dan tampilkan hasilnya.",
  },
  {
    name: "game_dice",
    prompt: "Lakukan lempar dadu virtual dan tampilkan hasilnya.",
  },
];

async function main() {
  // Pastikan folder output ada
  await mkdir(OUTPUT_DIR, { recursive: true });

  let i = 0;
  for (const item of prompts) {
    i++;
    console.log(`▶ Running: ${item.name}`);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: item.prompt,
        servers,
      }),
    });

    const result = await res.json();

    const filePath = path.join(OUTPUT_DIR, `${i}-${item.name}.txt`);
    await writeFile(filePath, result.message, "utf-8");

    console.log(`✔ Saved: ${filePath}`);
  }

  console.log("✅ Semua prompt selesai dijalankan");
}

main().catch((err) => {
  console.error("❌ Error:", err);
});
