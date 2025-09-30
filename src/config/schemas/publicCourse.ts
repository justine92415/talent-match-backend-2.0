/**
 * 公開課程模組 Schema
 * 
 * 包含公開課程 API 相關的請求和回應 Schema
 * 完全基於 PublicCourseController 和 PublicCourseService 的實際實作
 */

export const publicCourseSchemas = {
  // ==================== 課程時段相關 Schema ====================

  // 課程時段 Schema
  CourseSlot: {
    type: 'object',
    properties: {
      time: {
        type: 'string',
        description: '時段時間 (HH:MM 格式)',
        example: '09:00'
      },
      status: {
        type: 'string',
        enum: ['unavailable', 'available', 'reserved'],
        description: '時段狀態 (unavailable: 教師未開放, available: 可預約, reserved: 已預約)',
        example: 'available'
      }
    },
    required: ['time', 'status'],
    description: '單一課程時段資訊'
  },

  // 每日課程表 Schema
  DaySchedule: {
    type: 'object',
    properties: {
      week: {
        type: 'string',
        description: '星期幾',
        example: '週一'
      },
      date: {
        type: 'string',
        format: 'date',
        description: '日期 (YYYY-MM-DD 格式)',
        example: '2024-09-20'
      },
      slots: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CourseSlot'
        },
        description: '該日的時段列表',
        example: [
          { time: '09:00', status: 'unavailable' },
          { time: '10:00', status: 'available' },
          { time: '11:00', status: 'available' },
          { time: '13:00', status: 'available' },
          { time: '14:00', status: 'available' },
          { time: '15:00', status: 'available' },
          { time: '16:00', status: 'available' },
          { time: '17:00', status: 'available' },
          { time: '19:00', status: 'unavailable' },
          { time: '20:00', status: 'unavailable' }
        ]
      }
    },
    required: ['week', 'date', 'slots'],
    description: '單日完整課程表'
  },

  // ==================== 公開課程列表 API Schema ====================

  // 公開課程查詢參數 Schema
  PublicCourseQueryParams: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        maxLength: 200,
        description: '搜尋關鍵字 (選填，在課程名稱和內容中搜尋，最大200字元)',
        example: 'Python'
      },
      main_category_id: {
        type: 'integer',
        minimum: 1,
        description: '主分類 ID (選填，篩選指定主分類的課程)',
        example: 1
      },
      sub_category_id: {
        type: 'integer',
        minimum: 1,
        description: '次分類 ID (選填，篩選指定次分類的課程)',
        example: 2
      },
      city: {
        type: 'string',
        description: '城市名稱 (選填，地區篩選)',
        example: '台北市'
      },
      sort: {
        type: 'string',
        enum: ['newest', 'popular', 'price_low', 'price_high'],
        description: '排序方式 (選填，newest: 最新發布, popular: 熱門程度, price_low: 價格由低到高, price_high: 價格由高到低)',
        example: 'newest'
      },
      page: {
        type: 'integer',
        minimum: 1,
        description: '頁碼 (選填，預設為 1)',
        example: 1
      },
      per_page: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        description: '每頁顯示數量 (選填，預設為 12，最大 100)',
        example: 12
      }
    }
  },

  // 公開課程列表項目 Schema
  PublicCourseListItem: {
    type: 'object',
    required: ['id', 'uuid', 'name', 'min_price', 'max_price', 'rate', 'review_count', 'student_count', 'main_category', 'sub_category', 'teacher', 'created_at', 'updated_at'],
    properties: {
      id: {
        type: 'integer',
        description: '課程 ID',
        example: 2
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '課程 UUID (系統生成的唯一識別碼)',
        example: '2728eb42-48d8-4356-9091-39e971ebce0c'
      },
      name: {
        type: 'string',
        description: '課程名稱',
        example: '測試課程2'
      },
      main_image: {
        type: 'string',
        nullable: true,
        description: '課程主圖 URL',
        example: 'https://firebasestorage.googleapis.com/v0/b/talent-match-2.firebasestorage.app/o/course_images%2Fteacher_4%2F83a3ac18-5be7-46bc-820f-8b3ca67e16dd.jpeg?alt=media'
      },
      min_price: {
        type: 'number',
        description: '最低價格',
        example: 200
      },
      max_price: {
        type: 'number',
        description: '最高價格',
        example: 1000
      },
      rate: {
        type: 'string',
        description: '課程評分 (字串格式的數字)',
        example: '0.00'
      },
      review_count: {
        type: 'integer',
        description: '評價數量',
        example: 0
      },
      student_count: {
        type: 'integer',
        description: '學生人數',
        example: 0
      },
      city: {
        type: 'string',
        nullable: true,
        description: '城市',
        example: '臺北市'
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
        description: '地址',
        example: 'qweqwe'
      },
      main_category: {
        type: 'object',
        description: '主分類資訊',
        properties: {
          id: {
            type: 'integer',
            description: '主分類 ID',
            example: 2
          },
          name: {
            type: 'string',
            description: '主分類名稱',
            example: '藝術創作'
          }
        },
        required: ['id', 'name']
      },
      sub_category: {
        type: 'object',
        description: '次分類資訊',
        properties: {
          id: {
            type: 'integer',
            description: '次分類 ID',
            example: 12
          },
          name: {
            type: 'string',
            description: '次分類名稱',
            example: '插畫'
          }
        },
        required: ['id', 'name']
      },
      teacher: {
        type: 'object',
        description: '教師資訊',
        properties: {
          id: {
            type: 'integer',
            description: '教師 ID',
            example: 5
          },
          user: {
            type: 'object',
            description: '教師使用者資訊',
            properties: {
              name: {
                type: 'string',
                description: '教師姓名',
                example: ''
              },
              nick_name: {
                type: 'string',
                description: '教師暱稱',
                example: '小明劍魔'
              },
              avatar_image: {
                type: 'string',
                description: '教師頭像 URL',
                example: 'https://firebasestorage.googleapis.com/v0/b/talent-match-2.firebasestorage.app/o/avatars%2Fuser_4%2Fc4853549-5487-4e2f-be17-1d09697c4d57.png?alt=media'
              }
            },
            required: ['name', 'nick_name', 'avatar_image']
          }
        },
        required: ['id', 'user']
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '建立時間',
        example: '2025-09-17T13:01:10.284Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: '更新時間',
        example: '2025-09-18T08:27:58.537Z'
      }
    }
  },

  // 公開課程分頁資訊 Schema
  PublicCoursePaginationInfo: {
    type: 'object',
    properties: {
      current_page: {
        type: 'integer',
        description: '目前頁碼',
        example: 1
      },
      per_page: {
        type: 'integer',
        description: '每頁數量',
        example: 12
      },
      total: {
        type: 'integer',
        description: '總筆數',
        example: 1
      },
      total_pages: {
        type: 'integer',
        description: '總頁數',
        example: 1
      }
    }
  },

  // 公開課程篩選條件 Schema
  PublicCourseFilters: {
    type: 'object',
    properties: {
      sort: {
        type: 'string',
        description: '排序方式',
        example: 'newest'
      },
      main_category_id: {
        type: 'integer',
        nullable: true,
        description: '主分類 ID',
        example: null
      },
      sub_category_id: {
        type: 'integer',
        nullable: true,
        description: '次分類 ID',
        example: null
      },
      city: {
        type: 'string',
        nullable: true,
        description: '城市',
        example: null
      },
      keyword: {
        type: 'string',
        nullable: true,
        description: '搜尋關鍵字',
        example: null
      }
    }
  },

  // 公開課程列表成功回應 Schema
  PublicCourseListSuccessResponse: {
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
        description: '成功訊息',
        example: '取得公開課程列表成功'
      },
      data: {
        type: 'object',
        properties: {
          courses: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicCourseListItem'
            },
            description: '公開課程列表'
          },
          pagination: {
            $ref: '#/components/schemas/PublicCoursePaginationInfo'
          },
          filters: {
            $ref: '#/components/schemas/PublicCourseFilters'
          }
        },
        description: '公開課程列表資料、分頁資訊和篩選條件'
      }
    }
  },

  // ==================== 公開課程詳情 API Schema ====================

  // 公開課程詳情 Schema
  PublicCourseDetail: {
    type: 'object',
    required: ['id', 'uuid', 'name', 'rate', 'review_count', 'student_count', 'purchase_count', 'main_category', 'sub_category', 'created_at'],
    properties: {
      id: {
        type: 'integer',
        description: '課程 ID',
        example: 2
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '課程 UUID (系統生成的唯一識別碼)',
        example: '2728eb42-48d8-4356-9091-39e971ebce0c'
      },
      name: {
        type: 'string',
        description: '課程名稱',
        example: '測試課程2'
      },
      content: {
        type: 'string',
        nullable: true,
        description: '課程內容描述',
        example: '測試課程2內容'
      },
      main_image: {
        type: 'string',
        nullable: true,
        description: '課程主圖 URL',
        example: 'https://firebasestorage.googleapis.com/v0/b/talent-match-2.firebasestorage.app/o/course_images%2Fteacher_4%2F83a3ac18-5be7-46bc-820f-8b3ca67e16dd.jpeg?alt=media'
      },
      rate: {
        type: 'string',
        description: '課程評分 (字串格式的數字)',
        example: '0.00'
      },
      review_count: {
        type: 'integer',
        description: '評價數量',
        example: 0
      },
      student_count: {
        type: 'integer',
        description: '學生人數',
        example: 0
      },
      purchase_count: {
        type: 'integer',
        description: '購買次數',
        example: 0
      },
      survey_url: {
        type: 'string',
        nullable: true,
        description: '問卷調查連結',
        example: null
      },
      purchase_message: {
        type: 'string',
        nullable: true,
        description: '購買備註訊息',
        example: '恭喜購買課程'
      },
      city: {
        type: 'string',
        nullable: true,
        description: '城市',
        example: null
      },
      district: {
        type: 'string',
        nullable: true,
        description: '區域',
        example: null
      },
      address: {
        type: 'string',
        nullable: true,
        description: '地址',
        example: null
      },
      main_category: {
        type: 'object',
        description: '主分類資訊',
        required: ['id', 'name'],
        properties: {
          id: {
            type: 'integer',
            description: '主分類 ID',
            example: 2
          },
          name: {
            type: 'string',
            description: '主分類名稱',
            example: '藝術創作'
          }
        }
      },
      sub_category: {
        type: 'object',
        description: '次分類資訊',
        required: ['id', 'name'],
        properties: {
          id: {
            type: 'integer',
            description: '次分類 ID',
            example: 12
          },
          name: {
            type: 'string',
            description: '次分類名稱',
            example: '插畫'
          }
        }
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '建立時間',
        example: '2025-09-17T13:01:10.284Z'
      }
    }
  },

  // 公開課程教師資訊 Schema
  PublicCourseTeacherInfo: {
    type: 'object',
    required: ['id', 'user', 'total_students', 'total_courses', 'average_rating'],
    properties: {
      id: {
        type: 'integer',
        description: '教師 ID',
        example: 5
      },
      user: {
        type: 'object',
        description: '教師使用者資訊',
        required: ['name', 'nick_name', 'avatar_image'],
        properties: {
          name: {
            type: 'string',
            description: '教師姓名',
            example: ''
          },
          nick_name: {
            type: 'string',
            description: '教師暱稱',
            example: '小明劍魔'
          },
          avatar_image: {
            type: 'string',
            description: '教師頭像 URL',
            example: 'https://firebasestorage.googleapis.com/v0/b/talent-match-2.firebasestorage.app/o/avatars%2Fuser_4%2Fc4853549-5487-4e2f-be17-1d09697c4d57.png?alt=media'
          }
        }
      },
      city: {
        type: 'string',
        nullable: true,
        description: '教師所在城市',
        example: '臺北市'
      },
      district: {
        type: 'string',
        nullable: true,
        description: '教師所在區域',
        example: '中正區'
      },
      address: {
        type: 'string',
        nullable: true,
        description: '教師地址',
        example: 'qweqwe'
      },
      introduction: {
        type: 'string',
        nullable: true,
        description: '教師介紹',
        example: '資深教師介紹內容'
      },
      total_students: {
        type: 'integer',
        description: '教師總學生數',
        example: 0
      },
      total_courses: {
        type: 'integer',
        description: '教師總課程數',
        example: 0
      },
      average_rating: {
        type: 'integer',
        description: '教師平均評分',
        example: 0
      }
    }
  },

  // 公開課程價格方案 Schema
  PublicCoursePriceOption: {
    type: 'object',
    required: ['id', 'uuid', 'price', 'quantity'],
    properties: {
      id: {
        type: 'integer',
        description: '價格方案 ID',
        example: 25
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '價格方案 UUID',
        example: '670a79ae-fee5-4036-ae24-7a7f6f5c157b'
      },
      price: {
        type: 'number',
        description: '價格',
        example: 200
      },
      quantity: {
        type: 'integer',
        description: '堂數',
        example: 1
      }
    }
  },

  // ==================== 課程詳細資料相關 Schema ====================

  // 公開課程影片 Schema
  PublicCourseVideo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '影片 ID',
        example: 1
      },
      name: {
        type: 'string',
        description: '影片名稱',
        example: '課程介紹影片'
      },
      category: {
        type: 'string',
        nullable: true,
        description: '影片分類',
        example: '介紹影片'
      },
      intro: {
        type: 'string',
        description: '影片簡介',
        example: '本影片將簡單介紹課程內容和學習目標'
      },
      url: {
        type: 'string',
        description: '影片 URL',
        example: 'https://firebasestorage.googleapis.com/v0/b/.../video1.mp4'
      },
      video_type: {
        type: 'string',
        enum: ['storage', 'youtube'],
        description: '影片類型 (storage: 儲存類型, youtube: YouTube 連結)',
        example: 'storage'
      },
      is_preview: {
        type: 'boolean',
        description: '是否為預覽影片',
        example: false
      }
    },
    required: ['id', 'name', 'intro', 'url', 'video_type', 'is_preview'],
    description: '公開課程影片資訊'
  },

  // 公開課程檔案 Schema
  PublicCourseFile: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '檔案 ID',
        example: 1
      },
      name: {
        type: 'string',
        description: '檔案名稱',
        example: '課程講義.pdf'
      },
      url: {
        type: 'string',
        description: '檔案下載 URL',
        example: 'https://firebasestorage.googleapis.com/v0/b/.../course-materials.pdf'
      }
    },
    required: ['id', 'name', 'url'],
    description: '公開課程檔案資訊'
  },

  // 公開課程評價 Schema
  PublicCourseReview: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '評價 ID',
        example: 1
      },
      rate: {
        type: 'integer',
        minimum: 1,
        maximum: 5,
        description: '評分 (1-5星)',
        example: 5
      },
      comment: {
        type: 'string',
        description: '評價內容',
        example: '老師教學很棒，內容豐富易懂！'
      },
      user: {
        type: 'object',
        properties: {
          nick_name: {
            type: 'string',
            description: '評價者暱稱',
            example: '學習愛好者'
          }
        },
        required: ['nick_name'],
        description: '評價者資訊'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '評價建立時間',
        example: '2024-09-20T10:30:00.000Z'
      }
    },
    required: ['id', 'rate', 'comment', 'user', 'created_at'],
    description: '公開課程評價資訊'
  },

  // 推薦課程 Schema
  PublicRecommendedCourse: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '推薦課程 ID',
        example: 3
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '推薦課程 UUID',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      name: {
        type: 'string',
        description: '推薦課程名稱',
        example: 'Python 進階應用'
      },
      main_image: {
        type: 'string',
        nullable: true,
        description: '推薦課程主圖 URL',
        example: 'https://firebasestorage.googleapis.com/v0/b/.../recommended-course.jpg'
      },
      rate: {
        type: 'number',
        description: '推薦課程評分',
        example: 4.5
      },
      min_price: {
        type: 'number',
        description: '推薦課程最低價格',
        example: 1500
      },
      teacher: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              nick_name: {
                type: 'string',
                description: '推薦課程教師暱稱',
                example: '資深講師'
              }
            },
            required: ['nick_name'],
            description: '推薦課程教師使用者資訊'
          }
        },
        required: ['user'],
        description: '推薦課程教師資訊'
      }
    },
    required: ['id', 'uuid', 'name', 'rate', 'min_price', 'teacher'],
    description: '推薦課程資訊'
  },

  // ==================== 教師詳細資訊相關 Schema ====================

  // 公開課程教師證書 Schema
  PublicTeacherCertificate: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '證書 ID',
        example: 26
      },
      license_name: {
        type: 'string',
        description: '證書名稱',
        example: 'Google Cloud Professional'
      }
    }
  },

  // 公開課程教師工作經驗 Schema
  PublicTeacherWorkExperience: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '工作經驗 ID',
        example: 29
      },
      company_name: {
        type: 'string',
        description: '公司名稱',
        example: 'Google Taiwan'
      },
      job_title: {
        type: 'string',
        description: '職位名稱',
        example: '軟體工程師'
      },
      start_year: {
        type: 'integer',
        description: '開始年份',
        example: 2020
      },
      end_year: {
        type: 'integer',
        nullable: true,
        description: '結束年份 (null 表示目前在職)',
        example: 2023
      }
    }
  },

  // 公開課程教師學習經歷 Schema
  PublicTeacherLearningExperience: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '學習經歷 ID',
        example: 22
      },
      school_name: {
        type: 'string',
        description: '學校名稱',
        example: '國立台灣大學'
      },
      department: {
        type: 'string',
        description: '科系/部門',
        example: '資訊工程學系'
      },
      degree: {
        type: 'string',
        description: '學位類型',
        example: 'bachelor'
      },
      start_year: {
        type: 'integer',
        description: '開始年份',
        example: 2018
      },
      end_year: {
        type: 'integer',
        nullable: true,
        description: '結束年份 (null 表示目前在學)',
        example: 2022
      }
    }
  },

  // 公開課程詳情成功回應 Schema
  PublicCourseDetailSuccessResponse: {
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
        description: '成功訊息',
        example: '取得課程詳情成功'
      },
      data: {
        type: 'object',
        properties: {
          course: {
            $ref: '#/components/schemas/PublicCourseDetail'
          },
          teacher: {
            $ref: '#/components/schemas/PublicCourseTeacherInfo'
          },
          price_options: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicCoursePriceOption'
            },
            description: '課程價格方案列表'
          },
          videos: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicCourseVideo'
            },
            description: '課程影片列表 (關聯的短影音，按顯示順序排列)'
          },
          files: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicCourseFile'
            },
            description: '課程檔案列表 (課程相關文件和資料)'
          },
          schedule: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/DaySchedule'
            },
            description: '7天課程表 (從明天開始的連續7天，顯示每日時段狀態)',
            example: [
              {
                week: '週日',
                date: '2024-09-20',
                slots: [
                  { time: '09:00', status: 'unavailable' },
                  { time: '10:00', status: 'available' },
                  { time: '11:00', status: 'available' },
                  { time: '13:00', status: 'available' },
                  { time: '14:00', status: 'available' },
                  { time: '15:00', status: 'available' },
                  { time: '16:00', status: 'available' },
                  { time: '17:00', status: 'available' },
                  { time: '19:00', status: 'unavailable' },
                  { time: '20:00', status: 'unavailable' }
                ]
              }
            ]
          },
          recent_reviews: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicCourseReview'
            },
            description: '最近評價列表 (顯示最新的課程評價)'
          },
          recommended_courses: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicRecommendedCourse'
            },
            description: '推薦課程列表 (相關或相似的課程推薦)'
          },
          teacher_certificates: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicTeacherCertificate'
            },
            description: '教師證書列表'
          },
          teacher_work_experiences: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicTeacherWorkExperience'
            },
            description: '教師工作經驗列表'
          },
          teacher_learning_experiences: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicTeacherLearningExperience'
            },
            description: '教師學習經歷列表'
          }
        },
        description: '公開課程完整詳情資料'
      }
    }
  },

  // ==================== 錯誤回應 Schema ====================

  // 公開課程詳情不存在錯誤回應 Schema
  PublicCourseNotFoundErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/NotFoundErrorResponse' },
      {
        type: 'object',
        properties: {
          code: {
            example: 'COURSE_NOT_PUBLISHED'
          },
          message: {
            example: '課程未發布或不存在'
          }
        }
      }
    ]
  }
}