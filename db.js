import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.join(__dirname, "books.db"));

const schema = fs.readFileSync(path.join(__dirname, "sql", "schema.sql"), "utf8");
db.exec(schema);

export function findBooks({ title, author, genre, year } = {}) {
  let sql = "SELECT * FROM books WHERE 1=1";
  const params = [];

  if (title) {
    sql += " AND title LIKE ?";
    params.push(`%${title}%`);
  }
  if (author) {
    sql += " AND author LIKE ?";
    params.push(`%${author}%`);
  }
  if (genre) {
    sql += " AND genre LIKE ?";
    params.push(`%${genre}%`);
  }
  if (year) {
    sql += " AND year = ?";
    params.push(Number(year));
  }

  sql += " ORDER BY year DESC LIMIT 15";
  return db.prepare(sql).all(...params);
}

export function getById(id) {
  return db.prepare("SELECT * FROM books WHERE id = ?").get(Number(id));
}

export default db;