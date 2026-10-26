import { z } from "zod";

export const themeSchema = z.object({
  background: z.string().default("#0b1020"),
  foreground: z.string().default("#f5f7ff"),
  accent: z.string().default("#7c5cff"),
  accent2: z.string().default("#21d4fd"),
});
export type Theme = z.infer<typeof themeSchema>;

export const defaultTheme: Theme = {
  background: "#0b1020",
  foreground: "#f5f7ff",
  accent: "#7c5cff",
  accent2: "#21d4fd",
};

export const palette = ["#7c5cff", "#21d4fd", "#ff5c8a", "#ffc75c", "#3ddc97", "#ff8a3d"];
