/**
 * 價格方案相關 Swagger Schema 定義
 * 
 * 提供價格方案相關的資料模型定義，供 Swagger 文件生成使用
 */

export const priceOptionSchemas = {
  // ==================== 價格方案基本資料 Schema ====================

  // 價格方案基本資訊 Schema
  PriceOption: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '價格方案 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '價格方案唯一識別碼',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      course_id: {
        type: 'integer',
        description: '所屬課程 ID',
        example: 1
      },
      price: {
        type: 'number',
        format: 'decimal',
        minimum: 1,
        maximum: 999999.99,
        description: '方案價格（新台幣）',
        example: 1500.00
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        maximum: 999,
        description: '方案堂數',
        example: 4
      },
      is_active: {
        type: 'boolean',
        description: '是否啟用',
        example: true
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '建立時間',
        example: '2024-01-15T10:30:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: '更新時間',
        example: '2024-01-15T10:30:00.000Z'
      }
    },
    required: ['id', 'uuid', 'course_id', 'price', 'quantity', 'is_active', 'created_at', 'updated_at']
  }
}