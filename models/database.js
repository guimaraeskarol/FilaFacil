const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
  constructor() {
    this.db = new sqlite3.Database(
      path.join(__dirname, "../filafacil.db"),
      (err) => {
        if (err) {
          console.error("Erro ao conectar ao banco de dados:", err);
        } else {
          console.log("✅ Banco de dados SQLite conectado");
        }
      }
    );
  }

  initialize() {
    this.db.serialize(() => {
      // Tabela de usuários
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de estabelecimentos
      this.db.run(`
        CREATE TABLE IF NOT EXISTS establishments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          address TEXT NOT NULL,
          city TEXT,
          state TEXT,
          phone TEXT,
          openingHours TEXT,
          closingHours TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `);

      // Tabela de filas
      this.db.run(`
        CREATE TABLE IF NOT EXISTS queues (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          establishmentId INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          maxCapacity INTEGER,
          averageServiceTime INTEGER,
          status TEXT DEFAULT 'active',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (establishmentId) REFERENCES establishments(id)
        )
      `);

      // Tabela de usuários em filas
      this.db.run(`
        CREATE TABLE IF NOT EXISTS queue_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          queueId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          position INTEGER,
          status TEXT DEFAULT 'waiting',
          joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          calledAt DATETIME,
          FOREIGN KEY (queueId) REFERENCES queues(id),
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `);

      // Tabela de histórico de atendimentos
      this.db.run(`
        CREATE TABLE IF NOT EXISTS attendance_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          queueId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          startTime DATETIME,
          endTime DATETIME,
          duration INTEGER,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (queueId) REFERENCES queues(id),
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `);

      console.log("✅ Tabelas do banco de dados criadas com sucesso");
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = Database;
