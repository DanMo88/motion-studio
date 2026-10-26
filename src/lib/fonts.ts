import { loadFont as loadVazirmatn } from "@remotion/google-fonts/Vazirmatn";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// Vazirmatn (SIL OFL) covers Persian/Arabic + Latin; Inter for Latin UI text.
export const vazirmatn = loadVazirmatn("normal", {
  weights: ["400", "700", "900"],
  subsets: ["arabic", "latin"],
});
export const inter = loadInter("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

const RTL_RE = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

/** True when the text contains Persian/Arabic/Hebrew characters. */
export const isRtl = (text: string) => RTL_RE.test(text);

/** Pick a font + direction automatically from the text. */
export const fontFor = (text: string) =>
  isRtl(text)
    ? { fontFamily: vazirmatn.fontFamily, direction: "rtl" as const }
    : { fontFamily: `${inter.fontFamily}, ${vazirmatn.fontFamily}`, direction: "ltr" as const };
