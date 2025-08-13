import { Request, Response } from 'express'
import { dataSource } from '../../db/data-source'
import { Teacher } from '../../entities/Teacher'
import { User } from '../../entities/User'
import { ResponseHelper } from '../../utils/responseHelper'
import { ValidationError } from '../../middleware/errorHandler'
import { TeacherProfileService } from '../../services/TeacherProfileService'

export class TeacherProfileController {
  /**
   * 查看教師基本資料
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res, '請先登入')
        return
      }

      const teacherRepository = dataSource.getRepository(Teacher)
      const userRepository = dataSource.getRepository(User)

      const teacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!teacher) {
        // 測試預期訊息：找不到教師資料
        ResponseHelper.error(res, '找不到教師資料', undefined, 404)
        return
      }

      const user = await userRepository.findOne({
        where: { id: userId }
      })

      if (!user) {
        ResponseHelper.notFound(res, '使用者資料')
        return
      }

      const profileData = {
        id: teacher.id,
        user_id: teacher.user_id,
        nationality: teacher.nationality,
        introduction: teacher.introduction,
        application_status: teacher.application_status,
        user: {
          id: user.id,
          nick_name: user.nick_name,
          email: user.email,
          contact_phone: user.contact_phone,
          avatar_image: user.avatar_image,
          avatar_google_url: user.avatar_google_url
        },
        created_at: teacher.created_at.toISOString(),
        updated_at: teacher.updated_at.toISOString()
      }

      // 測試預期訊息：取得教師資料成功
      ResponseHelper.success(res, '取得教師資料成功', { teacher: profileData })
    } catch (error) {
      console.error('Get profile error:', error)
      ResponseHelper.serverError(res)
    }
  }

  /**
   * 更新教師基本資料
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res, '請先登入')
        return
      }

      // 支援兩種格式：測試使用的簡單格式 { nationality, introduction } 和完整格式 { teacher_data, user_data }
      const { nationality, introduction, teacher_data, user_data } = req.body

      // 驗證參數
      const errors: Record<string, string[]> = {}

      // 處理簡單格式的參數（測試使用）
      if (nationality !== undefined) {
        if (typeof nationality !== 'string') {
          errors.nationality = ['國籍必須是文字']
        } else if (nationality.length > 50) {
          errors.nationality = ['國籍不得超過50字']
        }
      }

      if (introduction !== undefined) {
        if (typeof introduction !== 'string') {
          errors.introduction = ['個人介紹必須是文字']
        } else if (introduction.length < 100) {
          errors.introduction = ['個人介紹不得少於100字']
        } else if (introduction.length > 1000) {
          errors.introduction = ['個人介紹不得超過1000字']
        }
      }

      // 處理完整格式的參數
      if (teacher_data) {
        if (teacher_data.nationality && typeof teacher_data.nationality !== 'string') {
          errors.nationality = ['國籍必須是文字']
        }
        if (teacher_data.nationality && teacher_data.nationality.length > 50) {
          errors.nationality = ['國籍不得超過50字']
        }
        if (teacher_data.introduction && typeof teacher_data.introduction !== 'string') {
          errors.introduction = ['個人介紹必須是文字']
        }
        if (teacher_data.introduction && teacher_data.introduction.length < 100) {
          errors.introduction = ['個人介紹不得少於100字']
        }
        if (teacher_data.introduction && teacher_data.introduction.length > 1000) {
          errors.introduction = ['個人介紹不得超過1000字']
        }
      }

      if (user_data) {
        if (user_data.nick_name && typeof user_data.nick_name !== 'string') {
          errors.nick_name = ['暱稱必須是文字']
        }
        if (user_data.nick_name && user_data.nick_name.length > 50) {
          errors.nick_name = ['暱稱不得超過50字']
        }
        if (user_data.contact_phone && typeof user_data.contact_phone !== 'string') {
          errors.contact_phone = ['電話號碼必須是文字']
        }
        if (user_data.contact_phone && user_data.contact_phone.length > 20) {
          errors.contact_phone = ['電話號碼不得超過20字']
        }
      }

      if (Object.keys(errors).length > 0) {
        throw new ValidationError(errors)
      }

      // 開始更新
      const teacherRepository = dataSource.getRepository(Teacher)
      const userRepository = dataSource.getRepository(User)

      const teacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!teacher) {
        // 測試預期訊息：找不到教師資料
        ResponseHelper.error(res, '找不到教師資料', undefined, 404)
        return
      }

      const user = await userRepository.findOne({
        where: { id: userId }
      })

      if (!user) {
        ResponseHelper.notFound(res, '使用者資料')
        return
      }

      // 更新教師資料（支援兩種格式）
      let teacherUpdated = false
      if (teacher_data) {
        if (teacher_data.nationality !== undefined) {
          teacher.nationality = teacher_data.nationality
          teacherUpdated = true
        }
        if (teacher_data.introduction !== undefined) {
          teacher.introduction = teacher_data.introduction
          teacherUpdated = true
        }
      }

      // 處理簡單格式（測試使用）
      if (nationality !== undefined) {
        teacher.nationality = nationality
        teacherUpdated = true
      }
      if (introduction !== undefined) {
        teacher.introduction = introduction
        teacherUpdated = true
      }

      if (teacherUpdated) {
        teacher.updated_at = new Date()
        await teacherRepository.save(teacher)
      }

      // 更新使用者資料
      if (user_data) {
        if (user_data.nick_name !== undefined) {
          user.nick_name = user_data.nick_name
        }
        if (user_data.contact_phone !== undefined) {
          user.contact_phone = user_data.contact_phone
        }
        user.updated_at = new Date()
        await userRepository.save(user)
      }

      // 重新查詢更新後的資料
      const updatedTeacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      const updatedUser = await userRepository.findOne({
        where: { id: userId }
      })

      const profileData = {
        id: updatedTeacher!.id,
        user_id: updatedTeacher!.user_id,
        nationality: updatedTeacher!.nationality,
        introduction: updatedTeacher!.introduction,
        application_status: updatedTeacher!.application_status,
        user: {
          id: updatedUser!.id,
          nick_name: updatedUser!.nick_name,
          email: updatedUser!.email,
          contact_phone: updatedUser!.contact_phone,
          avatar_image: updatedUser!.avatar_image,
          avatar_google_url: updatedUser!.avatar_google_url
        },
        created_at: updatedTeacher!.created_at.toISOString(),
        updated_at: updatedTeacher!.updated_at.toISOString()
      }

      // 測試預期訊息：教師資料更新成功
      ResponseHelper.success(res, '教師資料更新成功', { teacher: profileData })
    } catch (error) {
      if (error instanceof ValidationError) {
        ResponseHelper.validationError(res, error.errors)
      } else {
        console.error('Update profile error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }
}
