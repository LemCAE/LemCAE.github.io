# LemCAE.github.io

个人主页与前端小网页实验田（纯静态 HTML / CSS / JS，无构建步骤，无外部 CDN 依赖）。

## 目录说明

- `index.html` / `about/` / `assets/`：极简 Bento 网格主页、关于页与深浅色主题切换
- `notes/`：与主页同风格的 Markdown 笔记列表页（`notes/index.html`）、阅读器（`notes/view.html`）与文章源文件（`notes/posts/*.md`）
- `data/projects.json`：首页与笔记页共享的数据清单
- `C-ppt/`：C 语言知识点复习交互式 Web 课件
- `knowledge/`：中国近现代史纲要复习台、党课题库复习台等交互式学习网页

## 如何添加新的小网页

1. 在仓库根目录新建一个文件夹（例如 `toys/pixel-clock/`），放入你的 `index.html` 和相关静态资源。
2. 打开 `data/projects.json`，在 `"projects"` 数组中添加一条记录：

```json
{
  "id": "pixel-clock",
  "title": "网页标题",
  "subtitle": "一句话副标题",
  "description": "简单介绍一下这个小网页怎么玩。",
  "url": "./toys/pixel-clock/",
  "tag": "小工具",
  "year": "2026",
  "featured": false,
  "accent": "emerald",
  "highlights": ["特性一", "特性二"]
}
```

- `featured`: 设为 `true` 时在桌面端占据两列宽度。
- `accent`: 可选 `emerald`、`cyan`、`amber`。
- `tag`: 自动同步生成首页顶部的筛选标签。

## 如何添加新的笔记

1. 在 `notes/posts/` 下新建一个 Markdown 文件，例如 `notes/posts/css-grid.md`。
2. 在 `data/projects.json` 的 `"notes"` 数组里添加一条记录：

```json
{
  "id": "css-grid",
  "title": "笔记标题",
  "date": "2026-11-26",
  "category": "前端",
  "summary": "一两句话概括这篇笔记。",
  "url": "./notes/view.html?id=css-grid",
  "file": "./posts/css-grid.md"
}
```

提交并推送到 `main` 分支后，GitHub Pages 会直接上线更新。
