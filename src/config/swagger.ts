import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Talent Match API',
    version: '2.0.0',
    description: '全面重構後的 Talent Match 後端 API 文件',
    contact: {
      name: 'API 支援',
      url: 'https://example.com/support'
    }
  },
  servers: [
    {
      url: 'http://localhost:8080/api',
      description: '開發環境'
    },
    {
      url: 'https://api.talent-match.com/api',
      description: '正式環境'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token 認證'
      }
    },
    schemas: {
      // === 公開課程瀏覽相關 Schema ===

      // 課程列表項目 Schema
      CourseListItem: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: '課程ID',
          example: 41
        },
        uuid: {
          type: 'string',
          format: 'uuid',
          description: '課程UUID',
          example: 'c5b71a6b-7d27-4e4a-8e9f-123456789abc'
        },
        name: {
          type: 'string',
          description: '課程名稱',
          example: 'Python 程式設計基礎'
        },
        main_image: {
          type: 'string',
          nullable: true,
          description: '課程主圖片',
          example: '/images/courses/python-basics.jpg'
        },
        rate: {
          type: 'number',
          format: 'float',
          description: '平均評分',
          example: 4.5
        },
        review_count: {
          type: 'integer',
          description: '評價數量',
          example: 25
        },
        student_count: {
          type: 'integer',
          description: '學生數量',
          example: 150
        },
        view_count: {
          type: 'integer',
          description: '瀏覽次數',
          example: 1250
        },
        teacher: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 5
            },
            user: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: '王老師'
                },
                avatar_image: {
                  type: 'string',
                  nullable: true,
                  example: '/avatars/teacher_5.jpg'
                }
              }
            },
            nationality: {
              type: 'string',
              example: '台灣'
            }
          }
        },
        main_category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: '程式設計'
            }
          }
        },
        sub_category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 2
            },
            name: {
              type: 'string',
              example: 'Python'
            }
          }
        }
      }
    },

    // 分頁資訊 Schema
    PaginationInfo: {
      type: 'object',
      properties: {
        current_page: {
          type: 'integer',
          minimum: 1,
          maximum: 999999,
          description: '目前頁碼',
          example: 1
        },
        per_page: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: '每頁筆數',
          example: 12
        },
        total: {
          type: 'integer',
          minimum: 0,
          maximum: 999999999,
          description: '總筆數',
          example: 25
        },
        total_pages: {
          type: 'integer',
          minimum: 0,
          maximum: 999999,
          description: '總頁數',
          example: 3
        }
      }
    },

    // 課程篩選條件 Schema
    CourseFilters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          nullable: true,
          description: '關鍵字',
          example: 'Python'
        },
        main_category_id: {
          type: 'integer',
          nullable: true,
          description: '主分類ID',
          example: 1
        },
        sub_category_id: {
          type: 'integer',
          nullable: true,
          description: '次分類ID',
          example: 2
        },
        city_id: {
          type: 'integer',
          nullable: true,
          description: '城市ID',
          example: 1
        },
        sort: {
          type: 'string',
          description: '排序方式',
          example: 'newest'
        }
      }
    },

    // 課程詳情 Schema
    CourseDetail: {
      type: 'object',
      properties: {
        course: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '課程ID',
              example: 41
            },
            uuid: {
              type: 'string',
              format: 'uuid',
              description: '課程UUID',
              example: 'c5b71a6b-7d27-4e4a-8e9f-123456789abc'
            },
            name: {
              type: 'string',
              description: '課程名稱',
              example: 'Python 程式設計基礎'
            },
            content: {
              type: 'string',
              description: '課程內容',
              example: '完整的Python程式設計入門課程，從基礎語法開始教學...'
            },
            main_image: {
              type: 'string',
              nullable: true,
              description: '課程主圖片',
              example: '/images/courses/python-basics.jpg'
            },
            rate: {
              type: 'number',
              format: 'float',
              description: '平均評分',
              example: 4.5
            },
            review_count: {
              type: 'integer',
              description: '評價數量',
              example: 25
            },
            student_count: {
              type: 'integer',
              description: '學生數量',
              example: 150
            },
            view_count: {
              type: 'integer',
              description: '瀏覽次數（已加1）',
              example: 1251
            },
            main_category: {
              $ref: '#/components/schemas/CategoryInfo'
            },
            sub_category: {
              $ref: '#/components/schemas/CategoryInfo'
            },
            city: {
              $ref: '#/components/schemas/CityInfo'
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
        teacher: {
          $ref: '#/components/schemas/CourseTeacherInfo'
        },
        price_options: {
          type: 'array',
          items: {
            type: 'object'
          },
          description: '價格選項（TODO）'
        },
        videos: {
          type: 'array',
          items: {
            type: 'object'
          },
          description: '課程影片（TODO）'
        },
        files: {
          type: 'array',
          items: {
            type: 'object'
          },
          description: '課程檔案（TODO）'
        }
      }
    },

    // 分類資訊 Schema
    CategoryInfo: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1
        },
        name: {
          type: 'string',
          example: '程式設計'
        }
      }
    },

    // 城市資訊 Schema
    CityInfo: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1
        },
        name: {
          type: 'string',
          example: '台北市'
        }
      }
    },

    // 課程教師資訊 Schema
    CourseTeacherInfo: {
      type: 'object',
      nullable: true,
      properties: {
        id: {
          type: 'integer',
          example: 5
        },
        user: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: '王老師'
            },
            nick_name: {
              type: 'string',
              nullable: true,
              example: 'Python王'
            },
            avatar_image: {
              type: 'string',
              nullable: true,
              example: '/avatars/teacher_5.jpg'
            }
          }
        },
        nationality: {
          type: 'string',
          example: '台灣'
        },
        introduction: {
          type: 'string',
          nullable: true,
          example: '專業Python講師，具有5年以上教學經驗...'
        },
        total_students: {
          type: 'integer',
          description: '總學生數（TODO）',
          example: 0
        },
        total_courses: {
          type: 'integer',
          description: '總課程數（TODO）',
          example: 0
        },
        average_rating: {
          type: 'number',
          format: 'float',
          description: '平均評分（TODO）',
          example: 0
        }
      }
    },

    // 課程評價 Schema
    CourseReview: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: '評價ID',
          example: 1
        },
        rate: {
          type: 'integer',
          minimum: 1,
          maximum: 5,
          description: '評分',
          example: 5
        },
        comment: {
          type: 'string',
          nullable: true,
          description: '評價內容',
          example: '很棒的課程，老師教學認真！'
        },
        created_at: {
          type: 'string',
          format: 'date-time',
          description: '評價時間',
          example: '2024-01-15T10:30:00.000Z'
        },
        user: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '評價者姓名',
              example: '學生A'
            },
            avatar_image: {
              type: 'string',
              nullable: true,
              description: '頭像',
              example: '/avatars/student_1.jpg'
            }
          }
        }
      }
    },

    // 公開教師資料 Schema
    PublicTeacherProfile: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: '教師ID',
          example: 41
        },
        user: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '教師姓名',
              example: '王老師'
            },
            nick_name: {
              type: 'string',
              nullable: true,
              description: '暱稱',
              example: 'Python王'
            },
            avatar_image: {
              type: 'string',
              nullable: true,
              description: '頭像',
              example: '/avatars/teacher_41.jpg'
            }
          }
        },
        nationality: {
          type: 'string',
          description: '國籍',
          example: '台灣'
        },
        introduction: {
          type: 'string',
          nullable: true,
          description: '自我介紹',
          example: '專業Python講師，具有豐富的教學經驗...'
        },
        total_students: {
          type: 'integer',
          description: '總學生數（TODO）',
          example: 0
        },
        total_courses: {
          type: 'integer',
          description: '總課程數（TODO）',
          example: 0
        },
        average_rating: {
          type: 'number',
          format: 'float',
          description: '平均評分（TODO）',
          example: 0
        },
        rating_data: {
          type: 'object',
          nullable: true,
          description: '評分統計資料（TODO）',
          example: null
        }
      }
    },

    // 教師課程 Schema  
    TeacherCourse: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: '課程ID',
          example: 45
        },
        uuid: {
          type: 'string',
          format: 'uuid',
          description: '課程UUID',
          example: 'c5b71a6b-7d27-4e4a-8e9f-123456789abc'
        },
        name: {
          type: 'string',
          description: '課程名稱',
          example: 'JavaScript 進階開發'
        },
        content: {
          type: 'string',
          description: '課程內容',
          example: 'JavaScript 進階概念與實戰應用...'
        },
        main_image: {
          type: 'string',
          nullable: true,
          description: '課程主圖片',
          example: '/images/courses/js-advanced.jpg'
        },
        rate: {
          type: 'number',
          format: 'float',
          description: '平均評分',
          example: 4.8
        },
        review_count: {
          type: 'integer',
          description: '評價數量',
          example: 32
        },
        student_count: {
          type: 'integer',
          description: '學生數量',
          example: 85
        },
        view_count: {
          type: 'integer',
          description: '瀏覽次數',
          example: 892
        },
        main_category: {
          $ref: '#/components/schemas/CategoryInfo'
        },
        sub_category: {
          $ref: '#/components/schemas/CategoryInfo'
        }
      }
    },

      // 教師基本資訊 Schema
      TeacherBasicInfo: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '教師ID',
            example: 45
          },
          user: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: '教師姓名',
                example: '李老師'
              },
              nick_name: {
                type: 'string',
                nullable: true,
                description: '暱稱',
                example: 'JS專家'
              },
              avatar_image: {
                type: 'string',
                nullable: true,
                description: '頭像',
                example: '/avatars/teacher_45.jpg'
              }
            }
          },
          nationality: {
            type: 'string',
            description: '國籍',
            example: '台灣'
          }
        }
      },

      // 教師個人檔案資料 Schema (已通過審核的教師使用)
      TeacherProfileData: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '教師ID',
            example: 1
          },
          uuid: {
            type: 'string',
            format: 'uuid',
            description: '教師UUID',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          user_id: {
            type: 'integer',
            description: '關聯的使用者ID',
            example: 1
          },
          nationality: {
            type: 'string',
            maxLength: 50,
            description: '國籍',
            example: '台灣'
          },
          introduction: {
            type: 'string',
            description: '自我介紹',
            example: '我是一位熱愛教育的專業人士，擁有豐富的教學經驗和深厚的學術背景...'
          },
          application_status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            description: '申請狀態',
            example: 'APPROVED'
          },
          application_submitted_at: {
            type: 'string',
            format: 'date-time',
            description: '申請提交時間',
            nullable: true,
            example: '2024-01-15T10:30:00.000Z'
          },
          application_reviewed_at: {
            type: 'string',
            format: 'date-time',
            description: '申請審核時間',
            nullable: true,
            example: '2024-01-16T14:20:00.000Z'
          },
          reviewer_id: {
            type: 'integer',
            description: '審核者ID',
            nullable: true,
            example: 2
          },
          review_notes: {
            type: 'string',
            description: '審核備註',
            nullable: true,
            example: '教學資歷豐富，核准通過'
          },
          total_students: {
            type: 'integer',
            description: '總學生數',
            example: 150
          },
          total_courses: {
            type: 'integer',
            description: '總課程數',
            example: 8
          },
          average_rating: {
            type: 'number',
            format: 'float',
            description: '平均評分',
            example: 4.5
          },
          total_earnings: {
            type: 'number',
            format: 'float',
            description: '總收入',
            example: 125000.50
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
        required: [
          'id',
          'uuid',
          'user_id',
          'nationality',
          'introduction',
          'application_status',
          'total_students',
          'total_courses',
          'average_rating',
          'total_earnings',
          'created_at',
          'updated_at'
        ]
      },

      // 教師基本資料更新請求 Schema
      TeacherProfileUpdateRequest: {
        type: 'object',
        properties: {
          nationality: {
            type: 'string',
            maxLength: 50,
            minLength: 1,
            description: '國籍',
            example: '美國'
          },
          introduction: {
            type: 'string',
            minLength: 100,
            maxLength: 1000,
            description: '自我介紹（至少100字元）',
            example: '教師資料管理測試專用介紹，這段文字是用於測試教師基本資料更新功能的內容。包含了足夠的長度以通過系統驗證，同時也提供了清楚的識別用途。我是一位專業的教育工作者，致力於提供高品質的教學服務。'
          }
        }
      },

      // 工作經驗資料 Schema
      WorkExperience: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '工作經驗ID',
            example: 1
          },
          teacher_id: {
            type: 'integer',
            description: '教師ID',
            example: 1
          },
          is_working: {
            type: 'boolean',
            description: '是否仍在職',
            example: false
          },
          company_name: {
            type: 'string',
            maxLength: 100,
            description: '公司名稱',
            example: 'ABC科技股份有限公司'
          },
          workplace: {
            type: 'string',
            maxLength: 100,
            description: '工作地點',
            example: '台北市信義區'
          },
          job_category: {
            type: 'string',
            maxLength: 50,
            description: '職業類別',
            example: '軟體開發'
          },
          job_title: {
            type: 'string',
            maxLength: 100,
            description: '職位名稱',
            example: '資深軟體工程師'
          },
          start_year: {
            type: 'integer',
            minimum: 1900,
            description: '開始年份',
            example: 2020
          },
          start_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            description: '開始月份',
            example: 3
          },
          end_year: {
            type: 'integer',
            minimum: 1900,
            nullable: true,
            description: '結束年份（在職中為null）',
            example: 2023
          },
          end_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            nullable: true,
            description: '結束月份（在職中為null）',
            example: 8
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
        required: [
          'id',
          'teacher_id',
          'is_working',
          'company_name',
          'workplace',
          'job_category',
          'job_title',
          'start_year',
          'start_month',
          'created_at',
          'updated_at'
        ]
      },

      // 工作經驗建立請求 Schema
      WorkExperienceCreateRequest: {
        type: 'object',
        required: ['is_working', 'company_name', 'workplace', 'job_category', 'job_title', 'start_year', 'start_month'],
        properties: {
          is_working: {
            type: 'boolean',
            description: '是否仍在職（在職中則不需填寫結束日期）',
            example: false
          },
          company_name: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '公司名稱',
            example: 'ABC科技股份有限公司'
          },
          workplace: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '工作地點',
            example: '台北市信義區'
          },
          job_category: {
            type: 'string',
            maxLength: 50,
            minLength: 1,
            description: '職業類別',
            example: '軟體開發'
          },
          job_title: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '職位名稱',
            example: '資深軟體工程師'
          },
          start_year: {
            type: 'integer',
            minimum: 1900,
            description: '開始年份',
            example: 2020
          },
          start_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            description: '開始月份',
            example: 3
          },
          end_year: {
            type: 'integer',
            minimum: 1900,
            nullable: true,
            description: '結束年份（在職中請設為null）',
            example: 2023
          },
          end_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            nullable: true,
            description: '結束月份（在職中請設為null）',
            example: 8
          }
        }
      },

      // 工作經驗更新請求 Schema
      WorkExperienceUpdateRequest: {
        type: 'object',
        properties: {
          is_working: {
            type: 'boolean',
            description: '是否仍在職',
            example: true
          },
          company_name: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '公司名稱',
            example: 'XYZ科技股份有限公司'
          },
          workplace: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '工作地點',
            example: '新北市板橋區'
          },
          job_category: {
            type: 'string',
            maxLength: 50,
            minLength: 1,
            description: '職業類別',
            example: '系統架構'
          },
          job_title: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '職位名稱',
            example: '技術主管'
          },
          start_year: {
            type: 'integer',
            minimum: 1900,
            description: '開始年份',
            example: 2023
          },
          start_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            description: '開始月份',
            example: 9
          },
          end_year: {
            type: 'integer',
            minimum: 1900,
            nullable: true,
            description: '結束年份（在職中請設為null）',
            example: null
          },
          end_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            nullable: true,
            description: '結束月份（在職中請設為null）',
            example: null
          }
        }
      },

      // 工作經驗建立回應 Schema
      WorkExperienceCreateResponse: {
        allOf: [
          { $ref: '#/components/schemas/CreatedResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
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
          }
        ]
      },

      // 工作經驗更新回應 Schema
      WorkExperienceUpdateResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
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
          }
        ]
      },

      // === 認證相關 Schema ===

      // 使用者個人資料 Schema (排除敏感資訊)
      UserProfile: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '使用者 ID',
            example: 1
          },
          uuid: {
            type: 'string',
            format: 'uuid',
            description: '使用者 UUID',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          google_id: {
            type: 'string',
            nullable: true,
            description: 'Google ID (第三方登入)',
            example: null
          },
          name: {
            type: 'string',
            nullable: true,
            description: '真實姓名',
            example: '王小明'
          },
          nick_name: {
            type: 'string',
            description: '暱稱',
            example: '王小明'
          },
          email: {
            type: 'string',
            format: 'email',
            description: '電子郵件',
            example: 'user@example.com'
          },
          birthday: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: '生日',
            example: '1990-01-01'
          },
          contact_phone: {
            type: 'string',
            nullable: true,
            description: '聯絡電話',
            example: '0912345678'
          },
          avatar_image: {
            type: 'string',
            nullable: true,
            description: '頭像圖片 URL',
            example: 'https://example.com/avatar.jpg'
          },
          avatar_google_url: {
            type: 'string',
            nullable: true,
            description: 'Google 頭像 URL',
            example: null
          },
          role: {
            type: 'string',
            enum: ['student', 'teacher', 'admin'],
            description: '使用者角色',
            example: 'student'
          },
          account_status: {
            type: 'string',
            enum: ['active', 'suspended', 'pending'],
            description: '帳號狀態',
            example: 'active'
          },
          last_login_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: '最後登入時間',
            example: '2024-01-15T10:30:00.000Z'
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
          },
          deleted_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: '刪除時間 (軟刪除)',
            example: null
          }
        }
      },

      // 認證 Token 資料 Schema
      AuthTokens: {
        type: 'object',
        properties: {
          access_token: {
            type: 'string',
            description: 'JWT Access Token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          refresh_token: {
            type: 'string',
            description: 'JWT Refresh Token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          token_type: {
            type: 'string',
            description: 'Token 類型',
            example: 'Bearer'
          },
          expires_in: {
            type: 'integer',
            description: 'Access Token 過期時間 (秒)',
            example: 3600
          }
        }
      },

      // 完整認證回應 Schema
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/UserProfile'
          },
          access_token: {
            type: 'string',
            description: 'JWT Access Token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          refresh_token: {
            type: 'string',
            description: 'JWT Refresh Token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          token_type: {
            type: 'string',
            description: 'Token 類型',
            example: 'Bearer'
          },
          expires_in: {
            type: 'integer',
            description: 'Access Token 過期時間 (秒)',
            example: 3600
          }
        }
      },

      // 註冊成功回應 Schema
      RegisterResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success'
          },
          message: {
            type: 'string',
            example: '註冊成功'
          },
          data: {
            $ref: '#/components/schemas/AuthResponse'
          }
        }
      },

      // 登入成功回應 Schema
      LoginResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success'
          },
          message: {
            type: 'string',
            example: '登入成功'
          },
          data: {
            $ref: '#/components/schemas/AuthResponse'
          }
        }
      },

      // 刷新 Token 成功回應 Schema
      RefreshTokenResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success'
          },
          message: {
            type: 'string',
            example: 'Token 刷新成功'
          },
          data: {
            $ref: '#/components/schemas/AuthResponse'
          }
        }
      },

      // 取得個人資料回應 Schema
      GetProfileResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success'
          },
          message: {
            type: 'string',
            example: '取得個人資料成功'
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/UserProfile'
              }
            }
          }
        }
      },

      // 更新個人資料回應 Schema
      UpdateProfileResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success'
          },
          message: {
            type: 'string',
            example: '個人資料更新成功'
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/UserProfile'
              }
            }
          }
        }
      },

      // 忘記密碼回應 Schema
      ForgotPasswordResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success'
          },
          message: {
            type: 'string',
            example: '重設密碼郵件已發送，請檢查您的信箱'
          },
          data: {
            type: 'null',
            example: null
          }
        }
      },

      // 刪除帳號回應 Schema
      DeleteProfileResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success'
          },
          message: {
            type: 'string',
            example: '帳號已成功刪除'
          },
          data: {
            type: 'null',
            example: null
          }
        }
      },

      // 認證錯誤回應 Schema (補充缺少的 AuthErrorResponse)
      AuthErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: '認證錯誤訊息',
                example: '請先登入'
              }
            }
          }
        ]
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'new_password'],
        properties: {
          token: {
            type: 'string',
            minLength: 1,
            description: '重設密碼令牌',
            example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
          },
          new_password: {
            type: 'string',
            minLength: 8,
            description: '新密碼（至少8字元）',
            example: 'newSecurePassword123'
          }
        }
      },

      // 重設密碼回應 Schema
      ResetPasswordResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '密碼重設成功'
              }
            }
          }
        ]
      },

      // 通用錯誤回應 Schema (用於取代 SchemasErrorResponse)
      SchemasErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: '錯誤訊息',
                example: '參數驗證失敗'
              },
              errors: {
                type: 'object',
                additionalProperties: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                description: '詳細錯誤資訊',
                example: {
                  email: ['請輸入有效的電子郵件格式'],
                  password: ['密碼必須至少8字元']
                }
              }
            }
          }
        ]
      },

      // Schema錯誤 Schema (用於路由中引用的 schemas/SchemasError)
      SchemasError: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: '錯誤訊息',
                example: '參數驗證失敗'
              },
              errors: {
                type: 'object',
                additionalProperties: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                description: '詳細錯誤資訊',
                example: {
                  nationality: ['國籍為必填欄位'],
                  introduction: ['自我介紹必須至少100字元']
                }
              }
            }
          }
        ]
      },

      // 標準化回應格式
      ApiResponse: {
        type: 'object',
        required: ['status', 'message'],
        properties: {
          status: {
            type: 'string',
            enum: ['success', 'error'],
            description: '回應狀態'
          },
          message: {
            type: 'string',
            description: '回應訊息'
          },
          data: {
            type: 'object',
            description: '回應資料',
            nullable: true
          },
          errors: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            description: '詳細錯誤資訊',
            nullable: true
          },
          meta: {
            type: 'object',
            description: '額外 metadata',
            nullable: true
          }
        }
      },      // 成功回應
      SuccessResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['success']
              }
            }
          }
        ]
      },

      // 建立成功回應 (201)
      CreatedResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '建立成功'
              }
            }
          }
        ]
      },

      // 錯誤回應
      ErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['error']
              }
            }
          }
        ]
      },

      // 驗證錯誤回應 (400)
      ValidationErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '參數驗證失敗'
              },
              errors: {
                type: 'object',
                example: {
                  name: ['課程名稱為必填欄位'],
                  email: ['Email格式不正確']
                }
              }
            }
          }
        ]
      },

      // 未授權錯誤回應 (401)
      UnauthorizedErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '請先登入'
              }
            }
          }
        ]
      },

      // 權限不足錯誤回應 (403)
      ForbiddenErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '權限不足，無法執行此操作'
              }
            }
          }
        ]
      },

      // 資源不存在錯誤回應 (404)
      NotFoundErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '找不到指定的資源'
              }
            }
          }
        ]
      },

      // 資源衝突錯誤回應 (409)
      ConflictErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '資源已存在或發生衝突'
              }
            }
          }
        ]
      },

      // 業務邏輯錯誤回應 (422)
      BusinessErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '業務邏輯錯誤'
              }
            }
          }
        ]
      },

      // 系統錯誤回應 (500)
      ServerErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '系統錯誤，請稍後再試'
              }
            }
          }
        ]
      },

      // 實體定義
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '使用者 ID'
          },
          username: {
            type: 'string',
            description: '使用者名稱'
          },
          email: {
            type: 'string',
            format: 'email',
            description: '電子郵件'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '建立時間'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: '更新時間'
          }
        }
      },

      Course: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '課程 ID'
          },
          uuid: {
            type: 'string',
            format: 'uuid',
            description: '課程 UUID'
          },
          name: {
            type: 'string',
            description: '課程名稱'
          },
          content: {
            type: 'string',
            description: '課程內容'
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            description: '課程狀態'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '建立時間'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: '更新時間'
          }
        }
      },

      // 教師申請相關 Schema
      Teacher: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '教師 ID'
          },
          uuid: {
            type: 'string',
            format: 'uuid',
            description: '教師 UUID'
          },
          user_id: {
            type: 'integer',
            description: '關聯的使用者 ID'
          },
          nationality: {
            type: 'string',
            maxLength: 50,
            description: '國籍',
            example: '台灣'
          },
          introduction: {
            type: 'string',
            minLength: 100,
            maxLength: 1000,
            description: '自我介紹',
            example: '我是一位熱愛教育的專業人士，擁有豐富的教學經驗和深厚的學術背景...'
          },
          application_status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            description: '申請狀態',
            example: 'PENDING'
          },
          application_submitted_at: {
            type: 'string',
            format: 'date-time',
            description: '申請提交時間',
            nullable: true
          },
          application_reviewed_at: {
            type: 'string',
            format: 'date-time',
            description: '申請審核時間',
            nullable: true
          },
          reviewer_id: {
            type: 'integer',
            description: '審核者 ID',
            nullable: true
          },
          review_notes: {
            type: 'string',
            description: '審核備註',
            nullable: true
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: '建立時間'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: '更新時間'
          }
        }
      },

      // 教師申請請求 Schema
      TeacherApplicationRequest: {
        type: 'object',
        required: ['nationality', 'introduction'],
        properties: {
          nationality: {
            type: 'string',
            maxLength: 50,
            minLength: 1,
            description: '國籍',
            example: '台灣'
          },
          introduction: {
            type: 'string',
            minLength: 100,
            maxLength: 1000,
            description: '自我介紹（至少100字元）',
            example: '我是一位熱愛教育的專業人士，擁有豐富的教學經驗和深厚的學術背景。我在這個領域已經工作了多年，積累了豐富的實戰經驗。我希望能在這個平台上分享我的知識，幫助更多學生成長和進步，讓他們能夠在學習的道路上走得更遠。'
          }
        }
      },

      // 教師申請更新請求 Schema
      TeacherApplicationUpdateRequest: {
        type: 'object',
        properties: {
          nationality: {
            type: 'string',
            maxLength: 50,
            minLength: 1,
            description: '國籍',
            example: '日本'
          },
          introduction: {
            type: 'string',
            minLength: 100,
            maxLength: 1000,
            description: '自我介紹（至少100字元）',
            example: '更新後的申請介紹內容，需要長度超過100字元以符合系統驗證規則。這是教師申請的更新版本，包含了申請人更詳細的教學背景和經驗介紹。'
          }
        }
      },

      // 教師申請回應 Schema
      TeacherApplicationResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  teacher: {
                    $ref: '#/components/schemas/Teacher'
                  }
                }
              }
            }
          }
        ]
      },

      // 教師申請建立回應 Schema
      TeacherApplicationCreateResponse: {
        allOf: [
          { $ref: '#/components/schemas/CreatedResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '教師申請已建立'
              },
              data: {
                type: 'object',
                properties: {
                  teacher: {
                    allOf: [
                      { $ref: '#/components/schemas/Teacher' },
                      {
                        type: 'object',
                        properties: {
                          application_status: {
                            type: 'string',
                            enum: ['PENDING'],
                            example: 'PENDING'
                          }
                        }
                      }
                    ]
                  }
                }
              },
              meta: {
                type: 'object',
                properties: {
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-15T10:30:00.000Z'
                  },
                  requestId: {
                    type: 'string',
                    example: '1a2b3c4d5e6f'
                  },
                  version: {
                    type: 'string',
                    example: '2.0.0'
                  }
                }
              }
            }
          }
        ]
      },

      // 教師申請狀態查詢回應 Schema
      TeacherApplicationStatusResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '取得申請狀態成功'
              },
              data: {
                type: 'object',
                properties: {
                  teacher: {
                    $ref: '#/components/schemas/Teacher'
                  }
                }
              }
            }
          }
        ]
      },

      // 教師申請更新回應 Schema
      TeacherApplicationUpdateResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '申請資料更新成功'
              },
              data: {
                type: 'object',
                properties: {
                  teacher: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        description: '教師 ID'
                      },
                      nationality: {
                        type: 'string',
                        description: '國籍'
                      },
                      introduction: {
                        type: 'string',
                        description: '自我介紹'
                      },
                      updated_at: {
                        type: 'string',
                        format: 'date-time',
                        description: '更新時間'
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      },

      // ==================== 學習經歷管理相關 Schema ====================

      // 學習經歷實體 Schema
      LearningExperience: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '學習經歷 ID',
            example: 1
          },
          teacher_id: {
            type: 'integer',
            description: '教師 ID',
            example: 5
          },
          is_in_school: {
            type: 'boolean',
            description: '是否還在學',
            example: false
          },
          degree: {
            type: 'string',
            maxLength: 50,
            description: '學位',
            example: '碩士'
          },
          school_name: {
            type: 'string',
            maxLength: 100,
            description: '學校名稱',
            example: '國立台灣大學'
          },
          department: {
            type: 'string',
            maxLength: 100,
            description: '科系',
            example: '資訊工程學系'
          },
          region: {
            type: 'boolean',
            description: '是否為台灣地區學校',
            example: true
          },
          start_year: {
            type: 'integer',
            minimum: 1950,
            description: '開始年份',
            example: 2018
          },
          start_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            description: '開始月份',
            example: 9
          },
          end_year: {
            type: 'integer',
            minimum: 1950,
            nullable: true,
            description: '結束年份（在學中為 null）',
            example: 2020
          },
          end_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            nullable: true,
            description: '結束月份（在學中為 null）',
            example: 6
          },
          file_path: {
            type: 'string',
            nullable: true,
            description: '證書檔案路徑（TODO: 檔案上傳功能開發中）',
            example: null
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: '建立時間'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: '更新時間'
          }
        }
      },

      // 建立學習經歷請求 Schema
      CreateLearningExperienceRequest: {
        type: 'object',
        required: ['is_in_school', 'degree', 'school_name', 'department', 'region', 'start_year', 'start_month'],
        properties: {
          is_in_school: {
            type: 'boolean',
            description: '是否還在學（在學中則不需填寫結束日期）',
            example: false
          },
          degree: {
            type: 'string',
            maxLength: 50,
            minLength: 1,
            description: '學位（例：學士、碩士、博士、高中、國中等）',
            example: '學士'
          },
          school_name: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '學校名稱',
            example: '國立台灣大學'
          },
          department: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '科系或學院名稱',
            example: '資訊工程學系'
          },
          region: {
            type: 'boolean',
            description: '是否為台灣地區學校（true: 台灣, false: 海外）',
            example: true
          },
          start_year: {
            type: 'integer',
            minimum: 1950,
            description: '開始年份',
            example: 2018
          },
          start_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            description: '開始月份',
            example: 9
          },
          end_year: {
            type: 'integer',
            minimum: 1950,
            nullable: true,
            description: '結束年份（在學中請設為 null）',
            example: 2022
          },
          end_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            nullable: true,
            description: '結束月份（在學中請設為 null）',
            example: 6
          }
        }
      },

      // 更新學習經歷請求 Schema
      UpdateLearningExperienceRequest: {
        type: 'object',
        properties: {
          is_in_school: {
            type: 'boolean',
            description: '是否還在學',
            example: true
          },
          degree: {
            type: 'string',
            maxLength: 50,
            minLength: 1,
            description: '學位',
            example: '碩士'
          },
          school_name: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '學校名稱',
            example: '國立台灣大學'
          },
          department: {
            type: 'string',
            maxLength: 100,
            minLength: 1,
            description: '科系或學院名稱',
            example: '資訊工程學系研究所'
          },
          region: {
            type: 'boolean',
            description: '是否為台灣地區學校',
            example: true
          },
          start_year: {
            type: 'integer',
            minimum: 1950,
            description: '開始年份',
            example: 2022
          },
          start_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            description: '開始月份',
            example: 9
          },
          end_year: {
            type: 'integer',
            minimum: 1950,
            nullable: true,
            description: '結束年份（在學中請設為 null）',
            example: null
          },
          end_month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
            nullable: true,
            description: '結束月份（在學中請設為 null）',
            example: null
          }
        }
      },

      // 學習經歷清單回應 Schema
      LearningExperienceListResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '取得學習經歷列表成功'
              },
              data: {
                type: 'object',
                properties: {
                  learning_experiences: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/LearningExperience'
                    },
                    description: '學習經歷清單（依開始年份降序排列）'
                  }
                }
              }
            }
          }
        ]
      },

      // 單一學習經歷回應 Schema
      LearningExperienceResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  learning_experience: {
                    $ref: '#/components/schemas/LearningExperience'
                  }
                }
              }
            }
          }
        ]
      },

      // 學習經歷建立成功回應 Schema
      LearningExperienceCreateResponse: {
        allOf: [
          { $ref: '#/components/schemas/CreatedResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '學習經歷已建立'
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
          }
        ]
      },

      // TODO: 檔案上傳系統完成後啟用
      // 包含檔案的學習經歷建立請求 Schema
      // CreateLearningExperienceWithFile: {
      //   type: 'object',
      //   properties: {
      //     ...CreateLearningExperienceRequest.properties,
      //     certificate_file: {
      //       type: 'string',
      //       format: 'binary',
      //       description: '證書檔案（支援 PDF, JPG, JPEG, PNG，最大 5MB）'
      //     }
      //   }
      // },

      // 業務邏輯錯誤 Schema
      BusinessError: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    description: '業務錯誤代碼',
                    example: 'LEARNING_EXPERIENCE_NOT_FOUND'
                  },
                  message: {
                    type: 'string',
                    description: '業務錯誤訊息',
                    example: '找不到學習經歷記錄'
                  }
                }
              }
            }
          }
        ]
      },

      // 驗證錯誤 Schema
      ValidationError: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    enum: ['VALIDATION_ERROR'],
                    example: 'VALIDATION_ERROR'
                  },
                  message: {
                    type: 'string',
                    example: '參數驗證失敗'
                  },
                  details: {
                    type: 'object',
                    additionalProperties: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    },
                    description: '詳細驗證錯誤資訊',
                    example: {
                      end_year: ['結束年份不得早於開始年份'],
                      degree: ['學位為必填欄位']
                    }
                  }
                }
              }
            }
          }
        ]
      },

      // === 證書管理相關 Schema ===

      // 教師證書基本資料 Schema
      TeacherCertificate: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '證書ID',
            example: 1
          },
          teacher_id: {
            type: 'integer',
            description: '教師ID',
            example: 1
          },
          verifying_institution: {
            type: 'string',
            maxLength: 100,
            description: '發證機構名稱',
            example: '教育部'
          },
          license_name: {
            type: 'string',
            maxLength: 200,
            description: '證書名稱',
            example: '中等學校教師證書'
          },
          holder_name: {
            type: 'string',
            maxLength: 100,
            description: '證書持有人姓名',
            example: '王小明'
          },
          license_number: {
            type: 'string',
            maxLength: 100,
            description: '證書編號',
            example: 'TC2024001234'
          },
          file_path: {
            type: 'string',
            maxLength: 500,
            description: '證書檔案路徑',
            example: '/uploads/certificates/tc_2024001234.pdf'
          },
          category_id: {
            type: 'string',
            maxLength: 50,
            description: '證書類別ID',
            example: 'teaching_license'
          },
          subject: {
            type: 'string',
            maxLength: 200,
            description: '證書主題/科目',
            example: '數學科教學'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: '建立時間',
            example: '2024-01-15T08:00:00.000Z'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: '更新時間',
            example: '2024-01-15T08:00:00.000Z'
          }
        },
        required: [
          'id',
          'teacher_id', 
          'verifying_institution',
          'license_name',
          'holder_name',
          'license_number',
          'file_path',
          'category_id',
          'subject'
        ]
      },

      // 建立證書請求 Schema
      CreateTeacherCertificateRequest: {
        type: 'object',
        properties: {
          verifying_institution: {
            type: 'string',
            maxLength: 100,
            description: '發證機構名稱（必填）',
            example: '教育部'
          },
          license_name: {
            type: 'string',
            maxLength: 200,
            description: '證書名稱（必填）',
            example: '中等學校教師證書'
          },
          holder_name: {
            type: 'string',
            maxLength: 100,
            description: '證書持有人姓名（必填）',
            example: '王小明'
          },
          license_number: {
            type: 'string',
            maxLength: 100,
            description: '證書編號（必填）',
            example: 'TC2024001234'
          },
          file_path: {
            type: 'string',
            maxLength: 500,
            description: '證書檔案路徑（必填）',
            example: '/uploads/certificates/tc_2024001234.pdf'
          },
          category_id: {
            type: 'string',
            maxLength: 50,
            description: '證書類別ID（必填）',
            example: 'teaching_license'
          },
          subject: {
            type: 'string',
            maxLength: 200,
            description: '證書主題/科目（必填）',
            example: '數學科教學'
          }
        },
        required: [
          'verifying_institution',
          'license_name',
          'holder_name',
          'license_number',
          'file_path',
          'category_id',
          'subject'
        ],
        example: {
          verifying_institution: '教育部',
          license_name: '中等學校教師證書',
          holder_name: '王小明',
          license_number: 'TC2024001234',
          file_path: '/uploads/certificates/tc_2024001234.pdf',
          category_id: 'teaching_license',
          subject: '數學科教學'
        }
      },

      // 更新證書請求 Schema
      UpdateTeacherCertificateRequest: {
        type: 'object',
        properties: {
          verifying_institution: {
            type: 'string',
            maxLength: 100,
            description: '發證機構名稱（選填）',
            example: '教育部'
          },
          license_name: {
            type: 'string',
            maxLength: 200,
            description: '證書名稱（選填）',
            example: '高級中等學校教師證書'
          },
          holder_name: {
            type: 'string',
            maxLength: 100,
            description: '證書持有人姓名（選填）',
            example: '王小明'
          },
          license_number: {
            type: 'string',
            maxLength: 100,
            description: '證書編號（選填）',
            example: 'TC2024001235'
          },
          file_path: {
            type: 'string',
            maxLength: 500,
            description: '證書檔案路徑（選填）',
            example: '/uploads/certificates/tc_2024001235.pdf'
          },
          category_id: {
            type: 'string',
            maxLength: 50,
            description: '證書類別ID（選填）',
            example: 'advanced_teaching_license'
          },
          subject: {
            type: 'string',
            maxLength: 200,
            description: '證書主題/科目（選填）',
            example: '高中數學科教學'
          }
        },
        additionalProperties: false,
        example: {
          license_name: '高級中等學校教師證書',
          license_number: 'TC2024001235',
          subject: '高中數學科教學'
        }
      },

      // 證書列表回應 Schema
      TeacherCertificateListResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  certificates: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/TeacherCertificate'
                    },
                    description: '證書列表'
                  }
                }
              }
            }
          }
        ]
      },

      // 證書建立回應 Schema
      TeacherCertificateCreateResponse: {
        allOf: [
          { $ref: '#/components/schemas/CreatedResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  certificate: {
                    $ref: '#/components/schemas/TeacherCertificate'
                  }
                }
              }
            }
          }
        ]
      },

      // 證書更新回應 Schema
      TeacherCertificateUpdateResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  certificate: {
                    $ref: '#/components/schemas/TeacherCertificate'
                  }
                }
              }
            }
          }
        ]
      },

      // 證書刪除回應 Schema
      TeacherCertificateDeleteResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'null',
                description: '刪除成功時無回傳資料'
              }
            }
          }
        ]
      },

      // === 教師時間管理相關 Schema ===

      // 可預約時段資料 Schema
      AvailableSlot: {
        type: 'object',
        required: ['id', 'teacher_id', 'weekday', 'start_time', 'end_time', 'is_active', 'created_at', 'updated_at'],
        properties: {
          id: {
            type: 'integer',
            description: '時段ID',
            example: 1
          },
          teacher_id: {
            type: 'integer',
            description: '教師ID',
            example: 1
          },
          weekday: {
            type: 'integer',
            minimum: 0,
            maximum: 6,
            description: '星期幾（0=週日, 1=週一, ..., 6=週六）',
            example: 1
          },
          start_time: {
            type: 'string',
            pattern: '^([01]?[0-9]|2[0-3]):([0-5][0-9])$',
            description: '開始時間 (HH:MM 格式)',
            example: '09:00'
          },
          end_time: {
            type: 'string',
            pattern: '^([01]?[0-9]|2[0-3]):([0-5][0-9])$',
            description: '結束時間 (HH:MM 格式)',
            example: '10:00'
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
            example: '2025-08-16T09:00:00Z'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: '更新時間',
            example: '2025-08-16T09:00:00Z'
          }
        }
      },

      // 時段輸入資料 Schema
      AvailableSlotInput: {
        type: 'object',
        required: ['weekday', 'start_time', 'end_time'],
        properties: {
          weekday: {
            type: 'integer',
            minimum: 0,
            maximum: 6,
            description: '星期幾（0=週日, 1=週一, ..., 6=週六）',
            example: 1
          },
          start_time: {
            type: 'string',
            pattern: '^([01]?[0-9]|2[0-3]):([0-5][0-9])$',
            description: '開始時間 (HH:MM 格式)',
            example: '09:00'
          },
          end_time: {
            type: 'string',
            pattern: '^([01]?[0-9]|2[0-3]):([0-5][0-9])$',
            description: '結束時間 (HH:MM 格式)',
            example: '10:00'
          },
          is_active: {
            type: 'boolean',
            description: '是否啟用（預設為 true）',
            default: true,
            example: true
          }
        }
      },

      // 取得時段設定回應 Schema
      GetScheduleResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '取得教師時段設定成功'
              },
              data: {
                type: 'object',
                properties: {
                  available_slots: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/AvailableSlot'
                    },
                    description: '可預約時段列表'
                  },
                  total_slots: {
                    type: 'integer',
                    description: '時段總數',
                    example: 5
                  }
                }
              }
            }
          }
        ]
      },

      // 更新時段設定請求 Schema
      UpdateScheduleRequest: {
        type: 'object',
        required: ['available_slots'],
        properties: {
          available_slots: {
            type: 'array',
            minItems: 0,
            maxItems: 50,
            items: {
              $ref: '#/components/schemas/AvailableSlotInput'
            },
            description: '要設定的可預約時段列表（會完全替換現有設定）'
          }
        }
      },

      // 更新時段設定回應 Schema
      UpdateScheduleResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '教師時段設定更新成功'
              },
              data: {
                type: 'object',
                properties: {
                  available_slots: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/AvailableSlot'
                    },
                    description: '更新後的時段列表'
                  },
                  updated_count: {
                    type: 'integer',
                    description: '更新的時段數量',
                    example: 2
                  },
                  created_count: {
                    type: 'integer',
                    description: '新建立的時段數量',
                    example: 3
                  },
                  deleted_count: {
                    type: 'integer',
                    description: '刪除的時段數量',
                    example: 1
                  }
                }
              }
            }
          }
        ]
      },

      // 衝突資訊 Schema
      ConflictInfo: {
        type: 'object',
        properties: {
          slot_id: {
            type: 'integer',
            description: '衝突的時段ID',
            example: 1
          },
          weekday: {
            type: 'integer',
            description: '衝突發生的星期',
            example: 1
          },
          start_time: {
            type: 'string',
            description: '衝突時段開始時間',
            example: '09:00'
          },
          end_time: {
            type: 'string',
            description: '衝突時段結束時間',
            example: '10:00'
          },
          conflict_date: {
            type: 'string',
            format: 'date',
            description: '衝突發生日期',
            example: '2025-08-18'
          },
          reservation_id: {
            type: 'integer',
            description: '造成衝突的預約ID',
            example: 5
          },
          student_name: {
            type: 'string',
            description: '預約學生姓名',
            example: '李小華'
          },
          course_name: {
            type: 'string',
            description: '預約課程名稱',
            example: '英文會話課程'
          }
        }
      },

      // 檢查衝突回應 Schema
      CheckConflictsResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '時段衝突檢查完成'
              },
              data: {
                type: 'object',
                properties: {
                  has_conflicts: {
                    type: 'boolean',
                    description: '是否存在衝突',
                    example: false
                  },
                  conflicts: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ConflictInfo'
                    },
                    description: '衝突詳細資訊列表'
                  },
                  total_conflicts: {
                    type: 'integer',
                    description: '衝突總數',
                    example: 0
                  },
                  check_period: {
                    type: 'object',
                    properties: {
                      from_date: {
                        type: 'string',
                        format: 'date',
                        description: '檢查起始日期',
                        example: '2025-08-20'
                      },
                      to_date: {
                        type: 'string',
                        format: 'date',
                        description: '檢查結束日期',
                        example: '2025-09-20'
                      }
                    },
                    description: '檢查的時間範圍'
                  }
                }
              }
            }
          }
        ]
      },

      // ========================================
      // 影片管理相關 Schemas
      // ========================================
      
      VideoUploadRequest: {
        type: 'object',
        required: ['name', 'category', 'intro', 'video_type'],
        properties: {
          name: {
            type: 'string',
            maxLength: 100,
            description: '影片名稱',
            example: 'JavaScript 基礎教學第一課'
          },
          category: {
            type: 'string',
            maxLength: 50,
            description: '影片分類',
            example: '程式設計'
          },
          intro: {
            type: 'string',
            maxLength: 1000,
            description: '影片介紹',
            example: '這堂課將教授 JavaScript 的基本語法和概念，適合初學者學習。'
          },
          video_type: {
            type: 'string',
            enum: ['youtube', 'storage'],
            description: '影片類型：youtube 為 YouTube 連結，storage 為檔案上傳',
            example: 'youtube'
          },
          youtube_url: {
            type: 'string',
            format: 'uri',
            description: '當 video_type 為 youtube 時的 YouTube 連結',
            example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          }
        }
      },

      VideoUpdateRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            maxLength: 100,
            description: '影片名稱',
            example: 'JavaScript 基礎教學第一課 - 更新版'
          },
          category: {
            type: 'string',
            maxLength: 50,
            description: '影片分類',
            example: '前端開發'
          },
          intro: {
            type: 'string',
            maxLength: 1000,
            description: '影片介紹',
            example: '這堂課將教授 JavaScript 的基本語法和概念，已更新最新內容。'
          }
        }
      },

      VideoBase: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '影片ID',
            example: 1
          },
          uuid: {
            type: 'string',
            format: 'uuid',
            description: '影片唯一識別碼',
            example: '550e8400-e29b-41d4-a716-446655440001'
          },
          teacher_id: {
            type: 'integer',
            description: '教師ID',
            example: 1
          },
          name: {
            type: 'string',
            description: '影片名稱',
            example: 'JavaScript 基礎教學第一課'
          },
          category: {
            type: 'string',
            description: '影片分類',
            example: '程式設計'
          },
          intro: {
            type: 'string',
            description: '影片介紹',
            example: '這堂課將教授 JavaScript 的基本語法和概念，適合初學者學習。'
          },
          url: {
            type: 'string',
            nullable: true,
            description: '影片連結或檔案路徑',
            example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          },
          video_type: {
            type: 'string',
            enum: ['youtube', 'storage'],
            description: '影片類型',
            example: 'youtube'
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
          },
          deleted_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: '刪除時間',
            example: null
          }
        }
      },

      VideoUploadResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                $ref: '#/components/schemas/VideoBase'
              }
            }
          }
        ]
      },

      VideoUpdateResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                $ref: '#/components/schemas/VideoBase'
              }
            }
          }
        ]
      },

      VideoDetailResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                $ref: '#/components/schemas/VideoBase'
              }
            }
          }
        ]
      },

      VideoListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  videos: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/VideoBase'
                    }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: {
                        type: 'integer',
                        example: 1
                      },
                      per_page: {
                        type: 'integer',
                        example: 10
                      },
                      total: {
                        type: 'integer',
                        example: 25
                      },
                      total_pages: {
                        type: 'integer',
                        example: 3
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    },

    // 標準化回應範例
    responses: {
      Success: {
        description: '成功回應',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SuccessResponse'
            }
          }
        }
      },
      Created: {
        description: '建立成功',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreatedResponse'
            }
          }
        }
      },
      ValidationError: {
        description: '參數驗證錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationErrorResponse'
            }
          }
        }
      },
      SchemasError: {
        description: '參數驗證錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SchemasError'
            }
          }
        }
      },
      Unauthorized: {
        description: '未授權',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UnauthorizedErrorResponse'
            }
          }
        }
      },
      Forbidden: {
        description: '權限不足',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ForbiddenErrorResponse'
            }
          }
        }
      },
      NotFound: {
        description: '資源不存在',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/NotFoundErrorResponse'
            }
          }
        }
      },
      Conflict: {
        description: '資源衝突',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ConflictErrorResponse'
            }
          }
        }
      },
      BusinessError: {
        description: '業務邏輯錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/BusinessErrorResponse'
            }
          }
        }
      },
      ServerError: {
        description: '系統錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ServerErrorResponse'
            }
          }
        }
      },

      // 學習經歷相關標準回應
      UnauthorizedError: {
        description: '未授權 - Token 無效或已過期',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UnauthorizedErrorResponse'
            },
            example: {
              status: 'error',
              message: '請先登入',
              error: {
                code: 'UNAUTHORIZED',
                message: 'Token 無效或已過期'
              }
            }
          }
        }
      },

      InternalServerError: {
        description: '系統內部錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ServerErrorResponse'
            },
            example: {
              status: 'error',
              message: '系統錯誤，請稍後再試',
              error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: '系統發生未預期的錯誤'
              }
            }
          }
        }
      }
    }
  }
}

// 根據環境決定檔案副檔名
const isDevelopment = process.env.NODE_ENV !== 'production'

const options = {
  definition: swaggerDefinition,
  apis: [
    isDevelopment ? './src/routes/*.ts' : './dist/src/routes/*.js',
    isDevelopment ? './src/controllers/*.ts' : './dist/src/controllers/*.js',
    isDevelopment ? './src/app.ts' : './dist/src/app.js'
  ]
}

export const swaggerSpec = swaggerJSDoc(options)
