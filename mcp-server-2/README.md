# MCP Server 2 - Advanced Tools

MCP Server dengan koleksi tools yang lebih menarik dan berguna untuk berbagai keperluan.

## Installation

```bash
bun install
```

## Run Server

```bash
bun run src/index.ts
```

Server akan berjalan di `http://localhost:4040`

## Available Tools

### 📝 Text Tools
- **count_words** - Menghitung jumlah kata, karakter dalam teks
- **reverse_text** - Membalikkan urutan karakter
- **to_uppercase** - Mengubah ke huruf besar
- **to_lowercase** - Mengubah ke huruf kecil
- **to_title_case** - Mengubah ke Title Case

### ⏰ DateTime Tools
- **get_current_time** - Mendapatkan waktu saat ini dengan timezone
- **calculate_age** - Menghitung umur dari tanggal lahir
- **add_days** - Menambah/mengurangi hari dari tanggal
- **day_of_week** - Mendapatkan nama hari dari tanggal

### 🔄 Converter Tools
- **celsius_to_fahrenheit** - Konversi suhu C ke F
- **fahrenheit_to_celsius** - Konversi suhu F ke C
- **km_to_miles** - Konversi jarak km ke mil
- **miles_to_km** - Konversi jarak mil ke km
- **kg_to_pounds** - Konversi berat kg ke pound
- **pounds_to_kg** - Konversi berat pound ke kg

### 🎲 Random Tools
- **random_number** - Generate angka random dalam range
- **random_string** - Generate string random (alphanumeric/alphabetic/numeric)
- **coin_flip** - Lempar koin virtual
- **dice_roll** - Lempar dadu virtual (custom sides & count)
- **random_color** - Generate warna random (hex & rgb)

### 🧮 Math Tools
- **add** - Penjumlahan dua angka

### 🌤️ Weather Tools
- **get_weather** - Mendapatkan informasi cuaca kota

## API Endpoints

### List All Tools
```bash
GET http://localhost:4040/mcp/tools
```

### Invoke Tool
```bash
POST http://localhost:4040/mcp/invoke
Content-Type: application/json

{
  "name": "random_number",
  "arguments": {
    "min": 1,
    "max": 100
  }
}
```

## Example Usage

```bash
# Get random number
curl -X POST http://localhost:4040/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{"name":"random_number","arguments":{"min":1,"max":100}}'

# Count words
curl -X POST http://localhost:4040/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{"name":"count_words","arguments":{"text":"Hello world from Bun"}}'

# Get current time
curl -X POST http://localhost:4040/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{"name":"get_current_time","arguments":{"timezone":"Asia/Jakarta"}}'

# Roll dice
curl -X POST http://localhost:4040/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{"name":"dice_roll","arguments":{"sides":20,"count":2}}'
```
