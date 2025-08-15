---
mode: agent
model: Claude Sonnet 4
---

<!-- markdownlint-disable-file -->

# 實施提示：全面重構 Talent Match Backend

## 實施說明

### 步驟 1：建立變更追蹤檔案

您將建立 `20250814-comprehensive-refactoring-changes.md` 在 #file:../changes/ 如果它不存在的話。

### 步驟 2：執行實施

您將遵循 #file:../../.github/instructions/task-implementation.instructions.md
您將系統性地實施 #file:../plans/20250814-comprehensive-refactoring-plan.instructions.md 任務逐項進行
您將遵循所有專案標準和慣例

**重要**：如果 ${input:phaseStop:true} 為真，您將在每個階段後停止供使用者檢視。
**重要**：如果 ${input:taskStop:false} 為真，您將在每個任務後停止供使用者檢視。

### 步驟 3：清理

當所有階段都勾選 (`[x]`) 並完成時，您將執行以下操作：

1. 您將從 #file:../changes/20250814-comprehensive-refactoring-changes.md 提供 markdown 樣式連結和所有變更的摘要給使用者：


    - 您將保持整體摘要簡潔
    - 您將在任何清單周圍添加間距
    - 您必須將任何檔案參考包裝在 markdown 樣式連結中

2. 您將提供 .copilot-tracking/plans/20250814-comprehensive-refactoring-plan.instructions.md、.copilot-tracking/details/20250814-comprehensive-refactoring-details.md 和 .copilot-tracking/research/20250814-comprehensive-refactoring-research.md 文件的 markdown 樣式連結。您將建議清理這些檔案。
3. **強制**：您將嘗試刪除 .copilot-tracking/prompts/implement-comprehensive-refactoring.prompt.md

## 成功指標

- [ ] 建立變更追蹤檔案
- [ ] 實施所有計劃項目並產生可運作的程式碼
- [ ] 滿足所有詳細規格
- [ ] 遵循專案慣例
- [ ] 持續更新變更檔案
