# Chinese Poetry Web Interface

这是一个基于 `chinese-poetry` 仓库 JSON 数据的轻量搜索页面，支持：

- 按类别 / 朝代快速选择
- 模糊搜索作者
- 诗句、标题或内容全文搜索

## 使用方式

1. 进入仓库根目录
2. 启动本地静态服务器

```bash
cd /workspaces/chinese-poetry
python3 -m http.server 8000
```

3. 在浏览器打开 `http://localhost:8000/web/index.html`

> 注意：不要直接打开本地文件路径 `file://.../web/index.html`，必须通过 HTTP 服务器访问，才能正常加载 JSON 数据。
## 目录结构

- `index.html`：主页面
- `styles.css`：页面样式
- `app.js`：搜索逻辑
- `poetry-manifest.json`：数据目录清单

## 说明

页面会根据 `web/poetry-manifest.json` 中的类别加载对应 JSON 文件并进行查询。

由于数据文件较大，首次搜索可能需要几秒钟，请耐心等待。
