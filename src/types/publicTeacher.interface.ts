/**
 * 教師公開資料相關類型定義
 */

import { CitySummary } from './publicCourse.interface'

/**
 * 公開教師個人資料
 */
export interface PublicTeacherProfile {
  id: number
  name: string
  email: string
  bio?: string
  expertise?: string
  city?: CitySummary | null
  profile_picture?: string | null
  introduction?: string | null
  nationality?: string | null
  total_students: number
  total_courses: number
  average_rating: number
  total_earnings: number
  created_at: string
  user: {
    name: string
    email: string
  }
}

/**
 * 教師課程基本類型
 */
export interface PublicTeacherCourse {
  id: number
  title: string
  description?: string | null
  status: string
  main_category: {
    id: number
    name: string
  } | null
  sub_category: {
    id: number
    name: string
  } | null
  city: CitySummary | null
  price_min?: number | null
  price_max?: number | null
  total_hours?: number | null
  image?: string | null
  rating_stats: {
    average_rating: number
    total_reviews: number
    rating_distribution: {
      [key: string]: number
    }
  } | null
  created_at: string
}

/**
 * 教師課程查詢參數
 */
export interface PublicTeacherCourseQuery {
  page?: number
  limit?: number
  status?: string
}