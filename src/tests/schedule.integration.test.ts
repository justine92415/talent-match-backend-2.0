import request from 'supertest'
import app from './../app'
import { initTestDatabase, closeTestDatabase, clearDatabase } from '@tests/helpers/database'
import { UserTestHelpers, TeacherTestHelpers } from '@tests/helpers/testHelpers'
import { validUserData } from '@tests/fixtures/userFixtures'
import teacherFixtures from '@tests/fixtures/teacherFixtures'
import scheduleFixtures from '@tests/fixtures/scheduleFixtures'
import { dataSource } from '@db/data-source'
import { TeacherAvailableSlot } from '@entities/TeacherAvailableSlot'
import { Reservation } from '@entities/Reservation'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { ApplicationStatus, UserRole, ReservationStatus } from '@entities/enums'
import { MESSAGES, SUCCESS } from '@constants/Message'
import type { AvailableSlotData } from '@models/index'

describe('教師時間管理 API', () => {
  let teacherRepository: ReturnType<typeof dataSource.getRepository<Teacher>>
  let userRepository: ReturnType<typeof dataSource.getRepository<User>>
  let teacherAvailableSlotRepo: ReturnType<typeof dataSource.getRepository<TeacherAvailableSlot>>
  let reservationRepo: ReturnType<typeof dataSource.getRepository<Reservation>>
  let teacherToken: string
  let teacherId: number
  let nonTeacherToken: string

  beforeAll(async () => {
    await initTestDatabase()
    teacherRepository = dataSource.getRepository(Teacher)
    userRepository = dataSource.getRepository(User)
    teacherAvailableSlotRepo = dataSource.getRepository(TeacherAvailableSlot)
    reservationRepo = dataSource.getRepository(Reservation)
  })

  afterAll(async () => {
    await closeTestDatabase()
  })

  beforeEach(async () => {
    // 清理測試資料
    await clearDatabase()

    // 建立測試教師
    const teacherUser = await UserTestHelpers.createTeacherUserEntity()
    const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id, {
      application_status: ApplicationStatus.APPROVED
    })
    teacherId = teacher.id
    teacherToken = UserTestHelpers.generateAuthToken({
      id: teacherUser.id,
      roles: teacherUser.roles,
      uuid: teacherUser.uuid
    })

    // 建立非教師使用者
    const nonTeacherUser = await UserTestHelpers.createUserEntityWithRole({
      ...validUserData,
      email: 'student@example.com'
    }, UserRole.STUDENT)
    nonTeacherToken = UserTestHelpers.generateAuthToken({
      id: nonTeacherUser.id,
      roles: nonTeacherUser.roles,
      uuid: nonTeacherUser.uuid
    })
  })

  // Helper函式：建立測試預約
  const createTestReservation = async (reservationData: {
    teacher_id: number
    reserve_time: Date
    teacher_status?: ReservationStatus
    student_status?: ReservationStatus
  }) => {
    const studentUser = await UserTestHelpers.createUserEntity({
      email: 'reservation-student@example.com'
    })
    
    // 產生有效的 UUID v4 格式
    const { randomUUID } = await import('crypto')
    const reservation = reservationRepo.create({
      uuid: randomUUID(),
      course_id: 1,
      teacher_id: reservationData.teacher_id,
      student_id: studentUser.id,
      reserve_time: reservationData.reserve_time,
      teacher_status: reservationData.teacher_status || ReservationStatus.RESERVED,
      student_status: reservationData.student_status || ReservationStatus.RESERVED
    })
    
    return await reservationRepo.save(reservation)
  }

  describe('GET /api/teachers/schedule', () => {
    describe('成功情境', () => {
      it('應該回傳空的時段列表當教師沒有設定時段', async () => {
        const response = await request(app)
          .get('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject(scheduleFixtures.expectedApiResponses.getScheduleEmpty)
        expect(response.body.data.available_slots).toHaveLength(0)
        expect(response.body.data.total_slots).toBe(0)
      })

      it('應該回傳教師的可預約時段列表', async () => {
        // 建立測試時段
        const slot = teacherAvailableSlotRepo.create({
          teacher_id: teacherId,
          ...scheduleFixtures.validSlotData
        })
        await teacherAvailableSlotRepo.save(slot)

        const response = await request(app)
          .get('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)

        expect(response.status).toBe(200)
        expect(response.body.status).toBe('success')
        expect(response.body.message).toBe(SUCCESS.SCHEDULE_SETTINGS_GET_SUCCESS)
        expect(response.body.data.available_slots).toHaveLength(1)
        expect(response.body.data.total_slots).toBe(1)
        
        const returnedSlot = response.body.data.available_slots[0]
        expect(returnedSlot).toMatchObject({
          teacher_id: teacherId,
          weekday: scheduleFixtures.validSlotData.weekday,
          start_time: scheduleFixtures.validSlotData.start_time,
          end_time: scheduleFixtures.validSlotData.end_time,
          is_active: scheduleFixtures.validSlotData.is_active
        })
        expect(returnedSlot.id).toBeDefined()
        expect(returnedSlot.created_at).toBeDefined()
        expect(returnedSlot.updated_at).toBeDefined()
      })

      it('應該回傳多個時段並按weekday和start_time排序', async () => {
        // 建立多個測試時段（順序打亂）
        const slotsData = [
          { teacher_id: teacherId, weekday: 2, start_time: '14:00', end_time: '15:00', is_active: true },
          { teacher_id: teacherId, weekday: 1, start_time: '10:00', end_time: '11:00', is_active: true },
          { teacher_id: teacherId, weekday: 1, start_time: '09:00', end_time: '10:00', is_active: true }
        ]

        for (const slotData of slotsData) {
          const slot = teacherAvailableSlotRepo.create(slotData)
          await teacherAvailableSlotRepo.save(slot)
        }

        const response = await request(app)
          .get('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data.available_slots).toHaveLength(3)
        expect(response.body.data.total_slots).toBe(3)

        // 檢查排序正確性
        const slots = response.body.data.available_slots
        expect(slots[0].weekday).toBe(1)
        expect(slots[0].start_time).toBe('09:00')
        expect(slots[1].weekday).toBe(1)
        expect(slots[1].start_time).toBe('10:00')
        expect(slots[2].weekday).toBe(2)
        expect(slots[2].start_time).toBe('14:00')
      })

      it('應該只回傳該教師的時段，不包含其他教師', async () => {
        // 建立另一位教師和時段
        const otherTeacherUser = await UserTestHelpers.createTeacherUserEntity({
          email: 'other-teacher@example.com'
        })
        const otherTeacher = await TeacherTestHelpers.createTeacherApplication(otherTeacherUser.id, {
          application_status: ApplicationStatus.APPROVED
        })

        // 建立當前教師的時段
        const currentTeacherSlot = teacherAvailableSlotRepo.create({
          teacher_id: teacherId,
          ...scheduleFixtures.validSlotData
        })
        await teacherAvailableSlotRepo.save(currentTeacherSlot)

        // 建立其他教師的時段
        const otherTeacherSlot = teacherAvailableSlotRepo.create({
          teacher_id: otherTeacher.id,
          weekday: 2,
          start_time: '14:00',
          end_time: '15:00',
          is_active: true
        })
        await teacherAvailableSlotRepo.save(otherTeacherSlot)

        const response = await request(app)
          .get('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data.available_slots).toHaveLength(1)
        expect(response.body.data.available_slots[0].teacher_id).toBe(teacherId)
      })
    })

    describe('權限驗證', () => {
      it('應該回傳401當沒有提供認證token', async () => {
        const response = await request(app)
          .get('/api/teachers/schedule')

        expect(response.status).toBe(401)
        expect(response.body).toMatchObject(scheduleFixtures.expectedErrorResponses.unauthorized)
      })

      it('應該回傳404當使用者不是教師', async () => {
        const response = await request(app)
          .get('/api/teachers/schedule')
          .set('Authorization', `Bearer ${nonTeacherToken}`)

        expect(response.status).toBe(404)
        expect(response.body).toMatchObject(scheduleFixtures.expectedErrorResponses.forbidden)
      })

      it('應該回傳401當token無效', async () => {
        const response = await request(app)
          .get('/api/teachers/schedule')
          .set('Authorization', 'Bearer invalid-token')

        expect(response.status).toBe(401)
        expect(response.body).toMatchObject(scheduleFixtures.expectedErrorResponses.invalidToken)
      })
    })
  })

  describe('PUT /api/teachers/schedule', () => {
    describe('成功情境', () => {
      it('應該成功建立新的時段設定', async () => {
        const requestData = scheduleFixtures.validUpdateScheduleRequest

        const response = await request(app)
          .put('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(requestData)

        expect(response.status).toBe(200)
        expect(response.body.status).toBe('success')
        expect(response.body.message).toBe(SUCCESS.SCHEDULE_SETTINGS_UPDATE_SUCCESS)
        expect(response.body.data.available_slots).toHaveLength(4)
        expect(response.body.data.created_count).toBe(4)
        expect(response.body.data.updated_count).toBe(0)
        expect(response.body.data.deleted_count).toBe(0)

        // 驗證資料庫中的資料
        const dbSlots = await teacherAvailableSlotRepo.find({
          where: { teacher_id: teacherId }
        })
        expect(dbSlots).toHaveLength(4)
      })

      it('應該成功替換現有的時段設定', async () => {
        // 先建立一些現有時段
        const existingSlots = [
          { teacher_id: teacherId, weekday: 0, start_time: '08:00', end_time: '09:00', is_active: true },
          { teacher_id: teacherId, weekday: 6, start_time: '20:00', end_time: '21:00', is_active: true }
        ]

        for (const slotData of existingSlots) {
          const slot = teacherAvailableSlotRepo.create(slotData)
          await teacherAvailableSlotRepo.save(slot)
        }

        // 更新為新的時段配置
        const requestData = scheduleFixtures.validUpdateScheduleRequest

        const response = await request(app)
          .put('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(requestData)

        expect(response.status).toBe(200)
        expect(response.body.data.available_slots).toHaveLength(4)
        expect(response.body.data.created_count).toBe(4)
        expect(response.body.data.deleted_count).toBe(2) // 舊的兩個被刪除

        // 驗證資料庫中只有新的時段
        const dbSlots = await teacherAvailableSlotRepo.find({
          where: { teacher_id: teacherId }
        })
        expect(dbSlots).toHaveLength(4)

        // 檢查舊時段已被刪除
        const oldSlot = await teacherAvailableSlotRepo.findOne({
          where: { teacher_id: teacherId, weekday: 0, start_time: '08:00' }
        })
        expect(oldSlot).toBeNull()
      })

      it('應該成功清空所有時段設定', async () => {
        // 先建立一些現有時段
        const slot = teacherAvailableSlotRepo.create({
          teacher_id: teacherId,
          ...scheduleFixtures.validSlotData
        })
        await teacherAvailableSlotRepo.save(slot)

        // 發送空陣列來清空所有時段
        const requestData = { available_slots: [] }

        const response = await request(app)
          .put('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(requestData)

        expect(response.status).toBe(200)
        expect(response.body.data.available_slots).toHaveLength(0)
        expect(response.body.data.created_count).toBe(0)
        expect(response.body.data.deleted_count).toBe(1)

        // 驗證資料庫中沒有時段
        const dbSlots = await teacherAvailableSlotRepo.find({
          where: { teacher_id: teacherId }
        })
        expect(dbSlots).toHaveLength(0)
      })
    })

    describe('驗證錯誤', () => {
      it('應該回傳400當請求資料格式錯誤', async () => {
        const invalidData = { invalid: 'data' }

        const response = await request(app)
          .put('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(invalidData)

        expect(response.status).toBe(400)
        expect(response.body).toMatchObject(scheduleFixtures.expectedErrorResponses.validationError)
      })

      it('應該回傳400當時段資料缺少必填欄位', async () => {
        const invalidData = {
          available_slots: [scheduleFixtures.invalidSlotData.missingWeekday]
        }

        const response = await request(app)
          .put('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(invalidData)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body.errors).toBeDefined()
      })

      it('應該回傳400當時間格式錯誤', async () => {
        const invalidData = {
          available_slots: [scheduleFixtures.invalidFormatSlotData.invalidTimeFormat]
        }

        const response = await request(app)
          .put('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(invalidData)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body.errors).toBeDefined()
      })

      it('應該回傳400當結束時間早於開始時間', async () => {
        const invalidData = {
          available_slots: [scheduleFixtures.invalidFormatSlotData.endTimeBeforeStart]
        }

        const response = await request(app)
          .put('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(invalidData)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body.errors).toBeDefined()
      })

      it('應該回傳400當星期數超出範圍', async () => {
        const invalidData = {
          available_slots: [scheduleFixtures.invalidFormatSlotData.invalidWeekday]
        }

        const response = await request(app)
          .put('/api/teachers/schedule')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(invalidData)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body.errors).toBeDefined()
      })
    })

    describe('權限驗證', () => {
      it('應該回傳401當沒有提供認證token', async () => {
        const response = await request(app)
          .put('/api/teachers/schedule')
          .send(scheduleFixtures.validUpdateScheduleRequest)

        expect(response.status).toBe(401)
        expect(response.body).toMatchObject(scheduleFixtures.expectedErrorResponses.unauthorized)
      })

      it('應該回傳404當使用者不是教師', async () => {
        const response = await request(app)
          .put('/api/teachers/schedule')
          .set('Authorization', `Bearer ${nonTeacherToken}`)
          .send(scheduleFixtures.validUpdateScheduleRequest)

        expect(response.status).toBe(404)
        expect(response.body).toMatchObject(scheduleFixtures.expectedErrorResponses.forbidden)
      })
    })
  })

  describe('GET /api/teachers/schedule/conflicts', () => {
    describe('成功情境', () => {
      it('應該回傳沒有衝突當教師沒有預約', async () => {
        // 建立時段但沒有預約
        const slot = teacherAvailableSlotRepo.create({
          teacher_id: teacherId,
          ...scheduleFixtures.validSlotData
        })
        await teacherAvailableSlotRepo.save(slot)

        const response = await request(app)
          .get('/api/teachers/schedule/conflicts')
          .set('Authorization', `Bearer ${teacherToken}`)

        expect(response.status).toBe(200)
        expect(response.body.status).toBe('success')
        expect(response.body.message).toBe(SUCCESS.SCHEDULE_CONFLICT_CHECK_SUCCESS)
        expect(response.body.data.has_conflicts).toBe(false)
        expect(response.body.data.conflicts).toHaveLength(0)
        expect(response.body.data.total_conflicts).toBe(0)
        expect(response.body.data.check_period).toBeDefined()
      })

      it('應該接受查詢參數來篩選檢查範圍', async () => {
        const queryParams = '?from_date=2025-09-01&to_date=2025-09-30'

        const response = await request(app)
          .get(`/api/teachers/schedule/conflicts${queryParams}`)
          .set('Authorization', `Bearer ${teacherToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data.check_period.from_date).toBe('2025-09-01')
        expect(response.body.data.check_period.to_date).toBe('2025-09-30')
      })

      it('應該接受slot_ids參數來檢查特定時段', async () => {
        // 建立多個時段
        const slot1 = teacherAvailableSlotRepo.create({
          teacher_id: teacherId,
          weekday: 1,
          start_time: '09:00',
          end_time: '10:00',
          is_active: true
        })
        const slot2 = teacherAvailableSlotRepo.create({
          teacher_id: teacherId,
          weekday: 2,
          start_time: '14:00',
          end_time: '15:00',
          is_active: true
        })
        await teacherAvailableSlotRepo.save([slot1, slot2])

        const queryParams = `?slot_ids=${slot1.id}`

        const response = await request(app)
          .get(`/api/teachers/schedule/conflicts${queryParams}`)
          .set('Authorization', `Bearer ${teacherToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data.has_conflicts).toBe(false)
      })

      it('應該檢測到預約衝突', async () => {
        console.log('🔍 DEBUG: 開始衝突檢測測試')
        console.log('  - 測試環境時區:', Intl.DateTimeFormat().resolvedOptions().timeZone)
        console.log('  - 當前時間:', new Date().toISOString())
        console.log('  - 當前本地時間:', new Date().toString())
        console.log('  - UTC 偏移量:', new Date().getTimezoneOffset(), '分鐘')
        console.log('  - 環境變數 TZ:', process.env.TZ || 'undefined')
        
        // 建立時段
        const slot = teacherAvailableSlotRepo.create({
          teacher_id: teacherId,
          weekday: 1, // 週一
          start_time: '09:00:00', // 使用完整格式
          end_time: '10:00:00',   // 使用完整格式
          is_active: true
        })
        const savedSlot = await teacherAvailableSlotRepo.save(slot)
        
        console.log('  - 建立的時段:', {
          id: savedSlot.id,
          weekday: savedSlot.weekday,
          start_time: savedSlot.start_time,
          end_time: savedSlot.end_time,
          teacher_id: savedSlot.teacher_id
        })

        // 建立衝突的預約
        // 2025-08-18 是星期一，時段是 09:00-10:00
        // 為了確保在任何時區環境都能正確檢測衝突，我們需要建立一個真正在 09:00-10:00 範圍內的預約
        // CI 環境按 UTC 時區處理，所以我們直接使用 UTC 時間 09:30
        const reservationTime = new Date('2025-08-18T09:30:00.000Z')  // UTC 09:30，在 09:00-10:00 範圍內
        
        console.log('🔍 DEBUG: 衝突測試詳細資訊')
        console.log('  - 教師時段: 週一 09:00-10:00')
        console.log('  - 預約時間 (UTC):', reservationTime.toISOString())
        console.log('  - 預約時間 (本地):', reservationTime.toString())
        console.log('  - 預約時間戳:', reservationTime.getTime())
        console.log('  - 預約日期資訊:')
        console.log('    * getUTCDay():', reservationTime.getUTCDay(), '(0=週日, 1=週一, 2=週二...)')
        console.log('    * getDay():', reservationTime.getDay(), '(本地時區)')
        console.log('    * getUTCHours():', reservationTime.getUTCHours())
        console.log('    * getHours():', reservationTime.getHours(), '(本地時區)')
        console.log('    * getUTCMinutes():', reservationTime.getUTCMinutes())
        console.log('    * getMinutes():', reservationTime.getMinutes(), '(本地時區)')
        console.log('  - 時區偏移:', reservationTime.getTimezoneOffset(), '分鐘')
        console.log('  - 預期結果: 應該與時段 09:00-10:00 產生衝突')
        
        const conflictReservation = await createTestReservation({
          teacher_id: teacherId,
          reserve_time: reservationTime,
          teacher_status: ReservationStatus.RESERVED,
          student_status: ReservationStatus.RESERVED
        })
        
        console.log('  - 建立的預約 ID:', conflictReservation.id)
        console.log('  - 預約記錄中的時間 (UTC):', conflictReservation.reserve_time.toISOString())
        console.log('  - 預約記錄中的時間 (本地):', conflictReservation.reserve_time.toString())
        console.log('  - 預約記錄時間資訊:')
        console.log('    * reserve_time.getUTCDay():', conflictReservation.reserve_time.getUTCDay())
        console.log('    * reserve_time.getUTCHours():', conflictReservation.reserve_time.getUTCHours())
        console.log('    * reserve_time.getUTCMinutes():', conflictReservation.reserve_time.getUTCMinutes())

        const response = await request(app)
          .get('/api/teachers/schedule/conflicts')
          .set('Authorization', `Bearer ${teacherToken}`)
          .query({
            from_date: '2025-08-18',
            to_date: '2025-08-25'
          })

        console.log('🔍 DEBUG: API 回應分析')
        console.log('  - HTTP 狀態:', response.status)
        console.log('  - 查詢參數:', { from_date: '2025-08-18', to_date: '2025-08-25' })
        console.log('  - API 回應:', JSON.stringify(response.body, null, 2))
        
        if (response.body.data) {
          console.log('  - has_conflicts:', response.body.data.has_conflicts)
          console.log('  - total_conflicts:', response.body.data.total_conflicts)
          console.log('  - conflicts 數量:', response.body.data.conflicts?.length || 0)
          
          if (response.body.data.conflicts && response.body.data.conflicts.length > 0) {
            response.body.data.conflicts.forEach((conflict: any, index: number) => {
              console.log(`  - 衝突 ${index + 1}:`, {
                slot_id: conflict.slot_id,
                reservation_id: conflict.reservation_id,
                reserve_time: conflict.reserve_time,
                student_id: conflict.student_id,
                reason: conflict.reason
              })
            })
          } else {
            console.log('  ❌ 沒有檢測到衝突！這表示時區處理可能還有問題')
            console.log('  📊 詳細分析:')
            console.log('    * 預約時間 UTC 週幾:', reservationTime.getUTCDay())
            console.log('    * 時段設定週幾:', savedSlot.weekday)
            console.log('    * 預約 UTC 小時:', reservationTime.getUTCHours())
            console.log('    * 時段開始時間:', savedSlot.start_time)
            console.log('    * 時段結束時間:', savedSlot.end_time)
          }
        }

        expect(response.status).toBe(200)
        expect(response.body.status).toBe('success')
        expect(response.body.data.has_conflicts).toBe(true)
        expect(response.body.data.total_conflicts).toBe(1)
        expect(response.body.data.conflicts).toHaveLength(1)
        
        const conflict = response.body.data.conflicts[0]
        expect(conflict.slot_id).toBe(savedSlot.id)
        expect(conflict.reservation_id).toBe(conflictReservation.id)
        expect(conflict.reason).toContain('時段衝突')
      })
    })

    describe('權限驗證', () => {
      it('應該回傳401當沒有提供認證token', async () => {
        const response = await request(app)
          .get('/api/teachers/schedule/conflicts')

        expect(response.status).toBe(401)
        expect(response.body).toMatchObject(scheduleFixtures.expectedErrorResponses.unauthorized)
      })

      it('應該回傳404當使用者不是教師', async () => {
        const response = await request(app)
          .get('/api/teachers/schedule/conflicts')
          .set('Authorization', `Bearer ${nonTeacherToken}`)

        expect(response.status).toBe(404)
        expect(response.body).toMatchObject(scheduleFixtures.expectedErrorResponses.forbidden)
      })
    })

    describe('查詢參數驗證', () => {
      it('應該回傳400當日期格式錯誤', async () => {
        const response = await request(app)
          .get('/api/teachers/schedule/conflicts')
          .set('Authorization', `Bearer ${teacherToken}`)
          .query({
            from_date: 'invalid-date',
            to_date: '2025-09-30'
          })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body.errors).toBeDefined()
      })

      it('應該回傳400當結束日期早於開始日期', async () => {
        const response = await request(app)
          .get('/api/teachers/schedule/conflicts')
          .set('Authorization', `Bearer ${teacherToken}`)
          .query({
            from_date: '2025-09-30',
            to_date: '2025-09-01'
          })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body.errors).toBeDefined()
      })

      it('應該回傳400當slot_ids格式錯誤', async () => {
        const response = await request(app)
          .get('/api/teachers/schedule/conflicts')
          .set('Authorization', `Bearer ${teacherToken}`)
          .query({
            slot_ids: 'invalid,ids'
          })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body.errors).toBeDefined()
      })
    })
  })

  describe('邊界測試', () => {
    it('應該處理大量時段更新', async () => {
      const requestData = {
        available_slots: scheduleFixtures.bulkSlotData
      }

      const response = await request(app)
        .put('/api/teachers/schedule')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body.data.available_slots).toHaveLength(scheduleFixtures.bulkSlotData.length)
    })

    it('應該處理邊界時間設定', async () => {
      const requestData = {
        available_slots: [scheduleFixtures.boundaryTimeSlotData.earlyMorning]
      }

      const response = await request(app)
        .put('/api/teachers/schedule')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body.data.available_slots[0].start_time).toBe('06:00')
    })

    it('應該拒絕跨日的時段設定', async () => {
      const requestData = {
        available_slots: [scheduleFixtures.boundaryTimeSlotData.crossMidnight]
      }

      const response = await request(app)
        .put('/api/teachers/schedule')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
    })
  })
})