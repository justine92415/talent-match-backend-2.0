import { dataSource } from '../db/data-source'
import { QueryRunner } from 'typeorm'
import getLogger from './logger'

const logger = getLogger('TransactionManager')

/**
 * 在交易中執行函式
 * @param fn 要在交易中執行的函式
 * @returns Promise 執行結果
 */
export async function withTransaction<T>(fn: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
  const queryRunner = dataSource.createQueryRunner()

  try {
    await queryRunner.connect()
    await queryRunner.startTransaction()

    logger.info('Transaction started')

    const result = await fn(queryRunner)

    await queryRunner.commitTransaction()
    logger.info('Transaction committed successfully')

    return result
  } catch (error) {
    await queryRunner.rollbackTransaction()
    logger.error('Transaction rolled back', { error })
    throw error
  } finally {
    await queryRunner.release()
    logger.info('QueryRunner released')
  }
}

/**
 * 在交易中執行多個作業
 * @param operations 要執行的作業陣列
 * @returns Promise<void>
 */
export async function executeInTransaction(operations: Array<(queryRunner: QueryRunner) => Promise<void>>): Promise<void> {
  await withTransaction(async (queryRunner: QueryRunner) => {
    for (const operation of operations) {
      await operation(queryRunner)
    }
  })
}

/**
 * 巢狀交易管理器
 * 支援 Savepoint 機制
 */
export class NestedTransactionManager {
  private queryRunner: QueryRunner
  private savepointStack: string[] = []
  private savepointCounter = 0

  constructor(queryRunner: QueryRunner) {
    this.queryRunner = queryRunner
  }

  /**
   * 開始一個新的 savepoint
   * @returns savepoint 名稱
   */
  async startSavepoint(): Promise<string> {
    const savepointName = `sp_${++this.savepointCounter}`
    await this.queryRunner.query(`SAVEPOINT ${savepointName}`)
    this.savepointStack.push(savepointName)

    logger.info(`Savepoint created: ${savepointName}`)
    return savepointName
  }

  /**
   * 回滾到指定的 savepoint
   * @param savepointName savepoint 名稱，若未提供則回滾到最近的 savepoint
   */
  async rollbackToSavepoint(savepointName?: string): Promise<void> {
    const name = savepointName || this.savepointStack[this.savepointStack.length - 1]
    if (!name) {
      throw new Error('No savepoint available for rollback')
    }

    await this.queryRunner.query(`ROLLBACK TO SAVEPOINT ${name}`)
    logger.info(`Rolled back to savepoint: ${name}`)

    // 清理 savepoint stack
    const index = this.savepointStack.indexOf(name)
    if (index !== -1) {
      this.savepointStack = this.savepointStack.slice(0, index + 1)
    }
  }

  /**
   * 釋放 savepoint
   * @param savepointName savepoint 名稱，若未提供則釋放最近的 savepoint
   */
  async releaseSavepoint(savepointName?: string): Promise<void> {
    const name = savepointName || this.savepointStack.pop()
    if (!name) {
      throw new Error('No savepoint available for release')
    }

    await this.queryRunner.query(`RELEASE SAVEPOINT ${name}`)
    logger.info(`Savepoint released: ${name}`)
  }

  /**
   * 取得目前的 savepoint 堆疊
   */
  getSavepointStack(): string[] {
    return [...this.savepointStack]
  }
}

/**
 * 建立具有巢狀交易支援的交易管理器
 * @param fn 要在交易中執行的函式
 * @returns Promise 執行結果
 */
export async function withNestedTransaction<T>(fn: (manager: NestedTransactionManager) => Promise<T>): Promise<T> {
  return withTransaction(async (queryRunner: QueryRunner) => {
    const nestedManager = new NestedTransactionManager(queryRunner)
    return fn(nestedManager)
  })
}

/**
 * 平行執行多個交易操作（每個操作在自己的交易中）
 * @param operations 要執行的操作陣列
 * @returns Promise<T[]> 所有操作的結果
 */
export async function executeParallel<T>(operations: Array<() => Promise<T>>): Promise<T[]> {
  return Promise.all(operations.map(op => op()))
}

/**
 * 序列執行多個交易操作
 * @param operations 要執行的操作陣列
 * @returns Promise<T[]> 所有操作的結果
 */
export async function executeSequential<T>(operations: Array<() => Promise<T>>): Promise<T[]> {
  const results: T[] = []
  for (const operation of operations) {
    const result = await operation()
    results.push(result)
  }
  return results
}
