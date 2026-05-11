export const ENVIRONMENT = process.env.ENVIRONMENT || process.env.NODE_ENV || 'development'
export const PORT = Number(process.env.PORT || 8787)
export const OTLP_SAMPLE_RATE = 0
export const SERVICE_NAME = 'multiplayer-demo-server'
export const SERVICE_VERSION = '1.0.0'

export const MULTIPLAYER_SDK_API_KEY = process.env.MULTIPLAYER_SDK_API_KEY
export const MULTIPLAYER_OTEL_TRACES_EXPORTER_HTTP_URL = process.env.MULTIPLAYER_OTEL_TRACES_EXPORTER_HTTP_URL || 'https://otlp.multiplayer.app/v1/traces'
export const MULTIPLAYER_OTEL_LOGS_EXPORTER_HTTP_URL = process.env.MULTIPLAYER_OTEL_LOGS_EXPORTER_HTTP_URL || 'https://otlp.multiplayer.app/v1/logs'
