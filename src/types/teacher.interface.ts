/**
 * 教師申請請求介面
 */
export interface TeacherApplicationData {
  nationality: string
  introduction: string
}

/**
 * 教師申請更新請求介面
 */
export interface TeacherApplicationUpdateData {
  nationality?: string
  introduction?: string
}