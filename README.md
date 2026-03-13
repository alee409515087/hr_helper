<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6dd75651-503b-4e4f-ace6-f2dd534bb11c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

這個專案已設定好 GitHub Actions，可以透過 GitHub Pages 自動部署上線。

1. 到 GitHub Repository 的 **Settings** -> **Pages**。
2. 將 **Source** 設為 `GitHub Actions`。
3. 只要將程式碼推送到 `main` (或 `master`) 分支，GitHub Actions 就會自動建置並部署。

## 專案設定說明

- **.gitignore**: 已設定忽略 `node_modules/`, `dist/`, `.env` 等常見不必要上傳的暫存檔案與環境變數檔。
- **package.json**: 包含了執行專案所需的相依套件與指令 (例如 `npm run dev`, `npm run build`)。
