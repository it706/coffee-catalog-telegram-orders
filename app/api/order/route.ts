import { NextResponse } from "next/server";

type OrderItem = {
  name?: string;
  quantity?: number;
  price?: number;
};

type OrderPayload = {
  customerName?: string;
  phone?: string;
  delivery?: string;
  deliveryAddress?: string;
  comment?: string;
  items?: OrderItem[];
  total?: number;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const payload = (await request.json()) as OrderPayload;
  const customerName = payload.customerName?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const delivery = payload.delivery?.trim() ?? "";
  const deliveryAddress = payload.deliveryAddress?.trim() ?? "";
  const comment = payload.comment?.trim() ?? "";
  const items = payload.items ?? [];
  const total = payload.total ?? 0;
  const phoneDigits = phone.replace(/\D/g, "");
  const deliveryDetails =
    delivery === "Самовывоз" ? "Самовывоз, Москва, Лермонтова 51" : `${delivery}, ${deliveryAddress}`;

  if (!customerName || phoneDigits.length !== 11 || !delivery || items.length === 0 || total <= 0) {
    return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
  }

  if (delivery !== "Самовывоз" && !deliveryAddress) {
    return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ message: "Telegram is not configured" }, { status: 500 });
  }

  const orderLines = items
    .map((item) => {
      const quantity = item.quantity ?? 0;
      const price = item.price ?? 0;
      return `• ${escapeHtml(item.name ?? "Товар")} × ${quantity} = ${quantity * price} ₽`;
    })
    .join("\n");

  const submittedAt = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date());
  const orderNumber = `VC-${Date.now().toString().slice(-6)}`;

  const text = [
    `<b>Новый заказ ${orderNumber} с сайта Valery's Coffee</b>`,
    "",
    `<b>Клиент:</b> ${escapeHtml(customerName)}`,
    `<b>Телефон:</b> ${escapeHtml(phone)}`,
    `<b>Получение:</b> ${escapeHtml(deliveryDetails)}`,
    comment ? `<b>Комментарий:</b> ${escapeHtml(comment)}` : "",
    "",
    "<b>Состав заказа:</b>",
    orderLines,
    "",
    `<b>Итого:</b> ${total} ₽`,
    `<b>Дата:</b> ${escapeHtml(submittedAt)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: "HTML",
      text,
    }),
  });

  if (!telegramResponse.ok) {
    return NextResponse.json({ message: "Telegram request failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, orderNumber });
}
