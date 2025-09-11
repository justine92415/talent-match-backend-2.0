import { getFirebaseStorage } from '../config/firebase'

export const testFirebaseStorageConnection = async (): Promise<{
  success: boolean
  bucketName?: string
  bucketExists?: boolean
  error?: string
}> => {
  try {
    const storage = getFirebaseStorage()
    const bucket = storage.bucket()
    
    // 檢查 bucket 是否存在
    const [exists] = await bucket.exists()
    
    return {
      success: true,
      bucketName: bucket.name,
      bucketExists: exists
    }
  } catch (error) {
    console.error('Firebase Storage 測試失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤'
    }
  }
}

export const listStorageBuckets = async (): Promise<string[]> => {
  try {
    const storage = getFirebaseStorage()
    // Firebase Storage client doesn't have getBuckets method in this version
    // This is a placeholder that could be implemented with Firebase Admin SDK
    console.log('Storage service initialized:', !!storage)
    return []
  } catch (error) {
    console.error('無法初始化 Storage 服務:', error)
    return []
  }
}