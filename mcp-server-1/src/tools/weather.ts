import { fetchWeatherApi } from "openmeteo";
import { WeatherApiResponse } from "@openmeteo/sdk/weather-api-response";

import type { Tool } from "../../../types/tool";

const parameters = [
  "temperature_2m",
  "relative_humidity_2m",
  "rain",
  "wind_speed_10m",
  "wind_direction_10m",
  "soil_temperature_0cm",
  "soil_moisture_0_to_1cm",
];

const url = "https://api.open-meteo.com/v1/forecast";

export const weatherTools: Tool[] = [
  {
    name: "getWeather",
    description: "Ambil cuaca berdasarkan kota",
    parameters: {
      type: "object",
      properties: {
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      required: ["latitude", "longitude"],
    },
    handler: async ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) => {
      const params = {
        latitude,
        longitude,
        hourly: parameters,
        timezone: "auto",
      };
      const responses = await fetchWeatherApi(url, params);
      if (!responses) throw new Error("Failed to fetch weather");

      // Process first location. Add a for-loop for multiple locations or weather models
      const response = responses[0] as WeatherApiResponse;

      // Attributes for timezone and location
      const elevation = response.elevation();
      const timezone = response.timezone();
      const timezoneAbbreviation = response.timezoneAbbreviation();
      const utcOffsetSeconds = response.utcOffsetSeconds();

      const hourly = response.hourly()!;

      // Note: The order of weather variables in the URL query and the indices below need to match!
      const weatherData = {
        hourly: {
          time: Array.from(
            {
              length:
                (Number(hourly.timeEnd()) - Number(hourly.time())) /
                hourly.interval(),
            },
            (_, i) =>
              new Date(
                (Number(hourly.time()) +
                  i * hourly.interval() +
                  utcOffsetSeconds) *
                  1000,
              ),
          ),
          temperature_2m: hourly.variables(0)!.valuesArray(),
          relative_humidity_2m: hourly.variables(1)!.valuesArray(),
          rain: hourly.variables(2)!.valuesArray(),
          wind_speed_10m: hourly.variables(3)!.valuesArray(),
          wind_direction_10m: hourly.variables(4)!.valuesArray(),
          soil_temperature_0cm: hourly.variables(5)!.valuesArray(),
          soil_moisture_0_to_1cm: hourly.variables(6)!.valuesArray(),
        },
      };

      console.log(`✅ MCP1 Weather: ${latitude}, ${longitude}`);
      return {
        latitude,
        longitude,
        elevation,
        timezone,
        timezoneAbbreviation,
        utcOffsetSeconds,
        weatherData,
      };
    },
  },
];
