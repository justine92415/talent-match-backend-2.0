<!-- markdownlint-disable-file -->

# 任務詳細資訊：全面重構 Talent Match Backend

## 研究參考

**來源研究**：#file:../research/20250814-comprehensive-refactoring-research.md

## 階段 1：基礎工具建立

### 任務 1.1：建立非同步處理包裝器

建立統一的控制器方法包裝器，自動處理異常並轉發到錯誤處理中間件。

- **檔案**：
  - `src/utils/asyncHandler.ts` - 非同步處理包裝器實作
- **成功**：
  - asyncHandler 函式正確包裝控制器方法
  - 異常自動轉發到 next() 中間件
  - 型別安全和 TypeScript 相容性
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md (行 86-105) - AsyncHandler 設計規範
  - #file:../../docs/重構指南.md - 控制器方法包裝器實作指南
- **相依性**：
  - 無前置要求

### 任務 1.2：建立錯誤訊息常數檔案

建立集中管理的錯誤訊息常數系統，支援多語言和分類管理。

- **檔案**：
  - `src/constants/errorMessages.ts` - 錯誤訊息常數定義
  - `src/constants/index.ts` - 常數匯出整合
- **成功**：
  - 完整的錯誤訊息分類：權限、驗證、成功、找不到資源
  - 支援中文錯誤訊息
  - 型別安全的常數定義
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md (行 106-135) - 錯誤訊息分類設計
  - #file:../../docs/重構指南.md - 錯誤訊息常數實作範例
- **相依性**：
  - 任務 1.1 完成

### 任務 1.3：建立自訂錯誤類別系統

實作分層的自訂錯誤類別，支援不同類型的應用程式錯誤。

- **檔案**：
  - `src/utils/errors.ts` - 自訂錯誤類別定義
  - `src/utils/index.ts` - 工具函式匯出
- **成功**：
  - AppError 基礎錯誤類別建立
  - 特化錯誤類別：ValidationError、UnauthorizedError、ForbiddenError、NotFoundError、ConflictError、BusinessError
  - 支援錯誤碼和詳細錯誤資訊
  - 型別安全和繼承結構正確
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md (行 136-165) - 自訂錯誤類別設計
  - #file:../../docs/重構指南.md - 錯誤類別實作範例
- **相依性**：
  - 任務 1.2 完成

### 任務 1.4：建立結構化日誌系統

實作基於 Winston 的結構化日誌系統，支援不同環境配置。

- **檔案**：
  - `src/utils/logger.ts` - Winston 日誌配置
  - `logs/` 目錄 - 日誌檔案儲存目錄
- **成功**：
  - 支援多種日誌級別：error、warn、info、http、debug
  - 開發環境控制台輸出，生產環境檔案輸出
  - 結構化日誌格式包含時間戳、服務資訊
  - 錯誤堆疊追蹤支援
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md (行 196-225) - 日誌服務設計
  - #file:../../docs/重構指南.md - Winston 日誌配置範例
- **相依性**：
  - Winston 套件安裝
  - 任務 1.3 完成

## 階段 2：架構核心重構

### 任務 2.1：建立統一驗證中間件系統

重構驗證邏輯，建立可重用的驗證中間件。

- **檔案**：
  - `src/middleware/validators/` 目錄 - 驗證中間件集合
  - `src/middleware/validators/courseValidator.ts` - 課程驗證範例
  - `src/middleware/validators/index.ts` - 驗證中間件匯出
- **成功**：
  - 通用驗證函式：validateId、validateRequestBody
  - 特定業務驗證：課程、教師、使用者驗證
  - 統一錯誤回應格式
  - 中間件鏈支援
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - 請求驗證中間件設計
  - #file:../../docs/重構指南.md - 驗證中間件實作範例
- **相依性**：
  - 階段 1 完成
  - 錯誤訊息常數

### 任務 2.2：重構全域錯誤處理中間件

重構現有錯誤處理中間件，整合新的錯誤類別系統。

- **檔案**：
  - `src/middleware/errorHandler.ts` - 全域錯誤處理重構
- **成功**：
  - 支援所有自訂錯誤類別
  - 統一錯誤回應格式
  - 詳細錯誤日誌記錄
  - 生產環境錯誤訊息過濾
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - 全域錯誤處理設計
  - #file:../../docs/重構指南.md - 錯誤處理中間件實作
- **相依性**：
  - 任務 1.3、1.4 完成
  - ResponseHelper 工具

### 任務 2.3：擴展 Express Request 型別定義

擴展 Express Request 介面，支援自訂屬性注入。

- **檔案**：
  - `src/types/express.d.ts` - Express 型別擴展
  - `src/types/index.ts` - 型別定義整合
- **成功**：
  - Request 介面新增 courseId、userId、teacherId 屬性
  - 型別安全的屬性存取
  - 與驗證中間件整合
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - Express 型別擴展
  - #file:../../docs/重構指南.md - Request 型別定義範例
- **相依性**：
  - 任務 2.1 完成
  - TypeScript 設定

### 任務 2.4：建立統一回應幫助工具

建立或改善現有的回應幫助工具，統一 API 回應格式。

- **檔案**：
  - `src/utils/responseHelper.ts` - 回應幫助工具重構
- **成功**：
  - 標準化的成功和錯誤回應格式
  - 支援分頁和資料包裝
  - 整合錯誤訊息常數
  - 型別安全的回應格式
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - 回應格式標準化
  - #file:../../docs/重構指南.md - ResponseHelper 實作範例
- **相依性**：
  - 任務 1.2 完成
  - 錯誤類別系統

## 階段 3：服務層重構

### 任務 3.1：重構所有服務類別統一錯誤處理

改善現有服務類別的錯誤處理，採用統一的錯誤處理模式。

- **檔案**：
  - `src/services/CourseService.ts` - 課程服務重構
  - `src/services/TeacherApplicationService.ts` - 教師申請服務重構
  - 其他所有服務檔案 - 統一錯誤處理模式
- **成功**：
  - 所有服務採用統一錯誤處理和日誌記錄
  - 業務邏輯與資料存取分離清晰
  - 使用自訂錯誤類別
  - 保持現有服務結構的簡潔性
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - 服務重構模式
  - #file:../../docs/重構指南.md - 服務類別錯誤處理實作
- **相依性**：
  - 階段 2 完成
  - 基礎工具建立

### 任務 3.2：建立交易管理工具

實作資料庫交易管理工具，確保資料一致性。

- **檔案**：
  - `src/utils/transactionManager.ts` - 交易管理工具
- **成功**：
  - runInTransaction 函式實作
  - 自動回滾錯誤處理
  - TypeORM QueryRunner 整合
  - 交易日誌記錄
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - 交易處理設計
  - #file:../../docs/重構指南.md - 交易管理實作範例
- **相依性**：
  - 任務 1.4 完成
  - TypeORM 配置

### 任務 3.3：重構控制器採用新架構

重構所有控制器，採用 asyncHandler 和統一錯誤處理模式。

- **檔案**：
  - `src/controllers/` 目錄下所有控制器檔案
- **成功**：
  - 所有控制器方法使用 asyncHandler 包裝
  - 統一錯誤處理和回應格式
  - 移除重複的 try-catch 程式碼
  - 保持現有控制器結構和功能
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - 控制器重構模式
  - #file:../../docs/重構指南.md - 控制器錯誤處理實作
- **相依性**：
  - 任務 3.1 完成
  - asyncHandler 工具

## 階段 4：文件與測試

### 任務 4.1：重構 Swagger 文件標準化回應

重構 Swagger 設定，建立標準化的 API 回應組件。

- **檔案**：
  - `src/config/swagger.ts` - Swagger 配置重構
  - `src/docs/` 目錄 - API 文件組件
- **成功**：
  - 標準化回應組件：Success、Created、ValidationError、Unauthorized、Forbidden、NotFound、ServerError
  - 完整的 API 文件範例
  - 自動化文件產生
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - Swagger 組件設計
  - #file:../../docs/重構指南.md - Swagger 共用組件實作
- **相依性**：
- 階段 2、3 完成
- Swagger 套件配置

### 任務 4.2：建立測試輔助函數和測試重構

建立測試輔助函數，重構現有測試適配新架構。

- **檔案**：
  - `src/tests/helpers/` 目錄 - 測試輔助函數
  - `src/tests/helpers/courseTestHelper.ts` - 課程測試輔助
  - 現有測試檔案 - 重構適配新架構
- **成功**：
  - 測試資料建立和清理函數
  - 簡化的測試設定
  - 整合測試資料庫設定
  - 提升測試覆蓋率至 80% 以上
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - 測試策略設計
  - #file:../../docs/重構指南.md - 測試輔助函數實作
- **相依性**：
  - 階段 3 完成
  - Jest 和測試環境配置

### 任務 4.3：更新路由配置和應用程式入口

更新路由配置整合新的中間件和控制器，重構應用程式入口點。

- **檔案**：
  - `src/routes/` 目錄下所有路由檔案
  - `src/app.ts` - 應用程式入口重構
  - `src/server.ts` - 伺服器啟動重構
- **成功**：
  - 路由整合新的驗證中間件
  - 全域錯誤處理配置
  - 應用程式模組化結構
  - 保持現有路由功能
- **研究參考**：
  - #file:../research/20250814-comprehensive-refactoring-research.md - 檔案結構重組
  - #file:../../docs/重構指南.md - 應用程式架構整合
- **相依性**：
  - 所有前階段完成
  - 路由和中間件配置## 相依性

- TypeScript 4.9+
- Express.js 4.18+
- TypeORM 0.3+
- Winston 日誌函式庫
- Jest 測試框架

## 成功指標

- 所有控制器消除重複 try-catch 模式
- 建立完整統一錯誤處理架構
- 統一錯誤處理和驗證機制
- 結構化日誌和交易管理支援
- 測試覆蓋率達到 80% 以上
- API 文件完整性和標準化
- 程式碼模組化和可維護性顯著提升
