/**
 * 教師相關 Schema
 * 基於 TeacherController 實際實作定義的 Swagger Schema
 */

export const teacherSchemas = {
  // === 教師申請相關 Schema ===

  // 教師申請狀態回應 Schema
  TeacherApplyStatusSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: '取得教師申請狀態成功'
      },
      data: {
        type: 'object',
        properties: {
          application_status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected'],
            description: '申請狀態',
            example: 'pending'
          },
          application_submitted_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: '申請提交時間',
            example: '2024-01-15T10:30:00.000Z'
          },
          application_reviewed_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: '審核完成時間',
            example: null
          },
          reviewer_id: {
            type: 'integer',
            nullable: true,
            description: '審核者ID',
            example: null
          },
          review_notes: {
            type: 'string',
            nullable: true,
            description: '審核備註或拒絕原因',
            example: null
          },
          basic_info: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                nullable: true,
                description: '縣市',
                example: '台北市'
              },
              district: {
                type: 'string',
                nullable: true,
                description: '區域',
                example: '中正區'
              },
              address: {
                type: 'string',
                nullable: true,
                description: '詳細地址',
                example: '中山南路5號'
              },
              main_category_id: {
                type: 'integer',
                nullable: true,
                description: '教授科目（主分類ID）',
                example: 1
              },
              sub_category_ids: {
                type: 'array',
                items: {
                  type: 'integer'
                },
                nullable: true,
                description: '專長（子分類ID陣列）',
                example: [1, 2, 3]
              },
              introduction: {
                type: 'string',
                nullable: true,
                description: '自我介紹',
                example: '我是一位經驗豐富的教師...'
              }
            }
          },
          work_experiences: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                company_name: { type: 'string', example: '某某公司' },
                job_title: { type: 'string', example: '軟體工程師' },
                is_working: { type: 'boolean', example: false },
                start_year: { type: 'integer', example: 2020 },
                start_month: { type: 'integer', example: 1 },
                end_year: { type: 'integer', nullable: true, example: 2022 },
                end_month: { type: 'integer', nullable: true, example: 12 }
              }
            },
            description: '工作經驗列表'
          },
          learning_experiences: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                degree: { type: 'string', example: '學士' },
                school_name: { type: 'string', example: '某某大學' },
                department: { type: 'string', example: '資訊工程學系' },
                is_in_school: { type: 'boolean', example: false },
                start_year: { type: 'integer', example: 2016 },
                start_month: { type: 'integer', example: 9 },
                end_year: { type: 'integer', nullable: true, example: 2020 },
                end_month: { type: 'integer', nullable: true, example: 6 }
              }
            },
            description: '學歷背景列表'
          },
          certificates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                license_name: { type: 'string', example: '某某證照' },
                verifying_institution: { type: 'string', example: '發證機構' },
                license_number: { type: 'string', example: 'CERT123456' },
                category_id: { type: 'string', example: 'programming' },
                subject: { type: 'string', example: '程式設計' }
              }
            },
            description: '教學證照列表'
          },
          id: { type: 'integer', example: 1 },
          uuid: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          user_id: { type: 'integer', example: 123 },
          created_at: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
          updated_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
        }
      }
    }
  },

  // 教師基本資訊回應 Schema
  TeacherBasicInfoSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: '取得教師基本資訊成功'
      },
      data: {
        type: 'object',
        properties: {
          basic_info: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              uuid: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              user_id: { type: 'integer', example: 123 },
              city: { type: 'string', example: '台北市' },
              district: { type: 'string', example: '中正區' },
              address: { type: 'string', example: '中山南路5號' },
              main_category_id: { type: 'integer', example: 1 },
              sub_category_ids: { type: 'array', items: { type: 'integer' }, example: [1, 2, 3] },
              introduction: { type: 'string', example: '我是一位經驗豐富的教師...' },
              created_at: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
              updated_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
            }
          }
        }
      }
    }
  },

  // 教師基本資訊更新請求 Schema
  TeacherBasicInfoUpdateRequest: {
    type: 'object',
    required: ['city', 'district', 'address', 'main_category_id', 'sub_category_ids', 'introduction'],
    properties: {
      city: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        description: '縣市（必填，1-50字元）',
        example: '台北市'
      },
      district: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        description: '區域（必填，1-50字元）',
        example: '中正區'
      },
      address: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '詳細地址（必填，1-200字元）',
        example: '中山南路5號'
      },
      main_category_id: {
        type: 'integer',
        minimum: 1,
        description: '教授科目（主分類ID，必填）',
        example: 1
      },
      sub_category_ids: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 1
        },
        minItems: 1,
        maxItems: 3,
        uniqueItems: true,
        description: '專長（子分類ID陣列，必填，最少1個最多3個）',
        example: [1, 2, 3]
      },
      introduction: {
        type: 'string',
        minLength: 100,
        maxLength: 1000,
        description: '自我介紹（必填，100-1000字元）',
        example: '我是一位經驗豐富的教師，擁有10年以上的教學經驗，專精於程式設計領域，能夠以淺顯易懂的方式教導學生掌握複雜的技術概念。'
      }
    }
  },

  // 教師基本資訊更新成功回應 Schema
  TeacherBasicInfoUpdateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: '教師基本資訊更新成功'
      },
      data: {
        type: 'object',
        properties: {
          basic_info: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              city: { type: 'string', example: '台北市' },
              district: { type: 'string', example: '中正區' },
              address: { type: 'string', example: '中山南路5號' },
              main_category_id: { type: 'integer', example: 1 },
              sub_category_ids: { type: 'array', items: { type: 'integer' }, example: [1, 2, 3] },
              introduction: { type: 'string', example: '我是一位經驗豐富的教師...' },
              updated_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
            }
          },
          notice: {
            type: 'string',
            example: '個人資料更新成功，相關變更將在下次重新登入後生效'
          }
        }
      }
    }
  },

  // 教師申請請求 Schema (基於 teacherApplicationSchema)
  TeacherApplicationRequest: {
    type: 'object',
    required: ['city', 'district', 'address', 'main_category_id', 'sub_category_ids', 'introduction'],
    properties: {
      city: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        description: '縣市（必填，1-50字元）',
        example: '台北市'
      },
      district: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        description: '區域（必填，1-50字元）',
        example: '中正區'
      },
      address: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '詳細地址（必填，1-200字元）',
        example: '中山南路5號'
      },
      main_category_id: {
        type: 'integer',
        minimum: 1,
        description: '教授科目（主分類ID，必填，只能選擇一個）',
        example: 1
      },
      sub_category_ids: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 1
        },
        minItems: 1,
        maxItems: 3,
        uniqueItems: true,
        description: '專長（子分類ID陣列，必填，最少1個最多3個不重複的專長）',
        example: [1, 2, 3]
      },
      introduction: {
        type: 'string',
        minLength: 100,
        maxLength: 1000,
        description: '自我介紹（必填，100-1000字元，用於審核評估）',
        example: '我是一位具備豐富教學經驗的老師，專長在於程式設計教學...'
      }
    }
  },

  // 教師資料 Schema (基於實際 Teacher entity 回應)
  TeacherData: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '教師記錄 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '教師 UUID',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      user_id: {
        type: 'integer',
        description: '關聯的使用者 ID',
        example: 123
      },
      city: {
        type: 'string',
        description: '縣市',
        example: '台北市'
      },
      district: {
        type: 'string',
        description: '區域',
        example: '中正區'
      },
      address: {
        type: 'string',
        description: '詳細地址',
        example: '中山南路5號'
      },
      main_category_id: {
        type: 'integer',
        description: '教授科目（主分類ID）',
        example: 1
      },
      sub_category_ids: {
        type: 'array',
        items: {
          type: 'integer'
        },
        description: '專長（子分類ID陣列）',
        example: [1, 2, 3]
      },
      introduction: {
        type: 'string',
        description: '自我介紹',
        example: '我是一位具備豐富教學經驗的老師，專長在於程式設計教學...'
      },
      application_status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        description: '申請狀態：pending(待審核)、approved(已通過)、rejected(已拒絕)',
        example: 'pending'
      },
      application_submitted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: '申請提交時間',
        example: '2024-01-15T10:30:00.000Z'
      },
      application_reviewed_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: '申請審核時間',
        example: null
      },
      reviewer_id: {
        type: 'integer',
        nullable: true,
        description: '審核者 ID',
        example: null
      },
      review_notes: {
        type: 'string',
        nullable: true,
        description: '審核備註',
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

  // 教師申請成功回應 Schema (基於 handleCreated 實作)
  TeacherApplicationSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '教師申請已建立'
      },
      data: {
        type: 'object',
        description: '回應資料',
        properties: {
          teacher: {
            $ref: '#/components/schemas/TeacherData',
            description: '新建立的教師申請資料'
          }
        }
      }
    }
  },

  // 教師申請驗證錯誤回應 (使用 allOf 組合共用 Schema)
  TeacherApplicationValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '教師申請參數驗證失敗'
          },
          errors: {
            example: {
              city: ['縣市為必填欄位', '縣市長度不能超過50個字元'],
              district: ['區域為必填欄位'],
              address: ['地址為必填欄位'],
              main_category_id: ['教授科目為必填欄位'],
              sub_category_ids: ['至少需要選擇1個專長', '最多只能選擇3個專長'],
              introduction: ['自我介紹為必填欄位', '自我介紹至少需要100個字元']
            }
          }
        }
      }
    ]
  },

  // 教師申請業務邏輯錯誤回應
  TeacherApplicationBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '此電子郵件已被註冊或教授科目不存在或專長不存在'
          }
        }
      }
    ]
  }
}