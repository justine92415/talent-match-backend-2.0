/**
 * 首頁相關 Schema
 * 包含評論摘要、短影片、推薦課程的請求和回應 Schema
 */

export const homeSchemas = {
  // ==================== 評論摘要 Schema ====================
  
  // 評論摘要查詢參數 Schema
  ReviewsSummaryQueryParams: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 20,
        description: '精選評論數量，預設為 6，最小 1，最大 20',
        example: 6
      }
    }
  },

  // 精選評論項目 Schema
  FeaturedReviewItem: {
    type: 'object',
    properties: {
      reviewId: {
        type: 'integer',
        description: '評論 ID',
        example: 123
      },
      student: {
        type: 'object',
        description: '學生資訊',
        properties: {
          name: {
            type: 'string',
            description: '學生暱稱',
            example: '王小明'
          },
          avatar: {
            type: 'string',
            nullable: true,
            description: '學生頭像 URL',
            example: 'https://example.com/avatar.jpg'
          }
        }
      },
      title: {
        type: 'string',
        description: '評論標題（目前為空字串）',
        example: ''
      },
      content: {
        type: 'string',
        description: '評論內容（至少 20 字）',
        example: '老師教學非常認真，課程內容豐富，我學到了很多實用的技巧！'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: '評論建立時間',
        example: '2024-01-15T10:30:00.000Z'
      }
    }
  },

  // 評論摘要資料 Schema
  ReviewsSummaryData: {
    type: 'object',
    properties: {
      overallRating: {
        type: 'number',
        description: '整體平均評分（四捨五入到小數點第一位）',
        example: 4.5
      },
      featuredReviews: {
        type: 'array',
        description: '精選評論列表（評分 >= 4 且內容 >= 20 字，每位學生最多一則，取最新）',
        items: {
          $ref: '#/components/schemas/FeaturedReviewItem'
        }
      }
    }
  },

  // 評論摘要成功回應 Schema
  ReviewsSummarySuccessResponse: {
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
        example: '成功取得評論摘要'
      },
      data: {
        $ref: '#/components/schemas/ReviewsSummaryData',
        description: '評論摘要資料'
      }
    }
  },

  // ==================== 短影片 Schema ====================

  // 短影片查詢參數 Schema
  ShortVideosQueryParams: {
    type: 'object',
    properties: {
      mainCategoryId: {
        type: 'integer',
        minimum: 1,
        description: '主分類 ID（選填，用於篩選特定分類的影片）',
        example: 1
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 20,
        description: '返回數量，預設為 5，最小 1，最大 20',
        example: 5
      }
    }
  },

  // 短影片項目 Schema
  ShortVideoItem: {
    type: 'object',
    properties: {
      videoId: {
        type: 'integer',
        description: '影片 ID',
        example: 1
      },
      courseId: {
        type: 'integer',
        description: '所屬課程 ID',
        example: 10
      },
      title: {
        type: 'string',
        description: '影片標題',
        example: '基礎吉他入門教學'
      },
      thumbnailUrl: {
        type: 'string',
        description: '縮圖 URL（目前使用影片 URL）',
        example: 'https://example.com/video.mp4'
      },
      videoUrl: {
        type: 'string',
        description: '影片播放 URL',
        example: 'https://example.com/video.mp4'
      },
      duration: {
        type: 'integer',
        description: '影片長度（秒，目前預設為 0）',
        example: 0
      },
      mainCategory: {
        type: 'object',
        description: '主分類資訊',
        properties: {
          id: {
            type: 'integer',
            description: '主分類 ID',
            example: 1
          },
          name: {
            type: 'string',
            description: '主分類名稱',
            example: '音樂'
          }
        }
      },
      course: {
        type: 'object',
        description: '課程資訊',
        properties: {
          id: {
            type: 'integer',
            description: '課程 ID',
            example: 10
          },
          title: {
            type: 'string',
            description: '課程標題',
            example: '吉他初學者必修課'
          }
        }
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
          name: {
            type: 'string',
            description: '教師姓名',
            example: '李老師'
          }
        }
      }
    }
  },

  // 短影片資料 Schema
  ShortVideosData: {
    type: 'object',
    properties: {
      videos: {
        type: 'array',
        description: '短影片列表（依評分、熱門度、完整度、發布時間排序）',
        items: {
          $ref: '#/components/schemas/ShortVideoItem'
        }
      }
    }
  },

  // 短影片成功回應 Schema
  ShortVideosSuccessResponse: {
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
        example: '成功取得短影音列表'
      },
      data: {
        $ref: '#/components/schemas/ShortVideosData',
        description: '短影片資料'
      }
    }
  },

  // ==================== 推薦課程 Schema ====================

  // 推薦課程查詢參數 Schema
  RecommendedCoursesQueryParams: {
    type: 'object',
    properties: {
      cityId: {
        type: 'integer',
        minimum: 1,
        description: '縣市 ID（選填，用於優先顯示該地區課程）',
        example: 1
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 20,
        description: '返回數量，預設為 6，最小 1，最大 20',
        example: 6
      }
    }
  },

  // 推薦課程項目 Schema
  RecommendedCourseItem: {
    type: 'object',
    properties: {
      courseId: {
        type: 'integer',
        description: '課程 ID',
        example: 15
      },
      title: {
        type: 'string',
        description: '課程標題',
        example: '吉他初學者必修課'
      },
      description: {
        type: 'string',
        description: '課程描述（最多 100 字，超過會截斷並加 ...）',
        example: '本課程專為吉他初學者設計，從基礎指法到和弦練習，循序漸進帶你進入音樂世界...'
      },
      coverImage: {
        type: 'string',
        description: '課程封面圖片 URL',
        example: 'https://example.com/course-cover.jpg'
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
          name: {
            type: 'string',
            description: '教師姓名',
            example: '李老師'
          },
          avatar: {
            type: 'string',
            description: '教師頭像 URL',
            example: 'https://example.com/teacher-avatar.jpg'
          }
        }
      },
      priceRange: {
        type: 'object',
        description: '價格範圍',
        properties: {
          min: {
            type: 'number',
            description: '最低價格',
            example: 500
          },
          perUnit: {
            type: 'string',
            description: '計價單位',
            example: '堂'
          }
        }
      },
      mainCategory: {
        type: 'object',
        description: '主分類資訊',
        properties: {
          id: {
            type: 'integer',
            description: '主分類 ID',
            example: 1
          },
          name: {
            type: 'string',
            description: '主分類名稱',
            example: '音樂'
          }
        }
      },
      subCategory: {
        type: 'object',
        description: '子分類資訊',
        properties: {
          id: {
            type: 'integer',
            description: '子分類 ID',
            example: 3
          },
          name: {
            type: 'string',
            description: '子分類名稱',
            example: '吉他'
          }
        }
      },
      rating: {
        type: 'object',
        description: '評分資訊',
        properties: {
          average: {
            type: 'number',
            description: '平均評分',
            example: 4.5
          },
          count: {
            type: 'integer',
            description: '評論數量',
            example: 120
          }
        }
      },
      city: {
        type: 'object',
        description: '城市資訊',
        properties: {
          id: {
            type: 'integer',
            description: '城市 ID（目前為 0）',
            example: 0
          },
          name: {
            type: 'string',
            description: '城市名稱',
            example: '台北市'
          }
        }
      }
    }
  },

  // 推薦課程資料 Schema
  RecommendedCoursesData: {
    type: 'object',
    properties: {
      courses: {
        type: 'array',
        description: '推薦課程列表（依地區匹配、評分、可預約性、完整度排序，同一教師最多一堂課）',
        items: {
          $ref: '#/components/schemas/RecommendedCourseItem'
        }
      }
    }
  },

  // 推薦課程成功回應 Schema
  RecommendedCoursesSuccessResponse: {
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
        example: '成功取得推薦課程'
      },
      data: {
        $ref: '#/components/schemas/RecommendedCoursesData',
        description: '推薦課程資料'
      }
    }
  },

  // ==================== 錯誤回應 Schema ====================

  // 首頁驗證錯誤回應
  HomeValidationErrorResponse: {
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
              limit: ['limit 必須是數字'],
              mainCategoryId: ['mainCategoryId 必須是正整數']
            }
          }
        }
      }
    ]
  }
}
