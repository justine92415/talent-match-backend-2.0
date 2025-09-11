import { initializeApp, getApps, App, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import path from 'path'
import * as fs from 'fs'

let firebaseApp: App | null = null

export const initializeFirebase = (): App => {
  if (firebaseApp) {
    return firebaseApp
  }

  try {
    if (getApps().length === 0) {
      let serviceAccount: any

      // 支援兩種配置方式：檔案路徑或直接 JSON 字串
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
      
      if (serviceAccountJson) {
        // 方式1: 直接使用環境變數中的 JSON 字串
        try {
          serviceAccount = JSON.parse(serviceAccountJson)
          console.log('✅ Firebase: 使用環境變數中的服務帳戶憑證')
        } catch (error) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT JSON 格式錯誤')
        }
      } else if (serviceAccountPath) {
        // 方式2: 從檔案路徑讀取
        const absolutePath = path.resolve(serviceAccountPath)
        
        if (!fs.existsSync(absolutePath)) {
          throw new Error(`Firebase service account file not found: ${absolutePath}`)
        }

        serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'))
        console.log('✅ Firebase: 使用服務帳戶檔案')
      } else {
        throw new Error('需要設定 FIREBASE_SERVICE_ACCOUNT_PATH 或 FIREBASE_SERVICE_ACCOUNT 環境變數')
      }

      // 設定 Storage Bucket
      let storageBucket = process.env.FIREBASE_STORAGE_BUCKET
      
      if (!storageBucket) {
        // 如果沒有設定，嘗試從 project_id 推斷（優先使用新格式）
        if (serviceAccount.project_id) {
          storageBucket = `${serviceAccount.project_id}.firebasestorage.app`
          console.log(`✅ Firebase: 自動推斷 Storage Bucket: ${storageBucket}`)
        } else {
          throw new Error('無法確定 Storage Bucket，請設定 FIREBASE_STORAGE_BUCKET 環境變數')
        }
      }

      console.log(`📦 Firebase: 使用 Storage Bucket: ${storageBucket}`)

      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: storageBucket
      })

      console.log(`✅ Firebase 初始化成功 - Project: ${serviceAccount.project_id}, Bucket: ${storageBucket}`)
    } else {
      firebaseApp = getApps()[0]
    }

    return firebaseApp
  } catch (error) {
    console.error('❌ Firebase 初始化失敗:', error)
    throw error
  }
}

export const getFirebaseStorage = () => {
  const app = initializeFirebase()
  return getStorage(app)
}

export const isFirebaseConfigured = (): boolean => {
  const hasServiceAccount = !!(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT)
  const hasStorageBucket = !!process.env.FIREBASE_STORAGE_BUCKET
  
  // 如果有服務帳戶但沒有 bucket，嘗試檢查是否能從服務帳戶 JSON 中推斷
  if (hasServiceAccount && !hasStorageBucket) {
    try {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
      if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson)
        return !!serviceAccount.project_id // 可以從 project_id 推斷 bucket
      }
    } catch {
      return false
    }
  }
  
  return hasServiceAccount && (hasStorageBucket || !!process.env.FIREBASE_SERVICE_ACCOUNT)
}