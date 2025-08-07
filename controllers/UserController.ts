import { Request, Response, NextFunction } from 'express'
import { dataSource } from '../db/data-source'
import { User } from '../entities/User'
import getLogger from '../utils/logger'

const logger = getLogger('UserController')

export class UserController {
  private userRepository = dataSource.getRepository(User)

  // 取得所有使用者
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userRepository.find()
      res.json({
        status: 'success',
        data: users
      })
    } catch (error) {
      logger.error('取得使用者列表失敗:', error)
      next(error)
    }
  }

  // 根據ID取得使用者
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const user = await this.userRepository.findOne({
        where: { id: parseInt(id) }
      })

      if (!user) {
        return res.status(404).json({
          status: 'failed',
          message: '找不到使用者'
        })
      }

      res.json({
        status: 'success',
        data: user
      })
    } catch (error) {
      logger.error('取得使用者失敗:', error)
      next(error)
    }
  }

  // 建立新使用者
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, age } = req.body

      if (!email || !name) {
        return res.status(400).json({
          status: 'failed',
          message: 'Email 和姓名為必填欄位'
        })
      }

      // 檢查email是否已存在
      const existingUser = await this.userRepository.findOne({
        where: { email }
      })

      if (existingUser) {
        return res.status(409).json({
          status: 'failed',
          message: 'Email 已存在'
        })
      }

      const user = this.userRepository.create({
        email,
        name,
        age: age ? parseInt(age) : undefined
      })

      const savedUser = await this.userRepository.save(user)

      res.status(201).json({
        status: 'success',
        data: savedUser
      })
    } catch (error) {
      logger.error('建立使用者失敗:', error)
      next(error)
    }
  }

  // 更新使用者
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { email, name, age } = req.body

      const user = await this.userRepository.findOne({
        where: { id: parseInt(id) }
      })

      if (!user) {
        return res.status(404).json({
          status: 'failed',
          message: '找不到使用者'
        })
      }

      // 如果要更新email，檢查是否已存在
      if (email && email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email }
        })

        if (existingUser) {
          return res.status(409).json({
            status: 'failed',
            message: 'Email 已存在'
          })
        }
      }

      // 更新使用者資料
      if (email) user.email = email
      if (name) user.name = name
      if (age !== undefined) user.age = age ? parseInt(age) : undefined

      const updatedUser = await this.userRepository.save(user)

      res.json({
        status: 'success',
        data: updatedUser
      })
    } catch (error) {
      logger.error('更新使用者失敗:', error)
      next(error)
    }
  }

  // 刪除使用者
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      const user = await this.userRepository.findOne({
        where: { id: parseInt(id) }
      })

      if (!user) {
        return res.status(404).json({
          status: 'failed',
          message: '找不到使用者'
        })
      }

      await this.userRepository.remove(user)

      res.json({
        status: 'success',
        message: '使用者已刪除'
      })
    } catch (error) {
      logger.error('刪除使用者失敗:', error)
      next(error)
    }
  }
}
