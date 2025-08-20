/**
 * 評價系統測試用 fixtures
 */

import { ReviewSubmitRequest, ReviewCreateData } from '@models/review'

/**
 * 有效的評價提交資料
 */
export const validReviewData: ReviewSubmitRequest = {
  reservation_id: 1,
  rate: 5,
  comment: '老師教得很好，內容很實用！講解清晰，實作練習很有幫助。課程安排得很有條理，推薦給想學習的朋友。這是一個超過50字元的評價內容，符合驗證要求。'
}

/**
 * 無效的評價資料 - 用於驗證測試
 */
export const invalidReviewData = {
  missingReservationId: {
    rate: 5,
    comment: '老師教得很好，內容很實用！講解清晰，實作練習很有幫助。課程安排得很有條理，推薦給想學習的朋友。'
  },
  invalidReservationId: {
    reservation_id: 'invalid',
    rate: 5,
    comment: '老師教得很好，內容很實用！講解清晰，實作練習很有幫助。課程安排得很有條理，推薦給想學習的朋友。'
  },
  missingRate: {
    reservation_id: 1,
    comment: '老師教得很好，內容很實用！講解清晰，實作練習很有幫助。課程安排得很有條理，推薦給想學習的朋友。'
  },
  invalidRate: {
    reservation_id: 1,
    rate: 6, // 超出範圍
    comment: '老師教得很好，內容很實用！講解清晰，實作練習很有幫助。課程安排得很有條理，推薦給想學習的朋友。'
  },
  rateOutOfRangeLow: {
    reservation_id: 1,
    rate: 0, // 低於範圍
    comment: '老師教得很好，內容很實用！講解清晰，實作練習很有幫助。課程安排得很有條理，推薦給想學習的朋友。'
  },
  missingComment: {
    reservation_id: 1,
    rate: 5
  },
  emptyComment: {
    reservation_id: 1,
    rate: 5,
    comment: ''
  },
  shortComment: {
    reservation_id: 1,
    rate: 5,
    comment: '太短了' // 少於50字元
  },
  longComment: {
    reservation_id: 1,
    rate: 5,
    comment: 'A'.repeat(501) // 超過500字元
  }
}

/**
 * 評價服務層建立資料
 */
export const validReviewCreateData: ReviewCreateData = {
  reservation_id: 1,
  course_id: 1,
  user_id: 1,
  teacher_id: 1,
  rate: 5,
  comment: '老師教得很好，內容很實用！講解清晰，實作練習很有幫助。課程安排得很有條理，推薦給想學習的朋友。這是一個超過50字元的評價內容，符合驗證要求。'
}

/**
 * 多種評分的評價資料
 */
export const reviewVariations = {
  excellentReview: {
    reservation_id: 2,
    rate: 5,
    comment: '非常優秀的課程！教師專業且耐心，課程內容豐富實用，強烈推薦給所有想要學習的朋友們。教學方式生動有趣，讓人容易理解複雜的概念。'
  },
  goodReview: {
    reservation_id: 3,
    rate: 4,
    comment: '課程整體不錯，內容實用性強，教師講解清楚。雖然有些地方可以改進，但整體來說是很好的學習體驗，值得推薦給大家。'
  },
  averageReview: {
    reservation_id: 4,
    rate: 3,
    comment: '課程內容尚可，教師態度還好。有些部分講解得不夠深入，希望能夠增加更多實例說明。整體還算OK，但有改進空間。'
  },
  poorReview: {
    reservation_id: 5,
    rate: 2,
    comment: '課程內容比較基礎，不太符合我的期待。教師講解速度有點快，建議可以放慢一些讓學生更好理解。希望下次能夠改善。'
  },
  badReview: {
    reservation_id: 6,
    rate: 1,
    comment: '課程內容與描述不符，教師準備不充分。上課時間安排也有問題，整體體驗不佳。不推薦其他人參加這個課程。需要大幅改進。'
  }
}

/**
 * 查詢參數測試資料
 */
export const queryParams = {
  validPagination: {
    page: 1,
    per_page: 10
  },
  invalidPagination: {
    invalidPage: {
      page: 'invalid',
      per_page: 10
    },
    negativePage: {
      page: -1,
      per_page: 10
    },
    zerePage: {
      page: 0,
      per_page: 10
    },
    invalidPerPage: {
      page: 1,
      per_page: 'invalid'
    },
    negativePerPage: {
      page: 1,
      per_page: -5
    },
    zeroPerPage: {
      page: 1,
      per_page: 0
    },
    excessivePerPage: {
      page: 1,
      per_page: 101 // 超過限制
    }
  },
  validSort: {
    newest: { sort: 'newest' },
    oldest: { sort: 'oldest' },
    ratingHigh: { sort: 'rating_high' },
    ratingLow: { sort: 'rating_low' }
  },
  invalidSort: {
    wrongSort: { sort: 'invalid_sort' }
  },
  validFilter: {
    ratingFilter: { rating: 5 },
    dateFilter: {
      date_from: '2025-01-01',
      date_to: '2025-12-31'
    },
    keywordFilter: { keyword: '實用' },
    combinedFilter: {
      rating: 4,
      date_from: '2025-01-01',
      date_to: '2025-12-31',
      keyword: '推薦',
      sort: 'newest'
    }
  },
  invalidFilter: {
    invalidRating: { rating: 6 },
    negativeRating: { rating: -1 },
    invalidDateFormat: {
      date_from: 'invalid-date',
      date_to: '2025-12-31'
    },
    longKeyword: {
      keyword: 'A'.repeat(101) // 超過100字元
    }
  }
}

/**
 * 預期的 API 回應格式
 */
export const expectedResponseStructures = {
  submitSuccess: {
    status: 'success',
    data: {
      review: {
        id: expect.any(Number),
        uuid: expect.any(String),
        reservation_id: expect.any(Number),
        course_id: expect.any(Number),
        user_id: expect.any(Number),
        teacher_id: expect.any(Number),
        rate: expect.any(Number),
        comment: expect.any(String),
        is_visible: expect.any(Boolean),
        created_at: expect.any(String)
      },
      course_updated: {
        course_id: expect.any(Number),
        new_average_rate: expect.any(Number),
        new_review_count: expect.any(Number)
      }
    }
  },
  courseReviewsList: {
    status: 'success',
    data: {
      reviews: expect.any(Array),
      pagination: {
        current_page: expect.any(Number),
        per_page: expect.any(Number),
        total: expect.any(Number),
        total_pages: expect.any(Number)
      },
      course_info: {
        id: expect.any(Number),
        name: expect.any(String),
        average_rate: expect.any(Number),
        review_count: expect.any(Number)
      }
    }
  },
  myReviewsList: {
    status: 'success',
    data: {
      reviews: expect.any(Array),
      pagination: {
        current_page: expect.any(Number),
        per_page: expect.any(Number),
        total: expect.any(Number),
        total_pages: expect.any(Number)
      },
      summary: {
        total_reviews: expect.any(Number),
        average_rating_given: expect.any(Number),
        courses_reviewed: expect.any(Number)
      }
    }
  },
  receivedReviewsList: {
    status: 'success',
    data: {
      reviews: expect.any(Array),
      pagination: {
        current_page: expect.any(Number),
        per_page: expect.any(Number),
        total: expect.any(Number),
        total_pages: expect.any(Number)
      },
      summary: {
        total_reviews: expect.any(Number),
        average_rating: expect.any(Number),
        rating_distribution: {
          '5_star': expect.any(Number),
          '4_star': expect.any(Number),
          '3_star': expect.any(Number),
          '2_star': expect.any(Number),
          '1_star': expect.any(Number)
        }
      }
    }
  }
}