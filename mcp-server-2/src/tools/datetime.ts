import type { Tool } from "../../../types/tool";

export const datetimeTools: Tool[] = [
  {
    name: "get_current_time",
    description: "Mendapatkan waktu saat ini",
    parameters: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description: "Timezone (default: Asia/Jakarta)",
        },
      },
      required: [],
    },
    handler: async ({ timezone = "Asia/Jakarta" }: { timezone?: string }) => {
      const now = new Date();
      console.log(
        `✅ MCP2 DateTime: ${now.toLocaleString("id-ID", {
          timeZone: timezone,
        })}`,
      );
      return {
        iso: now.toISOString(),
        timestamp: now.getTime(),
        timezone,
        formatted: now.toLocaleString("id-ID", { timeZone: timezone }),
      };
    },
  },
  {
    name: "calculate_age",
    description: "Menghitung umur berdasarkan tanggal lahir",
    parameters: {
      type: "object",
      properties: {
        birthdate: {
          type: "string",
          description: "Tanggal lahir (format: YYYY-MM-DD)",
        },
      },
      required: ["birthdate"],
    },
    handler: async ({ birthdate }: { birthdate: string }) => {
      const birth = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }

      console.log(`✅ MCP2 DateTime: ${age} years old`);
      return {
        age,
        birthdate,
        next_birthday: new Date(
          today.getFullYear() + (monthDiff < 0 ? 1 : 0),
          birth.getMonth(),
          birth.getDate(),
        ).toISOString(),
      };
    },
  },
  {
    name: "add_days",
    description: "Menambahkan atau mengurangi hari dari tanggal tertentu",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Tanggal awal (format: YYYY-MM-DD atau ISO string)",
        },
        days: {
          type: "number",
          description:
            "Jumlah hari yang akan ditambahkan (negatif untuk mengurangi)",
        },
      },
      required: ["date", "days"],
    },
    handler: async ({ date, days }: { date: string; days: number }) => {
      const targetDate = new Date(date);
      targetDate.setDate(targetDate.getDate() + days);

      console.log(
        `✅ MCP2 DateTime: ${targetDate.toLocaleDateString("id-ID")}`,
      );
      return {
        original_date: date,
        days_added: days,
        result_date: targetDate.toISOString(),
        formatted: targetDate.toLocaleDateString("id-ID"),
      };
    },
  },
  {
    name: "day_of_week",
    description: "Mendapatkan hari dalam seminggu dari tanggal tertentu",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Tanggal (format: YYYY-MM-DD atau ISO string)",
        },
      },
      required: ["date"],
    },
    handler: async ({ date }: { date: string }) => {
      const targetDate = new Date(date);
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const daysEn = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      console.log(`✅ MCP2 DateTime: ${days[targetDate.getDay()]}`);
      return {
        date,
        day_name_id: days[targetDate.getDay()],
        day_name_en: daysEn[targetDate.getDay()],
        day_number: targetDate.getDay(),
      };
    },
  },
];
