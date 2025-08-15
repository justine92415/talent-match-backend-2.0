# 建置階段
FROM node:20-alpine3.19 AS builder

WORKDIR /app

# 複製依賴檔案（確保包含 package-lock.json）
COPY package*.json ./

# 安裝所有依賴（包括開發依賴，用於建置）
# 即使在生產環境中，建置階段也需要開發依賴項目
RUN npm ci --include=dev

# 複製原始碼
COPY . .

# 建置應用程式
RUN npm run build

# 生產階段
FROM node:20-alpine3.19 AS production

WORKDIR /app

# 複製依賴檔案
COPY package.json package-lock.json ./

# 只安裝生產依賴
RUN npm ci --omit=dev

# 從建置階段複製編譯結果
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 8080

# 啟動應用程式
CMD ["node", "dist/src/bin/www.js"]