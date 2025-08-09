-- PostgreSQL 初始化腳本
-- 這個檔案會在 PostgreSQL 容器首次啟動時自動執行

-- 創建測試資料庫（如果不存在的話）
CREATE DATABASE talentmatch_test;

-- 確保測試資料庫的權限正確
GRANT ALL PRIVILEGES ON DATABASE talentmatch_test TO talentmatch;

-- 輸出確認訊息
\echo '✅ 測試資料庫 talentmatch_test 已創建完成'