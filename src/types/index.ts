export type Cinsiyet = "erkek" | "kadın";

export type AktiviteSeviyesi =
    | "hareketsiz (ofis işi)"
    | "hafif egzersiz (haftada 1-2 gün)"
    | "orta düzey egzersiz (haftada 3-5 gün)"
    | "yoğun egzersiz (haftada 6-7 gün)"
    | "atlet (günde 2 kez egzersiz)";

export type Hedef = "kilo_al" | "kilo_koruma" | "kilo_ver";

export interface FizikselVeriler {
    boy: number;
    kilo: number;
    yas: number;
    cinsiyet: Cinsiyet;
    yagOrani: number;
    aktiviteSeviyesi: AktiviteSeviyesi;
    agirlikCalisiyorMu: boolean;
}

export interface DietPreferencesData {
    mealsPerDay: number;
    dietType: string;
    allergies?: string;
}

export interface MealItem {
    name: string;
    cal: string;
    fullText: string;
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