import { Request, Response, NextFunction } from 'express'
import { errorHandler } from '@middleware/error'
import { BusinessError, ValidationError, AuthError, SystemError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { ERROR_MESSAGES } from '@constants/Message'

describe('ErrorHandler Middleware - 新的簡潔錯誤格式', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction
  let jsonMock: jest.Mock
  let statusMock: jest.Mock

  beforeEach(() => {
    jsonMock = jest.fn()
    statusMock = jest.fn().mockReturnThis()
    
    mockReq = {
      method: 'POST',
      url: '/api/test',
      body: { test: 'data' },
      user: { userId: 1, roles: ['student'], type: 'access' }
    }
    
    mockRes = {
      status: statusMock,
      json: jsonMock
    }
    
    mockNext = jest.fn()

    // 清理 console.log 和其他日誌
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('🎯 新格式驗證 - 業務錯誤', () => {
    it('BusinessError 應該回傳簡潔格式（無 error 物件，無 errors 欄位）', () => {
      // Arrange
      const error = new BusinessError(ERROR_CODES.INVALID_CREDENTIALS, ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS)

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert - 驗證新的簡潔格式
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS
        // 不應該包含 error 物件或 errors 欄位
      })

      // 確認沒有多餘欄位
      const callArgs = jsonMock.mock.calls[0][0]
      expect(callArgs.error).toBeUndefined()
      expect(callArgs.errors).toBeUndefined()
    })

    it('BusinessError EMAIL_EXISTS 應該回傳正確狀態碼和格式', () => {
      // Arrange
      const error = new BusinessError(ERROR_CODES.EMAIL_EXISTS, ERROR_MESSAGES.AUTH.EMAIL_EXISTS)

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: ERROR_CODES.EMAIL_EXISTS,
        message: ERROR_MESSAGES.AUTH.EMAIL_EXISTS
      })
    })
  })

  describe('🔐 新格式驗證 - 認證錯誤', () => {
    it('AuthError 應該回傳簡潔格式（無 error 物件，無 errors 欄位）', () => {
      // Arrange
      const error = new AuthError(ERROR_CODES.TOKEN_EXPIRED, ERROR_MESSAGES.AUTH.TOKEN_EXPIRED)

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: ERROR_CODES.TOKEN_EXPIRED,
        message: ERROR_MESSAGES.AUTH.TOKEN_EXPIRED
      })

      // 確認沒有多餘欄位
      const callArgs = jsonMock.mock.calls[0][0]
      expect(callArgs.error).toBeUndefined()
      expect(callArgs.errors).toBeUndefined()
    })

    it('AuthError UNAUTHORIZED_ACCESS 應該回傳 401 狀態碼', () => {
      // Arrange
      const error = new AuthError(ERROR_CODES.UNAUTHORIZED_ACCESS, ERROR_MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS, 401)

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: ERROR_CODES.UNAUTHORIZED_ACCESS,
        message: ERROR_MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS
      })
    })
  })

  describe('✅ 新格式驗證 - 驗證錯誤（包含 errors）', () => {
    it('ValidationError 有 details 時應該包含 errors 欄位', () => {
      // Arrange
      const error = new ValidationError(ERROR_CODES.VALIDATION_ERROR, '參數驗證失敗', {
        username: ['帳號格式不正確'],
        password: ['密碼長度不足']
      })

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert - 驗證包含 errors 欄位
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '參數驗證失敗',
        errors: {
          username: ['帳號格式不正確'],
          password: ['密碼長度不足']
        }
      })

      // 確認沒有多餘的 error 物件
      const callArgs = jsonMock.mock.calls[0][0]
      expect(callArgs.error).toBeUndefined()
    })

    it('ValidationError 無 details 時不應該包含 errors 欄位', () => {
      // Arrange
      const error = new ValidationError(ERROR_CODES.VALIDATION_ERROR, '驗證失敗')

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert - 沒有 details 時不應該包含 errors 欄位
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '驗證失敗'
      })

      // 確認沒有多餘欄位
      const callArgs = jsonMock.mock.calls[0][0]
      expect(callArgs.error).toBeUndefined()
      expect(callArgs.errors).toBeUndefined()
    })

    it('ValidationError 複雜驗證錯誤應該正確處理', () => {
      // Arrange
      const error = new ValidationError(ERROR_CODES.VALIDATION_ERROR, '多個欄位驗證失敗', {
        email: ['電子郵件格式不正確', '電子郵件長度超過限制'],
        nick_name: ['暱稱不能為空'],
        password: ['密碼至少需要 8 個字元', '密碼必須包含數字和字母']
      })

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '多個欄位驗證失敗',
        errors: {
          email: ['電子郵件格式不正確', '電子郵件長度超過限制'],
          nick_name: ['暱稱不能為空'],
          password: ['密碼至少需要 8 個字元', '密碼必須包含數字和字母']
        }
      })
    })
  })

  describe('🖥️ 新格式驗證 - 系統錯誤', () => {
    it('SystemError 應該回傳簡潔格式', () => {
      // Arrange
      const error = new SystemError(ERROR_CODES.INTERNAL_ERROR, ERROR_MESSAGES.SYSTEM.INTERNAL_ERROR)

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES.SYSTEM.INTERNAL_ERROR
      })

      // 確認沒有多餘欄位
      const callArgs = jsonMock.mock.calls[0][0]
      expect(callArgs.error).toBeUndefined()
      expect(callArgs.errors).toBeUndefined()
    })

    it('SystemError DATABASE_ERROR 應該回傳 500 狀態碼', () => {
      // Arrange
      const error = new SystemError('DATABASE_ERROR', '資料庫連線失敗', 500)

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: 'DATABASE_ERROR',
        message: '資料庫連線失敗'
      })
    })
  })

  describe('❓ 未知錯誤處理', () => {
    it('未知錯誤應該轉換為統一的系統錯誤格式', () => {
      // Arrange
      const error = new Error('未預期的錯誤')

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert - 未知錯誤應該轉換為系統錯誤格式
      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        code: ERROR_CODES.INTERNAL_ERROR,
        message: process.env.NODE_ENV === 'development' ? '未預期的錯誤' : '系統發生內部錯誤'
      })

      // 確認沒有多餘欄位
      const callArgs = jsonMock.mock.calls[0][0]
      expect(callArgs.error).toBeUndefined()
      expect(callArgs.errors).toBeUndefined()
    })

    it('JavaScript TypeError 應該轉換為系統錯誤', () => {
      // Arrange
      const error = new TypeError('Cannot read property of undefined')

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500)
      const callArgs = jsonMock.mock.calls[0][0]
      expect(callArgs.status).toBe('error')
      expect(callArgs.code).toBe(ERROR_CODES.INTERNAL_ERROR)
      expect(callArgs.message).toBeDefined()
      expect(callArgs.error).toBeUndefined()
      expect(callArgs.errors).toBeUndefined()
    })
  })

  describe('🔍 格式一致性驗證', () => {
    it('所有錯誤回應都應該包含必要欄位且格式統一', () => {
      const testCases = [
        { error: new BusinessError('BUSINESS_ERROR', '業務錯誤'), expectErrors: false },
        { error: new AuthError('AUTH_ERROR', '認證錯誤'), expectErrors: false },
        { error: new SystemError('SYSTEM_ERROR', '系統錯誤'), expectErrors: false },
        { error: new ValidationError(ERROR_CODES.VALIDATION_ERROR, '驗證錯誤'), expectErrors: false },
        { 
          error: new ValidationError(ERROR_CODES.VALIDATION_ERROR, '驗證錯誤', { field: ['錯誤'] }), 
          expectErrors: true 
        }
      ]

      testCases.forEach((testCase, index) => {
        // Reset mocks
        jsonMock.mockClear()
        statusMock.mockClear()
        
        // Act
        errorHandler(testCase.error, mockReq as Request, mockRes as Response, mockNext)
        
        // Assert basic structure
        const callArgs = jsonMock.mock.calls[0][0]
        expect(callArgs.status).toBe('error')
        expect(callArgs.code).toBeDefined()
        expect(callArgs.message).toBeDefined()
        
        // Verify no redundant error object
        expect(callArgs.error).toBeUndefined()
        
        // Verify errors field presence
        if (testCase.expectErrors) {
          expect(callArgs.errors).toBeDefined()
        } else {
          expect(callArgs.errors).toBeUndefined()
        }
      })
    })

    it('回應物件應該只包含預期的欄位', () => {
      // Arrange
      const error = new BusinessError('TEST_ERROR', '測試錯誤')

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

      // Assert - 檢查物件只包含預期欄位
      const callArgs = jsonMock.mock.calls[0][0]
      const expectedFields = ['status', 'code', 'message']
      const actualFields = Object.keys(callArgs)
      
      expect(actualFields.sort()).toEqual(expectedFields.sort())
    })
  })
})