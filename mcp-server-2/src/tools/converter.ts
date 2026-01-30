import type { Tool } from "../../../types/tool";

export const converterTools: Tool[] = [
  {
    name: "celsius_to_fahrenheit",
    description: "Mengkonversi suhu dari Celsius ke Fahrenheit",
    parameters: {
      type: "object",
      properties: {
        celsius: { type: "number", description: "Suhu dalam Celsius" },
      },
      required: ["celsius"],
    },
    handler: async ({ celsius }: { celsius: number }) => {
      const fahrenheit = (celsius * 9) / 5 + 32;
      return {
        celsius,
        fahrenheit,
        kelvin: celsius + 273.15,
      };
    },
  },
  {
    name: "fahrenheit_to_celsius",
    description: "Mengkonversi suhu dari Fahrenheit ke Celsius",
    parameters: {
      type: "object",
      properties: {
        fahrenheit: { type: "number", description: "Suhu dalam Fahrenheit" },
      },
      required: ["fahrenheit"],
    },
    handler: async ({ fahrenheit }: { fahrenheit: number }) => {
      const celsius = ((fahrenheit - 32) * 5) / 9;
      return {
        fahrenheit,
        celsius,
        kelvin: celsius + 273.15,
      };
    },
  },
  {
    name: "km_to_miles",
    description: "Mengkonversi jarak dari kilometer ke mil",
    parameters: {
      type: "object",
      properties: {
        km: { type: "number", description: "Jarak dalam kilometer" },
      },
      required: ["km"],
    },
    handler: async ({ km }: { km: number }) => {
      return {
        km,
        miles: km * 0.621371,
        meters: km * 1000,
        feet: km * 3280.84,
      };
    },
  },
  {
    name: "miles_to_km",
    description: "Mengkonversi jarak dari mil ke kilometer",
    parameters: {
      type: "object",
      properties: {
        miles: { type: "number", description: "Jarak dalam mil" },
      },
      required: ["miles"],
    },
    handler: async ({ miles }: { miles: number }) => {
      return {
        miles,
        km: miles * 1.60934,
        meters: miles * 1609.34,
        feet: miles * 5280,
      };
    },
  },
  {
    name: "kg_to_pounds",
    description: "Mengkonversi berat dari kilogram ke pound",
    parameters: {
      type: "object",
      properties: {
        kg: { type: "number", description: "Berat dalam kilogram" },
      },
      required: ["kg"],
    },
    handler: async ({ kg }: { kg: number }) => {
      return {
        kg,
        pounds: kg * 2.20462,
        grams: kg * 1000,
        ounces: kg * 35.274,
      };
    },
  },
  {
    name: "pounds_to_kg",
    description: "Mengkonversi berat dari pound ke kilogram",
    parameters: {
      type: "object",
      properties: {
        pounds: { type: "number", description: "Berat dalam pound" },
      },
      required: ["pounds"],
    },
    handler: async ({ pounds }: { pounds: number }) => {
      return {
        pounds,
        kg: pounds * 0.453592,
        grams: pounds * 453.592,
        ounces: pounds * 16,
      };
    },
  },
];
