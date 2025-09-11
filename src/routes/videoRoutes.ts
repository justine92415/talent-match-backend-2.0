import { Router } from 'express'
import { videoController } from '@controllers/VideoController'
import { authMiddlewareChains } from '@middleware/auth'
import { validateRequest } from '@middleware/schemas'
import { 
  uploadVideoSchema,
  updateVideoSchema,
  videoListQuerySchema
} from '@middleware/schemas/course'

const router = Router()


router.post('/', ...authMiddlewareChains.teacherAuth, validateRequest(uploadVideoSchema), videoController.uploadVideo)


router.get('/', ...authMiddlewareChains.teacherAuth, validateRequest(videoListQuerySchema), videoController.getVideoList)


router.get('/:id', ...authMiddlewareChains.teacherAuth, videoController.getVideoDetail)


router.put('/:id', ...authMiddlewareChains.teacherAuth, validateRequest(updateVideoSchema), videoController.updateVideo)


router.delete('/:id', ...authMiddlewareChains.teacherAuth, videoController.deleteVideo)

export default router