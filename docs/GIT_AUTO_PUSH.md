# Git 自動推送設定

## 設定概述

已為以下倉庫設置自動推送到 GitHub：

### 1. Desktop Fox 專案
- **路徑：** `/home/nero/.openclaw/workspace/desktop-fox`
- **遠端：** `https://github.com/Nero0928/desktop-fox.git`

**自動推送機制：**
1. **post-commit hook** - 每次提交後立即推送
2. **Cron 定時檢查** - 每 30 分鐘檢查是否有未推送的提交

### 2. 主工作區（記憶/設定）
- **路徑：** `/home/nero/.openclaw/workspace`
- **遠端：** 你的個人倉庫

**自動推送機制：**
- **Cron 定時檢查** - 每 1 小時檢查並推送

---

## 機制詳情

### post-commit Hook
檔案位置：`.git/hooks/post-commit`

功能：
- 每次 `git commit` 後自動執行
- 立即推送到 origin main
- 顯示推送成功/失敗訊息

### Cron 定時任務

**Desktop Fox 推送任務：**
- 頻率：每 30 分鐘
- 檢查：是否有未推送的提交 (`git log origin/main..HEAD`)
- 動作：如有則推送，無則跳過

**主工作區推送任務：**
- 頻率：每 1 小時
- 檢查：同上
- 動作：如有則推送

---

## 手動操作

如果需要手動推送：

```bash
# Desktop Fox
cd /home/nero/.openclaw/workspace/desktop-fox
git push origin main

# 主工作區
cd /home/nero/.openclaw/workspace
git push origin main
```

---

## 故障排除

### 推送失敗常見原因

1. **權限問題**
   - 檢查 GitHub 帳號是否有寫入權限
   - 確認使用了正確的認證方式（HTTPS Token 或 SSH Key）

2. **網路問題**
   - 檢查是否能連接 github.com
   - 如需代理，設定 `git config --global http.proxy`

3. **衝突問題**
   - 如果遠端有更新而本地沒有同步
   - 需要手動執行 `git pull` 後再推送

### 檢查自動推送狀態

```bash
# 查看 cron 任務列表
openclaw cron list

# 查看是否有未推送的提交
cd /path/to/repo
git status
```

---

## 安全性注意事項

⚠️ **GitHub 認證方式：**

使用 HTTPS 時，需要確保：
- 已配置 Git Credential Manager，或
- 使用 Personal Access Token（推薦）
- 或使用 SSH Key（更安全）

如果使用 SSH：
```bash
git remote set-url origin git@github.com:Nero0928/desktop-fox.git
```

---

*設定時間：2026-02-24*
