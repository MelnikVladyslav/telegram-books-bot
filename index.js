process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import TelegramBot from "node-telegram-bot-api";
import { findBooks, getById } from "./db.js";

const TOKEN = "8960622413:AAFua40MijcmycuXRBoybnuoWHwoWRNeAOk";
const bot = new TelegramBot(TOKEN, { polling: true });

function formatBook(b) {
  return `📖 *${b.title}*\nАвтор: ${b.author}\nРік: ${b.year || "—"}\nЖанр: ${b.genre || "—"}`;
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Привіт. Я шукаю книги в базі.\n\nКоманди:\n/search — пошук\n/help — підказка"
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Приклади:

/search автор:Шевченко
/search жанр:проза
/search рік:1968

Можна комбінувати параметри.`
  );
});

bot.onText(/\/search(?:\s+(.+))?/, (msg, match) => {
  const query = (match[1] || "").trim();

  if (!query) {
    bot.sendMessage(msg.chat.id, "Напиши що шукати. Див. /help");
    return;
  }

  const params = {};
  const parts = query.split(/\s+/);
  const free = [];

  for (const p of parts) {
    if (p.startsWith("автор:")) params.author = p.slice(6);
    else if (p.startsWith("жанр:")) params.genre = p.slice(5);
    else if (p.startsWith("рік:")) params.year = p.slice(4);
    else free.push(p);
  }

  if (free.length) params.title = free.join(" ");

  const rows = findBooks(params);

  if (!rows.length) {
    bot.sendMessage(msg.chat.id, "Нічого не знайшов.");
    return;
  }

  const text = rows.map(formatBook).join("\n\n");
  bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
});

bot.onText(/\/book (\d+)/, (msg, match) => {
  const book = getById(match[1]);
  if (!book) {
    bot.sendMessage(msg.chat.id, "Немає такої книги.");
    return;
  }
  bot.sendMessage(msg.chat.id, formatBook(book), { parse_mode: "Markdown" });
});

console.log("бот запущений");