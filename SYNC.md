# 工作區同步說明

## 目錄結構

這個工作區 (>~/.openclaw/workspace<) 與 Desktop Fox 專案共用記憶檔案：

```
~
├── .openclaw/workspace/          # 本地工作區（主要編輯位置）
│   ├── memory/                   # 每日記憶
│   ├── docs/                     # 文檔
│   ├── *.md                      # 設定檔案
│   └── .git/                     # 本地 git（可選使用）
│
└── desktop-fox/                  # 遠端同步位置
    ├── agent/                    # 記憶與設定檔案（同步至此）
    │   ├── memory/
    │   ├── docs/
    │   └── *.md
    ├── assets/                   # 狐狸精靈圖
    ├── src/                      # 遊戲源碼
    └── .git/                     # 連接 GitHub
```

## 同步機制

### 自動同步（已設定）
- **定時提交：** 每小時自動提交本地變更
- **GitHub 推送：** Desktop Fox 倉庫已啟用自動推送

### 手動同步
如果需要在兩個位置之間立即同步：

```bash
# 從工作區複製到 Desktop Fox
cd ~/.openclaw/workspace
rsync -av memory/ ~/desktop-fox/agent/memory/
rsync -av docs/ ~/desktop-fox/agent/docs/
cp *.md ~/desktop-fox/agent/

# 然後在 Desktop Fox 提交
cd ~/desktop-fox
git add agent/
git commit -m "同步記憶更新"
# 會自動推送到 GitHub
```

## GitHub 位置

所有記憶檔案現在位於：
>https://github.com/Nero0928/desktop-fox/tree/main/agent

## 檔案說明

| 檔案 | 用途 |
|------|------|
| SOUL.md | 狐狐的個性設定 |
| IDENTITY.md | 身份資訊 |
| USER.md | 用戶（Nero）資訊 |
| AGENTS.md | 工作區規則 |
| memory/YYYY-MM-DD.md | 每日記憶日誌 |

---

*設定時間：2026-02-24*
