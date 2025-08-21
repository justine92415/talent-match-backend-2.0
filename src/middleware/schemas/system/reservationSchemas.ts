import Joi from 'joi'

export const createReservationSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  teacher_id: Joi.number().integer().positive().required(),
  reserve_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  reserve_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/).required()
})

export const reservationListQuerySchema = Joi.object({
  role: Joi.string().valid('student', 'teacher').default('student'),
  status: Joi.string().valid('reserved', 'completed', 'cancelled').optional()
})

export const updateReservationStatusSchema = Joi.object({
  status_type: Joi.string().valid('teacher-complete', 'student-complete').required(),
  notes: Joi.string().max(500).optional()
})

export const reservationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
})

export const calendarViewQuerySchema = Joi.object({
  view: Joi.string().valid('week', 'month').required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  role: Joi.string().valid('student', 'teacher').default('student')
})
