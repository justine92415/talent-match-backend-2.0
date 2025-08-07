import { WebConfig } from '../types'

const webConfig: WebConfig = {
  port: parseInt(process.env.PORT || '3000', 10)
}

export default webConfig
