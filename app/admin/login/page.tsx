"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setStatus("Неверный пароль.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setStatus("Не удалось выполнить вход. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="loginPage">
      <form className="loginCard" onSubmit={handleSubmit}>
        <span className="brandMark" aria-hidden="true">
          <span>VC</span>
        </span>
        <div>
          <p className="eyebrow">вход в админку</p>
          <h1>Valery's Coffee</h1>
          <p>Введите пароль владельца, чтобы открыть управление каталогом.</p>
        </div>
        <label>
          Пароль
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите пароль"
            type="password"
            value={password}
          />
        </label>
        <button className="button primary full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Проверяем..." : "Войти"}
        </button>
        <p className="status" role="status">
          {status}
        </p>
        <Link className="loginBack" href="/">
          Вернуться в магазин
        </Link>
      </form>
    </main>
  );
}
