"use client";

import { FormEvent, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: "Зерно" | "Дрип-пакеты" | "Аксессуары";
  price: number;
  note: string;
  roast: string;
  imagePosition: string;
};

type Cart = Record<number, number>;

const products: Product[] = [
  {
    id: 1,
    name: "Эфиопия Сидамо",
    category: "Зерно",
    price: 1190,
    note: "Жасмин, абрикос, легкая чайность",
    roast: "светлая обжарка",
    imagePosition: "0% 0%",
  },
  {
    id: 2,
    name: "Бразилия Серрадо",
    category: "Зерно",
    price: 890,
    note: "Шоколад, орех, плотное тело",
    roast: "средняя обжарка",
    imagePosition: "33.333% 0%",
  },
  {
    id: 3,
    name: "Колумбия Уила",
    category: "Зерно",
    price: 1090,
    note: "Красное яблоко, карамель, какао",
    roast: "средняя обжарка",
    imagePosition: "66.666% 0%",
  },
  {
    id: 4,
    name: "Дрип-бокс Weekend",
    category: "Дрип-пакеты",
    price: 790,
    note: "6 порций для поездок и офиса",
    roast: "фильтр",
    imagePosition: "100% 0%",
  },
  {
    id: 5,
    name: "Дрип-бокс Discovery",
    category: "Дрип-пакеты",
    price: 990,
    note: "Набор из 8 разных вкусов",
    roast: "ассорти",
    imagePosition: "0% 100%",
  },
  {
    id: 6,
    name: "V60 Ceramic",
    category: "Аксессуары",
    price: 1790,
    note: "Керамическая воронка для фильтр-кофе",
    roast: "для дома",
    imagePosition: "33.333% 100%",
  },
  {
    id: 7,
    name: "Фильтры V60",
    category: "Аксессуары",
    price: 590,
    note: "100 бумажных фильтров",
    roast: "расходники",
    imagePosition: "66.666% 100%",
  },
  {
    id: 8,
    name: "Термокружка Valery's",
    category: "Аксессуары",
    price: 2190,
    note: "Стальная кружка 360 мл",
    roast: "to go",
    imagePosition: "100% 100%",
  },
];

const categories = ["Все", "Зерно", "Дрип-пакеты", "Аксессуары"] as const;
const pickupAddress = "Москва, Лермонтова 51";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
  const parts = normalized.match(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);

  if (!parts) return digits;

  const [, country, code, first, second, third] = parts;
  let result = country ? `+${country}` : "";

  if (code) result += ` ${code}`;
  if (first) result += ` ${first}`;
  if (second) result += `-${second}`;
  if (third) result += `-${third}`;

  return result;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("Все");
  const [cart, setCart] = useState<Cart>({});
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState("Самовывоз");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Все") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const cartItems = useMemo(() => {
    return products
      .filter((product) => cart[product.id])
      .map((product) => ({
        ...product,
        quantity: cart[product.id],
      }));
  }, [cart]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const phoneDigits = phone.replace(/\D/g, "");

  function addToCart(productId: number) {
    setCart((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));
    setRecentlyAddedId(productId);
    window.setTimeout(() => setRecentlyAddedId((current) => (current === productId ? null : current)), 1100);
  }

  function changeQuantity(productId: number, delta: number) {
    setCart((current) => {
      const nextQuantity = (current[productId] ?? 0) + delta;
      const nextCart = { ...current };

      if (nextQuantity <= 0) {
        delete nextCart[productId];
      } else {
        nextCart[productId] = nextQuantity;
      }

      return nextCart;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (cartItems.length === 0) {
      setStatus("Добавьте хотя бы один товар в заказ.");
      return;
    }

    if (!customerName.trim()) {
      setStatus("Введите имя.");
      return;
    }

    if (phoneDigits.length !== 11) {
      setStatus("Телефон должен содержать ровно 11 цифр.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone,
          delivery,
          comment,
          total,
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Order request failed");
      }

      setStatus("Заказ отправлен. Администратор свяжется для подтверждения.");
      setCart({});
      setCustomerName("");
      setPhone("");
      setDelivery("Самовывоз");
      setComment("");
    } catch {
      setStatus("Не удалось отправить заказ. Попробуйте еще раз или напишите нам.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Valery's Coffee">
          <span className="brandMark" aria-hidden="true">
            <span>VC</span>
          </span>
          <span className="brandText">
            <strong>Valery's</strong>
            <small>Coffee</small>
          </span>
        </a>
        <nav aria-label="Навигация">
          <a href="#catalog">Каталог</a>
          <a href="#cart">Заказ</a>
        </nav>
        <a className="contact" href="tel:+79990000000">
          +7 999 000-00-00
        </a>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">кофе для дома и офиса</p>
          <h1>Интернет-магазин премиального кофе для дома и офиса</h1>
          <p>
            Выберите зерно, дрип-пакеты или аксессуары, соберите корзину и оформите заказ за пару
            минут. Мы подтвердим детали и подготовим кофе к получению.
          </p>
          <a className="button primary" href="#catalog">
            Выбрать кофе
          </a>
        </div>
        <aside className="heroCard">
          <span>Хит недели</span>
          <strong>Эфиопия Сидамо</strong>
          <p>Светлая обжарка с нотами жасмина и абрикоса.</p>
          <button className="button ghost" onClick={() => addToCart(1)} type="button">
            В корзину
          </button>
        </aside>
      </section>

      <section className="catalog" id="catalog">
        <div className="catalogHead">
          <div>
            <p className="eyebrow">каталог</p>
            <h2>Выберите категорию</h2>
          </div>
          <div className="filters" aria-label="Фильтр товаров">
            {categories.map((category) => (
              <button
                className={activeCategory === category ? "active" : ""}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="productGrid">
          {filteredProducts.map((product) => (
            <article className={recentlyAddedId === product.id ? "productCard added" : "productCard"} key={product.id}>
              <div
                className="productPhoto"
                style={{
                  backgroundImage: "url('/product-sprite.png')",
                  backgroundPosition: product.imagePosition,
                }}
              >
                <span>{product.category}</span>
              </div>
              <div className="productInfo">
                <h3>{product.name}</h3>
                <p>{product.note}</p>
                <small>{product.roast}</small>
              </div>
              <div className="productActions">
                <strong>{product.price} ₽</strong>
                {cart[product.id] ? (
                  <div className="productStepper" aria-label={`Количество товара ${product.name}`}>
                    <button onClick={() => changeQuantity(product.id, -1)} type="button">
                      -
                    </button>
                    <button className="addedButton" onClick={() => addToCart(product.id)} type="button">
                      Добавлено · {cart[product.id]} шт
                    </button>
                    <button onClick={() => changeQuantity(product.id, 1)} type="button">
                      +
                    </button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(product.id)} type="button">
                    Добавить
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="order" id="cart">
        <div className="cartPanel">
          <p className="eyebrow">корзина</p>
          <h2>Ваш заказ</h2>
          {cartItems.length === 0 ? (
            <p className="empty">Корзина пока пустая. Добавьте кофе или аксессуары из каталога.</p>
          ) : (
            <div className="cartList">
              {cartItems.map((item) => (
                <div className="cartItem" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.price} ₽ за шт.</span>
                  </div>
                  <div className="quantity">
                    <button onClick={() => changeQuantity(item.id, -1)} type="button">
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQuantity(item.id, 1)} type="button">
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="total">
            <span>Итого</span>
            <strong>{total} ₽</strong>
          </div>
        </div>

        <form className="orderForm" onSubmit={handleSubmit}>
          <label>
            Имя
            <input onChange={(event) => setCustomerName(event.target.value)} placeholder="Иван" value={customerName} />
          </label>
          <label>
            Телефон
            <input
              inputMode="tel"
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              placeholder="+7 999 000-00-00"
              type="tel"
              value={phone}
            />
          </label>
          <label>
            Получение
            <select onChange={(event) => setDelivery(event.target.value)} value={delivery}>
              <option>Самовывоз</option>
              <option>Доставка по городу</option>
              <option>Доставка СДЭК</option>
            </select>
            {delivery === "Самовывоз" ? <small className="pickupAddress">Адрес: {pickupAddress}</small> : null}
          </label>
          <label>
            Комментарий
            <textarea
              onChange={(event) => setComment(event.target.value)}
              placeholder="Например: помолоть под фильтр"
              value={comment}
            />
          </label>
          <button className="button primary full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Отправляем..." : "Отправить заказ"}
          </button>
          <p className="status" role="status">
            {status}
          </p>
        </form>
      </section>
    </main>
  );
}
