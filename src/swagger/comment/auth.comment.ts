import { Request, Response, NextFunction } from 'express'

/**
 * 認證相關 API 的 Swagger 註解中間件
 */
const AuthComment = {
  register: (req: Request, res: Response, next: NextFunction) => {
    /**
     * #swagger.tags = ['Authentication']
     * #swagger.summary = '使用者註冊'
     * #swagger.description = '註冊新的使用者帳戶，成功後自動登入並回傳 JWT Token'
     * #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/RegisterRequest" }
                }
            }
        }
      * #swagger.responses[201] = { 
          description: '註冊成功',
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterResponse" }
            }
          }
      }
      * #swagger.responses[400] = { 
          description: '請求參數錯誤或資料衝突',
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationErrorResponse" }
            }
          }
      }
      * #swagger.responses[500] = { 
          description: '伺服器內部錯誤',
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "error" },
                  message: { type: "string", example: "伺服器內部錯誤" }
                }
              }
            }
          }
      }
    */
    next()
  }
}

export default AuthComment
