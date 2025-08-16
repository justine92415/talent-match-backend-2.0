/**
 * 學習經歷測試資料 Fixtures
 * 提供學習經歷管理測試所需的標準測試資料
 */

import { TeacherLearningExperience } from '@entities/TeacherLearningExperience'
import { CreateLearningExperienceRequest, UpdateLearningExperienceRequest } from '@models/index'

// 有效的學習經歷資料
export const validLearningExperiences = {
  // 基本大學學士學位（已畢業）
  bachelor: {
    is_in_school: false,
    degree: '學士',
    school_name: '台灣大學',
    department: '資訊工程學系',
    region: true,
    start_year: 2016,
    start_month: 9,
    end_year: 2020,
    end_month: 6
    // TODO: 檔案上傳系統完成後新增 certificate_file
  } as CreateLearningExperienceRequest,

  // 碩士學位（已畢業）
  master: {
    is_in_school: false,
    degree: '碩士',
    school_name: '清華大學',
    department: '電機工程學系',
    region: true,
    start_year: 2020,
    start_month: 9,
    end_year: 2022,
    end_month: 6
  } as CreateLearningExperienceRequest,

  // 博士學位（仍在學）
  doctorate: {
    is_in_school: true,
    degree: '博士',
    school_name: '交通大學',
    department: '資訊科學與工程研究所',
    region: true,
    start_year: 2022,
    start_month: 9,
    end_year: null,
    end_month: null
  } as CreateLearningExperienceRequest,

  // 海外學歷
  overseas: {
    is_in_school: false,
    degree: '碩士',
    school_name: 'Stanford University',
    department: 'Computer Science',
    region: false,
    start_year: 2018,
    start_month: 9,
    end_year: 2020,
    end_month: 6
  } as CreateLearningExperienceRequest,

  // 專科學歷
  diploma: {
    is_in_school: false,
    degree: '專科',
    school_name: '台北科技大學',
    department: '電子工程系',
    region: true,
    start_year: 2014,
    start_month: 9,
    end_year: 2016,
    end_month: 6
  } as CreateLearningExperienceRequest,

  // 用於更新測試
  updateData: {
    degree: '碩士',
    school_name: '成功大學',
    department: '資訊工程學系',
    end_year: 2021,
    end_month: 12
  } as UpdateLearningExperienceRequest
}

// 無效的學習經歷資料
export const invalidLearningExperiences = {
  // 在學但設定結束日期
  inSchoolWithEndDate: {
    is_in_school: true,
    degree: '博士',
    school_name: '台灣大學',
    department: '資訊工程學系',
    region: true,
    start_year: 2022,
    start_month: 9,
    end_year: 2026, // 在學不應該有結束日期
    end_month: 6
  },

  // 結束日期早於開始日期
  endBeforeStart: {
    is_in_school: false,
    degree: '學士',
    school_name: '台灣大學',
    department: '資訊工程學系',
    region: true,
    start_year: 2020,
    start_month: 9,
    end_year: 2019, // 結束年份早於開始年份
    end_month: 6
  },

  // 空白學校名稱
  emptySchoolName: {
    is_in_school: false,
    degree: '學士',
    school_name: '',
    department: '資訊工程學系',
    region: true,
    start_year: 2016,
    start_month: 9,
    end_year: 2020,
    end_month: 6
  },

  // 無效的月份
  invalidMonth: {
    is_in_school: false,
    degree: '學士',
    school_name: '台灣大學',
    department: '資訊工程學系',
    region: true,
    start_year: 2016,
    start_month: 13, // 無效月份
    end_year: 2020,
    end_month: 6
  },

  // 畢業但沒有結束日期
  graduatedNoEndDate: {
    is_in_school: false,
    degree: '學士',
    school_name: '台灣大學',
    department: '資訊工程學系',
    region: true,
    start_year: 2016,
    start_month: 9
    // 缺少 end_year 和 end_month
  }
}

// 學習經歷實體資料工廠函式
export const createLearningExperienceEntityData = (
  teacherId: number,
  overrides: Partial<TeacherLearningExperience> = {}
): Partial<TeacherLearningExperience> => ({
  teacher_id: teacherId,
  is_in_school: false,
  degree: '學士',
  school_name: '台灣大學',
  department: '資訊工程學系',
  region: true,
  start_year: 2016,
  start_month: 9,
  end_year: 2020,
  end_month: 6,
  file_path: null, // TODO: 檔案上傳系統完成後提供測試檔案路徑
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides
})

// 不同類型學習經歷的實體資料
export const learningExperienceEntityVariations = {
  // 基本學士學歷
  bachelor: (teacherId: number) => createLearningExperienceEntityData(teacherId, {
    id: 1,
    degree: '學士',
    school_name: '台灣大學',
    department: '資訊工程學系'
  }),

  // 碩士學歷
  master: (teacherId: number) => createLearningExperienceEntityData(teacherId, {
    id: 2,
    degree: '碩士',
    school_name: '清華大學',
    department: '電機工程學系',
    start_year: 2020,
    start_month: 9,
    end_year: 2022,
    end_month: 6
  }),

  // 在學博士
  doctorateInProgress: (teacherId: number) => createLearningExperienceEntityData(teacherId, {
    id: 3,
    is_in_school: true,
    degree: '博士',
    school_name: '交通大學',
    department: '資訊科學與工程研究所',
    start_year: 2022,
    start_month: 9,
    end_year: null,
    end_month: null
  }),

  // 海外學歷
  overseas: (teacherId: number) => createLearningExperienceEntityData(teacherId, {
    id: 4,
    degree: '碩士',
    school_name: 'Stanford University',
    department: 'Computer Science',
    region: false,
    start_year: 2018,
    start_month: 9,
    end_year: 2020,
    end_month: 6
  })
}

// 測試場景資料組合
export const learningExperienceTestScenarios = {
  // 成功建立學習經歷
  createSuccess: {
    requestData: validLearningExperiences.bachelor,
    expectedStatus: 201
  },

  // 建立在學中的學習經歷
  createInSchool: {
    requestData: validLearningExperiences.doctorate,
    expectedStatus: 201
  },

  // 建立海外學習經歷
  createOverseas: {
    requestData: validLearningExperiences.overseas,
    expectedStatus: 201
  },

  // 驗證錯誤 - 在學但有結束日期
  validationErrorInSchoolWithEnd: {
    requestData: invalidLearningExperiences.inSchoolWithEndDate,
    expectedStatus: 400
  },

  // 驗證錯誤 - 結束日期早於開始日期
  validationErrorEndBeforeStart: {
    requestData: invalidLearningExperiences.endBeforeStart,
    expectedStatus: 400
  },

  // 成功更新學習經歷
  updateSuccess: {
    updateData: validLearningExperiences.updateData,
    expectedStatus: 200
  },

  // 成功刪除學習經歷
  deleteSuccess: {
    expectedStatus: 200
  },

  // 找不到學習經歷記錄
  notFound: {
    expectedStatus: 404
  },

  // 無權限存取
  unauthorized: {
    expectedStatus: 403
  }
}

// 預期回應結構
export const expectedLearningExperienceResponses = {
  // 建立成功回應
  createSuccess: {
    status: 'success',
    message: expect.any(String), // TODO: 等 constants 建立後使用統一訊息
    data: {
      learning_experience: {
        id: expect.any(Number),
        teacher_id: expect.any(Number),
        is_in_school: expect.any(Boolean),
        degree: expect.any(String),
        school_name: expect.any(String),
        department: expect.any(String),
        region: expect.any(Boolean),
        start_year: expect.any(Number),
        start_month: expect.any(Number),
        end_year: expect.anything(), // null 或 number
        end_month: expect.anything(), // null 或 number
        file_path: null, // TODO: 檔案上傳完成後改為 expect.any(String)
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }
    }
  },

  // 列表查詢成功回應
  listSuccess: {
    status: 'success',
    message: expect.any(String),
    data: {
      learning_experiences: expect.any(Array)
    }
  },

  // 更新成功回應
  updateSuccess: {
    status: 'success',
    message: expect.any(String),
    data: {
      learning_experience: {
        id: expect.any(Number),
        degree: expect.any(String),
        school_name: expect.any(String),
        updated_at: expect.any(String)
      }
    }
  },

  // 刪除成功回應
  deleteSuccess: {
    status: 'success',
    message: expect.any(String),
    data: null
  },

  // 驗證錯誤回應
  validationError: {
    status: 'error',
    message: expect.any(String),
    errors: expect.any(Object)
  },

  // 找不到記錄回應
  notFound: {
    status: 'error',
    message: expect.any(String)
  },

  // 權限不足回應
  unauthorized: {
    status: 'error',
    message: expect.any(String)
  }
}

// 資料庫查詢條件
export const learningExperienceQueryConditions = {
  byTeacherId: (teacherId: number) => ({ where: { teacher_id: teacherId } }),
  byId: (id: number) => ({ where: { id } }),
  byIdAndTeacher: (id: number, teacherId: number) => ({ 
    where: { id, teacher_id: teacherId } 
  }),
  byDegree: (degree: string) => ({ where: { degree } }),
  inSchoolOnly: () => ({ where: { is_in_school: true } }),
  graduatedOnly: () => ({ where: { is_in_school: false } })
}

export default {
  validLearningExperiences,
  invalidLearningExperiences,
  createLearningExperienceEntityData,
  learningExperienceEntityVariations,
  learningExperienceTestScenarios,
  expectedLearningExperienceResponses,
  learningExperienceQueryConditions
}