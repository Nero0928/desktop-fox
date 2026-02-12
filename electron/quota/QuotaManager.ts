import type { DatabaseManager } from '../database/DatabaseManager'

const FREE_QUOTA_PER_DAY = 10

export class QuotaManager {
  private db: DatabaseManager

  constructor(db: DatabaseManager) {
    this.db = db
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0]
  }

  async canUseAI(): Promise<boolean> {
    // TODO: 檢查是否有 Pro DLC
    // 暫時只檢查免費配額
    const today = this.getTodayDate()
    const used = this.db.getQuotaUsage(today)
    
    return used < FREE_QUOTA_PER_DAY
  }

  async useAI(): Promise<void> {
    const today = this.getTodayDate()
    this.db.incrementQuota(today)
  }

  async getStatus(): Promise<{
    usedToday: number
    maxFree: number
    hasPro: boolean
  }> {
    const today = this.getTodayDate()
    const usedToday = this.db.getQuotaUsage(today)
    
    // TODO: 從 Steam 檢查 Pro DLC
    const hasPro = false
    
    return {
      usedToday,
      maxFree: FREE_QUOTA_PER_DAY,
      hasPro
    }
  }
}
