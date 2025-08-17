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

# 建置應用程式
RUN npm run build

# 生產階段
FROM node:20-alpine3.19 AS production

WORKDIR /app

# 複製依賴檔案和配置文件
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.prod.json ./

# 安裝生產依賴 + tsconfig-paths（運行時需要）
RUN npm ci --omit=dev && npm install tsconfig-paths

# 從建置階段複製編譯結果和源碼（tsconfig-paths 需要源碼路徑）
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# 暴露端口
EXPOSE 8080

# 使用生產用 tsconfig 啟動應用程式
CMD ["sh", "-c", "TS_NODE_PROJECT=tsconfig.prod.json node -r tsconfig-paths/register dist/src/bin/www.js"]