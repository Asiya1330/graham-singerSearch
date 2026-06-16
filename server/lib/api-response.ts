import type { Response } from "express";
import {
  API_ERRORS,
  getApiError,
  type ApiErrorCode,
} from "@shared/api-errors";

export class HttpApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, overrideMessage?: string) {
    const def = API_ERRORS[code];
    super(overrideMessage ?? def.message);
    this.code = code;
    this.status = def.status;
  }
}

export function sendApiError(
  res: Response,
  code: ApiErrorCode,
  overrideMessage?: string,
): Response {
  const body = getApiError(code, overrideMessage);
  return res.status(API_ERRORS[code].status).json(body);
}

export function sendRouteError(
  res: Response,
  error: unknown,
  fallbackCode: ApiErrorCode = "OPERATION_FAILED",
): Response {
  if (error instanceof HttpApiError) {
    return sendApiError(res, error.code, error.message);
  }

  console.error(`[api] ${fallbackCode}:`, error);
  return sendApiError(res, fallbackCode);
}
