# 建置階段
FROM node:20-alpine3.19 AS builder

WORKDIR /app

# 複製依賴檔案
COPY package*.json ./
COPY tsconfig.json ./

# 安裝所有依賴（包括開發依賴，用於建置）
RUN npm ci --include=dev

# 複製原始碼
COPY . .

# 建置應用程式（tsc-alias 會轉換路徑別名為相對路徑）
RUN npm run build

# 生產階段
FROM node:20-alpine3.19 AS production

WORKDIR /app

# 複製依賴檔案
COPY package*.json ./

# 只安裝生產依賴
RUN npm ci --omit=dev

# 從建置階段複製編譯結果（已轉換路徑別名）
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 8080

# 直接啟動應用程式（不需要 tsconfig-paths）
CMD ["node", "dist/src/bin/www.js"]