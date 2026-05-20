import { hostname } from 'os'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { BatchSpanProcessor, ParentBasedSampler } from '@opentelemetry/sdk-trace-base'
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { logs } from '@opentelemetry/api-logs'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici'
import {
  SessionRecorderIdGenerator,
  SessionRecorderHttpTraceExporter,
  SessionRecorderHttpLogsExporter,
  SessionRecorderHttpInstrumentationHooksNode,
  SessionRecorderTraceIdRatioBasedSampler
} from '@multiplayer-app/session-recorder-node'
import * as SemanticAttributes from '@opentelemetry/semantic-conventions'
import {
  MULTIPLAYER_SDK_API_KEY,
  ENVIRONMENT,
  OTLP_SAMPLE_RATE,
  SERVICE_NAME,
  SERVICE_VERSION,
  MULTIPLAYER_OTEL_TRACES_EXPORTER_HTTP_URL,
  MULTIPLAYER_OTEL_LOGS_EXPORTER_HTTP_URL
} from './config.js'

/**
 * Initialize OpenTelemetry with Multiplayer exporters and HTTP/Express instrumentation.
 * This module MUST be imported before any other application code.
 */

const resource = resourceFromAttributes({
  [SemanticAttributes.SEMRESATTRS_SERVICE_NAME]: SERVICE_NAME,
  [SemanticAttributes.SEMRESATTRS_SERVICE_VERSION]: SERVICE_VERSION,
  [SemanticAttributes.SEMRESATTRS_HOST_NAME]: hostname(),
  [SemanticAttributes.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: ENVIRONMENT,
  [SemanticAttributes.SEMRESATTRS_PROCESS_RUNTIME_VERSION]: process.version,
  [SemanticAttributes.SEMRESATTRS_PROCESS_PID]: process.pid,
})

const traceExporter = new SessionRecorderHttpTraceExporter({
  apiKey: MULTIPLAYER_SDK_API_KEY,
  url: MULTIPLAYER_OTEL_TRACES_EXPORTER_HTTP_URL
})

const logRecordExporter = new SessionRecorderHttpLogsExporter({
  apiKey: MULTIPLAYER_SDK_API_KEY,
  url: MULTIPLAYER_OTEL_LOGS_EXPORTER_HTTP_URL
})

const tracerProvider = new NodeTracerProvider({
  resource,
  sampler: new ParentBasedSampler({
    root: new SessionRecorderTraceIdRatioBasedSampler(OTLP_SAMPLE_RATE),
  }),
  idGenerator: new SessionRecorderIdGenerator(),
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
})
tracerProvider.register()

const loggerProvider = new LoggerProvider({
  resource,
  processors: [new BatchLogRecordProcessor(logRecordExporter)],
})
logs.setGlobalLoggerProvider(loggerProvider)

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation({
      requestHook: SessionRecorderHttpInstrumentationHooksNode.requestHook({
        maskHeadersList: ['Authorization', 'cookie', 'x-api-key'],
        maxPayloadSizeBytes: 500000,
        isMaskBodyEnabled: false,
        isMaskHeadersEnabled: true
      }),
      responseHook: SessionRecorderHttpInstrumentationHooksNode.responseHook({
        maskHeadersList: ['set-cookie'],
        maxPayloadSizeBytes: 500000,
        isMaskBodyEnabled: false,
        isMaskHeadersEnabled: true
      })
    }),
    new ExpressInstrumentation(),
    new UndiciInstrumentation(),
  ],
})

console.log('[OpenTelemetry] Initialized with Multiplayer exporters')

process.on('SIGTERM', async () => {
  try {
    await tracerProvider.shutdown()
    await loggerProvider.shutdown()
    console.log('[OpenTelemetry] SDK shut down successfully')
  } catch (error) {
    console.error('[OpenTelemetry] Error during SDK shutdown:', error)
  }
  process.exit(0)
})
