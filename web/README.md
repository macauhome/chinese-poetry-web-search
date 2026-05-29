# Chinese Poetry Web Interface

這是一個基於 `chinese-poetry` 倉庫 JSON 數據的輕量搜索頁面，支持：

- 按類別 / 朝代快速選擇
- 模糊搜索作者
- 詩句、標題或內容全文搜索

## 使用方式

1. 進入倉庫根目錄
2. 啓動本地靜態服務器

```bash
cd /workspaces/chinese-poetry
python3 -m http.server 8000
```

3. 在瀏覽器打開 `http://localhost:8000/web/index.html`

> 注意：不要直接打開本地文件路徑 `file://.../web/index.html`，必須通過 HTTP 服務器訪問，才能正常加載 JSON 數據。
## 目錄結構

- `index.html`：主頁面
- `styles.css`：頁面樣式
- `app.js`：搜索邏輯
- `poetry-manifest.json`：數據目錄清單

## 說明

頁面會根據 `web/poetry-manifest.json` 中的類別加載對應 JSON 文件並進行查詢。

由於數據文件較大，首次搜索可能需要幾秒鐘，請耐心等待。
