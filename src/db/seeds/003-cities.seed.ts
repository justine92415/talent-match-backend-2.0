import { DataSource } from 'typeorm'
import { City } from '@entities/City'

export class CitySeed {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(City)
    
    // 檢查是否已有資料
    const existingCount = await repository.count()
    if (existingCount > 0) {
      console.log('城市資料已存在，跳過初始化')
      return
    }

    const cities = [
      { city_code: 'TPE', city_name: '台北市', is_active: true },
      { city_code: 'TPH', city_name: '新北市', is_active: true },
      { city_code: 'TYC', city_name: '桃園市', is_active: true },
      { city_code: 'HSC', city_name: '新竹市', is_active: true },
      { city_code: 'HSH', city_name: '新竹縣', is_active: true },
      { city_code: 'MLI', city_name: '苗栗縣', is_active: true },
      { city_code: 'TXG', city_name: '台中市', is_active: true },
      { city_code: 'CWH', city_name: '彰化縣', is_active: true },
      { city_code: 'NTO', city_name: '南投縣', is_active: true },
      { city_code: 'YLI', city_name: '雲林縣', is_active: true },
      { city_code: 'CHY', city_name: '嘉義市', is_active: true },
      { city_code: 'CYI', city_name: '嘉義縣', is_active: true },
      { city_code: 'TNN', city_name: '台南市', is_active: true },
      { city_code: 'KHH', city_name: '高雄市', is_active: true },
      { city_code: 'PTS', city_name: '屏東縣', is_active: true },
      { city_code: 'TTT', city_name: '台東縣', is_active: true },
      { city_code: 'HWA', city_name: '花蓮縣', is_active: true },
      { city_code: 'ILA', city_name: '宜蘭縣', is_active: true },
      { city_code: 'KMN', city_name: '金門縣', is_active: true },
      { city_code: 'LNN', city_name: '連江縣', is_active: true },
      { city_code: 'PEH', city_name: '澎湖縣', is_active: true }
    ]

    const savedCities = await repository.save(cities)
    console.log(`成功初始化 ${savedCities.length} 個城市`)
  }
}