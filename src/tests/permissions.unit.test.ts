import { Request, Response, NextFunction } from 'express'
import { clearDatabase, initTestDatabase, closeTestDatabase } from '@tests/helpers/database'
import { UserRole } from '@entities/enums'
import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '@config/secret'
import { 
  requireRole, 
  requireRoles, 
  requireStudent, 
  requireTeacher, 
  requireAdmin,
  requireAnyRole,
  requireAllRoles,
  requireRoleWithCondition
} from '@middleware/auth/userAuth'
import { BusinessError } from '@utils/errors'

describe('多重角色權限系統單元測試', () => {
  beforeAll(async () => {
    await initTestDatabase()
  })

  afterAll(async () => {
    await closeTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  // 輔助函式：建立模擬的 req, res, next
  const createMockReqResNext = (user?: any) => {
    const req = { user } as Request
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response
    const next = jest.fn() as NextFunction
    return { req, res, next }
  }

  // 輔助函式：產生 JWT token 使用者
  const createUser = (userId: number, role: UserRole, roles: UserRole[]) => ({
    userId,
    role,
    roles,
    email: `user${userId}@test.com`
  })

  describe('JWT Token 多重角色支援測試', () => {
    it('應該正確解析包含多重角色的 JWT token', () => {
      const user = createUser(1, UserRole.STUDENT, [UserRole.STUDENT, UserRole.TEACHER])
      
      expect(user.roles).toContain(UserRole.STUDENT)
      expect(user.roles).toContain(UserRole.TEACHER)
      expect(user.roles).toHaveLength(2)
    })

    it('應該支援僅有 roles 陣列的 token（未來版本）', () => {
      const user = createUser(2, UserRole.TEACHER, [UserRole.TEACHER])
      
      expect(user.roles).toContain(UserRole.TEACHER)
      expect(user.roles).toHaveLength(1)
    })
  })

  describe('requireRoles 中介軟體測試', () => {
    it('應該拒絕沒有所需角色的使用者（any 模式）', () => {
      const user = createUser(1, UserRole.STUDENT, [UserRole.STUDENT])
      const { req, res, next } = createMockReqResNext(user)
      
      const middleware = requireRoles([UserRole.TEACHER], 'any')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
      expect(res.status).not.toHaveBeenCalled()
    })

    it('應該允許擁有所需角色的使用者（any 模式）', () => {
      const user = createUser(2, UserRole.TEACHER, [UserRole.TEACHER])
      const { req, res, next } = createMockReqResNext(user)
      
      const middleware = requireRoles([UserRole.TEACHER], 'any')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('應該允許具有多重角色的使用者存取（any 模式）', () => {
      const user = createUser(3, UserRole.STUDENT, [UserRole.STUDENT, UserRole.TEACHER])
      const { req, res, next } = createMockReqResNext(user)
      
      const middleware = requireRoles([UserRole.TEACHER], 'any')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('應該在 all 模式下要求所有角色', () => {
      const user = createUser(4, UserRole.STUDENT, [UserRole.STUDENT, UserRole.TEACHER])
      const { req, res, next } = createMockReqResNext(user)
      
      const middleware = requireRoles([UserRole.TEACHER, UserRole.ADMIN], 'all')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
      expect(res.status).not.toHaveBeenCalled()
    })

    it('應該在使用者具有所有要求角色時允許存取（all 模式）', () => {
      const user = createUser(5, UserRole.ADMIN, [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN])
      const { req, res, next } = createMockReqResNext(user)
      
      const middleware = requireRoles([UserRole.TEACHER, UserRole.ADMIN], 'all')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(res.status).not.toHaveBeenCalled()
    })
  })

  describe('單一角色檢查向後相容性測試', () => {
    it('requireTeacher 應該允許教師存取', () => {
      const user = createUser(1, UserRole.TEACHER, [UserRole.TEACHER])
      const { req, res, next } = createMockReqResNext(user)
      
      requireTeacher(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('requireTeacher 應該拒絕非教師存取', () => {
      const user = createUser(2, UserRole.STUDENT, [UserRole.STUDENT])
      const { req, res, next } = createMockReqResNext(user)
      
      requireTeacher(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
      expect(res.status).not.toHaveBeenCalled()
    })

    it('requireStudent 應該允許學生存取', () => {
      const user = createUser(3, UserRole.STUDENT, [UserRole.STUDENT])
      const { req, res, next } = createMockReqResNext(user)
      
      requireStudent(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('requireAdmin 應該允許管理員存取', () => {
      const user = createUser(4, UserRole.ADMIN, [UserRole.ADMIN])
      const { req, res, next } = createMockReqResNext(user)
      
      requireAdmin(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(res.status).not.toHaveBeenCalled()
    })
  })

  describe('進階權限組合測試', () => {
    it('requireAnyRole 應該允許具有任一角色的使用者', () => {
      const user = createUser(1, UserRole.STUDENT, [UserRole.STUDENT])
      const { req, res, next } = createMockReqResNext(user)
      
      const middleware = requireAnyRole([UserRole.STUDENT, UserRole.TEACHER])
      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('requireAllRoles 應該要求使用者具有所有角色', () => {
      const user = createUser(2, UserRole.STUDENT, [UserRole.STUDENT, UserRole.TEACHER])
      const { req, res, next } = createMockReqResNext(user)
      
      const middleware = requireAllRoles([UserRole.STUDENT, UserRole.TEACHER])
      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('requireRoleWithCondition 應該支援條件式權限檢查', () => {
      const user = createUser(3, UserRole.TEACHER, [UserRole.TEACHER])
      const { req, res, next } = createMockReqResNext(user)
      
      // 模擬條件：總是返回 true（通過）
      const passingCondition = (user: any) => true
      
      const middleware = requireRoleWithCondition([UserRole.TEACHER], 'any', passingCondition)
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('requireRoleWithCondition 應該在條件不符合時拒絕存取', () => {
      const user = createUser(4, UserRole.TEACHER, [UserRole.TEACHER])
      const { req, res, next } = createMockReqResNext(user)
      
      // 模擬條件：總是返回 false（拒絕）
      const failingCondition = (user: any) => false
      
      const middleware = requireRoleWithCondition([UserRole.TEACHER], 'any', failingCondition)
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
      expect(res.status).not.toHaveBeenCalled()
    })
  })

  describe('錯誤處理和邊界測試', () => {
    it('應該正確處理缺少使用者資訊的請求', () => {
      const { req, res, next } = createMockReqResNext() // 沒有 user
      
      requireTeacher(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
      expect(res.status).not.toHaveBeenCalled()
    })

    it('應該正確處理沒有角色資訊的使用者', () => {
      const user = { userId: 1, email: 'test@test.com' } // 沒有 role 或 roles
      const { req, res, next } = createMockReqResNext(user)
      
      requireTeacher(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
      expect(res.status).not.toHaveBeenCalled()
    })

    it('應該正確處理空的角色陣列', () => {
      const user = createUser(1, UserRole.STUDENT, [])
      const { req, res, next } = createMockReqResNext(user)
      
      const middleware = requireRoles([UserRole.TEACHER], 'any')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
      expect(res.status).not.toHaveBeenCalled()
    })
  })

  describe('複雜權限場景測試', () => {
    it('應該支援管理員存取所有內容', () => {
      const admin = createUser(1, UserRole.ADMIN, [UserRole.ADMIN])
      
      // 測試所有權限檢查
      const testCases = [
        { middleware: requireStudent, name: 'requireStudent' },
        { middleware: requireTeacher, name: 'requireTeacher' },
        { middleware: requireAdmin, name: 'requireAdmin' }
      ]

      testCases.forEach(testCase => {
        const { req, res, next } = createMockReqResNext(admin)
        testCase.middleware(req, res, next)
        
        // 管理員應該能通過所有檢查
        expect(next).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
      })

      // 測試工廠函式建立的中介軟體
      const factoryTestCases = [
        requireRoles([UserRole.TEACHER], 'any'),
        requireAnyRole([UserRole.STUDENT, UserRole.TEACHER])
      ]

      factoryTestCases.forEach(middleware => {
        const { req, res, next } = createMockReqResNext(admin)
        middleware(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
      })
    })

    it('應該支援多重角色使用者的複雜權限檢查', () => {
      const multiRoleUser = createUser(2, UserRole.STUDENT, [UserRole.STUDENT, UserRole.TEACHER])
      
      // 應該通過的檢查
      const passTests = [
        { middleware: requireStudent, name: 'requireStudent' },
        { middleware: requireTeacher, name: 'requireTeacher' }
      ]

      passTests.forEach(test => {
        const { req, res, next } = createMockReqResNext(multiRoleUser)
        test.middleware(req, res, next)
        expect(next).toHaveBeenCalled()
      })

      // 應該通過的工廠函式測試
      const passFactoryTests = [
        requireAnyRole([UserRole.STUDENT, UserRole.ADMIN]),
        requireAllRoles([UserRole.STUDENT, UserRole.TEACHER])
      ]

      passFactoryTests.forEach(middleware => {
        const { req, res, next } = createMockReqResNext(multiRoleUser)
        middleware(req, res, next)
        expect(next).toHaveBeenCalled()
      })

      // 應該失敗的檢查
      const { req: failReq, res: failRes, next: failNext } = createMockReqResNext(multiRoleUser)
      requireAdmin(failReq, failRes, failNext)
      expect(failNext).toHaveBeenCalledWith(expect.any(Error))

      // 應該失敗的工廠函式測試
      const { req: failReq2, res: failRes2, next: failNext2 } = createMockReqResNext(multiRoleUser)
      const failMiddleware = requireAllRoles([UserRole.STUDENT, UserRole.ADMIN])
      failMiddleware(failReq2, failRes2, failNext2)
      expect(failNext2).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})