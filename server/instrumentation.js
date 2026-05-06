import { NodeSDK } from '@opentelemetry/sdk-node'
import { ParentBasedSampler } from '@opentelemetry/sdk-trace-base'
import {
  SessionRecorderIdGenerator,
  SessionRecorderHttpTraceExporter,
  SessionRecorderHttpLogsExporter,
  SessionRecorderHttpInstrumentationHooksNode,
  SessionRecorderTraceIdRatioBasedSampler
} from '@multiplayer-app/session-recorder-node'
import {
  getNodeAutoInstrumentations
} from '@opentelemetry/auto-instrumentations-node'
import {
  MULTIPLAYER_SDK_API_KEY,
  ENVIRONMENT,
  OTLP_SAMPLE_RATE
} from './config.js'

/**
 * Initialize OpenTelemetry with Multiplayer exporters and auto-instrumentation.
 * This module MUST be imported before any other application code.
 */
const sdk = new NodeSDK({
  sampler: new ParentBasedSampler({
    root: new SessionRecorderTraceIdRatioBasedSampler(OTLP_SAMPLE_RATE),
  }),
  traceIdGenerator: new SessionRecorderIdGenerator(),
  instrumentations: [
    ...getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        requestHook: SessionRecorderHttpInstrumentationHooksNode.requestHook({
          // Mask sensitive headers from being captured in traces
          maskHeadersList: ['Authorization', 'cookie', 'x-api-key'],
          // Limit payload size to avoid huge traces
          maxPayloadSizeBytes: 500000,
          isMaskBodyEnabled: false,
          isMaskHeadersEnabled: true
        }),
        responseHook: SessionRecorderHttpInstrumentationHooksNode.responseHook({
          // Mask session/auth cookies in responses
          maskHeadersList: ['set-cookie'],
          maxPayloadSizeBytes: 500000,
          isMaskBodyEnabled: false,
          isMaskHeadersEnabled: true
        })
      }
    })
  ],
  traceExporter: new SessionRecorderHttpTraceExporter({
    apiKey: MULTIPLAYER_SDK_API_KEY
  }),
  logRecordExporter: new SessionRecorderHttpLogsExporter({
    apiKey: MULTIPLAYER_SDK_API_KEY
  }),
  resourceAttributes: {
    'service.name': 'multiplayer-cli-demo-app',
    'service.version': '0.0.0',
    environment: ENVIRONMENT
  }
})

sdk.start()

console.log('[OpenTelemetry] Initialized with Multiplayer exporters')

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown()
    console.log('[OpenTelemetry] SDK shut down successfully')
  } catch (error) {
    console.error('[OpenTelemetry] Error during SDK shutdown:', error)
  }
  process.exit(0)
})
