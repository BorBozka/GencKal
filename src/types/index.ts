import { z } from "zod";

export const generatedPlanSchema = z.object({
    macros: z.object({
        protein: z.number(),
        fat: z.number(),
        carb: z.number(),
    }),
    meals: z.array(
        z.object({
            title: z.string(),
            items: z.array(
                z.object({
                    name: z.string(),
                    cal: z.number(),
                    fullText: z.string(),
                    macros: z.object({
                        protein: z.number(),
                        fat: z.number(),
                        carb: z.number(),
                    }),
                })
            ),
        })
    ),
});

export type Cinsiyet = "erkek" | "kadın";

export type AktiviteSeviyesi =
    | "hareketsiz (ofis işi)"
    | "hafif egzersiz (haftada 1-2 gün)"
    | "orta düzey egzersiz (haftada 3-5 gün)"
    | "yoğun egzersiz (haftada 6-7 gün)"
    | "atlet (günde 2 kez egzersiz)";

export type Hedef = "kilo_al" | "kilo_koruma" | "kilo_ver";

export type DiyetTipi = "standart" | "karnivor" | "vejetaryen" | "vegan" | "keto";

export interface FizikselVeriler {
    boy: number;
    kilo: number;
    yas: number;
    cinsiyet: Cinsiyet;
    yagOrani: number;
    aktiviteSeviyesi: AktiviteSeviyesi;
    agirlikCalisiyorMu: boolean;
}

export interface MealItem {
    name: string;
    cal: number;
    fullText: string;
    macros?: MacroDistribution;
}

export interface MealCard {
    title: string;
    items: MealItem[];
}

export interface MacroDistribution {
    protein: number;
    fat: number;
    carb: number;
}

export interface DiyetVerileri {
    diyetTipi: DiyetTipi;
    ogunSayisi: number;
    alerjenler: string[];
    kullanilanTakviyeler: string[];
    hedef: Hedef;
}

export interface KullaniciProfil {
    fizikselVeriler: FizikselVeriler;
    diyetVerileri: DiyetVerileri;
}