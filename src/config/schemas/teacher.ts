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
                holder_name: { type: 'string', example: '王小明' },
                license_number: { type: 'string', example: 'CERT123456' },
                category_id: { type: 'integer', example: 1 },
                issue_year: { type: 'integer', example: 2023 },
                issue_month: { type: 'integer', example: 6 },
                expiry_year: { type: 'integer', nullable: true, example: 2026 },
                expiry_month: { type: 'integer', nullable: true, example: 6 },
                file_path: { type: 'string', nullable: true, example: '/uploads/certificates/cert123.pdf' }
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

  // 教師申請更新請求 Schema
  TeacherApplicationUpdateRequest: {
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
        example: '我是一位經驗豐富的教師，擁有10年以上的教學經驗。'
      }
    }
  },

  // 教師申請更新成功回應 Schema
  TeacherApplicationUpdateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '教師申請更新成功'
      },
      data: {
        type: 'object',
        properties: {
          teacher: {
            type: 'object',
            properties: {
              id: { type: 'integer', description: '教師 ID', example: 1 },
              uuid: { type: 'string', format: 'uuid', description: '教師唯一識別碼', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              user_id: { type: 'integer', description: '使用者 ID', example: 123 },
              city: { type: 'string', description: '縣市', example: '台北市' },
              district: { type: 'string', description: '區域', example: '中正區' },
              address: { type: 'string', description: '詳細地址', example: '中山南路5號' },
              main_category_id: { type: 'integer', description: '教授科目（主分類ID）', example: 1 },
              sub_category_ids: { type: 'array', items: { type: 'integer' }, description: '專長（子分類ID陣列）', example: [1, 2, 3] },
              introduction: { type: 'string', description: '自我介紹', example: '我是一位經驗豐富的教師...' },
              application_status: { type: 'string', enum: ['pending', 'approved', 'rejected'], description: '申請狀態', example: 'pending' },
              application_submitted_at: { type: 'string', format: 'date-time', nullable: true, description: '申請提交時間', example: '2024-01-15T10:30:00.000Z' },
              application_reviewed_at: { type: 'string', format: 'date-time', nullable: true, description: '審核完成時間', example: null },
              reviewer_id: { type: 'integer', nullable: true, description: '審核者ID', example: null },
              review_notes: { type: 'string', nullable: true, description: '審核備註或拒絕原因', example: null },
              created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
              updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
            }
          }
        }
      }
    }
  },

  // 重新提交成功回應 Schema
  TeacherResubmitSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '申請重新提交成功'
      },
      data: {
        type: 'object',
        properties: {
          teacher: {
            type: 'object',
            properties: {
              id: { type: 'integer', description: '教師 ID', example: 1 },
              uuid: { type: 'string', format: 'uuid', description: '教師唯一識別碼', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              application_status: { type: 'string', enum: ['pending'], description: '申請狀態', example: 'pending' },
              application_submitted_at: { type: 'string', format: 'date-time', description: '申請提交時間', example: '2024-01-15T10:30:00.000Z' },
              application_reviewed_at: { type: 'string', format: 'date-time', nullable: true, description: '審核完成時間（已清除）', example: null },
              reviewer_id: { type: 'integer', nullable: true, description: '審核者ID（已清除）', example: null },
              review_notes: { type: 'string', nullable: true, description: '審核備註（已清除）', example: null },
              updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
            }
          }
        }
      }
    }
  },

  // 提交申請成功回應 Schema
  TeacherSubmitSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '教師申請提交成功'
      },
      data: {
        type: 'object',
        properties: {
          teacher: {
            type: 'object',
            properties: {
              id: { type: 'integer', description: '教師 ID', example: 1 },
              uuid: { type: 'string', format: 'uuid', description: '教師唯一識別碼', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              application_status: { type: 'string', enum: ['pending'], description: '申請狀態', example: 'pending' },
              application_submitted_at: { type: 'string', format: 'date-time', description: '申請提交時間', example: '2024-01-15T10:30:00.000Z' },
              created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
              updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
            }
          }
        }
      }
    }
  },

  // 教師個人檔案成功回應 Schema
  TeacherProfileSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '取得教師個人檔案成功'
      },
      data: {
        type: 'object',
        properties: {
          teacher: {
            type: 'object',
            properties: {
              id: { type: 'integer', description: '教師 ID', example: 1 },
              uuid: { type: 'string', format: 'uuid', description: '教師唯一識別碼', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              user_id: { type: 'integer', description: '使用者 ID', example: 123 },
              city: { type: 'string', description: '縣市', example: '台北市' },
              district: { type: 'string', description: '區域', example: '中正區' },
              address: { type: 'string', description: '詳細地址', example: '中山南路5號' },
              main_category_id: { type: 'integer', description: '教授科目（主分類ID）', example: 1 },
              sub_category_ids: { type: 'array', items: { type: 'integer' }, description: '專長（子分類ID陣列）', example: [1, 2, 3] },
              introduction: { type: 'string', description: '自我介紹', example: '我是一位經驗豐富的教師...' },
              application_status: { type: 'string', enum: ['pending', 'approved', 'rejected'], description: '申請狀態', example: 'approved' },
              application_submitted_at: { type: 'string', format: 'date-time', nullable: true, description: '申請提交時間', example: '2024-01-10T10:30:00.000Z' },
              application_reviewed_at: { type: 'string', format: 'date-time', nullable: true, description: '審核完成時間', example: '2024-01-12T14:20:00.000Z' },
              reviewer_id: { type: 'integer', nullable: true, description: '審核者ID', example: 1 },
              review_notes: { type: 'string', nullable: true, description: '審核備註', example: '資格符合，核准申請' },
              total_students: { type: 'integer', description: '總學生數', example: 25 },
              total_courses: { type: 'integer', description: '總課程數', example: 8 },
              average_rating: { type: 'number', format: 'decimal', description: '平均評分', example: 4.5 },
              total_completed_lessons: { type: 'integer', description: '累積完成課堂數', example: 120 },
              total_earnings: { type: 'number', format: 'decimal', description: '總收入', example: 150000.00 },
              created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
              updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
            }
          }
        }
      }
    }
  },

  // 教師個人檔案更新請求 Schema
  TeacherProfileUpdateRequest: {
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
        example: '我是一位經驗豐富的教師，擁有10年以上的教學經驗。'
      }
    }
  },

  // 教師個人檔案更新成功回應 Schema
  TeacherProfileUpdateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '教師個人檔案更新成功'
      },
      data: {
        type: 'object',
        properties: {
          teacher: {
            type: 'object',
            properties: {
              id: { type: 'integer', description: '教師 ID', example: 1 },
              city: { type: 'string', description: '縣市', example: '台北市' },
              district: { type: 'string', description: '區域', example: '中正區' },
              address: { type: 'string', description: '詳細地址', example: '中山南路5號' },
              main_category_id: { type: 'integer', description: '教授科目（主分類ID）', example: 1 },
              sub_category_ids: { type: 'array', items: { type: 'integer' }, description: '專長（子分類ID陣列）', example: [1, 2, 3] },
              introduction: { type: 'string', description: '自我介紹', example: '我是一位經驗豐富的教師...' },
              application_status: { type: 'string', enum: ['approved'], description: '申請狀態', example: 'approved' },
              updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
            }
          },
          notice: {
            type: 'string',
            description: '更新提醒訊息',
            example: '個人資料更新成功，相關變更將在下次重新登入後生效'
          }
        }
      }
    }
  },

  // 工作經驗列表成功回應 Schema
  WorkExperienceListSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '取得工作經驗列表成功'
      },
      data: {
        type: 'object',
        properties: {
          work_experiences: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/WorkExperience'
            },
            description: '工作經驗列表'
          },
          total: { type: 'integer', description: '總數量', example: 2 }
        }
      }
    }
  },

  // 工作經驗實體 Schema
  WorkExperience: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: '工作經驗 ID', example: 1 },
      teacher_id: { type: 'integer', description: '教師 ID', example: 1 },
      is_working: { type: 'boolean', description: '是否仍在職', example: false },
      company_name: { type: 'string', description: '公司名稱', example: '某某科技公司' },
      city: { type: 'string', description: '工作縣市', example: '台北市' },
      district: { type: 'string', description: '工作地區', example: '信義區' },
      job_category: { type: 'string', description: '工作類別', example: '軟體開發' },
      job_title: { type: 'string', description: '職位名稱', example: '資深工程師' },
      start_year: { type: 'integer', description: '開始年份', example: 2020 },
      start_month: { type: 'integer', description: '開始月份', example: 1 },
      end_year: { type: 'integer', nullable: true, description: '結束年份', example: 2022 },
      end_month: { type: 'integer', nullable: true, description: '結束月份', example: 12 },
      created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
      updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
    },
    required: ['id', 'teacher_id', 'company_name', 'city', 'district', 'job_category', 'job_title', 'is_working', 'start_year', 'start_month', 'created_at', 'updated_at']
  },

  // 工作經驗建立請求 Schema
  WorkExperienceCreateRequest: {
    type: 'object',
    required: ['company_name', 'city', 'district', 'job_category', 'job_title', 'is_working', 'start_year', 'start_month'],
    properties: {
      company_name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '公司名稱（必填，1-200字元）',
        example: '某某科技公司'
      },
      city: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        description: '工作縣市（必填，1-50字元）',
        example: '台北市'
      },
      district: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        description: '工作地區（必填，1-50字元）',
        example: '信義區'
      },
      job_category: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: '工作類別（必填，1-100字元）',
        example: '軟體開發'
      },
      job_title: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: '職位名稱（必填，1-100字元）',
        example: '資深工程師'
      },
      is_working: {
        type: 'boolean',
        description: '是否仍在職（必填）',
        example: false
      },
      start_year: {
        type: 'integer',
        minimum: 1900,
        maximum: 2100,
        description: '開始年份（必填，1900-2100）',
        example: 2020
      },
      start_month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        description: '開始月份（必填，1-12）',
        example: 1
      },
      end_year: {
        type: 'integer',
        minimum: 1900,
        maximum: 2100,
        nullable: true,
        description: '結束年份（選填，如仍在職可為空，1900-2100）',
        example: 2022
      },
      end_month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        nullable: true,
        description: '結束月份（選填，如仍在職可為空，1-12）',
        example: 12
      }
    }
  },

  // 批次工作經驗建立請求 Schema
  WorkExperienceBatchCreateRequest: {
    type: 'object',
    required: ['work_experiences'],
    properties: {
      work_experiences: {
        type: 'array',
        minItems: 1,
        maxItems: 20,
        description: '工作經驗陣列（必填，1-20筆）',
        items: {
          $ref: '#/components/schemas/WorkExperienceCreateRequest'
        },
        example: [
          {
            company_name: '某某科技公司',
            city: '台北市',
            district: '信義區',
            job_category: '軟體開發',
            job_title: '資深工程師',
            is_working: false,
            start_year: 2020,
            start_month: 1,
            end_year: 2022,
            end_month: 12
          },
          {
            company_name: '另一家公司',
            city: '新北市',
            district: '板橋區',
            job_category: '產品管理',
            job_title: '產品經理',
            is_working: true,
            start_year: 2023,
            start_month: 1,
            end_year: null,
            end_month: null
          }
        ]
      }
    }
  },

  // 批次工作經驗建立成功回應 Schema
  WorkExperienceBatchCreateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '成功建立 2 筆工作經驗'
      },
      data: {
        type: 'object',
        properties: {
          work_experiences: {
            type: 'array',
            description: '建立的工作經驗記錄陣列',
            items: {
              $ref: '#/components/schemas/WorkExperience'
            }
          }
        },
        required: ['work_experiences']
      }
    },
    required: ['status', 'message', 'data']
  },

  // 工作經驗建立成功回應 Schema
  WorkExperienceCreateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '工作經驗建立成功'
      },
      data: {
        type: 'object',
        properties: {
          work_experience: {
            $ref: '#/components/schemas/WorkExperience'
          }
        }
      }
    }
  },

  // 工作經驗更新請求 Schema (與建立請求相同結構)
  WorkExperienceUpdateRequest: {
    $ref: '#/components/schemas/WorkExperienceCreateRequest'
  },

  // 工作經驗更新成功回應 Schema
  WorkExperienceUpdateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '工作經驗更新成功'
      },
      data: {
        type: 'object',
        properties: {
          work_experience: {
            $ref: '#/components/schemas/WorkExperience'
          }
        }
      }
    }
  },

  // 工作經驗刪除成功回應 Schema
  WorkExperienceDeleteSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '工作經驗刪除成功'
      },
      data: {
        nullable: true,
        description: '此 API 無回傳資料',
        example: null
      }
    }
  },

  // 學習經驗實體 Schema
  LearningExperience: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: '學習經驗 ID', example: 1 },
      teacher_id: { type: 'integer', description: '教師 ID', example: 1 },
      school_name: { type: 'string', description: '學校名稱', example: '國立台灣大學' },
      major: { type: 'string', description: '主修科目', example: '資訊工程學系' },
      degree: { type: 'string', enum: ['高中', '專科', '學士', '碩士', '博士'], description: '學位', example: '學士' },
      is_studying: { type: 'boolean', description: '是否仍在就讀', example: false },
      start_year: { type: 'integer', description: '開始年份', example: 2016 },
      start_month: { type: 'integer', description: '開始月份', example: 9 },
      end_year: { type: 'integer', nullable: true, description: '結束年份', example: 2020 },
      end_month: { type: 'integer', nullable: true, description: '結束月份', example: 6 },
      created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
      updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
    },
    required: ['id', 'teacher_id', 'school_name', 'major', 'degree', 'is_studying', 'start_year', 'start_month', 'created_at', 'updated_at']
  },

  // 學習經驗列表成功回應 Schema
  LearningExperienceListSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '取得學習經驗列表成功'
      },
      data: {
        type: 'object',
        properties: {
          learning_experiences: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/LearningExperience'
            },
            description: '學習經驗列表'
          },
          total: { type: 'integer', description: '總數量', example: 2 }
        }
      }
    }
  },

  // 學習經驗建立請求 Schema
  LearningExperienceCreateRequest: {
    type: 'object',
    required: ['school_name', 'major', 'degree', 'is_studying', 'start_year', 'start_month'],
    properties: {
      school_name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '學校名稱（必填，1-200字元）',
        example: '國立台灣大學'
      },
      major: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: '主修科目（必填，1-100字元）',
        example: '資訊工程學系'
      },
      degree: {
        type: 'string',
        enum: ['高中', '專科', '學士', '碩士', '博士'],
        description: '學位（必填）',
        example: '學士'
      },
      is_studying: {
        type: 'boolean',
        description: '是否仍在就讀（必填）',
        example: false
      },
      start_year: {
        type: 'integer',
        minimum: 1900,
        maximum: 2100,
        description: '開始年份（必填，1900-2100）',
        example: 2016
      },
      start_month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        description: '開始月份（必填，1-12）',
        example: 9
      },
      end_year: {
        type: 'integer',
        minimum: 1900,
        maximum: 2100,
        nullable: true,
        description: '結束年份（選填，如仍在學可為空，1900-2100）',
        example: 2020
      },
      end_month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        nullable: true,
        description: '結束月份（選填，如仍在學可為空，1-12）',
        example: 6
      }
    }
  },

  // 學習經驗建立成功回應 Schema
  LearningExperienceCreateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '學習經驗建立成功'
      },
      data: {
        type: 'object',
        properties: {
          learning_experience: {
            $ref: '#/components/schemas/LearningExperience'
          }
        }
      }
    }
  },

  // 學習經驗更新請求 Schema (與建立請求相同結構)
  LearningExperienceUpdateRequest: {
    $ref: '#/components/schemas/LearningExperienceCreateRequest'
  },

  // 學習經驗更新成功回應 Schema
  LearningExperienceUpdateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '學習經驗更新成功'
      },
      data: {
        type: 'object',
        properties: {
          learning_experience: {
            $ref: '#/components/schemas/LearningExperience'
          }
        }
      }
    }
  },

  // 學習經驗刪除成功回應 Schema
  LearningExperienceDeleteSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '學習經驗刪除成功'
      },
      data: {
        nullable: true,
        description: '此 API 無回傳資料',
        example: null
      }
    }
  },

  // 證照實體 Schema
  Certificate: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: '證照 ID', example: 1 },
      teacher_id: { type: 'integer', description: '教師 ID', example: 1 },
      license_name: { type: 'string', description: '證照名稱', example: 'AWS Solutions Architect' },
      verifying_institution: { type: 'string', description: '發證機構', example: 'Amazon Web Services' },
      holder_name: { type: 'string', description: '持有人姓名', example: '王小明' },
      license_number: { type: 'string', description: '證照編號', example: 'AWS-12345' },
      category_id: { type: 'integer', description: '證照分類 ID', example: 1 },
      issue_year: { type: 'integer', description: '發證年份', example: 2023 },
      issue_month: { type: 'integer', description: '發證月份', example: 6 },
      expiry_year: { type: 'integer', nullable: true, description: '到期年份', example: 2026 },
      expiry_month: { type: 'integer', nullable: true, description: '到期月份', example: 6 },
      file_path: { type: 'string', nullable: true, description: '證照檔案路徑', example: '/uploads/certificates/aws-cert.pdf' },
      created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
      updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
    },
    required: ['id', 'teacher_id', 'license_name', 'verifying_institution', 'holder_name', 'license_number', 'category_id', 'issue_year', 'issue_month', 'created_at', 'updated_at']
  },

  // 證照列表成功回應 Schema
  CertificateListSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '取得證照列表成功'
      },
      data: {
        type: 'object',
        properties: {
          certificates: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Certificate'
            },
            description: '證照列表'
          },
          total: { type: 'integer', description: '總數量', example: 2 }
        }
      }
    }
  },

  // 證照建立請求 Schema
  CertificateCreateRequest: {
    type: 'object',
    required: ['license_name', 'verifying_institution', 'holder_name', 'license_number', 'category_id', 'issue_year', 'issue_month'],
    properties: {
      license_name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '證照名稱（必填，1-200字元）',
        example: 'AWS Solutions Architect'
      },
      verifying_institution: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '發證機構（必填，1-200字元）',
        example: 'Amazon Web Services'
      },
      holder_name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: '持有人姓名（必填，1-100字元）',
        example: '王小明'
      },
      license_number: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: '證照編號（必填，1-100字元）',
        example: 'AWS-12345'
      },
      category_id: {
        type: 'integer',
        minimum: 1,
        description: '證照分類 ID（必填，正整數）',
        example: 1
      },
      issue_year: {
        type: 'integer',
        minimum: 1900,
        maximum: 2100,
        description: '發證年份（必填，1900-2100）',
        example: 2023
      },
      issue_month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        description: '發證月份（必填，1-12）',
        example: 6
      },
      expiry_year: {
        type: 'integer',
        minimum: 1900,
        maximum: 2150,
        nullable: true,
        description: '到期年份（選填，1900-2150）',
        example: 2026
      },
      expiry_month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        nullable: true,
        description: '到期月份（選填，1-12）',
        example: 6
      },
      file_path: {
        type: 'string',
        maxLength: 500,
        nullable: true,
        description: '證照檔案路徑（選填，最多500字元）',
        example: '/uploads/certificates/aws-cert.pdf'
      }
    }
  },

  // 證照建立成功回應 Schema
  CertificateCreateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '證照建立成功'
      },
      data: {
        type: 'object',
        properties: {
          certificate: {
            $ref: '#/components/schemas/Certificate'
          }
        }
      }
    }
  },

  // 證照更新請求 Schema (與建立請求相同結構)
  CertificateUpdateRequest: {
    $ref: '#/components/schemas/CertificateCreateRequest'
  },

  // 證照更新成功回應 Schema
  CertificateUpdateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '證照更新成功'
      },
      data: {
        type: 'object',
        properties: {
          certificate: {
            $ref: '#/components/schemas/Certificate'
          }
        }
      }
    }
  },

  // 證照刪除成功回應 Schema
  CertificateDeleteSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '證照刪除成功'
      },
      data: {
        nullable: true,
        description: '此 API 無回傳資料',
        example: null
      }
    }
  },

  // === 批次和 UPSERT Schema ===

  // 工作經驗批次建立請求 Schema (已存在)
  // WorkExperienceBatchCreateRequest: {
  //   已在上面定義
  // },

  // 工作經驗 UPSERT 請求 Schema
  WorkExperienceUpsertRequest: {
    type: 'object',
    required: ['work_experiences'],
    properties: {
      work_experiences: {
        type: 'array',
        items: {
          allOf: [
            { $ref: '#/components/schemas/WorkExperienceCreateRequest' },
            {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: '工作經驗 ID（用於更新，新增時不提供）',
                  example: 123
                }
              }
            }
          ]
        },
        minItems: 1,
        maxItems: 20,
        description: '工作經驗陣列（1-20筆）'
      }
    }
  },

  // 工作經驗 UPSERT 回應 Schema
  WorkExperienceUpsertResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: '工作經驗批次處理完成'
      },
      data: {
        type: 'object',
        properties: {
          work_experiences: {
            type: 'array',
            items: { $ref: '#/components/schemas/WorkExperience' }
          }
        }
      }
    }
  },

  // 學習經驗批次建立請求 Schema
  LearningExperienceBatchCreateRequest: {
    type: 'object',
    required: ['learning_experiences'],
    properties: {
      learning_experiences: {
        type: 'array',
        items: { $ref: '#/components/schemas/LearningExperienceCreateRequest' },
        minItems: 1,
        maxItems: 20,
        description: '學習經驗陣列（1-20筆）'
      }
    }
  },

  // 學習經驗批次建立成功回應 Schema
  LearningExperienceBatchCreateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: '成功建立 2 筆學習經驗'
      },
      data: {
        type: 'object',
        properties: {
          learning_experiences: {
            type: 'array',
            items: { $ref: '#/components/schemas/LearningExperience' }
          }
        }
      }
    }
  },

  // 學習經驗 UPSERT 請求 Schema
  LearningExperienceUpsertRequest: {
    type: 'object',
    required: ['learning_experiences'],
    properties: {
      learning_experiences: {
        type: 'array',
        items: {
          allOf: [
            { $ref: '#/components/schemas/LearningExperienceCreateRequest' },
            {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: '學習經驗 ID（用於更新，新增時不提供）',
                  example: 456
                }
              }
            }
          ]
        },
        minItems: 1,
        maxItems: 20,
        description: '學習經驗陣列（1-20筆）'
      }
    }
  },

  // 學習經驗 UPSERT 回應 Schema
  LearningExperienceUpsertResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: '學習經驗批次處理完成'
      },
      data: {
        type: 'object',
        properties: {
          learning_experiences: {
            type: 'array',
            items: { $ref: '#/components/schemas/LearningExperience' }
          }
        }
      }
    }
  },

  // 證書批次建立請求 Schema
  CertificateBatchCreateRequest: {
    type: 'object',
    required: ['certificates'],
    properties: {
      certificates: {
        type: 'array',
        items: { $ref: '#/components/schemas/CertificateCreateRequest' },
        minItems: 1,
        maxItems: 20,
        description: '證書陣列（1-20筆）'
      }
    }
  },

  // 證書批次建立成功回應 Schema
  CertificateBatchCreateSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: '成功建立 2 張證書'
      },
      data: {
        type: 'object',
        properties: {
          certificates: {
            type: 'array',
            items: { $ref: '#/components/schemas/Certificate' }
          }
        }
      }
    }
  },

  // 證書 UPSERT 請求 Schema
  CertificateUpsertRequest: {
    type: 'object',
    required: ['certificates'],
    properties: {
      certificates: {
        type: 'array',
        items: {
          allOf: [
            { $ref: '#/components/schemas/CertificateCreateRequest' },
            {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: '證書 ID（用於更新，新增時不提供）',
                  example: 789
                }
              }
            }
          ]
        },
        minItems: 1,
        maxItems: 20,
        description: '證書陣列（1-20筆）'
      }
    }
  },

  // 證書 UPSERT 回應 Schema
  CertificateUpsertResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: '證書批次處理完成'
      },
      data: {
        type: 'object',
        properties: {
          certificates: {
            type: 'array',
            items: { $ref: '#/components/schemas/Certificate' }
          }
        }
      }
    }
  },

  // 排程衝突檢查成功回應 Schema
  ScheduleConflictCheckSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '排程衝突檢查完成'
      },
      data: {
        type: 'object',
        properties: {
          has_conflicts: { type: 'boolean', description: '是否有衝突', example: false },
          conflicts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date', description: '衝突日期', example: '2024-01-15' },
                time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', description: '衝突時間', example: '10:00' },
                reason: { type: 'string', description: '衝突原因', example: '與現有課程預約衝突' },
                course_id: { type: 'integer', nullable: true, description: '衝突課程 ID', example: 1 },
                reservation_id: { type: 'integer', nullable: true, description: '衝突預約 ID', example: 1 }
              }
            },
            description: '衝突詳細列表'
          },
          total_conflicts: { type: 'integer', description: '衝突總數', example: 0 }
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
  },

  // ==================== 管理員功能相關 Schema ==================== 

  // 教師申請資訊 Schema
  TeacherApplicationInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '申請 ID',
        example: 1
      },
      teacher_id: {
        type: 'integer',
        description: '教師 ID',
        example: 1
      },
      name: {
        type: 'string',
        description: '教師姓名',
        example: '王小明'
      },
      email: {
        type: 'string',
        description: '教師電子郵件',
        example: 'teacher@example.com'
      },
      nationality: {
        type: 'string',
        description: '國籍',
        example: '台灣'
      },
      introduction: {
        type: 'string',
        description: '自我介紹',
        example: '我是一位經驗豐富的程式設計講師'
      },
      teaching_experience: {
        type: 'string',
        description: '教學經驗',
        example: '5年以上教學經驗'
      },
      application_status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        description: '申請狀態',
        example: 'pending'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '申請時間',
        example: '2024-01-15T10:30:00.000Z'
      }
    }
  },

  // ==================== 教師後台相關 Schema ==================== 

  // 教師儀表板總覽 Schema
  TeacherDashboardOverview: {
    type: 'object',
    properties: {
      total_students: {
        type: 'integer',
        description: '總學生數',
        example: 25
      },
      active_courses: {
        type: 'integer',
        description: '活躍課程數',
        example: 3
      },
      total_earnings: {
        type: 'number',
        format: 'float',
        description: '總收入',
        example: 15000.50
      },
      pending_reservations: {
        type: 'integer',
        description: '待確認預約數',
        example: 2
      },
      average_rating: {
        type: 'number',
        format: 'float',
        description: '平均評分',
        example: 4.8
      },
      total_reviews: {
        type: 'integer',
        description: '總評價數',
        example: 45
      }
    }
  },

  // 教師詳細統計 Schema
  TeacherDetailedStatistics: {
    type: 'object',
    properties: {
      monthly_earnings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            month: {
              type: 'string',
              description: '月份',
              example: '2024-01'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: '金額',
              example: 2500.00
            }
          }
        }
      },
      course_performance: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            course_name: {
              type: 'string',
              description: '課程名稱',
              example: 'JavaScript 基礎'
            },
            student_count: {
              type: 'integer',
              description: '學生數',
              example: 12
            },
            rating: {
              type: 'number',
              format: 'float',
              description: '評分',
              example: 4.7
            }
          }
        }
      },
      teaching_hours: {
        type: 'object',
        properties: {
          this_month: {
            type: 'integer',
            description: '本月教學時數',
            example: 40
          },
          last_month: {
            type: 'integer',
            description: '上月教學時數',
            example: 35
          }
        }
      }
    }
  },

  // 教師學生資訊 Schema
  TeacherStudentInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '學生 ID',
        example: 1
      },
      name: {
        type: 'string',
        description: '學生姓名',
        example: '李小華'
      },
      email: {
        type: 'string',
        description: '學生電子郵件',
        example: 'student@example.com'
      },
      avatar: {
        type: 'string',
        nullable: true,
        description: '學生頭像',
        example: 'https://example.com/avatar.jpg'
      },
      enrolled_courses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            course_name: {
              type: 'string',
              description: '課程名稱',
              example: 'JavaScript 基礎'
            },
            progress: {
              type: 'number',
              format: 'float',
              description: '學習進度 (0-100%)',
              example: 75.5
            }
          }
        }
      },
      total_lessons: {
        type: 'integer',
        description: '總課堂數',
        example: 10
      },
      completed_lessons: {
        type: 'integer',
        description: '已完成課堂數',
        example: 7
      }
    }
  },

  // 教師預約資訊 Schema
  TeacherReservationInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '預約 ID',
        example: 1
      },
      student_name: {
        type: 'string',
        description: '學生姓名',
        example: '張小明'
      },
      course_name: {
        type: 'string',
        description: '課程名稱',
        example: 'Python 基礎'
      },
      reservation_date: {
        type: 'string',
        format: 'date',
        description: '預約日期',
        example: '2024-01-20'
      },
      reservation_time: {
        type: 'string',
        description: '預約時間',
        example: '14:00-15:00'
      },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        description: '預約狀態',
        example: 'pending'
      },
      notes: {
        type: 'string',
        nullable: true,
        description: '備註',
        example: '學生希望複習迴圈概念'
      }
    }
  },

  // 教師收入資訊 Schema
  TeacherEarningInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '收入記錄 ID',
        example: 1
      },
      source_type: {
        type: 'string',
        enum: ['course_sale', 'lesson_fee', 'bonus'],
        description: '收入來源類型',
        example: 'course_sale'
      },
      amount: {
        type: 'number',
        format: 'float',
        description: '收入金額',
        example: 1500.00
      },
      description: {
        type: 'string',
        description: '收入描述',
        example: 'JavaScript 基礎課程銷售'
      },
      earned_date: {
        type: 'string',
        format: 'date',
        description: '收入日期',
        example: '2024-01-15'
      },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'paid'],
        description: '收入狀態',
        example: 'confirmed'
      }
    }
  },

  // 收入摘要 Schema
  EarningSummary: {
    type: 'object',
    properties: {
      total_earnings: {
        type: 'number',
        format: 'float',
        description: '總收入',
        example: 25000.00
      },
      this_month_earnings: {
        type: 'number',
        format: 'float',
        description: '本月收入',
        example: 3500.00
      },
      last_month_earnings: {
        type: 'number',
        format: 'float',
        description: '上月收入',
        example: 2800.00
      },
      pending_amount: {
        type: 'number',
        format: 'float',
        description: '待結算金額',
        example: 800.00
      },
      growth_rate: {
        type: 'number',
        format: 'float',
        description: '成長率 (%)',
        example: 25.0
      }
    }
  },

  // 教師結算資訊 Schema
  TeacherSettlementInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '結算 ID',
        example: 1
      },
      period_start: {
        type: 'string',
        format: 'date',
        description: '結算期間開始',
        example: '2024-01-01'
      },
      period_end: {
        type: 'string',
        format: 'date',
        description: '結算期間結束',
        example: '2024-01-31'
      },
      total_amount: {
        type: 'number',
        format: 'float',
        description: '結算總金額',
        example: 5000.00
      },
      platform_fee: {
        type: 'number',
        format: 'float',
        description: '平台手續費',
        example: 500.00
      },
      net_amount: {
        type: 'number',
        format: 'float',
        description: '實際收入',
        example: 4500.00
      },
      status: {
        type: 'string',
        enum: ['pending', 'processing', 'completed'],
        description: '結算狀態',
        example: 'completed'
      },
      settled_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: '結算時間',
        example: '2024-02-01T10:00:00.000Z'
      }
    }
  },

  // 結算詳細資訊 Schema
  SettlementDetailInfo: {
    type: 'object',
    properties: {
      settlement_id: {
        type: 'integer',
        description: '結算 ID',
        example: 1
      },
      period_info: {
        type: 'object',
        properties: {
          start_date: {
            type: 'string',
            format: 'date',
            description: '期間開始日',
            example: '2024-01-01'
          },
          end_date: {
            type: 'string',
            format: 'date',
            description: '期間結束日',
            example: '2024-01-31'
          }
        }
      },
      earnings_breakdown: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              description: '收入來源',
              example: 'JavaScript 基礎課程'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: '金額',
              example: 1500.00
            },
            date: {
              type: 'string',
              format: 'date',
              description: '收入日期',
              example: '2024-01-15'
            }
          }
        }
      },
      deductions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: '扣款類型',
              example: '平台手續費'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: '扣款金額',
              example: 150.00
            },
            rate: {
              type: 'number',
              format: 'float',
              description: '扣款比例 (%)',
              example: 10.0
            }
          }
        }
      },
      final_amount: {
        type: 'number',
        format: 'float',
        description: '最終結算金額',
        example: 4500.00
      }
    }
  },

  // 收入統計 Schema
  EarningsStatistics: {
    type: 'object',
    properties: {
      overview: {
        type: 'object',
        properties: {
          total_revenue: {
            type: 'number',
            format: 'float',
            description: '總營收',
            example: 50000.00
          },
          average_monthly: {
            type: 'number',
            format: 'float',
            description: '月均收入',
            example: 4166.67
          },
          best_month: {
            type: 'object',
            properties: {
              month: {
                type: 'string',
                description: '最佳月份',
                example: '2024-03'
              },
              amount: {
                type: 'number',
                format: 'float',
                description: '收入金額',
                example: 6500.00
              }
            }
          }
        }
      },
      trends: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            month: {
              type: 'string',
              description: '月份',
              example: '2024-01'
            },
            earnings: {
              type: 'number',
              format: 'float',
              description: '收入',
              example: 3500.00
            },
            growth: {
              type: 'number',
              format: 'float',
              description: '成長率 (%)',
              example: 12.5
            }
          }
        }
      },
      by_source: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source_type: {
              type: 'string',
              description: '收入來源',
              example: '課程銷售'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: '金額',
              example: 35000.00
            },
            percentage: {
              type: 'number',
              format: 'float',
              description: '佔比 (%)',
              example: 70.0
            }
          }
        }
      }
    }
  },

  // 學生詳細資訊 Schema
  StudentDetailInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '學生 ID',
        example: 1
      },
      name: {
        type: 'string',
        description: '學生姓名',
        example: '李小華'
      },
      email: {
        type: 'string',
        format: 'email',
        description: '學生電子郵件',
        example: 'student@example.com'
      },
      avatar: {
        type: 'string',
        nullable: true,
        description: '學生頭像 URL',
        example: 'https://example.com/avatars/student.jpg'
      },
      phone: {
        type: 'string',
        nullable: true,
        description: '聯絡電話',
        example: '0912345678'
      },
      registration_date: {
        type: 'string',
        format: 'date-time',
        description: '註冊日期',
        example: '2024-01-15T10:30:00.000Z'
      },
      learning_status: {
        type: 'string',
        enum: ['active', 'inactive', 'suspended'],
        description: '學習狀態',
        example: 'active'
      },
      enrolled_courses: {
        type: 'array',
        description: '已報名課程',
        items: {
          type: 'object',
          properties: {
            course_id: {
              type: 'integer',
              description: '課程 ID',
              example: 1
            },
            course_name: {
              type: 'string',
              description: '課程名稱',
              example: 'JavaScript 基礎入門'
            },
            enrollment_date: {
              type: 'string',
              format: 'date-time',
              description: '報名日期',
              example: '2024-01-20T14:00:00.000Z'
            },
            progress: {
              type: 'number',
              format: 'float',
              description: '學習進度 (0-100)',
              example: 75.5
            },
            status: {
              type: 'string',
              enum: ['enrolled', 'in_progress', 'completed', 'dropped'],
              description: '課程狀態',
              example: 'in_progress'
            }
          }
        }
      },
      lesson_history: {
        type: 'array',
        description: '上課記錄',
        items: {
          type: 'object',
          properties: {
            lesson_date: {
              type: 'string',
              format: 'date',
              description: '上課日期',
              example: '2024-01-25'
            },
            lesson_time: {
              type: 'string',
              description: '上課時間',
              example: '14:00-15:00'
            },
            course_name: {
              type: 'string',
              description: '課程名稱',
              example: 'JavaScript 基礎入門'
            },
            status: {
              type: 'string',
              enum: ['attended', 'absent', 'cancelled'],
              description: '出席狀態',
              example: 'attended'
            },
            notes: {
              type: 'string',
              nullable: true,
              description: '課堂筆記',
              example: '學生對迴圈概念掌握良好'
            }
          }
        }
      },
      payment_history: {
        type: 'array',
        description: '付款記錄',
        items: {
          type: 'object',
          properties: {
            payment_date: {
              type: 'string',
              format: 'date-time',
              description: '付款日期',
              example: '2024-01-20T10:00:00.000Z'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: '付款金額',
              example: 2000.00
            },
            course_name: {
              type: 'string',
              description: '課程名稱',
              example: 'JavaScript 基礎入門'
            },
            payment_method: {
              type: 'string',
              description: '付款方式',
              example: '信用卡'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              description: '付款狀態',
              example: 'completed'
            }
          }
        }
      },
      total_paid: {
        type: 'number',
        format: 'float',
        description: '總付款金額',
        example: 5000.00
      },
      learning_preferences: {
        type: 'object',
        nullable: true,
        description: '學習偏好',
        properties: {
          preferred_time: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: '偏好上課時間',
            example: ['週二 14:00-16:00', '週四 19:00-21:00']
          },
          learning_style: {
            type: 'string',
            description: '學習風格',
            example: '視覺型學習者'
          },
          special_requirements: {
            type: 'string',
            nullable: true,
            description: '特殊需求',
            example: '需要中文字幕'
          }
        }
      }
    }
  }
}