import pino from 'pino'
import pretty from 'pino-pretty'

function getLogger(prefix: string, logLevel: string = 'debug'): pino.Logger {
  return pino(
    {
      level: logLevel
    },
    pretty({
      messageFormat: `[${prefix}]: {msg}`,
      colorize: true,
      sync: true
    })
  )
}

export default getLogger
