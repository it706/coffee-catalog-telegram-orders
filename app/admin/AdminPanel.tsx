"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { categories, defaultProducts, productStorageKey, type Product } from "../data/products";

const editableCategories = categories.filter((category) => category !== "Все") as Product["category"][];
const imagePositions = ["0% 0%", "33.333% 0%", "66.666% 0%", "100% 0%", "0% 100%", "33.333% 100%", "66.666% 100%", "100% 100%"];

function createProduct(products: Product[]): Product {
  return {
    id: Math.max(0, ...products.map((product) => product.id)) + 1,
    name: "Новый товар",
    category: "Зерно",
    price: 990,
    note: "Короткое продающее описание",
    roast: "средняя обжарка",
    origin: "страна / материал",
    weight: "250 г",
    brew: "способ приготовления",
    imagePosition: "0% 0%",
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [selectedId, setSelectedId] = useState(defaultProducts[0].id);
  const [status, setStatus] = useState("");

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedId) ?? products[0];
  }, [products, selectedId]);

  useEffect(() => {
    const savedProducts = window.localStorage.getItem(productStorageKey);

    if (!savedProducts) return;

    try {
      const parsedProducts = JSON.parse(savedProducts) as Product[];
      if (parsedProducts.length > 0) {
        setProducts(parsedProducts);
        setSelectedId(parsedProducts[0].id);
      }
    } catch {
      window.localStorage.removeItem(productStorageKey);
    }
  }, []);

  function saveProducts(nextProducts: Product[], message = "Каталог сохранен. Обновите магазин, чтобы увидеть изменения.") {
    setProducts(nextProducts);
    window.localStorage.setItem(productStorageKey, JSON.stringify(nextProducts));
    setStatus(message);
  }

  function updateSelectedProduct(field: keyof Product, value: Product[keyof Product]) {
    saveProducts(
      products.map((product) => (product.id === selectedProduct.id ? { ...product, [field]: value } : product)),
      "Изменение сохранено в браузере.",
    );
  }

  function handleTextChange(field: keyof Product) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      updateSelectedProduct(field, field === "price" ? Number(event.target.value) : event.target.value);
    };
  }

  function addProduct() {
    const newProduct = createProduct(products);
    saveProducts([...products, newProduct], "Новый товар добавлен.");
    setSelectedId(newProduct.id);
  }

  function deleteProduct() {
    if (products.length === 1) {
      setStatus("Нельзя удалить последний товар.");
      return;
    }

    const nextProducts = products.filter((product) => product.id !== selectedProduct.id);
    saveProducts(nextProducts, "Товар удален.");
    setSelectedId(nextProducts[0].id);
  }

  function resetProducts() {
    saveProducts(defaultProducts, "Каталог сброшен к стартовой версии.");
    setSelectedId(defaultProducts[0].id);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProducts(products);
  }

  async function handleLogout() {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (!selectedProduct) return null;

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <p className="eyebrow">админка магазина</p>
          <h1>Управление каталогом Valery's Coffee</h1>
          <p>Меняйте товары, цены и описания. Данные сохраняются в этом браузере и сразу доступны витрине.</p>
        </div>
        <div className="adminHeaderActions">
          <Link className="button primary" href="/">
            Вернуться в магазин
          </Link>
          <button onClick={handleLogout} type="button">
            Выйти
          </button>
        </div>
      </header>

      <section className="adminNotice">
        Это демо-админка для портфолио: она работает без базы данных через localStorage. Для реального клиента следующий шаг - подключить базу данных и вход по паролю.
      </section>

      <section className="adminLayout">
        <aside className="adminList" aria-label="Товары">
          <div className="adminListHead">
            <strong>Товары</strong>
            <button onClick={addProduct} type="button">
              Добавить
            </button>
          </div>
          {products.map((product) => (
            <button
              className={product.id === selectedProduct.id ? "adminItem active" : "adminItem"}
              key={product.id}
              onClick={() => setSelectedId(product.id)}
              type="button"
            >
              <span>{product.name}</span>
              <small>{product.price} ₽</small>
            </button>
          ))}
        </aside>

        <form className="adminEditor" onSubmit={handleSubmit}>
          <div className="adminPreview">
            <div
              className="productPhoto"
              style={{
                backgroundImage: "url('/product-sprite.png')",
                backgroundPosition: selectedProduct.imagePosition,
              }}
            >
              <span>{selectedProduct.category}</span>
            </div>
            <div>
              <p className="eyebrow">превью товара</p>
              <h2>{selectedProduct.name}</h2>
              <p>{selectedProduct.note}</p>
              <strong>{selectedProduct.price} ₽</strong>
            </div>
          </div>

          <div className="adminForm">
            <label>
              Название
              <input onChange={handleTextChange("name")} value={selectedProduct.name} />
            </label>
            <label>
              Категория
              <select onChange={handleTextChange("category")} value={selectedProduct.category}>
                {editableCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Цена
              <input min="0" onChange={handleTextChange("price")} type="number" value={selectedProduct.price} />
            </label>
            <label>
              Фото
              <select onChange={handleTextChange("imagePosition")} value={selectedProduct.imagePosition}>
                {imagePositions.map((position, index) => (
                  <option key={position} value={position}>
                    Фото {index + 1}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide">
              Описание
              <textarea onChange={handleTextChange("note")} value={selectedProduct.note} />
            </label>
            <label>
              Обжарка / тип
              <input onChange={handleTextChange("roast")} value={selectedProduct.roast} />
            </label>
            <label>
              Страна / материал
              <input onChange={handleTextChange("origin")} value={selectedProduct.origin} />
            </label>
            <label>
              Вес / размер
              <input onChange={handleTextChange("weight")} value={selectedProduct.weight} />
            </label>
            <label>
              Способ
              <input onChange={handleTextChange("brew")} value={selectedProduct.brew} />
            </label>
          </div>

          <div className="adminActions">
            <button className="button primary" type="submit">
              Сохранить товар
            </button>
            <button onClick={deleteProduct} type="button">
              Удалить товар
            </button>
            <button onClick={resetProducts} type="button">
              Сбросить каталог
            </button>
          </div>

          <p className="status" role="status">
            {status}
          </p>
        </form>
      </section>
    </main>
  );
}
