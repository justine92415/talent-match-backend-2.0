/**
 * 使用者測試資料 fixtures
 * 遵循 TDD 指示文件：統一管理測試資料，避免重複宣告
 */

import { UserRole, AccountStatus } from '@entities/enums'
import { User } from '@entities/User'

// 基本有效使用者資料
export const validUserData = {
  nick_name: '測試使用者',
  email: 'test@example.com',
  password: 'password123'
}

// 第二個有效使用者資料（避免重複）
export const validUserData2 = {
  nick_name: '測試使用者2',
  email: 'test2@example.com',
  password: 'password123'
}

// 第三個有效使用者資料
export const validUserData3 = {
  nick_name: '測試使用者3',
  email: 'test3@example.com',
  password: 'password123'
}

// 第四個有效使用者資料
export const validUserData4 = {
  nick_name: '測試使用者4',
  email: 'test4@example.com',
  password: 'password123'
}

// 第五個有效使用者資料
export const validUserData5 = {
  nick_name: '測試使用者5',
  email: 'test5@example.com',
  password: 'password123'
}

// 長暱稱測試資料
export const longNicknameUserData = {
  nick_name: 'a'.repeat(50), // 50 字元，符合最大長度
  email: 'long-nickname@example.com',
  password: 'password123'
}

// 過長暱稱測試資料（用於驗證失敗）
export const tooLongNicknameUserData = {
  nick_name: 'a'.repeat(51), // 51 字元，超過限制
  email: 'too-long-nickname@example.com',
  password: 'password123'
}

// 長 Email 測試資料
export const longEmailUserData = {
  nick_name: '測試長Email',
  email: 'very.long.email.address.test.user.with.many.dots@long-domain-name-for-testing.example.com',
  password: 'password123'
}

// 無效使用者資料集合
export const invalidUserData = {
  // 無效 Email 格式
  invalidEmail: {
    nick_name: '測試使用者',
    email: 'invalid-email',
    password: 'password123'
  },

  // 過短密碼
  shortPassword: {
    nick_name: '測試使用者',
    email: 'test@example.com',
    password: '123' // 過短
  },

  // 空白暱稱
  emptyNickname: {
    nick_name: '',
    email: 'test@example.com',
    password: 'password123'
  },

  // 缺少必填欄位
  missingFields: {
    nick_name: '測試使用者'
    // 缺少 email 和 password
  },

  // 空白登入欄位
  emptyLogin: {
    email: '',
    password: ''
  },

  // 無效登入 Email
  invalidLoginEmail: {
    email: 'invalid-email',
    password: 'password123'
  }
}

// 完整使用者實體資料（用於直接建立資料庫記錄）
export const createUserEntityData = (overrides: Partial<User> = {}): Partial<User> => ({
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  nick_name: '測試使用者',
  name: '測試使用者真實姓名',
  role: UserRole.STUDENT,
  account_status: AccountStatus.ACTIVE,
  password: 'hashedpassword123',
  contact_phone: '0912345678',
  ...overrides
})

// 教師角色使用者資料
export const teacherUserEntityData = (overrides: Partial<User> = {}): Partial<User> => ({
  uuid: '550e8400-e29b-41d4-a716-446655440001',
  email: 'teacher@example.com',
  nick_name: '教師使用者',
  name: '教師使用者真實姓名',
  role: UserRole.TEACHER,
  account_status: AccountStatus.ACTIVE,
  password: 'hashedpassword123',
  ...overrides
})

// 管理員角色使用者資料
export const adminUserEntityData = (overrides: Partial<User> = {}): Partial<User> => ({
  uuid: '550e8400-e29b-41d4-a716-446655440002',
  email: 'admin@example.com',
  nick_name: '管理員使用者',
  name: '管理員使用者真實姓名',
  role: UserRole.ADMIN,
  account_status: AccountStatus.ACTIVE,
  password: 'hashedpassword123',
  ...overrides
})

// 停用狀態使用者資料
export const suspendedUserEntityData = (overrides: Partial<User> = {}): Partial<User> => ({
  uuid: '550e8400-e29b-41d4-a716-446655440003',
  email: 'suspended@example.com',
  nick_name: '停用使用者',
  name: '停用使用者真實姓名',
  role: UserRole.STUDENT,
  account_status: AccountStatus.SUSPENDED,
  password: 'hashedpassword123',
  ...overrides
})

// 更新個人資料測試資料
export const updateProfileData = {
  // 有效更新資料
  validUpdate: {
    nick_name: '更新後的暱稱',
    name: '更新後的真實姓名',
    contact_phone: '0987654321'
  },

  // 多欄位更新
  multiFieldUpdate: {
    nick_name: '更新後的暱稱2',
    name: '測試使用者真實姓名',
    contact_phone: '0912345678'
  },

  // 過長暱稱更新（用於驗證失敗）
  tooLongNickname: {
    nick_name: 'a'.repeat(51) // 51個字元，超過限制
  },

  // 空白暱稱更新（用於驗證失敗）
  emptyNickname: {
    nick_name: ''
  }
}

// 忘記密碼和重設密碼測試資料
export const passwordResetData = {
  // 有效的忘記密碼請求
  validForgotPassword: {
    email: 'test@example.com'
  },

  // 不存在的 Email
  nonExistentEmail: {
    email: 'nonexistent@example.com'
  },

  // 停用帳號 Email
  suspendedAccountEmail: {
    email: 'suspended@example.com'
  },

  // 有效的重設密碼資料
  validResetPassword: {
    token: 'test-reset-token-12345',
    new_password: 'newPassword456'
  },

  // 無效的重設令牌
  invalidResetToken: {
    token: 'invalid-token',
    new_password: 'newPassword123'
  },

  // 過短的新密碼
  shortNewPassword: {
    token: 'valid-token',
    new_password: '123'
  },

  // 空白新密碼
  emptyNewPassword: {
    token: 'valid-token',
    new_password: ''
  },

  // 非字串格式新密碼
  invalidNewPasswordType: {
    token: 'valid-token',
    new_password: 12345678
  }
}

// 刷新 Token 測試資料
export const refreshTokenData = {
  // 空白 refresh token
  emptyToken: {
    refresh_token: ''
  },

  // 非字串格式 refresh token
  invalidTokenType: {
    refresh_token: 12345
  },

  // 無效的 refresh token
  invalidToken: {
    refresh_token: 'invalid.refresh.token'
  }
}

// 常用測試使用者建立工廠函式
export const createTestUserVariations = () => ({
  // 基本學生使用者
  student: createUserEntityData(),
  
  // 教師使用者
  teacher: teacherUserEntityData(),
  
  // 管理員使用者
  admin: adminUserEntityData(),
  
  // 停用使用者
  suspended: suspendedUserEntityData(),
  
  // 用於重複測試的使用者
  duplicate: createUserEntityData({
    uuid: '550e8400-e29b-41d4-a716-446655440010',
    email: 'duplicate-test@example.com',
    nick_name: '重複測試使用者'
  }),

  // 用於刪除測試的使用者
  forDeletion: createUserEntityData({
    uuid: '550e8400-e29b-41d4-a716-446655440011',
    email: 'delete-test@example.com',
    nick_name: '待刪除使用者'
  })
})