import type { Tool } from "../../../types/tool";

export const randomTools: Tool[] = [
  {
    name: "random_number",
    description: "Generate angka random dalam range tertentu",
    parameters: {
      type: "object",
      properties: {
        min: { type: "number", description: "Nilai minimum" },
        max: { type: "number", description: "Nilai maximum" },
      },
      required: ["min", "max"],
    },
    handler: async ({ min, max }: { min: number; max: number }) => {
      const random = Math.floor(Math.random() * (max - min + 1)) + min;
      return { result: random, min, max };
    },
  },
  {
    name: "random_string",
    description: "Generate string random dengan panjang tertentu",
    parameters: {
      type: "object",
      properties: {
        length: { type: "number", description: "Panjang string yang diinginkan" },
        type: {
          type: "string",
          description: "Tipe karakter: alphanumeric, alphabetic, numeric",
          enum: ["alphanumeric", "alphabetic", "numeric"],
        },
      },
      required: ["length"],
    },
    handler: async ({
      length,
      type = "alphanumeric",
    }: {
      length: number;
      type?: string;
    }) => {
      let chars = "";
      if (type === "numeric") {
        chars = "0123456789";
      } else if (type === "alphabetic") {
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      } else {
        chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      }

      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      return { result, length, type };
    },
  },
  {
    name: "coin_flip",
    description: "Lempar koin virtual (heads atau tails)",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      const result = Math.random() < 0.5 ? "heads" : "tails";
      return {
        result,
        result_id: result === "heads" ? "Kepala" : "Ekor",
      };
    },
  },
  {
    name: "dice_roll",
    description: "Lempar dadu virtual",
    parameters: {
      type: "object",
      properties: {
        sides: {
          type: "number",
          description: "Jumlah sisi dadu (default: 6)",
        },
        count: {
          type: "number",
          description: "Jumlah dadu yang dilempar (default: 1)",
        },
      },
      required: [],
    },
    handler: async ({
      sides = 6,
      count = 1,
    }: {
      sides?: number;
      count?: number;
    }) => {
      const rolls = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }

      return {
        rolls,
        total: rolls.reduce((sum, roll) => sum + roll, 0),
        sides,
        count,
      };
    },
  },
  {
    name: "random_color",
    description: "Generate warna random dalam format hex",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      const hex = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
      return {
        hex: `#${hex}`,
        rgb: {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
        },
      };
    },
  },
];
