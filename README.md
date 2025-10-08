# 🎓 Talent Match - 線下教學媒合平台後端系統

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.4.2-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.4-blue?logo=postgresql)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3.20-orange)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Jest](https://img.shields.io/badge/Jest-29.7.0-C21325?logo=jest)
![License](https://img.shields.io/badge/License-Private-red)

一個功能完整、架構清晰的線教學媒合平台後端 API 系統，採用企業級開發標準與最佳實踐。

</div>

---

## 📋 目錄

- [專案簡介](#-專案簡介)
- [專案亮點](#-專案亮點)
- [核心功能特性](#-核心功能特性)
- [技術架構](#-技術架構)
- [資料庫設計](#️-資料庫設計)
- [測試](#-測試)
- [作者](#-作者)

---

## 📖 專案簡介

**Talent Match** 是一個專業的線下教學媒合平台後端系統，連接教師與學生，提供完整的課程管理、預約排程、訂單支付、即時通訊等功能。

### 🔄 專案背景

本專案是 [talent-match-backend](https://github.com/TalentMatchNorth10/talent-match-backend) 的**完全重構版本**，採用更現代化的技術棧與更嚴謹的開發流程。

### 🤖 AI 輔助開發實踐

本專案是一個展示 **GitHub Copilot** 與 **AI 驅動開發（AIDD）** 的實踐案例：

- 📋 **完整需求文件**：撰寫詳細的 User Story 規格（`specs/user_story_*.md`）
- 📝 **開發指南文件**：建立 Instruction 文件（`.github/instructions/*.md`）指導 AI 輔助開發
- 🎯 **Prompt Engineering**：透過精心設計的 Prompt 文件，提升 AI 程式碼生成品質
- 🔄 **持續優化**：在開發過程中不斷調整 Instructions，使 AI 理解專案脈絡

---

## 🎯 專案亮點

### 1️⃣ 架構設計

✨ **分層架構**：清晰的 Controller → Service → Entity 分層  
✨ **SOLID 原則**：單一職責、開放封閉、依賴反轉  
✨ **設計模式**：Repository Pattern、Dependency Injection  

### 2️⃣ 程式碼品質

✨ **測試驅動開發**：TDD Red-Green-Refactor 循環  
✨ **程式碼檢查**：ESLint + Prettier 零警告  

### 3️⃣ 最佳實踐

✨ **RESTful API**：遵循 REST 設計原則  
✨ **錯誤處理**：統一錯誤處理機制  
✨ **日誌系統**：結構化日誌（Pino）  
✨ **安全性**：JWT 認證、密碼加密、角色權限  

### 4️⃣ 開發效率

✨ **Docker 化**：一鍵啟動開發環境  
✨ **熱重載**：程式碼變更自動重啟  
✨ **API 文件**：Swagger 自動生成  
✨ **Path Alias**：簡化匯入路徑  

### 5️⃣ 資料庫設計

✨ **正規化設計**：符合 3NF 正規化  
✨ **關聯完整**：35+ 表格，完整外鍵關聯  
✨ **索引最佳化**：常用欄位建立索引  
✨ **軟刪除**：資料保留機制  

### 6️⃣ 專案管理

✨ **規格文件**：完整的 User Story 規格  
✨ **進度追蹤**：詳細的開發進度文件  
✨ **版本控制**：Git 分支策略、Commit 規範  
✨ **測試集合**：Postman Collection 完整  

---

## ✨ 核心功能特性

### 👥 使用者系統
- **多重註冊方式**：一般註冊、Google OAuth 2.0 整合
- **完整認證流程**：JWT Token 認證、密碼重設、帳號鎖定保護
- **角色權限管理**：學生、教師、管理員、超級管理員四種角色
- **個人資料管理**：頭像上傳、資料驗證

### 👨‍🏫 教師申請系統
- **教師申請流程**：提交申請、狀態查詢、資料更新、重新提交
- **工作經驗管理**：完整的 CRUD 操作、在職狀態管理
- **學習經歷管理**：學歷驗證、證明文件上傳、多學歷支援
- **證書管理**：專業證照上傳、分類管理、驗證機制
- **時段管理**：可預約時段設定

### 📚 課程管理系統
- **課程生命週期**：草稿、提交審核、發布、封存
- **價格方案**：多元定價策略、堂數套餐、優惠管理
- **多媒體內容**：課程短影音上傳
- **分類系統**：主分類、次分類、標籤管理、地區篩選

### 📅 預約排程系統
- **教師可預約時段管理**
- **學生課程預約功能**
- **預約狀態追蹤**

### 🛒 電商功能
- **購物車系統**
- **訂單管理**
- **金流整合（ECPay）**
- **課程收藏功能**
- **購買記錄管理**

### ⭐ 評價系統
- **課程評價提交**
- **評分統計分析**
- **評價篩選功能**
- **教師評價檢視**

### 👨‍💼 管理員後台
- **教師申請審核**
- **課程上架審核**

---

## 🏗 技術架構

### 核心技術棧

```
┌─────────────────────────────────────────────────────────────┐
│                      應用層 (Application)                   │
├─────────────────────────────────────────────────────────────┤
│  • Express.js 4.18.2 - Web 框架                             │
│  • TypeScript 5.4.2 - 型別安全                              │
│  • Pino - 結構化日誌系統                                    │
│  • Swagger - API 文件自動生成                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      業務層 (Business Logic)                │
├─────────────────────────────────────────────────────────────┤
│  Controllers → Services → Entities                          │
│  • 22+ Controllers (路由控制)                               │
│  • 24+ Services (業務邏輯)                                  │
│  • 35+ Entities (資料模型)                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      資料層 (Data Access)                   │
├─────────────────────────────────────────────────────────────┤
│  • TypeORM 0.3.20 - ORM 框架                                │
│  • PostgreSQL 16.4 - 關聯式資料庫                           │
│  • Repository Pattern - 資料存取模式                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      基礎設施層 (Infrastructure)            │
├─────────────────────────────────────────────────────────────┤
│  • Docker Compose - 容器編排                                │
│  • Firebase Admin - 檔案儲存                                │
│  • JWT - 認證令牌機制                                       │
│  • Bcrypt - 密碼加密                                        │
└─────────────────────────────────────────────────────────────┘
```

### 專案架構設計

```
talent-match-backend2/
├── src/
│   ├── app.ts                    # Express 應用程式主檔案
│   ├── bin/
│   │   └── www.ts               # 伺服器啟動腳本
│   ├── config/                  # 設定檔案
│   │   ├── db.ts               # 資料庫設定
│   │   ├── firebase.ts         # Firebase 設定
│   │   ├── swagger.ts          # Swagger 文件設定
│   │   └── secret.ts           # 敏感資料管理
│   ├── constants/              # 常數定義
│   │   ├── ErrorCode.ts       # 錯誤碼
│   │   ├── Message.ts         # 訊息常數
│   │   └── validation.ts      # 驗證規則
│   ├── controllers/            # 控制器層（22+ 檔案）
│   │   ├── AuthController.ts
│   │   ├── TeacherController.ts
│   │   ├── CourseController.ts
│   │   └── ...
│   ├── services/               # 服務層（24+ 檔案）
│   │   ├── AuthService.ts
│   │   ├── TeacherService.ts
│   │   ├── CourseService.ts
│   │   └── ...
│   ├── entities/               # 資料實體（35+ 檔案）
│   │   ├── User.ts
│   │   ├── Teacher.ts
│   │   ├── Course.ts
│   │   └── ...
│   ├── middleware/             # 中間件
│   │   ├── auth.ts            # 認證中間件
│   │   ├── validation.ts      # 驗證中間件
│   │   └── error.ts           # 錯誤處理中間件
│   ├── routes/                 # 路由定義
│   │   └── index.ts           # 路由整合
│   ├── utils/                  # 工具函式
│   │   ├── logger.ts          # 日誌工具
│   │   ├── jwt.ts             # JWT 工具
│   │   └── validators.ts      # 驗證工具
│   ├── types/                  # TypeScript 型別定義
│   └── tests/                  # 測試檔案
│       ├── auth.test.ts
│       ├── teacher.test.ts
│       └── ...
├── docker/
│   └── postgres-init.sql       # 資料庫初始化腳本
├── specs/                      # 規格文件
│   ├── api-routes.md          # API 路由規劃
│   ├── db_design.md           # 資料庫設計
│   └── user_story_*.md        # 使用者故事規格
├── postman/                    # Postman 測試集合
│   └── talent-match-api-collection.json
├── docker-compose.yml          # Docker 容器編排
├── Dockerfile.dev              # 開發環境 Docker 映像
├── tsconfig.json              # TypeScript 設定
├── jest.config.mjs            # Jest 測試設定
├── eslint.config.mjs          # ESLint 程式碼檢查設定
└── package.json               # 專案相依套件
```

### 分層架構說明

#### 🎯 Controller 層（控制器）
- **職責**：接收 HTTP 請求、參數驗證、呼叫 Service、回傳回應
- **特點**：薄控制器設計、統一回應格式、錯誤處理
- **範例**：`AuthController`、`TeacherController`、`CourseController`

#### 💼 Service 層（業務邏輯）
- **職責**：核心業務邏輯、資料處理、交易管理
- **特點**：可重用、獨立測試、職責單一
- **範例**：`AuthService`、`TeacherService`、`CourseService`

#### 📊 Entity 層（資料實體）
- **職責**：資料模型定義、資料庫映射、關聯關係
- **特點**：TypeORM 裝飾器、型別安全、自動遷移
- **範例**：`User`、`Teacher`、`Course`

#### 🛡️ Middleware 層（中間件）
- **職責**：請求攔截、認證授權、日誌記錄
- **特點**：可組合、可重用、順序執行
- **範例**：`authenticate`、`authorize`、`errorHandler`

---

## 🗄️ 資料庫設計

### 核心資料表（35+ 表格）

#### 使用者相關
- **users** - 使用者基本資料（含 Google OAuth）
- **user_roles** - 使用者角色關聯
- **user_preferences** - 使用者偏好設定
- **user_favorites** - 收藏課程記錄

#### 教師相關
- **teachers** - 教師基本資料
- **teacher_work_experiences** - 工作經驗
- **teacher_learning_experiences** - 學習經歷
- **teacher_certificates** - 專業證照
- **teacher_available_slots** - 可預約時段
- **teacher_earnings** - 收入記錄
- **teacher_settlements** - 月結算資料

#### 課程相關
- **courses** - 課程主表
- **course_price_options** - 價格方案
- **course_videos** - 課程影片關聯
- **course_files** - 課程檔案
- **course_rating_stats** - 評分統計
- **main_categories** - 主分類
- **sub_categories** - 次分類

#### 訂單相關
- **orders** - 訂單主表
- **order_items** - 訂單明細
- **user_cart_items** - 購物車
- **user_course_purchases** - 購買記錄

#### 預約評價
- **reservations** - 預約記錄
- **reviews** - 課程評價

#### 通訊系統
- **chats** - 聊天室
- **chat_participants** - 聊天參與者
- **messages** - 訊息記錄
- **message_receivers** - 訊息接收者
- **notifications** - 系統通知

#### 管理系統
- **admin_users** - 管理員帳號
- **course_applications** - 課程申請審核
- **audit_logs** - 操作日誌

---
## 🧪 測試

### 測試策略

本專案採用 **測試驅動開發（TDD）** 方法論：

1. **Red**：先寫測試（測試失敗）
2. **Green**：寫最少程式碼讓測試通過
3. **Refactor**：重構程式碼，保持測試通過

### 測試架構

```
src/tests/
├── integration/           # 整合測試
│   ├── auth.test.ts
│   ├── teacher.test.ts
│   └── course.test.ts
├── unit/                  # 單元測試
│   ├── services/
│   └── utils/
└── helpers/               # 測試輔助工具
    ├── testSetup.ts
    └── fixtures.ts
```

---

## 👨‍💻 作者

**Justine**

- GitHub: [@justine92415](https://github.com/justine92415)
- Email: justine92415@gmail.com

---

**最後更新時間：2025年10月8日**