import sqlite3 from 'sqlite3'
import path from 'path'
import type { ChatHistoryRecord, PetStateRecord } from '../../src/types'

export class DatabaseManager {
  private db: sqlite3.Database | null = null
  private userDataPath: string

  constructor(userDataPath: string) {
    this.userDataPath = userDataPath
  }

  async initialize(): Promise<void> {
    const dbPath = path.join(this.userDataPath, 'desktop-fox.db')
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err)
        } else {
          // 啟用 WAL 模式
          this.db?.exec('PRAGMA journal_mode = WAL;', () => {
            this.createTables().then(resolve).catch(reject)
          })
        }
      })
    })
  }

  private async createTables(): Promise<void> {
    if (!this.db) return

    const exec = (sql: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.db?.exec(sql, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }

    // 聊天歷史
    await exec(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `)

    // 寵物狀態
    await exec(`
      CREATE TABLE IF NOT EXISTS pet_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        hunger INTEGER DEFAULT 80,
        mood INTEGER DEFAULT 80,
        energy INTEGER DEFAULT 80,
        last_fed INTEGER DEFAULT (strftime('%s', 'now')),
        last_interaction INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `)

    // 設定
    await exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `)

    // 配額追蹤
    await exec(`
      CREATE TABLE IF NOT EXISTS quota_usage (
        date TEXT PRIMARY KEY,
        used_count INTEGER DEFAULT 0
      )
    `)

    // 插入預設寵物狀態
    await exec(`INSERT OR IGNORE INTO pet_state (id) VALUES (1)`)
  }

  // 聊天歷史操作
  getChatHistory(limit: number = 100): Promise<ChatHistoryRecord[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([])
        return
      }
      
      this.db.all(
        'SELECT * FROM chat_history ORDER BY timestamp DESC LIMIT ?',
        [limit],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows as ChatHistoryRecord[])
        }
      )
    })
  }

  saveMessage(role: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      
      this.db.run(
        'INSERT INTO chat_history (role, content) VALUES (?, ?)',
        [role, content],
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })
  }

  clearChatHistory(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      
      this.db.exec('DELETE FROM chat_history', (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  // 寵物狀態操作
  getPetState(): Promise<PetStateRecord | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null)
        return
      }
      
      this.db.get('SELECT * FROM pet_state WHERE id = 1', (err, row) => {
        if (err) reject(err)
        else resolve(row as PetStateRecord | null)
      })
    })
  }

  updatePetState(updates: Partial<Omit<PetStateRecord, 'id' | 'updated_at'>>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      
      const fields: string[] = []
      const values: any[] = []
      
      for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = ?`)
        values.push(value)
      }
      fields.push('updated_at = strftime("%s", "now")')
      
      this.db.run(
        `UPDATE pet_state SET ${fields.join(', ')} WHERE id = 1`,
        values,
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })
  }

  // 設定操作
  getSetting(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null)
        return
      }
      
      this.db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
        if (err) {
          reject(err)
          return
        }
        
        if (!row) {
          resolve(null)
          return
        }
        
        try {
          resolve(JSON.parse((row as { value: string }).value))
        } catch {
          resolve((row as { value: string }).value)
        }
      })
    })
  }

  setSetting(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)
      
      this.db.run(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, jsonValue],
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })
  }

  getAllSettings(): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({})
        return
      }
      
      this.db.all('SELECT key, value FROM settings', (err, rows) => {
        if (err) {
          reject(err)
          return
        }
        
        const settings: Record<string, any> = {}
        for (const row of rows as { key: string; value: string }[]) {
          try {
            settings[row.key] = JSON.parse(row.value)
          } catch {
            settings[row.key] = row.value
          }
        }
        
        resolve(settings)
      })
    })
  }

  // 配額操作
  getQuotaUsage(date: string): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(0)
        return
      }
      
      this.db.get(
        'SELECT used_count FROM quota_usage WHERE date = ?',
        [date],
        (err, row) => {
          if (err) reject(err)
          else resolve((row as { used_count: number } | undefined)?.used_count || 0)
        }
      )
    })
  }

  incrementQuota(date: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      
      this.db.run(
        `INSERT INTO quota_usage (date, used_count) VALUES (?, 1)
         ON CONFLICT(date) DO UPDATE SET used_count = used_count + 1`,
        [date],
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })
  }

  close(): void {
    this.db?.close((err) => {
      if (err) console.error('Error closing database:', err)
    })
    this.db = null
  }
}
