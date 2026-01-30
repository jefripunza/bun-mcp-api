import type { Tool } from "../../../types/tool";

export const textTools: Tool[] = [
  {
    name: "count_words",
    description: "Menghitung jumlah kata dalam sebuah teks",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "Teks yang akan dihitung katanya" },
      },
      required: ["text"],
    },
    handler: async ({ text }: { text: string }) => {
      const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
      return {
        word_count: words.length,
        character_count: text.length,
        character_count_no_spaces: text.replace(/\s/g, "").length,
      };
    },
  },
  {
    name: "reverse_text",
    description: "Membalikkan urutan karakter dalam teks",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "Teks yang akan dibalik" },
      },
      required: ["text"],
    },
    handler: async ({ text }: { text: string }) => {
      return { reversed: text.split("").reverse().join("") };
    },
  },
  {
    name: "to_uppercase",
    description: "Mengubah teks menjadi huruf besar semua",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "Teks yang akan diubah" },
      },
      required: ["text"],
    },
    handler: async ({ text }: { text: string }) => {
      return { result: text.toUpperCase() };
    },
  },
  {
    name: "to_lowercase",
    description: "Mengubah teks menjadi huruf kecil semua",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "Teks yang akan diubah" },
      },
      required: ["text"],
    },
    handler: async ({ text }: { text: string }) => {
      return { result: text.toLowerCase() };
    },
  },
  {
    name: "to_title_case",
    description: "Mengubah teks menjadi Title Case (huruf besar di awal kata)",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "Teks yang akan diubah" },
      },
      required: ["text"],
    },
    handler: async ({ text }: { text: string }) => {
      const titleCase = text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { result: titleCase };
    },
  },
];
