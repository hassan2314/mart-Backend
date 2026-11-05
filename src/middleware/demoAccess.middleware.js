import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Blocks catalog, order, user, and profile writes for the public read-only admin.
// Login, logout, and token refresh do not use this middleware.
export const rejectReadOnly = asyncHandler(async (req, res, next) => {
  if (req.user?.readOnly && !SAFE_METHODS.has(req.method)) {
    throw new ApiError(
      403,
      "This demo admin account is read-only and cannot change data."
    );
  }
  next();
});

export const rejectDemoCredentialChange = asyncHandler(async (req, res, next) => {
  if (req.user?.isDemo) {
    throw new ApiError(
      403,
      "Demo account passwords cannot be changed. Use the published demo password."
    );
  }
  next();
});

export const rejectDemoIdentityChange = asyncHandler(async (req, res, next) => {
  if (!req.user?.isDemo) {
    next();
    return;
  }

  const nextUsername =
    typeof req.body?.username === "string" ? req.body.username.trim().toLowerCase() : "";
  const nextEmail =
    typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

  if (
    (nextUsername && nextUsername !== req.user.username) ||
    (nextEmail && nextEmail !== req.user.email)
  ) {
    throw new ApiError(403, "Demo account username and email cannot be changed.");
  }

  next();
});
