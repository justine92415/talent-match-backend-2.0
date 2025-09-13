import express from 'express'
import { TagsController } from '@controllers/TagsController'

const router = express.Router()
const tagsController = new TagsController()

// 新增中介軟體來確認路由有被觸發
router.use('/', (req, res, next) => {
  console.log('🌐 tagRoutes - 收到請求:', req.method, req.path)
  next()
})

/**
 * @swagger
 * /api/tags:
 *   get:
 *     tags:
 *       - Tags
 *     summary: 取得所有標籤清單
 *     description: |
 *       取得系統中所有啟用的主分類和次分類標籤清單，供前端選單使用。
 *       
 *       **業務邏輯**：
 *       - 查詢所有啟用的主分類（is_active = true）
 *       - 為每個主分類查詢對應的啟用次分類
 *       - 按顯示順序（display_order）和 ID 排序
 *       - 組合成標籤物件格式回傳
 *     responses:
 *       200:
 *         description: 取得標籤清單成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetTagsSuccessResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/', tagsController.getAllTags)

// 新增簡單的測試端點
router.get('/test', (req, res) => {
  console.log('🧪 tagRoutes - 測試端點被呼叫')
  res.json({
    status: true,
    message: 'Tags API 測試端點正常工作',
    timestamp: new Date().toISOString()
  })
})

export default router