/**
 * 教師相關測試資料 Fixtures
 * 提供教師申請測試所需的標準測試資料
 */

import { ApplicationStatus, UserRole, AccountStatus } from '../../entities/enums'
import { Teacher } from '../../entities/Teacher'

// 有效的測試資料：自我介紹
export const validIntroductions = {
  // 基本有效介紹（剛好100+字元）
  basic: '我是一位熱愛教育的專業人士，擁有豐富的教學經驗和深厚的學術背景。我在這個領域已經工作了多年，積累了豐富的實戰經驗。我希望能在這個平台上分享我的知識，幫助更多學生成長和進步，讓他們能夠在學習的道路上走得更遠，實現自己的夢想和目標。',

  // 詳細介紹（150+字元）
  detailed: '這是一個完整的教師申請自我介紹，包含了豐富的個人背景資訊和教學經驗描述。我在教育領域擁有超過十年的專業經驗，曾經在多個教育機構任教，具備深厚的學科知識和優秀的教學技巧。我熱愛與學生互動，善於啟發學生的學習興趣，並且能夠根據不同學生的特點制定個性化的教學方案。我相信教育的力量能夠改變世界，希望通過我的努力為學生們提供最優質的教學服務。',

  // 更新用介紹（120+字元）
  updated: '更新後的申請介紹內容，需要長度超過100字元以符合系統驗證規則。這是教師申請的更新版本，包含了申請人更詳細的教學背景和經驗介紹，確保更新功能的測試資料符合業務需求和系統驗證要求。我擁有豐富的教學經驗和專業知識，能夠提供高品質的教學服務，幫助學生達成學習目標。',

  // 重複申請測試用介紹（110+字元）
  duplicate: '新的申請內容，這是第二次嘗試申請教師身份的內容。雖然內容很詳細且足夠長，但因為已經有申請記錄，所以應該會被系統拒絕，並回傳適當的錯誤訊息。我在教育領域有豐富的經驗，擅長多種教學方法和技巧，希望能夠分享知識給學生們，讓他們在學習過程中獲得更好的成果。',

  // 已存在申請記錄用介紹（130+字元）
  existing: '已存在的申請內容，這是一個有效的教師申請記錄，包含了足夠的長度和詳細的描述。這個內容會用於測試重複申請的情況，確保系統能正確處理已存在的申請。我具備專業的教學能力和豐富的實務經驗，能夠為學生提供優質的教育服務，幫助他們在學習路上取得成功，實現個人的學習目標和職涯發展。',

  // 原始申請記錄介紹（100+字元）
  original: '原始申請介紹內容，這是教師申請的原始版本。包含了申請人的基本教學背景和經驗介紹，符合系統的最低長度要求，用於測試申請更新功能的原始資料。我熱愛教育工作，具備良好的溝通能力和教學技巧，希望能夠通過平台為更多學生提供專業的教學指導。',

  // 日本國籍申請者介紹（110+字元）
  japanese: '私は教育に情熱を注ぐ専門家として、豊富な教育経験と深い学術的背景を持っています。長年この分野で働き、実践的な経験を積んできました。このプラットフォームで知識を共有し、より多くの学生の成長と進歩を支援したいと思っています。学生たちが学習の道のりでより遠くまで行けるよう手助けしたいと考えています。',

  // 工作經驗豐富申請者介紹（140+字元）
  experienced: '我擁有超過十五年的教育工作經驗，曾在多個知名教育機構擔任資深教師職位。在教學過程中，我不斷精進自己的教學方法，善於運用多元化的教學策略來滿足不同學習類型學生的需求。我相信每個學生都有其獨特的潜力，透過適當的引導和鼓勵，都能夠達到優秀的學習成果。希望能在這個平台上發揮我的專業能力，為更多學生提供高品質的教育服務。',

  // 用於教師資料管理測試的介紹（120+字元）
  profileUpdate: '教師資料管理測試專用介紹，這段文字是用於測試教師基本資料更新功能的內容。包含了足夠的長度以通過系統驗證，同時也提供了清楚的識別用途。我是一位專業的教育工作者，致力於提供高品質的教學服務，希望能通過不斷學習和改進，為學生帶來最好的學習體驗和成果。'
}

// 無效的自我介紹內容（用於驗證測試）
export const invalidIntroductions = {
  // 過短介紹（少於100字元）
  tooShort: '太短的介紹內容',

  // 空白介紹
  empty: '',

  // 過長介紹（超過1000字元）
  tooLong: 'A'.repeat(1001),

  // 剛好1000字元（邊界測試）
  maxLength: 'A'.repeat(1000)
}

// 基本有效教師申請資料
export const validTeacherApplicationData = {
  basic: {
    nationality: '台灣',
    introduction: validIntroductions.basic
  },

  detailed: {
    nationality: '台灣', 
    introduction: validIntroductions.detailed
  },

  japanese: {
    nationality: '日本',
    introduction: validIntroductions.japanese
  },

  updated: {
    nationality: '日本',
    introduction: validIntroductions.updated
  },

  multiFieldUpdate: {
    nationality: '美國',
    introduction: validIntroductions.experienced
  }
}

// 無效教師申請資料（用於驗證測試）
export const invalidTeacherApplicationData = {
  emptyNationality: {
    nationality: '',
    introduction: validIntroductions.basic
  },

  shortIntroduction: {
    nationality: '台灣',
    introduction: invalidIntroductions.tooShort
  },

  longIntroduction: {
    nationality: '台灣',
    introduction: invalidIntroductions.tooLong
  },

  emptyIntroduction: {
    nationality: '台灣',
    introduction: invalidIntroductions.empty
  }
}

// 教師實體資料建立工廠函式
export const createTeacherEntityData = (overrides: Partial<Teacher> = {}): Partial<Teacher> => ({
  uuid: '550e8400-e29b-41d4-a716-446655440001',
  user_id: 1,
  nationality: '台灣',
  introduction: validIntroductions.basic,
  application_status: ApplicationStatus.PENDING,
  application_submitted_at: undefined,
  application_reviewed_at: undefined,
  reviewer_id: undefined,
  review_notes: undefined,
  ...overrides
})

// 不同申請狀態的教師資料
export const teacherEntityVariations = {
  // 待審核狀態
  pending: createTeacherEntityData({
    application_status: ApplicationStatus.PENDING,
    introduction: validIntroductions.basic
  }),

  // 已通過狀態
  approved: createTeacherEntityData({
    uuid: '550e8400-e29b-41d4-a716-446655440002',
    application_status: ApplicationStatus.APPROVED,
    introduction: validIntroductions.detailed,
    application_reviewed_at: new Date(),
    reviewer_id: 1,
    review_notes: '申請審核通過'
  }),

  // 已拒絕狀態
  rejected: createTeacherEntityData({
    uuid: '550e8400-e29b-41d4-a716-446655440003',
    application_status: ApplicationStatus.REJECTED,
    introduction: validIntroductions.basic,
    application_reviewed_at: new Date(),
    reviewer_id: 1,
    review_notes: '申請資料不符合要求'
  }),

  // 已提交狀態（等待審核）
  submitted: createTeacherEntityData({
    uuid: '550e8400-e29b-41d4-a716-446655440004',
    application_status: ApplicationStatus.PENDING,
    introduction: validIntroductions.detailed,
    application_submitted_at: new Date()
  }),

  // 用於重複申請測試
  forDuplicateTest: createTeacherEntityData({
    uuid: '550e8400-e29b-41d4-a716-446655440005',
    introduction: validIntroductions.existing
  }),

  // 用於更新測試的原始資料
  forUpdateTest: createTeacherEntityData({
    uuid: '550e8400-e29b-41d4-a716-446655440006',
    introduction: validIntroductions.original
  }),

  // 用於測試拒絕已通過申請的修改
  approvedForRejection: createTeacherEntityData({
    uuid: '550e8400-e29b-41d4-a716-446655440007',
    application_status: ApplicationStatus.APPROVED,
    introduction: validIntroductions.detailed,
    application_reviewed_at: new Date(),
    reviewer_id: 1
  })
}

// JWT Token 測試用使用者資料
export const jwtTestUsers = {
  // 基本學生使用者（用於申請）
  student: {
    id: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    nick_name: '測試使用者',
    name: '測試使用者真實姓名',
    role: UserRole.STUDENT,
    account_status: AccountStatus.ACTIVE,
    password: 'hashedpassword123'
  },

  // 教師使用者（不能申請）
  teacher: {
    id: 2,
    uuid: '550e8400-e29b-41d4-a716-446655440010',
    email: 'teacher@example.com',
    nick_name: '教師使用者',
    name: '教師使用者真實姓名',
    role: UserRole.TEACHER,
    account_status: AccountStatus.ACTIVE,
    password: 'hashedpassword123'
  },

  // 停用使用者（不能申請）
  suspended: {
    id: 3,
    uuid: '550e8400-e29b-41d4-a716-446655440011',
    email: 'suspended@example.com',
    nick_name: '停用使用者',
    name: '停用使用者真實姓名',
    role: UserRole.STUDENT,
    account_status: AccountStatus.SUSPENDED,
    password: 'hashedpassword123'
  }
}

// 常用測試場景資料組合
export const teacherApplicationTestScenarios = {
  // 成功申請場景
  successfulApplication: {
    user: jwtTestUsers.student,
    applicationData: validTeacherApplicationData.basic,
    expectedStatus: 201
  },

  // 重複申請場景  
  duplicateApplication: {
    user: jwtTestUsers.student,
    existingTeacher: teacherEntityVariations.forDuplicateTest,
    applicationData: validTeacherApplicationData.japanese,
    expectedStatus: 409
  },

  // 無效資料申請場景
  invalidApplication: {
    user: jwtTestUsers.student,
    applicationData: invalidTeacherApplicationData.shortIntroduction,
    expectedStatus: 400
  },

  // 非學生申請場景
  nonStudentApplication: {
    user: jwtTestUsers.teacher,
    applicationData: validTeacherApplicationData.basic,
    expectedStatus: 403
  },

  // 停用帳號申請場景
  suspendedUserApplication: {
    user: jwtTestUsers.suspended,
    applicationData: validTeacherApplicationData.basic,
    expectedStatus: 401
  },

  // 成功取得申請狀態場景
  getApplicationSuccess: {
    user: jwtTestUsers.student,
    existingTeacher: teacherEntityVariations.pending,
    expectedStatus: 200
  },

  // 沒有申請記錄場景
  noApplicationRecord: {
    user: jwtTestUsers.student,
    expectedStatus: 404
  },

  // 成功更新申請場景
  updateApplicationSuccess: {
    user: jwtTestUsers.student,
    existingTeacher: teacherEntityVariations.forUpdateTest,
    updateData: validTeacherApplicationData.updated,
    expectedStatus: 200
  },

  // 拒絕已通過申請的修改場景
  updateApprovedApplication: {
    user: jwtTestUsers.student,
    existingTeacher: teacherEntityVariations.approvedForRejection,
    updateData: validTeacherApplicationData.updated,
    expectedStatus: 400
  }
}

// 用於驗證回應格式的預期資料結構
export const expectedResponseStructures = {
  // 成功申請回應結構
  successfulApplicationResponse: {
    status: 'success',
    message: '教師申請已建立',
    data: {
      teacher: {
        id: expect.any(Number),
        uuid: expect.any(String),
        user_id: expect.any(Number),
        nationality: expect.any(String),
        introduction: expect.any(String),
        application_status: ApplicationStatus.PENDING,
        application_submitted_at: null,
        created_at: expect.any(String)
      }
    }
  },

  // 重複申請錯誤回應結構
  duplicateApplicationResponse: {
    status: 'error',
    message: '您已經有教師申請記錄',
    errors: {}
  },

  // 驗證錯誤回應結構
  validationErrorResponse: {
    status: 'error',
    message: '參數驗證失敗',
    errors: expect.any(Object)
  },

  // 取得申請狀態成功回應結構
  getApplicationSuccessResponse: {
    status: 'success',
    message: '取得申請狀態成功',
    data: {
      teacher: {
        id: expect.any(Number),
        uuid: expect.any(String),
        nationality: expect.any(String),
        introduction: expect.any(String),
        application_status: expect.any(String),
        application_submitted_at: null,
        application_reviewed_at: null,
        reviewer_id: null,
        review_notes: null,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }
    }
  },

  // 沒有申請記錄錯誤回應結構
  noApplicationResponse: {
    status: 'error',
    message: '找不到教師申請記錄'
  },

  // 更新申請成功回應結構
  updateApplicationSuccessResponse: {
    status: 'success',
    message: '申請資料更新成功',
    data: {
      teacher: {
        id: expect.any(Number),
        nationality: expect.any(String),
        introduction: expect.any(String),
        updated_at: expect.any(String)
      }
    }
  }
}

// 資料庫查詢用的搜尋條件
export const teacherQueryConditions = {
  byUserId: (userId: number) => ({ where: { user_id: userId } }),
  byId: (id: number) => ({ where: { id } }),
  byUuid: (uuid: string) => ({ where: { uuid } }),
  byStatus: (status: ApplicationStatus) => ({ where: { application_status: status } })
}

export default {
  validIntroductions,
  invalidIntroductions,
  validTeacherApplicationData,
  invalidTeacherApplicationData,
  createTeacherEntityData,
  teacherEntityVariations,
  jwtTestUsers,
  teacherApplicationTestScenarios,
  expectedResponseStructures,
  teacherQueryConditions
}