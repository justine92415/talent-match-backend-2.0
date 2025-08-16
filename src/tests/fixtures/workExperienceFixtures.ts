/**
 * 工作經驗測試資料 Fixtures
 * 遵循 TDD 指示文件：提供工作經驗測試所需的標準測試資料
 */

import { TeacherWorkExperience } from '@entities/TeacherWorkExperience'

// 有效的工作經驗測試資料
export const validWorkExperienceData = {
  // 基本在職工作經驗
  currentJob: {
    is_working: true,
    company_name: '台灣科技教育股份有限公司',
    workplace: '台北市信義區',
    job_category: '軟體開發',
    job_title: '資深軟體工程師',
    start_year: 2020,
    start_month: 3,
    end_year: null,
    end_month: null
  },

  // 基本離職工作經驗
  pastJob: {
    is_working: false,
    company_name: '創新教育科技有限公司',
    workplace: '新北市板橋區',
    job_category: '教育訓練',
    job_title: '資深講師',
    start_year: 2018,
    start_month: 6,
    end_year: 2020,
    end_month: 2
  },

  // 教育相關工作經驗
  educationJob: {
    is_working: false,
    company_name: '國立台灣大學',
    workplace: '台北市大安區',
    job_category: '高等教育',
    job_title: '助理教授',
    start_year: 2015,
    start_month: 8,
    end_year: 2018,
    end_month: 5
  },

  // 短期工作經驗
  shortTermJob: {
    is_working: false,
    company_name: '暑期程式設計營',
    workplace: '台中市西屯區',
    job_category: '教育訓練',
    job_title: '程式設計講師',
    start_year: 2019,
    start_month: 7,
    end_year: 2019,
    end_month: 8
  },

  // 管理職位工作經驗
  managerialJob: {
    is_working: true,
    company_name: '全球教育解決方案公司',
    workplace: '台北市松山區',
    job_category: '管理職',
    job_title: '技術總監',
    start_year: 2021,
    start_month: 1,
    end_year: null,
    end_month: null
  },

  // 國外工作經驗
  overseasJob: {
    is_working: false,
    company_name: 'Google Inc.',
    workplace: 'Mountain View, CA',
    job_category: 'Software Engineering',
    job_title: 'Senior Software Engineer',
    start_year: 2016,
    start_month: 9,
    end_year: 2019,
    end_month: 12
  },

  // 用於更新測試的原始資料
  originalForUpdate: {
    is_working: true,
    company_name: '原始公司名稱',
    workplace: '原始工作地點',
    job_category: '原始工作類別',
    job_title: '原始職位',
    start_year: 2020,
    start_month: 1,
    end_year: null,
    end_month: null
  },

  // 更新後的資料
  updatedData: {
    is_working: false,
    company_name: '更新後公司名稱',
    workplace: '更新後工作地點',
    job_category: '更新後工作類別',
    job_title: '更新後職位',
    start_year: 2020,
    start_month: 1,
    end_year: 2023,
    end_month: 6
  }
}

// 無效的工作經驗測試資料（用於驗證測試）
export const invalidWorkExperienceData = {
  // 缺少必填欄位
  missingCompanyName: {
    is_working: true,
    workplace: '台北市信義區',
    job_category: '軟體開發',
    job_title: '工程師',
    start_year: 2020,
    start_month: 3
  },

  // 公司名稱過長
  companyNameTooLong: {
    is_working: true,
    company_name: 'A'.repeat(201),
    workplace: '台北市信義區',
    job_category: '軟體開發',
    job_title: '工程師',
    start_year: 2020,
    start_month: 3
  },

  // 無效的年份
  invalidYear: {
    is_working: false,
    company_name: '測試公司',
    workplace: '台北市信義區',
    job_category: '軟體開發',
    job_title: '工程師',
    start_year: 1899, // 過早的年份
    start_month: 3,
    end_year: 2023,
    end_month: 6
  },

  // 無效的月份
  invalidMonth: {
    is_working: false,
    company_name: '測試公司',
    workplace: '台北市信義區',
    job_category: '軟體開發',
    job_title: '工程師',
    start_year: 2020,
    start_month: 13, // 無效月份
    end_year: 2023,
    end_month: 6
  },

  // 結束時間早於開始時間
  endBeforeStart: {
    is_working: false,
    company_name: '測試公司',
    workplace: '台北市信義區',
    job_category: '軟體開發',
    job_title: '工程師',
    start_year: 2023,
    start_month: 6,
    end_year: 2020,
    end_month: 3
  },

  // 在職但有結束時間
  workingWithEndDate: {
    is_working: true,
    company_name: '測試公司',
    workplace: '台北市信義區',
    job_category: '軟體開發',
    job_title: '工程師',
    start_year: 2020,
    start_month: 3,
    end_year: 2023,
    end_month: 6
  },

  // 離職但沒有結束時間
  notWorkingWithoutEndDate: {
    is_working: false,
    company_name: '測試公司',
    workplace: '台北市信義區',
    job_category: '軟體開發',
    job_title: '工程師',
    start_year: 2020,
    start_month: 3,
    end_year: null,
    end_month: null
  }
}

// 工作經驗實體資料建立工廠函式
export const createWorkExperienceEntityData = (teacherId: number, overrides: Partial<TeacherWorkExperience> = {}): Partial<TeacherWorkExperience> => ({
  teacher_id: teacherId,
  is_working: true,
  company_name: '預設公司名稱',
  workplace: '預設工作地點',
  job_category: '預設工作類別',
  job_title: '預設職位',
  start_year: 2020,
  start_month: 1,
  end_year: null,
  end_month: null,
  ...overrides
})

// 不同情境的工作經驗實體變體
export const workExperienceEntityVariations = {
  // 在職工作經驗
  current: (teacherId: number) => createWorkExperienceEntityData(teacherId, validWorkExperienceData.currentJob),

  // 離職工作經驗
  past: (teacherId: number) => createWorkExperienceEntityData(teacherId, validWorkExperienceData.pastJob),

  // 教育相關工作經驗
  education: (teacherId: number) => createWorkExperienceEntityData(teacherId, validWorkExperienceData.educationJob),

  // 短期工作經驗
  shortTerm: (teacherId: number) => createWorkExperienceEntityData(teacherId, validWorkExperienceData.shortTermJob),

  // 管理職位工作經驗
  managerial: (teacherId: number) => createWorkExperienceEntityData(teacherId, validWorkExperienceData.managerialJob),

  // 國外工作經驗
  overseas: (teacherId: number) => createWorkExperienceEntityData(teacherId, validWorkExperienceData.overseasJob),

  // 用於更新測試
  forUpdate: (teacherId: number) => createWorkExperienceEntityData(teacherId, validWorkExperienceData.originalForUpdate)
}

// 常用測試場景資料組合
export const workExperienceTestScenarios = {
  // 成功建立工作經驗場景
  createSuccess: {
    data: validWorkExperienceData.currentJob,
    expectedStatus: 201
  },

  // 建立無效工作經驗場景
  createInvalid: {
    data: invalidWorkExperienceData.missingCompanyName,
    expectedStatus: 400
  },

  // 建立邏輯錯誤工作經驗場景
  createLogicError: {
    data: invalidWorkExperienceData.workingWithEndDate,
    expectedStatus: 400
  },

  // 成功取得工作經驗列表場景
  getListSuccess: {
    expectedStatus: 200
  },

  // 成功更新工作經驗場景
  updateSuccess: {
    originalData: validWorkExperienceData.originalForUpdate,
    updateData: validWorkExperienceData.updatedData,
    expectedStatus: 200
  },

  // 更新無效資料場景
  updateInvalid: {
    updateData: invalidWorkExperienceData.companyNameTooLong,
    expectedStatus: 400
  },

  // 成功刪除工作經驗場景
  deleteSuccess: {
    expectedStatus: 200
  },

  // 刪除不存在的工作經驗場景
  deleteNotFound: {
    nonExistentId: 99999,
    expectedStatus: 404
  }
}

// 用於驗證回應格式的預期資料結構
export const expectedWorkExperienceResponseStructures = {
  // 成功建立工作經驗回應結構
  createSuccessResponse: {
    status: 'success',
    message: '工作經驗建立成功',
    data: {
      work_experience: {
        id: expect.any(Number),
        teacher_id: expect.any(Number),
        is_working: expect.any(Boolean),
        company_name: expect.any(String),
        workplace: expect.any(String),
        job_category: expect.any(String),
        job_title: expect.any(String),
        start_year: expect.any(Number),
        start_month: expect.any(Number),
        end_year: expect.anything(),
        end_month: expect.anything(),
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }
    }
  },

  // 驗證錯誤回應結構
  validationErrorResponse: {
    status: 'error',
    message: '參數驗證失敗',
    errors: expect.any(Object)
  },

  // 取得工作經驗列表成功回應結構
  getListSuccessResponse: {
    status: 'success',
    message: '取得工作經驗列表成功',
    data: {
      work_experiences: expect.any(Array),
      total: expect.any(Number)
    }
  },

  // 更新工作經驗成功回應結構
  updateSuccessResponse: {
    status: 'success',
    message: '工作經驗更新成功',
    data: {
      work_experience: {
        id: expect.any(Number),
        is_working: expect.any(Boolean),
        company_name: expect.any(String),
        workplace: expect.any(String),
        job_category: expect.any(String),
        job_title: expect.any(String),
        start_year: expect.any(Number),
        start_month: expect.any(Number),
        end_year: expect.anything(),
        end_month: expect.anything(),
        updated_at: expect.any(String)
      }
    }
  },

  // 刪除工作經驗成功回應結構
  deleteSuccessResponse: {
    status: 'success',
    message: '工作經驗刪除成功',
    data: {}
  },

  // 找不到資源錯誤回應結構
  notFoundResponse: {
    status: 'error',
    message: '找不到指定的工作經驗記錄'
  },

  // 權限不足錯誤回應結構
  forbiddenResponse: {
    status: 'error',
    message: '無權限執行此操作'
  }
}

// 資料庫查詢用的搜尋條件
export const workExperienceQueryConditions = {
  byTeacherId: (teacherId: number) => ({ where: { teacher_id: teacherId } }),
  byId: (id: number) => ({ where: { id } }),
  byIdAndTeacherId: (id: number, teacherId: number) => ({ 
    where: { id, teacher_id: teacherId } 
  }),
  currentJobs: (teacherId: number) => ({ 
    where: { teacher_id: teacherId, is_working: true } 
  }),
  pastJobs: (teacherId: number) => ({ 
    where: { teacher_id: teacherId, is_working: false } 
  }),
  byCompanyName: (teacherId: number, companyName: string) => ({ 
    where: { teacher_id: teacherId, company_name: companyName } 
  })
}

export default {
  validWorkExperienceData,
  invalidWorkExperienceData,
  createWorkExperienceEntityData,
  workExperienceEntityVariations,
  workExperienceTestScenarios,
  expectedWorkExperienceResponseStructures,
  workExperienceQueryConditions
}