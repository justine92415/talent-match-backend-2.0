import { Request, Response } from 'express'
import { learningExperienceService } from '@services/learningExperienceService'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { SuccessMessages } from '@constants/Message'
import type { CreateLearningExperienceRequest, UpdateLearningExperienceRequest } from '@models/teacher.interface';

/**
 * 學習經歷相關的控制器類別
 * 負責處理教師學習經歷的 HTTP 請求和回應
 */
export class LearningExperienceController {
  /**
   * 取得教師的學習經歷清單
   * GET /api/teachers/learning-experiences
   */
  getLearningExperiences = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，userId 必定存在

    // 首先需要找到教師記錄的 ID（這部分邏輯應該在服務層處理）
    // 這裡暫時先用 userId，但服務層需要修正為根據 userId 找到 teacherId
    const experiences = await learningExperienceService.getLearningExperiences(userId)
    
    // 符合預期的回應格式：{ data: { learning_experiences: [...] } }
    res.json(handleSuccess({ learning_experiences: experiences }, SuccessMessages.LEARNING_EXPERIENCE_LIST_SUCCESS))
  })

  /**
   * 建立新的學習經歷
   * POST /api/teachers/learning-experiences
   */
  createLearningExperience = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，userId 必定存在
    
    // TODO: 檔案上傳系統完成後，處理 certificate_file 上傳
    // const certificateFile = req.file // multer 中間件處理的檔案
    const learningExperienceData: CreateLearningExperienceRequest = {
      is_in_school: req.body.is_in_school,
      degree: req.body.degree,
      school_name: req.body.school_name,
      department: req.body.department,
      region: req.body.region,
      start_year: req.body.start_year,
      start_month: req.body.start_month,
      end_year: req.body.end_year,
      end_month: req.body.end_month
      // TODO: 檔案上傳系統完成後新增
      // certificate_file: certificateFile
    }

    const newExperience = await learningExperienceService.createLearningExperience(
      userId, 
      learningExperienceData
    )
    
    // 符合預期的回應格式：{ data: { learning_experience: {...} } }
    res.status(201).json(handleCreated({ learning_experience: newExperience }, SuccessMessages.LEARNING_EXPERIENCE_CREATED))
  })

  /**
   * 更新學習經歷
   * PUT /api/teachers/learning-experiences/:id
   */
  updateLearningExperience = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，userId 必定存在
    const experienceId = parseInt(req.params.id, 10)

    // TODO: 檔案上傳系統完成後，處理 certificate_file 上傳
    // const certificateFile = req.file // multer 中間件處理的檔案
    const updateData: UpdateLearningExperienceRequest = {
      is_in_school: req.body.is_in_school,
      degree: req.body.degree,
      school_name: req.body.school_name,
      department: req.body.department,
      region: req.body.region,
      start_year: req.body.start_year,
      start_month: req.body.start_month,
      end_year: req.body.end_year,
      end_month: req.body.end_month
      // TODO: 檔案上傳系統完成後新增
      // certificate_file: certificateFile
    }

    const updatedExperience = await learningExperienceService.updateLearningExperience(
      userId, 
      experienceId, 
      updateData
    )
    
    // 符合預期的回應格式：{ data: { learning_experience: {...} } }
    res.json(handleSuccess({ learning_experience: updatedExperience }, SuccessMessages.LEARNING_EXPERIENCE_UPDATED))
  })

  /**
   * 刪除學習經歷
   * DELETE /api/teachers/learning-experiences/:id
   */
  deleteLearningExperience = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，userId 必定存在
    const experienceId = parseInt(req.params.id, 10)

    await learningExperienceService.deleteLearningExperience(userId, experienceId)
    
    res.json(handleSuccess(null, SuccessMessages.LEARNING_EXPERIENCE_DELETED))
  })
}

// 建立單例實例並匯出
export const learningExperienceController = new LearningExperienceController()