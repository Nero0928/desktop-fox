import Database from 'better-sqlite3'
import path from 'path'
import type { ChatHistoryRecord, PetStateRecord } from '../../src/types'

export class DatabaseManager {
  private db: Database.Database | null = null
  private userDataPath: string

  constructor(userDataPath: string) {
    this.userDataPath = userDataPath
  }

  async initialize(): Promise<void> {
    const dbPath = path.join(this.userDataPath, 'desktop-fox.db')
    this.db = new Database(dbPath)
    
    // 啟用 WAL 模式以獲得更好效能
    this.db.pragma('journal_mode = WAL')
    
    this.createTables()
  }

  private createTables(): void {
    if (!this.db) return

    // 聊天歷史
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `)

    // 寵物狀態
    this.db.exec(`
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
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `)

    // 配額追蹤
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS quota_usage (
        date TEXT PRIMARY KEY,
        used_count INTEGER DEFAULT 0
      )
    `)

    // 插入預設寵物狀態
    this.db.exec(`
      INSERT OR IGNORE INTO pet_state (id) VALUES (1)
    `)
  }

  // 聊天歷史操作
  getChatHistory(limit: number = 100): ChatHistoryRecord[] {
    if (!this.db) return []
    
    const stmt = this.db.prepare(
      'SELECT * FROM chat_history ORDER BY timestamp DESC LIMIT ?'
    )
    return stmt.all(limit) as ChatHistoryRecord[]
  }

  saveMessage(role: string, content: string): void {
    if (!this.db) return
    
    const stmt = this.db.prepare(
      'INSERT INTO chat_history (role, content) VALUES (?, ?)'
    )
    stmt.run(role, content)
  }

  clearChatHistory(): void {
    if (!this.db) return
    this.db.exec('DELETE FROM chat_history')
  }

  // 寵物狀態操作
  getPetState(): PetStateRecord | null {
    if (!this.db) return null
    
    const stmt = this.db.prepare('SELECT * FROM pet_state WHERE id = 1')
    return stmt.get() as PetStateRecord | null
  }

  updatePetState(updates: Partial<Omit<PetStateRecord, 'id' | 'updated_at'>>): void {
    if (!this.db) return
    
    const fields: string[] = []
    const values: any[] = []
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
    fields.push('updated_at = strftime("%s", "now")')
    
    const stmt = this.db.prepare(
      `UPDATE pet_state SET ${fields.join(', ')} WHERE id = 1`
    )
    stmt.run(...values)
  }

  // 設定操作
  getSetting(key: string): any {
    if (!this.db) return null
    
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?')
    const row = stmt.get(key) as { value: string } | undefined
    
    if (!row) return null
    
    try {
      return JSON.parse(row.value)
    } catch {
      return row.value
    }
  }

  setSetting(key: string, value: any): void {
    if (!this.db) return
    
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)
    const stmt = this.db.prepare(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
    )
    stmt.run(key, jsonValue)
  }

  getAllSettings(): Record<string, any> {
    if (!this.db) return {}
    
    const stmt = this.db.prepare('SELECT key, value FROM settings')
    const rows = stmt.all() as { key: string; value: string }[]
    
    const settings: Record<string, any> = {}
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value)
      } catch {
        settings[row.key] = row.value
      }
    }
    
    return settings
  }

  // 配額操作
  getQuotaUsage(date: string): number {
    if (!this.db) return 0
    
    const stmt = this.db.prepare('SELECT used_count FROM quota_usage WHERE date = ?')
    const row = stmt.get(date) as { used_count: number } | undefined
    
    return row?.used_count || 0
  }

  incrementQuota(date: string): void {
    if (!this.db) return
    
    const stmt = this.db.prepare(`
      INSERT INTO quota_usage (date, used_count) VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET used_count = used_count + 1
    `)
    stmt.run(date)
  }

  close(): void {
    this.db?.close()
    this.db = null
  }
}
