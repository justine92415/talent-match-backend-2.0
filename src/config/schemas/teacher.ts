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
              type: 'object',
              properties: {
                id: { type: 'integer', description: '工作經驗 ID', example: 1 },
                teacher_id: { type: 'integer', description: '教師 ID', example: 1 },
                is_working: { type: 'boolean', description: '是否仍在職', example: false },
                company_name: { type: 'string', description: '公司名稱', example: '某某科技公司' },
                workplace: { type: 'string', description: '工作地點', example: '台北市信義區' },
                job_category: { type: 'string', description: '工作類別', example: '軟體開發' },
                job_title: { type: 'string', description: '職位名稱', example: '資深工程師' },
                start_year: { type: 'integer', description: '開始年份', example: 2020 },
                start_month: { type: 'integer', description: '開始月份', example: 1 },
                end_year: { type: 'integer', nullable: true, description: '結束年份', example: 2022 },
                end_month: { type: 'integer', nullable: true, description: '結束月份', example: 12 },
                created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
                updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
              }
            },
            description: '工作經驗列表'
          },
          total: { type: 'integer', description: '總數量', example: 2 }
        }
      }
    }
  },

  // 工作經驗建立請求 Schema
  WorkExperienceCreateRequest: {
    type: 'object',
    required: ['company_name', 'workplace', 'job_category', 'job_title', 'is_working', 'start_year', 'start_month'],
    properties: {
      company_name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '公司名稱（必填，1-200字元）',
        example: '某某科技公司'
      },
      workplace: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '工作地點（必填，1-200字元）',
        example: '台北市信義區'
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
            type: 'object',
            properties: {
              id: { type: 'integer', description: '工作經驗 ID', example: 1 },
              teacher_id: { type: 'integer', description: '教師 ID', example: 1 },
              is_working: { type: 'boolean', description: '是否仍在職', example: false },
              company_name: { type: 'string', description: '公司名稱', example: '某某科技公司' },
              workplace: { type: 'string', description: '工作地點', example: '台北市信義區' },
              job_category: { type: 'string', description: '工作類別', example: '軟體開發' },
              job_title: { type: 'string', description: '職位名稱', example: '資深工程師' },
              start_year: { type: 'integer', description: '開始年份', example: 2020 },
              start_month: { type: 'integer', description: '開始月份', example: 1 },
              end_year: { type: 'integer', nullable: true, description: '結束年份', example: 2022 },
              end_month: { type: 'integer', nullable: true, description: '結束月份', example: 12 },
              created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
              updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
            }
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
            $ref: '#/components/schemas/WorkExperienceCreateSuccessResponse/properties/data/properties/work_experience'
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
              }
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
            }
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
            $ref: '#/components/schemas/LearningExperienceCreateSuccessResponse/properties/data/properties/learning_experience'
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
              type: 'object',
              properties: {
                id: { type: 'integer', description: '證照 ID', example: 1 },
                teacher_id: { type: 'integer', description: '教師 ID', example: 1 },
                certificate_name: { type: 'string', description: '證照名稱', example: 'AWS Solutions Architect' },
                issuer: { type: 'string', description: '發證機構', example: 'Amazon Web Services' },
                year: { type: 'integer', description: '取得年份', example: 2023 },
                month: { type: 'integer', description: '取得月份', example: 8 },
                certificate_url: { type: 'string', format: 'uri', nullable: true, description: '證照檔案 URL', example: 'https://example.com/certificate.pdf' },
                created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
                updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
              }
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
    required: ['certificate_name', 'issuer', 'year', 'month'],
    properties: {
      certificate_name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '證照名稱（必填，1-200字元）',
        example: 'AWS Solutions Architect'
      },
      issuer: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '發證機構（必填，1-200字元）',
        example: 'Amazon Web Services'
      },
      year: {
        type: 'integer',
        minimum: 1900,
        maximum: 2100,
        description: '取得年份（必填，1900-2100）',
        example: 2023
      },
      month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        description: '取得月份（必填，1-12）',
        example: 8
      },
      certificate_url: {
        type: 'string',
        format: 'uri',
        nullable: true,
        description: '證照檔案 URL（選填）',
        example: 'https://example.com/certificate.pdf'
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
            type: 'object',
            properties: {
              id: { type: 'integer', description: '證照 ID', example: 1 },
              teacher_id: { type: 'integer', description: '教師 ID', example: 1 },
              certificate_name: { type: 'string', description: '證照名稱', example: 'AWS Solutions Architect' },
              issuer: { type: 'string', description: '發證機構', example: 'Amazon Web Services' },
              year: { type: 'integer', description: '取得年份', example: 2023 },
              month: { type: 'integer', description: '取得月份', example: 8 },
              certificate_url: { type: 'string', format: 'uri', nullable: true, description: '證照檔案 URL', example: 'https://example.com/certificate.pdf' },
              created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
              updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
            }
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
            $ref: '#/components/schemas/CertificateCreateSuccessResponse/properties/data/properties/certificate'
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

  // 排程取得成功回應 Schema
  ScheduleGetSuccessResponse: {
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
        example: '取得教師排程成功'
      },
      data: {
        type: 'object',
        properties: {
          schedules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: '排程 ID', example: 1 },
                teacher_id: { type: 'integer', description: '教師 ID', example: 1 },
                day_of_week: { type: 'integer', enum: [0, 1, 2, 3, 4, 5, 6], description: '星期（0=星期日, 1=星期一, ..., 6=星期六）', example: 1 },
                start_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', description: '開始時間（HH:mm 格式）', example: '09:00' },
                end_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', description: '結束時間（HH:mm 格式）', example: '17:00' },
                created_at: { type: 'string', format: 'date-time', description: '建立時間', example: '2024-01-01T00:00:00.000Z' },
                updated_at: { type: 'string', format: 'date-time', description: '更新時間', example: '2024-01-15T10:30:00.000Z' }
              }
            },
            description: '排程列表'
          },
          formatted_schedules: {
            type: 'object',
            properties: {
              monday: { type: 'array', items: { type: 'string', example: '09:00-17:00' }, description: '星期一排程' },
              tuesday: { type: 'array', items: { type: 'string', example: '09:00-17:00' }, description: '星期二排程' },
              wednesday: { type: 'array', items: { type: 'string', example: '09:00-17:00' }, description: '星期三排程' },
              thursday: { type: 'array', items: { type: 'string', example: '09:00-17:00' }, description: '星期四排程' },
              friday: { type: 'array', items: { type: 'string', example: '09:00-17:00' }, description: '星期五排程' },
              saturday: { type: 'array', items: { type: 'string', example: '09:00-12:00' }, description: '星期六排程' },
              sunday: { type: 'array', items: { type: 'string' }, description: '星期日排程' }
            },
            description: '格式化的排程資料'
          }
        }
      }
    }
  },

  // 排程更新請求 Schema
  ScheduleUpdateRequest: {
    type: 'object',
    required: ['schedules'],
    properties: {
      schedules: {
        type: 'array',
        minItems: 1,
        maxItems: 50,
        items: {
          type: 'object',
          required: ['day_of_week', 'start_time', 'end_time'],
          properties: {
            day_of_week: {
              type: 'integer',
              enum: [0, 1, 2, 3, 4, 5, 6],
              description: '星期（0=星期日, 1=星期一, ..., 6=星期六，必填）',
              example: 1
            },
            start_time: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: '開始時間（HH:mm 格式，必填）',
              example: '09:00'
            },
            end_time: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: '結束時間（HH:mm 格式，必填）',
              example: '17:00'
            }
          }
        },
        description: '排程列表（必填，1-50個排程）'
      }
    }
  },

  // 排程更新成功回應 Schema
  ScheduleUpdateSuccessResponse: {
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
        example: '教師排程更新成功'
      },
      data: {
        type: 'object',
        properties: {
          schedules: {
            $ref: '#/components/schemas/ScheduleGetSuccessResponse/properties/data/properties/schedules'
          },
          formatted_schedules: {
            $ref: '#/components/schemas/ScheduleGetSuccessResponse/properties/data/properties/formatted_schedules'
          },
          updated_count: { type: 'integer', description: '更新的排程數量', example: 5 },
          deleted_count: { type: 'integer', description: '刪除的舊排程數量', example: 3 }
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
  }
}