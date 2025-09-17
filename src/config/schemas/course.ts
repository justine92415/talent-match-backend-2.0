/**
 * 課程模組 Schema
 * 
 * 包含課程 API 相關的請求和回應 Schema
 * 完全基於 CourseController 和 CourseService 的實際實作
 */

export const courseSchemas = {
  // ==================== 課程建立 API Schema ==================== 
  
  // 課程建立請求 Schema
  CreateCourseRequest: {
    type: 'object',
    required: ['name', 'content', 'main_category_id', 'sub_category_id', 'city_id'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: '課程名稱 (必填，1-255字元)',
        example: 'JavaScript 基礎入門課程'
      },
      content: {
        type: 'string',
        minLength: 1,
        description: '課程內容描述 (必填，HTML格式)',
        example: '<p>完整的 JavaScript 基礎教學，適合初學者</p>'
      },
      main_category_id: {
        type: 'integer',
        minimum: 1,
        description: '主分類 ID (必填，對應程式設計、語言學習等主分類)',
        example: 1
      },
      sub_category_id: {
        type: 'integer',
        minimum: 1,
        description: '次分類 ID (必填，對應前端、後端等次分類)',
        example: 2
      },
      city_id: {
        type: 'integer',
        minimum: 1,
        description: '城市 ID (必填，對應課程授課城市)',
        example: 1
      },
      survey_url: {
        type: 'string',
        format: 'uri',
        nullable: true,
        description: '問卷調查連結 (選填，用於課後回饋)',
        example: 'https://forms.google.com/survey123'
      },
      purchase_message: {
        type: 'string',
        nullable: true,
        description: '購買備註訊息 (選填，顯示給學生的額外資訊)',
        example: '請準備筆記本，課程需要大量練習'
      }
    }
  },

  // 整合課程建立請求 Schema (multipart/form-data)
  IntegratedCourseCreateRequest: {
    type: 'object',
    required: ['courseData', 'priceOptions'],
    properties: {
      courseData: {
        type: 'string',
        format: 'json',
        description: '課程基本資料 (JSON 字串格式)',
        example: '{"name":"JavaScript 基礎入門課程","content":"<p>完整的 JavaScript 基礎教學，適合初學者</p>","main_category_id":1,"sub_category_id":2,"city_id":1,"survey_url":"https://forms.google.com/survey123","purchase_message":"請準備筆記本，課程需要大量練習"}'
      },
      priceOptions: {
        type: 'string', 
        format: 'json',
        description: '價格方案陣列 (JSON 字串格式)',
        example: '[{"price":1500,"quantity":1},{"price":4200,"quantity":3},{"price":7500,"quantity":6}]'
      },
      courseImage: {
        type: 'string',
        format: 'binary',
        description: '課程主圖 (可選，支援 JPEG/PNG/WebP，最大 10MB)',
        nullable: true
      }
    }
  },

  // ==================== 課程更新 API Schema ====================
  
  // 課程更新請求 Schema
  UpdateCourseRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: '課程名稱 (選填，1-255字元)',
        example: 'JavaScript 進階應用課程'
      },
      content: {
        type: 'string',
        minLength: 1,
        description: '課程內容描述 (選填，HTML格式)',
        example: '<p>深入學習 JavaScript 進階概念，包含異步編程、模組化等</p>'
      },
      main_category_id: {
        type: 'integer',
        minimum: 1,
        description: '主分類 ID (選填，對應程式設計、語言學習等主分類)',
        example: 1
      },
      sub_category_id: {
        type: 'integer',
        minimum: 1,
        description: '次分類 ID (選填，對應前端、後端等次分類)',
        example: 2
      },
      city_id: {
        type: 'integer',
        minimum: 1,
        description: '城市 ID (選填，對應課程授課城市)',
        example: 1
      },
      survey_url: {
        type: 'string',
        format: 'uri',
        nullable: true,
        description: '問卷調查連結 (選填，用於課後回饋)',
        example: 'https://forms.google.com/survey456'
      },
      purchase_message: {
        type: 'string',
        nullable: true,
        description: '購買備註訊息 (選填，顯示給學生的額外資訊)',
        example: '課程難度適中，建議有基礎程式經驗的學生參加'
      },
      price_options: {
        type: 'string',
        description: 'JSON 格式的價格方案資料 (選填，課程價格設定)',
        example: '{"options": [{"name": "單堂", "price": 1500}]}'
      }
    }
  },

  // ==================== 共用課程基本資訊 Schema ====================

  // 課程基本資訊 Schema
  CourseBasicInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '課程 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '課程 UUID (系統生成的唯一識別碼)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      teacher_id: {
        type: 'integer',
        description: '教師 ID (Teacher 表的主鍵，非 User ID)',
        example: 5
      },
      name: {
        type: 'string',
        description: '課程名稱',
        example: 'JavaScript 基礎入門課程'
      },
      content: {
        type: 'string',
        nullable: true,
        description: '課程內容描述 (HTML格式)',
        example: '<p>完整的 JavaScript 基礎教學，適合初學者</p>'
      },
      main_image: {
        type: 'string',
        nullable: true,
        description: '課程主圖 URL',
        example: null
      },
      rate: {
        type: 'number',
        format: 'float',
        description: '課程評分 (0-5分)',
        example: 0
      },
      review_count: {
        type: 'integer',
        description: '評價數量',
        example: 0
      },
      view_count: {
        type: 'integer',
        description: '瀏覽次數',
        example: 0
      },
      purchase_count: {
        type: 'integer',
        description: '購買次數',
        example: 0
      },
      student_count: {
        type: 'integer',
        description: '學生人數',
        example: 0
      },
      main_category_id: {
        type: 'integer',
        nullable: true,
        description: '主分類 ID',
        example: 1
      },
      sub_category_id: {
        type: 'integer',
        nullable: true,
        description: '次分類 ID',
        example: 2
      },
      city_id: {
        type: 'integer',
        nullable: true,
        description: '城市 ID',
        example: 1
      },
      dist_id: {
        type: 'string',
        nullable: true,
        description: '區域 ID',
        example: null
      },
      survey_url: {
        type: 'string',
        nullable: true,
        description: '問卷調查連結',
        example: ''
      },
      purchase_message: {
        type: 'string',
        nullable: true,
        description: '購買備註訊息',
        example: ''
      },
      status: {
        type: 'string',
        enum: ['draft', 'published', 'archived'],
        description: '課程狀態 (draft: 草稿, published: 已發布, archived: 已封存)',
        example: 'draft'
      },
      application_status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        nullable: true,
        description: '審核狀態 (pending: 待審核, approved: 已通過, rejected: 已拒絕)',
        example: null
      },
      submission_notes: {
        type: 'string',
        nullable: true,
        description: '提交審核備註',
        example: null
      },
      archive_reason: {
        type: 'string',
        nullable: true,
        description: '封存原因',
        example: null
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
    }
  },

  // 包含價格方案的課程詳細資訊 Schema (供編輯使用)
  CourseWithPriceOptions: {
    allOf: [
      { $ref: '#/components/schemas/CourseBasicInfo' },
      {
        type: 'object',
        properties: {
          price_options: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PriceOption'
            },
            description: '課程價格方案列表'
          }
        }
      }
    ]
  },

  // ==================== 成功回應 Schema ====================

  // 課程建立成功回應 Schema
  CreateCourseSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態 (建立成功固定為 success)',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '課程建立成功'
      },
      data: {
        type: 'object',
        properties: {
          course: {
            $ref: '#/components/schemas/CourseBasicInfo'
          }
        },
        description: '建立的課程資料'
      }
    }
  },

  // 課程更新成功回應 Schema
  UpdateCourseSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態 (更新成功固定為 success)',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '課程更新成功'
      },
      data: {
        type: 'object',
        properties: {
          course: {
            $ref: '#/components/schemas/CourseBasicInfo'
          }
        },
        description: '更新後的課程資料'
      }
    }
  },

  // ==================== 取得課程 API Schema ====================

  // 課程詳情成功回應 Schema
  GetCourseSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態 (取得成功固定為 success)',
        example: 'success'
      },
      message: {
        type: 'string',
        nullable: true,
        description: '回應訊息 (可能為空)',
        example: null
      },
      data: {
        type: 'object',
        properties: {
          course: {
            $ref: '#/components/schemas/CourseBasicInfo'
          }
        },
        description: '課程詳細資料'
      }
    }
  },

  // 課程編輯資料成功回應 Schema
  GetCourseForEditSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態 (取得成功固定為 success)',
        example: 'success'
      },
      message: {
        type: 'string',
        nullable: true,
        description: '回應訊息 (可能為空)',
        example: null
      },
      data: {
        type: 'object',
        properties: {
          course: {
            $ref: '#/components/schemas/CourseWithPriceOptions'
          }
        },
        description: '包含價格方案的完整課程資料'
      }
    }
  },

  // ==================== 教師課程列表 API Schema ====================

  // 課程列表查詢參數 Schema
  CourseListQueryParams: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        description: '頁碼 (選填，預設為 1)',
        example: 1
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        description: '每頁數量 (選填，預設為 20，最大 100)',
        example: 20
      }
    }
  },

  // 分頁資訊 Schema
  PaginationInfo: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        description: '目前頁碼',
        example: 1
      },
      limit: {
        type: 'integer',
        description: '每頁數量',
        example: 20
      },
      total: {
        type: 'integer',
        description: '總筆數',
        example: 45
      }
    }
  },

  // 課程列表成功回應 Schema
  GetCourseListSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態 (取得成功固定為 success)',
        example: 'success'
      },
      message: {
        type: 'string',
        nullable: true,
        description: '回應訊息 (可能為空)',
        example: null
      },
      data: {
        type: 'object',
        properties: {
          courses: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/CourseBasicInfo'
            },
            description: '課程列表'
          },
          total: {
            type: 'integer',
            description: '總筆數',
            example: 45
          },
          page: {
            type: 'integer',
            description: '目前頁碼',
            example: 1
          },
          limit: {
            type: 'integer',
            description: '每頁數量',
            example: 20
          }
        },
        description: '教師課程列表資料和分頁資訊'
      }
    }
  },

  // 課程列表權限錯誤回應 Schema
  GetCourseListPermissionErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ForbiddenErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '需要教師權限才能查看課程列表'
          }
        }
      }
    ]
  },

  // ==================== 公開課程相關 Schema ====================

  // 公開課程基本資訊 Schema
  PublicCourseBasicInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '課程 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '課程 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      name: {
        type: 'string',
        description: '課程名稱',
        example: 'JavaScript 基礎入門課程'
      },
      main_image: {
        type: 'string',
        nullable: true,
        description: '課程主圖 URL',
        example: 'https://example.com/course-image.jpg'
      },
      rate: {
        type: 'number',
        format: 'float',
        description: '課程評分 (0-5分)',
        example: 4.5
      },
      review_count: {
        type: 'integer',
        description: '評價數量',
        example: 25
      },
      teacher_name: {
        type: 'string',
        description: '教師姓名',
        example: '王老師'
      },
      price_range: {
        type: 'object',
        properties: {
          min: {
            type: 'number',
            description: '最低價格',
            example: 1500
          },
          max: {
            type: 'number',
            description: '最高價格',
            example: 7500
          }
        }
      }
    }
  },

  // 公開課程詳細資訊 Schema
  PublicCourseDetailInfo: {
    allOf: [
      { $ref: '#/components/schemas/PublicCourseBasicInfo' },
      {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: '課程內容描述',
            example: '<p>完整的 JavaScript 基礎教學，適合初學者</p>'
          },
          teacher_info: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: '教師 ID',
                example: 1
              },
              name: {
                type: 'string',
                description: '教師姓名',
                example: '王老師'
              },
              avatar: {
                type: 'string',
                nullable: true,
                description: '教師頭像',
                example: 'https://example.com/teacher-avatar.jpg'
              }
            }
          },
          price_options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: '價格方案 ID',
                  example: 1
                },
                price: {
                  type: 'number',
                  description: '價格',
                  example: 1500
                },
                quantity: {
                  type: 'integer',
                  description: '堂數',
                  example: 1
                }
              }
            }
          }
        }
      }
    ]
  },

  // ==================== 價格方案相關 Schema ====================

  // 價格方案建立請求 Schema
  PriceOptionCreateRequest: {
    type: 'object',
    required: ['price', 'quantity'],
    properties: {
      price: {
        type: 'number',
        format: 'float',
        minimum: 1,
        maximum: 999999,
        description: '價格 (必填，範圍 1-999999)',
        example: 1500
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        maximum: 999,
        description: '堂數 (必填，範圍 1-999)',
        example: 1
      }
    }
  },

  // 價格方案更新請求 Schema
  PriceOptionUpdateRequest: {
    type: 'object',
    properties: {
      price: {
        type: 'number',
        format: 'float',
        minimum: 1,
        maximum: 999999,
        description: '價格 (選填，範圍 1-999999)',
        example: 1800
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        maximum: 999,
        description: '堂數 (選填，範圍 1-999)',
        example: 1
      }
    }
  },

  // 價格方案資訊 Schema
  PriceOptionInfo: {
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
        description: '價格方案 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      course_id: {
        type: 'integer',
        description: '所屬課程 ID',
        example: 1
      },
      price: {
        type: 'number',
        format: 'float',
        description: '價格',
        example: 1500
      },
      quantity: {
        type: 'integer',
        description: '堂數',
        example: 1
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
    }
  },

  // ==================== 刪除課程 API Schema ====================

  // 課程刪除成功回應 Schema
  DeleteCourseSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態 (刪除成功固定為 success)',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '課程已刪除'
      },
      data: {
        nullable: true,
        description: '刪除操作無回傳資料',
        example: null
      }
    }
  },

  // 課程刪除業務邏輯錯誤回應 Schema
  DeleteCourseBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '已發布的課程不能直接刪除，請先封存後再刪除'
          }
        }
      }
    ]
  },

  // 課程刪除權限錯誤回應 Schema  
  DeleteCoursePermissionErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ForbiddenErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '只能刪除自己的課程'
          }
        }
      }
    ]
  },

  // 課程刪除不存在錯誤回應 Schema
  DeleteCourseNotFoundErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/NotFoundErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程不存在'
          }
        }
      }
    ]
  },

  // ==================== 課程狀態管理 API Schema ====================

  // 提交課程審核請求 Schema
  SubmitCourseRequest: {
    type: 'object',
    properties: {
      submission_notes: {
        type: 'string',
        nullable: true,
        description: '提交審核備註 (選填，提供給審核者的額外說明)',
        example: '課程內容已準備完成，請協助審核'
      }
    }
  },

  // 重新提交課程審核請求 Schema
  ResubmitCourseRequest: {
    type: 'object',
    properties: {
      submission_notes: {
        type: 'string',
        nullable: true,
        description: '重新提交審核備註 (選填，說明修正的內容)',
        example: '已根據回饋修正課程內容，請重新審核'
      }
    }
  },

  // 封存課程請求 Schema
  ArchiveCourseRequest: {
    type: 'object',
    properties: {
      archive_reason: {
        type: 'string',
        nullable: true,
        description: '封存原因 (選填，說明封存的理由)',
        example: '課程內容需要大幅更新，暫時下架'
      }
    }
  },

  // 狀態管理成功回應 Schema (通用)
  CourseStatusManagementSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態 (操作成功固定為 success)',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '課程狀態更新成功'
      },
      data: {
        nullable: true,
        description: '狀態管理操作無回傳資料',
        example: null
      }
    }
  },

  // 提交課程審核成功回應 Schema
  SubmitCourseSuccessResponse: {
    allOf: [
      { $ref: '#/components/schemas/CourseStatusManagementSuccessResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程已提交審核'
          }
        }
      }
    ]
  },

  // 重新提交課程審核成功回應 Schema
  ResubmitCourseSuccessResponse: {
    allOf: [
      { $ref: '#/components/schemas/CourseStatusManagementSuccessResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程已重新提交審核'
          }
        }
      }
    ]
  },

  // 發布課程成功回應 Schema
  PublishCourseSuccessResponse: {
    allOf: [
      { $ref: '#/components/schemas/CourseStatusManagementSuccessResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程已成功發布'
          }
        }
      }
    ]
  },

  // 封存課程成功回應 Schema
  ArchiveCourseSuccessResponse: {
    allOf: [
      { $ref: '#/components/schemas/CourseStatusManagementSuccessResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程已封存'
          }
        }
      }
    ]
  },

  // 課程狀態管理業務邏輯錯誤回應 Schema (通用)
  CourseStatusBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程狀態不允許此操作'
          }
        }
      }
    ]
  },

  // 提交課程業務錯誤回應 Schema
  SubmitCourseBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/CourseStatusBusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '只有草稿且未在審核中的課程可以提交'
          }
        }
      }
    ]
  },

  // 重新提交課程業務錯誤回應 Schema
  ResubmitCourseBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/CourseStatusBusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '只有被拒絕的課程可以重新提交'
          }
        }
      }
    ]
  },

  // 發布課程業務錯誤回應 Schema
  PublishCourseBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/CourseStatusBusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '只有草稿且審核通過的課程可以發布'
          }
        }
      }
    ]
  },

  // 封存課程業務錯誤回應 Schema
  ArchiveCourseBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/CourseStatusBusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '只有已發布的課程可以封存'
          }
        }
      }
    ]
  },

  // 課程狀態管理權限錯誤回應 Schema (通用)
  CourseStatusPermissionErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ForbiddenErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '只能管理自己的課程狀態'
          }
        }
      }
    ]
  },

  // 課程狀態管理不存在錯誤回應 Schema (通用)
  CourseStatusNotFoundErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/NotFoundErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程不存在'
          }
        }
      }
    ]
  },

  // 課程詳情權限錯誤回應 Schema
  GetCoursePermissionErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ForbiddenErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '只能查看自己的課程或已發布的公開課程'
          }
        }
      }
    ]
  },

  // 課程詳情不存在錯誤回應 Schema
  GetCourseNotFoundErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/NotFoundErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程不存在'
          }
        }
      }
    ]
  },

  // ==================== 錯誤回應 Schema (建立課程) ====================

  // 課程建立驗證錯誤回應 Schema - 繼承並自定義
  CreateCourseValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '參數驗證失敗'
          },
          errors: {
            example: {
              name: ['課程名稱為必填欄位'],
              content: ['課程內容為必填欄位'],
              main_category_id: ['主分類 ID 為必填欄位'],
              sub_category_id: ['次分類 ID 為必填欄位'],
              city_id: ['城市 ID 為必填欄位']
            }
          }
        }
      }
    ]
  },

  // 課程建立業務邏輯錯誤回應 Schema
  CreateCourseBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '需要教師權限才能建立課程'
          }
        }
      }
    ]
  },

  // 課程建立教師權限錯誤回應 Schema  
  CreateCourseTeacherPermissionErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ForbiddenErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '需要教師權限才能建立課程'
          }
        }
      }
    ]
  },

  // ==================== 錯誤回應 Schema (更新課程) ====================

  // 課程更新驗證錯誤回應 Schema - 繼承並自定義
  UpdateCourseValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '參數驗證失敗'
          },
          errors: {
            example: {
              name: ['課程名稱長度不能超過255字元'],
              main_category_id: ['主分類 ID 必須為正整數'],
              city_id: ['城市 ID 必須為正整數']
            }
          }
        }
      }
    ]
  },

  // 課程更新業務邏輯錯誤回應 Schema
  UpdateCourseBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '需要教師權限才能更新課程'
          }
        }
      }
    ]
  },

  // 課程更新權限錯誤回應 Schema  
  UpdateCoursePermissionErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ForbiddenErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '只能更新自己的課程'
          }
        }
      }
    ]
  },

  // 課程更新不存在錯誤回應 Schema
  UpdateCourseNotFoundErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/NotFoundErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程不存在'
          }
        }
      }
    ]
  },

  // ==================== 錯誤回應 Schema (取得編輯資料) ====================

  // 課程編輯權限錯誤回應 Schema
  GetCourseEditPermissionErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ForbiddenErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '只能編輯自己的課程'
          }
        }
      }
    ]
  },

  // 課程編輯不存在錯誤回應 Schema
  GetCourseEditNotFoundErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/NotFoundErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程不存在'
          }
        }
      }
    ]
  }
}