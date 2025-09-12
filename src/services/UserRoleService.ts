import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { UserRole } from '@entities/UserRole'
import { UserRole as UserRoleEnum } from '@entities/enums'
import { Errors } from '@utils/errors'

export class UserRoleService {
  private userRepository = dataSource.getRepository(User)
  private userRoleRepository = dataSource.getRepository(UserRole)

  /**
   * 取得使用者的啟用角色
   */
  async getUserRoles(userId: number): Promise<UserRoleEnum[]> {
    const userRoles = await this.userRoleRepository.find({
      where: {
        user_id: userId,
        is_active: true
      },
      select: ['role']
    })

    return userRoles.map(ur => ur.role)
  }

  /**
   * 檢查使用者是否擁有特定角色
   */
  async hasRole(userId: number, role: UserRoleEnum): Promise<boolean> {
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user_id: userId,
        role: role,
        is_active: true
      }
    })

    return !!userRole
  }

  /**
   * 檢查使用者是否擁有任一角色
   */
  async hasAnyRole(userId: number, roles: UserRoleEnum[]): Promise<boolean> {
    const userRoles = await this.userRoleRepository.find({
      where: {
        user_id: userId,
        is_active: true
      },
      select: ['role']
    })

    const userRoleNames = userRoles.map(ur => ur.role)
    return roles.some(role => userRoleNames.includes(role))
  }

  /**
   * 為使用者新增角色
   */
  async addRole(userId: number, role: UserRoleEnum, grantedBy?: number): Promise<void> {
    // 檢查使用者是否存在
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw Errors.userNotFound('使用者不存在')
    }

    // 檢查是否已經有此角色
    const existingRole = await this.userRoleRepository.findOne({
      where: {
        user_id: userId,
        role: role,
        is_active: true
      }
    })

    if (existingRole) {
      return // 已經有此角色，不需要重複新增
    }

    // 新增角色
    const userRole = this.userRoleRepository.create({
      user_id: userId,
      role: role,
      is_active: true,
      granted_by: grantedBy
    })

    await this.userRoleRepository.save(userRole)
  }

  /**
   * 移除使用者角色（軟刪除）
   */
  async removeRole(userId: number, role: UserRoleEnum): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user_id: userId,
        role: role,
        is_active: true
      }
    })

    if (userRole) {
      userRole.is_active = false
      userRole.revoked_at = new Date()
      await this.userRoleRepository.save(userRole)
    }
  }

  /**
   * 取得使用者的主要角色（向下相容）
   */
  async getPrimaryRole(userId: number): Promise<UserRoleEnum> {
    const roles = await this.getUserRoles(userId)
    
    // 按照優先級排序：super_admin > admin > teacher > teacher_applicant > student
    const roleOrder = [
      UserRoleEnum.SUPER_ADMIN,
      UserRoleEnum.ADMIN,
      UserRoleEnum.TEACHER,
      UserRoleEnum.TEACHER_APPLICANT,
      UserRoleEnum.STUDENT
    ]

    for (const role of roleOrder) {
      if (roles.includes(role)) {
        return role
      }
    }

    // 如果沒有任何角色，預設為學生
    return UserRoleEnum.STUDENT
  }

  /**
   * 角色升級：移除舊角色，指派新角色
   * @param userId 使用者 ID
   * @param fromRole 原角色
   * @param toRole 新角色
   * @param grantedBy 指派者 ID（可選）
   */
  async upgradeRole(userId: number, fromRole: UserRoleEnum, toRole: UserRoleEnum, grantedBy?: number): Promise<void> {
    // 檢查是否具有原角色
    const hasOldRole = await this.hasRole(userId, fromRole)
    if (!hasOldRole) {
      throw Errors.unauthorizedAccess(`使用者不具有 ${fromRole} 角色`)
    }

    // 移除舊角色
    await this.removeRole(userId, fromRole)

    // 指派新角色
    await this.addRole(userId, toRole, grantedBy)
  }

  /**
   * 檢查使用者是否為教師（包含申請者）
   * @param userId 使用者 ID
   * @returns 是否為教師或申請者
   */
  async isTeacherOrApplicant(userId: number): Promise<boolean> {
    return await this.hasAnyRole(userId, [UserRoleEnum.TEACHER, UserRoleEnum.TEACHER_APPLICANT])
  }

  /**
   * 為新使用者初始化預設角色
   */
  async initializeDefaultRole(userId: number): Promise<void> {
    await this.addRole(userId, UserRoleEnum.STUDENT)
  }
}

export const userRoleService = new UserRoleService()