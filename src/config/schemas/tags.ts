export const tagsSchemas = {
  // 次分類物件 Schema
  SubCategoryItem: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '次分類 ID',
        example: 1
      },
      name: {
        type: 'string',
        description: '次分類名稱',
        example: '水彩畫'
      }
    },
    required: ['id', 'name']
  },

  // 主分類標籤物件 Schema
  TagItem: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '主分類 ID',
        example: 1
      },
      main_category: {
        type: 'string',
        description: '主分類名稱',
        example: '藝術創作'
      },
      sub_category: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/SubCategoryItem'
        },
        description: '次分類清單'
      },
      icon_url: {
        type: 'string',
        nullable: true,
        description: '主分類圖示 URL（可為 null）',
        example: 'assets/images/tag-icon/draw_abstract.svg'
      }
    },
    required: ['id', 'main_category', 'sub_category', 'icon_url']
  },

  // 取得標籤清單成功回應 Schema
  GetTagsSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'boolean',
        description: '回應狀態 (成功時為 true)',
        enum: [true],
        example: true
      },
      message: {
        type: 'string',
        description: '回應訊息',
        example: '取得標籤清單成功'
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/TagItem'
        },
        description: '標籤清單資料'
      }
    },
    required: ['status', 'message', 'data']
  }
}