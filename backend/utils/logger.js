/**
 * Ayurlab Structured Logging Utility
 * Supports structured JSON logging for production (Docker/CloudWatch/Datadog)
 * and formatted readable output for local development.
 */

const isProd = process.env.NODE_ENV === 'production';

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();

  if (isProd) {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: 'ayurlab-backend',
      ...meta,
    });
  }

  const colors = {
    INFO: '\x1b[32m',    // Green
    WARN: '\x1b[33m',    // Yellow
    ERROR: '\x1b[31m',   // Red
    DEBUG: '\x1b[36m',   // Cyan
    RESET: '\x1b[0m',
  };

  const color = colors[level] || colors.RESET;
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${color}[${timestamp}] [${level}]${colors.RESET} ${message}${metaStr}`;
}

export const logger = {
  info: (message, meta = {}) => {
    console.log(formatMessage('INFO', message, meta));
  },

  warn: (message, meta = {}) => {
    console.warn(formatMessage('WARN', message, meta));
  },

  error: (message, error = null, meta = {}) => {
    const errorDetails = error ? {
      errorMessage: error.message || String(error),
      errorStack: error.stack ? error.stack.split('\n').slice(0, 4).join(' | ') : undefined,
    } : {};

    console.error(formatMessage('ERROR', message, { ...errorDetails, ...meta }));
  },

  debug: (message, meta = {}) => {
    if (process.env.DEBUG || !isProd) {
      console.log(formatMessage('DEBUG', message, meta));
    }
  },

  request: (req, res, durationMs) => {
    const status = res.statusCode;
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    const message = `${req.method} ${req.originalUrl || req.url} ${status} (${durationMs}ms)`;

    const meta = {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: status,
      durationMs,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent']?.slice(0, 60),
    };

    if (level === 'ERROR') {
      console.error(formatMessage(level, message, meta));
    } else if (level === 'WARN') {
      console.warn(formatMessage(level, message, meta));
    } else {
      console.log(formatMessage(level, message, meta));
    }
  },
};

export default logger;
