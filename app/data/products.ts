export type Product = {
  id: number;
  name: string;
  category: "Зерно" | "Дрип-пакеты" | "Аксессуары";
  price: number;
  note: string;
  roast: string;
  origin: string;
  weight: string;
  brew: string;
  imagePosition: string;
  isPublished: boolean;
};

export const categories = ["Все", "Зерно", "Дрип-пакеты", "Аксессуары"] as const;
export const productStorageKey = "valerys-coffee-products";

export function normalizeProducts(products: Product[]) {
  return products.map((product) => ({
    ...product,
    isPublished: product.isPublished ?? true,
  }));
}

export const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Эфиопия Сидамо",
    category: "Зерно",
    price: 1190,
    note: "Жасмин, абрикос, легкая чайность",
    roast: "светлая обжарка",
    origin: "Эфиопия",
    weight: "250 г",
    brew: "фильтр / V60",
    imagePosition: "0% 0%",
    isPublished: true,
  },
  {
    id: 2,
    name: "Бразилия Серрадо",
    category: "Зерно",
    price: 890,
    note: "Шоколад, орех, плотное тело",
    roast: "средняя обжарка",
    origin: "Бразилия",
    weight: "250 г",
    brew: "эспрессо / турка",
    imagePosition: "33.333% 0%",
    isPublished: true,
  },
  {
    id: 3,
    name: "Колумбия Уила",
    category: "Зерно",
    price: 1090,
    note: "Красное яблоко, карамель, какао",
    roast: "средняя обжарка",
    origin: "Колумбия",
    weight: "250 г",
    brew: "фильтр / эспрессо",
    imagePosition: "66.666% 0%",
    isPublished: true,
  },
  {
    id: 4,
    name: "Дрип-бокс Weekend",
    category: "Дрип-пакеты",
    price: 790,
    note: "6 порций для поездок и офиса",
    roast: "фильтр",
    origin: "ассорти",
    weight: "6 шт",
    brew: "просто добавить воду",
    imagePosition: "100% 0%",
    isPublished: true,
  },
  {
    id: 5,
    name: "Дрип-бокс Discovery",
    category: "Дрип-пакеты",
    price: 990,
    note: "Набор из 8 разных вкусов",
    roast: "ассорти",
    origin: "ассорти",
    weight: "8 шт",
    brew: "дрип-пакеты",
    imagePosition: "0% 100%",
    isPublished: true,
  },
  {
    id: 6,
    name: "V60 Ceramic",
    category: "Аксессуары",
    price: 1790,
    note: "Керамическая воронка для фильтр-кофе",
    roast: "для дома",
    origin: "керамика",
    weight: "размер 02",
    brew: "V60",
    imagePosition: "33.333% 100%",
    isPublished: true,
  },
  {
    id: 7,
    name: "Фильтры V60",
    category: "Аксессуары",
    price: 590,
    note: "100 бумажных фильтров",
    roast: "расходники",
    origin: "бумага",
    weight: "100 шт",
    brew: "V60 02",
    imagePosition: "66.666% 100%",
    isPublished: true,
  },
  {
    id: 8,
    name: "Термокружка Valery's",
    category: "Аксессуары",
    price: 2190,
    note: "Стальная кружка 360 мл",
    roast: "to go",
    origin: "сталь",
    weight: "360 мл",
    brew: "напитки с собой",
    imagePosition: "100% 100%",
    isPublished: true,
  },
];
