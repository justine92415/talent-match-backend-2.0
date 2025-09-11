import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { 
  createReservationSchema, 
  reservationListQuerySchema, 
  updateReservationStatusSchema, 
  reservationIdParamSchema, 
  calendarViewQuerySchema 
} from '@middleware/schemas/system/reservationSchemas'
import { reservationController } from '@controllers/ReservationController'

const router = Router()

router.post('/', 
  authenticateToken,
  createSchemasMiddleware({ body: createReservationSchema }),
  reservationController.createReservation
)

router.get('/', 
  authenticateToken,
  createSchemasMiddleware({ query: reservationListQuerySchema }),
  reservationController.getReservationList
)

router.put('/:id/status', 
  authenticateToken,
  createSchemasMiddleware({ params: reservationIdParamSchema, body: updateReservationStatusSchema }),
  reservationController.updateReservationStatus
)

router.delete('/:id', 
  authenticateToken,
  createSchemasMiddleware({ params: reservationIdParamSchema }),
  reservationController.cancelReservation
)

router.get('/calendar', 
  authenticateToken,
  createSchemasMiddleware({ query: calendarViewQuerySchema }),
  reservationController.getCalendarView
)

export default router