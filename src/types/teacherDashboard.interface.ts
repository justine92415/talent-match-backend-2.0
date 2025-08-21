/**
 * 教師後台管理系統型別定義
 * 包含儀表板、統計分析、學生管理、收入管理等相關介面
 */

// ================== 儀表板相關介面 ==================

/**
 * 儀表板數據概覽
 */
export interface DashboardOverview {
  total_students: number
  total_courses: number
  average_rating: number
  total_reviews: number
  this_month_earnings: number
  pending_settlements: number
}

/**
 * 今日課程安排
 */
export interface TodaySchedule {
  reservation_id: number
  student_name: string
  course_name: string
  start_time: string
  end_time: string
  status: 'reserved' | 'completed' | 'cancelled'
}

/**
 * 近期活動記錄
 */
export interface RecentActivity {
  type: 'new_review' | 'new_reservation' | 'course_purchased' | 'lesson_completed'
  message: string
  timestamp: string
}

/**
 * 快速統計數據
 */
export interface QuickStats {
  today_reservations: number
  week_reservations: number
  month_reservations: number
  pending_confirmations: number
  unread_messages: number
  completion_rate: number
}

/**
 * 表現摘要
 */
export interface PerformanceSummary {
  this_week: WeeklyPerformance
  last_week: WeeklyPerformance
  improvement: PerformanceImprovement
}

/**
 * 週表現數據
 */
export interface WeeklyPerformance {
  completed_lessons: number
  earnings: number
  new_students: number
  average_rating: number
}

/**
 * 表現改善指標
 */
export interface PerformanceImprovement {
  lessons_change: string
  earnings_change: string
  students_change: string
  rating_change: string
}

/**
 * 儀表板完整回應數據
 */
export interface DashboardResponse {
  overview: DashboardOverview
  today_schedule: TodaySchedule[]
  recent_activities: RecentActivity[]
  quick_stats: QuickStats
  performance_summary: PerformanceSummary
}

// ================== 統計數據相關介面 ==================

/**
 * 統計查詢參數
 */
export interface StatsQueryParams {
  period?: 'week' | 'month' | 'quarter' | 'year'
  start_date?: string
  end_date?: string
  group_by?: 'day' | 'week' | 'month'
}

/**
 * 統計期間資訊
 */
export interface PeriodInfo {
  period: string
  start_date: string
  end_date: string
  total_days: number
}

/**
 * 統計摘要
 */
export interface StatsSummary {
  total_lessons: number
  completed_lessons: number
  cancelled_lessons: number
  total_earnings: number
  total_students: number
  new_students: number
  returning_students: number
  average_rating: number
  total_reviews: number
  response_rate: number
  completion_rate: number
}

/**
 * 每日統計明細
 */
export interface DailyBreakdown {
  date: string
  lessons: number
  completed: number
  cancelled: number
  earnings: number
  students: number
  average_rating: number
}

/**
 * 課程表現統計
 */
export interface CoursePerformance {
  course_id: number
  course_name: string
  lessons_count: number
  students_count: number
  average_rating: number
  total_earnings: number
  completion_rate: number
}

/**
 * 學生參與度統計
 */
export interface StudentEngagement {
  most_active_students: ActiveStudent[]
  student_retention: StudentRetention
}

/**
 * 活躍學生資料
 */
export interface ActiveStudent {
  student_id: number
  student_name: string
  total_lessons: number
  last_lesson: string
  average_rating_given: number
}

/**
 * 學生留存率統計
 */
export interface StudentRetention {
  new_students_this_period: number
  returning_students: number
  retention_rate: number
}

/**
 * 教師統計完整回應
 */
export interface TeacherStatsResponse {
  period_info: PeriodInfo
  summary: StatsSummary
  daily_breakdown: DailyBreakdown[]
  course_performance: CoursePerformance[]
  student_engagement: StudentEngagement
}

// ================== 表現分析相關介面 ==================

/**
 * 表現分析查詢參數
 */
export interface PerformanceQueryParams {
  period?: 'month' | 'quarter' | 'year'
  compare_previous?: boolean
}

/**
 * 期間表現數據
 */
export interface PeriodPerformance {
  start_date: string
  end_date: string
  total_lessons: number
  completion_rate: number
  average_rating: number
  student_satisfaction: number
  response_time: number
  earnings: number
}

/**
 * 表現比較改善
 */
export interface PerformanceComparison {
  lessons_growth: string
  completion_improvement: string
  rating_improvement: string
  satisfaction_improvement: string
  response_improvement: string
  earnings_growth: string
}

/**
 * 表現概覽
 */
export interface PerformanceOverview {
  current_period: PeriodPerformance
  previous_period: PeriodPerformance
  improvements: PerformanceComparison
}

/**
 * 評分趨勢
 */
export interface RatingTrend {
  week: string
  average_rating: number
  total_reviews: number
  rating_distribution: RatingDistribution
}

/**
 * 評分分布
 */
export interface RatingDistribution {
  '5_star': number
  '4_star': number
  '3_star': number
  '2_star': number
  '1_star': number
}

/**
 * 優勢和改善領域
 */
export interface StrengthsAndAreas {
  strengths: PerformanceArea[]
  improvement_areas: PerformanceArea[]
}

/**
 * 表現領域
 */
export interface PerformanceArea {
  area: string
  score: number
  feedback_keywords?: string[]
  suggestions?: string[]
}

/**
 * 基準比較
 */
export interface BenchmarkComparison {
  platform_average: PlatformBenchmark
  your_ranking: TeacherRanking
}

/**
 * 平台基準數據
 */
export interface PlatformBenchmark {
  completion_rate: number
  average_rating: number
  response_time: number
}

/**
 * 教師排名
 */
export interface TeacherRanking {
  completion_rate: string
  average_rating: string
  response_time: string
}

/**
 * 教師表現完整回應
 */
export interface TeacherPerformanceResponse {
  performance_overview: PerformanceOverview
  rating_trends: RatingTrend[]
  strengths_and_areas: StrengthsAndAreas
  benchmark_comparison: BenchmarkComparison
}

// ================== 學生管理相關介面 ==================

/**
 * 學生查詢參數
 */
export interface StudentQueryParams {
  page?: number
  per_page?: number
  sort?: 'recent_activity' | 'total_lessons' | 'join_date' | 'name'
  course_id?: number
  status?: 'active' | 'inactive' | 'completed'
  search?: string
}

/**
 * 學生基本資料
 */
export interface StudentBasicInfo {
  student_id: number
  nick_name: string
  avatar_image: string | null
  join_date: string
  last_activity: string
  student_status: 'active' | 'inactive' | 'completed'
  communication_preference: 'chat' | 'email'
}

/**
 * 學生學習統計
 */
export interface StudentLearningStats {
  total_lessons: number
  completed_lessons: number
  remaining_lessons: number
  total_spent: number
  average_rating_given: number
}

/**
 * 學生課程註冊資訊
 */
export interface StudentCourseEnrollment {
  course_id: number
  course_name: string
  lessons_taken: number
  lessons_remaining: number
  progress: string
}

/**
 * 學生下次預約
 */
export interface StudentNextReservation {
  reservation_id: number
  course_name: string
  scheduled_time: string
}

/**
 * 學生列表項目
 */
export interface StudentListItem extends StudentBasicInfo, StudentLearningStats {
  courses_enrolled: StudentCourseEnrollment[]
  next_reservation: StudentNextReservation | null
}

/**
 * 學生列表摘要
 */
export interface StudentListSummary {
  total_students: number
  active_students: number
  inactive_students: number
  completed_students: number
  new_this_month: number
  average_lessons_per_student: number
}

/**
 * 學生列表完整回應
 */
export interface StudentListResponse {
  students: StudentListItem[]
  pagination: TeacherDashboardPaginationInfo
  summary: StudentListSummary
}

// ================== 學生詳情相關介面 ==================

/**
 * 學生個人資料
 */
export interface StudentProfile {
  student_id: number
  nick_name: string
  avatar_image: string | null
  join_date: string
  last_activity: string
  account_status: 'active' | 'inactive'
  communication_preference: 'chat' | 'email'
  timezone: string
}

/**
 * 學習摘要
 */
export interface LearningSummary {
  total_courses: number
  total_lessons: number
  completed_lessons: number
  cancelled_lessons: number
  no_show_lessons: number
  total_spent: number
  learning_streak: number
  completion_rate: number
  average_rating_given: number
  first_lesson_date: string
  latest_lesson_date: string
}

/**
 * 課程進度
 */
export interface CourseProgress {
  course_id: number
  course_name: string
  enrollment_date: string
  lessons_purchased: number
  lessons_taken: number
  lessons_remaining: number
  progress_percentage: number
  last_lesson_date: string
  average_rating: number
  status: 'in_progress' | 'completed' | 'paused'
}

/**
 * 最近互動記錄
 */
export interface RecentInteraction {
  type: 'lesson_completed' | 'message_sent' | 'reservation_made'
  lesson_date?: string
  timestamp?: string
  course_name?: string
  duration?: number
  rating?: number
  comment?: string
  message_preview?: string
  is_read?: boolean
  scheduled_time?: string
}

/**
 * 即將到來的預約
 */
export interface UpcomingReservation {
  reservation_id: number
  course_name: string
  scheduled_time: string
  status: 'confirmed' | 'pending'
  notes: string
}

/**
 * 溝通歷史記錄
 */
export interface CommunicationHistory {
  total_messages: number
  unread_messages: number
  last_message_time: string
  response_rate: number
  average_response_time: string
}

/**
 * 學生詳情完整回應
 */
export interface StudentDetailResponse {
  student: StudentProfile
  learning_summary: LearningSummary
  course_progress: CourseProgress[]
  recent_interactions: RecentInteraction[]
  upcoming_reservations: UpcomingReservation[]
  communication_history: CommunicationHistory
}

// ================== 學生購買記錄相關介面 ==================

/**
 * 購買記錄查詢參數
 */
export interface TeacherStudentPurchaseQueryParams {
  page?: number
  per_page?: number
}

/**
 * 使用歷史記錄
 */
export interface UsageHistory {
  used_date: string
  reservation_id: number
  lesson_status: 'completed' | 'cancelled'
}

/**
 * 購買記錄項目
 */
export interface TeacherStudentPurchaseRecord {
  purchase_id: number
  order_id: number
  course_id: number
  course_name: string
  purchased_date: string
  quantity_total: number
  quantity_used: number
  quantity_remaining: number
  total_amount: number
  unit_price: number
  price_option: string
  status: 'active' | 'expired' | 'used_up'
  expires_at: string | null
  usage_history: UsageHistory[]
}

/**
 * 購買記錄摘要
 */
export interface PurchaseSummary {
  total_purchases: number
  total_amount_spent: number
  total_lessons_purchased: number
  total_lessons_used: number
  total_lessons_remaining: number
  average_price_per_lesson: number
  first_purchase_date: string
  latest_purchase_date: string
}

/**
 * 學生購買記錄完整回應
 */
export interface StudentPurchaseResponse {
  purchases: TeacherStudentPurchaseRecord[]
  pagination: TeacherDashboardPaginationInfo
  summary: PurchaseSummary
}

// ================== 學生預約記錄相關介面 ==================

/**
 * 預約記錄查詢參數
 */
export interface ReservationQueryParams {
  page?: number
  per_page?: number
  status?: 'reserved' | 'completed' | 'cancelled'
  course_id?: number
  date_from?: string
  date_to?: string
}

/**
 * 預約記錄項目
 */
export interface ReservationRecord {
  reservation_id: number
  course_id: number
  course_name: string
  reserve_time: string
  duration: number
  teacher_status: 'reserved' | 'completed' | 'cancelled'
  student_status: 'reserved' | 'completed' | 'cancelled'
  overall_status: 'upcoming' | 'completed' | 'cancelled'
  created_at: string
  completed_at?: string
  notes?: string
  teacher_notes?: string
  student_feedback?: string
  rating?: number
  lesson_number: number
}

/**
 * 預約記錄摘要
 */
export interface ReservationSummary {
  total_reservations: number
  completed_reservations: number
  upcoming_reservations: number
  cancelled_reservations: number
  completion_rate: number
  average_rating: number
  total_teaching_hours: number
  no_show_count: number
}

/**
 * 學生預約記錄完整回應
 */
export interface StudentReservationResponse {
  reservations: ReservationRecord[]
  pagination: TeacherDashboardPaginationInfo
  summary: ReservationSummary
}

// ================== 收入管理相關介面 ==================

/**
 * 收入查詢參數
 */
export interface EarningsQueryParams {
  page?: number
  per_page?: number
  date_from?: string
  date_to?: string
  course_id?: number
  status?: 'pending' | 'settled' | 'paid'
}

/**
 * 收入記錄項目
 */
export interface EarningRecord {
  earning_id: number
  reservation_id: number
  order_id: number
  course_id: number
  course_name: string
  student_name: string
  lesson_date: string
  gross_amount: number
  platform_fee_rate: number
  platform_fee: number
  net_amount: number
  status: 'pending' | 'settled' | 'paid'
  settlement_month: string | null
  settled_at: string | null
  created_at: string
}

/**
 * 收入摘要
 */
export interface EarningsSummary {
  total_earnings: number
  total_gross_amount: number
  total_platform_fee: number
  total_net_amount: number
  pending_amount: number
  settled_amount: number
  average_per_lesson: number
  this_month_earnings: number
}

/**
 * 收入明細完整回應
 */
export interface EarningsResponse {
  earnings: EarningRecord[]
  pagination: TeacherDashboardPaginationInfo
  summary: EarningsSummary
}

// ================== 結算記錄相關介面 ==================

/**
 * 結算查詢參數
 */
export interface SettlementQueryParams {
  page?: number
  per_page?: number
  year?: number
  status?: 'pending' | 'processing' | 'completed' | 'paid'
}

/**
 * 課程收益明細
 */
export interface CourseBreakdown {
  course_id: number
  course_name: string
  lessons: number
  gross_amount: number
  net_amount: number
}

/**
 * 結算記錄項目
 */
export interface SettlementRecord {
  settlement_id: number
  settlement_month: string
  total_lessons: number
  gross_revenue: number
  total_platform_fee: number
  net_revenue: number
  tax_amount: number
  status: 'pending' | 'processing' | 'completed' | 'paid'
  created_at: string
  settlement_date: string | null
  paid_at: string | null
  courses_breakdown: CourseBreakdown[]
}

/**
 * 結算摘要
 */
export interface SettlementSummary {
  total_settlements: number
  total_net_revenue: number
  total_lessons: number
  pending_settlements: number
  pending_amount: number
  this_year_revenue: number
  average_monthly_revenue: number
}

/**
 * 結算記錄完整回應
 */
export interface SettlementsResponse {
  settlements: SettlementRecord[]
  pagination: TeacherDashboardPaginationInfo
  summary: SettlementSummary
}

// ================== 收入統計相關介面 ==================

/**
 * 收入統計查詢參數
 */
export interface EarningsStatsQueryParams {
  period?: 'month' | 'quarter' | 'year'
  year?: number
  compare_previous?: boolean
}

/**
 * 期間收入概覽
 */
export interface PeriodEarningsOverview {
  period: string
  total_lessons: number
  gross_revenue: number
  net_revenue: number
  platform_fee: number
  average_per_lesson: number
  active_courses: number
  unique_students: number
}

/**
 * 收入比較
 */
export interface EarningsComparison {
  lessons_change: string
  revenue_change: string
  students_change: string
  efficiency_change: string
}

/**
 * 收入總覽
 */
export interface EarningsOverview {
  current_period: PeriodEarningsOverview
  previous_period: PeriodEarningsOverview
  comparison: EarningsComparison
}

/**
 * 年度收入摘要
 */
export interface YearlySummary {
  year: number
  total_lessons: number
  gross_revenue: number
  net_revenue: number
  platform_fee: number
  months_active: number
  peak_month: PeakMonth
  growth_rate: string
}

/**
 * 收入高峰月份
 */
export interface PeakMonth {
  month: string
  revenue: number
  lessons: number
}

/**
 * 月度收入明細
 */
export interface MonthlyBreakdown {
  month: string
  lessons: number
  gross_revenue: number
  net_revenue: number
  students: number
}

/**
 * 課程收益明細
 */
export interface CourseRevenueBreakdown {
  course_id: number
  course_name: string
  total_lessons: number
  gross_revenue: number
  net_revenue: number
  percentage: number
  students_count: number
  average_per_student: number
}

/**
 * 收入預測
 */
export interface EarningsProjections {
  next_month_estimate: MonthlyEstimate
  year_end_estimate: YearlyEstimate
}

/**
 * 月度預測
 */
export interface MonthlyEstimate {
  estimated_lessons: number
  estimated_revenue: number
  confidence: 'high' | 'medium' | 'low'
}

/**
 * 年度預測
 */
export interface YearlyEstimate {
  estimated_total_lessons: number
  estimated_total_revenue: number
  confidence: 'high' | 'medium' | 'low'
}

/**
 * 基準數據
 */
export interface EarningsBenchmarks {
  platform_average: PlatformAverage
  your_performance: PerformanceRanking
}

/**
 * 平台平均數據
 */
export interface PlatformAverage {
  monthly_lessons: number
  monthly_revenue: number
  average_per_lesson: number
}

/**
 * 表現排名
 */
export interface PerformanceRanking {
  lessons_ranking: string
  revenue_ranking: string
  efficiency_ranking: string
}

/**
 * 收入統計完整回應
 */
export interface EarningsStatsResponse {
  overview: EarningsOverview
  yearly_summary: YearlySummary
  monthly_breakdown: MonthlyBreakdown[]
  course_revenue_breakdown: CourseRevenueBreakdown[]
  projections: EarningsProjections
  benchmarks: EarningsBenchmarks
}

// ================== 通用介面 ==================

/**
 * 分頁資訊
 */
export interface TeacherDashboardPaginationInfo {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}