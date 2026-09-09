const leaveService = require("../services/leave.service");
const { successResponse, errorResponse } = require("../utils/response");

function handleError(error, res, next) {
  if (error.code && error.statusCode)
    return errorResponse(
      res,
      error.message,
      error.code,
      error.statusCode,
      error.details,
    );
  return next(error);
}

async function getMine(req, res, next) {
  try {
    return successResponse(res, "Pengajuan izin berhasil dimuat.", {
      requests: await leaveService.getMyRequests(req.user.id),
    });
  } catch (error) {
    return handleError(error, res, next);
  }
}

async function create(req, res, next) {
  try {
    return successResponse(
      res,
      "Pengajuan berhasil dibuat.",
      { request: await leaveService.createRequest(req.user.id, req.body) },
      201,
    );
  } catch (error) {
    return handleError(error, res, next);
  }
}

async function getAll(req, res, next) {
  try {
    return successResponse(res, "Pengajuan izin berhasil dimuat.", {
      requests: await leaveService.getAllRequests(),
    });
  } catch (error) {
    return handleError(error, res, next);
  }
}

async function updateStatus(req, res, next) {
  try {
    return successResponse(res, "Status pengajuan berhasil diperbarui.", {
      request: await leaveService.updateRequestStatus(
        req.params.id,
        req.body.status,
      ),
    });
  } catch (error) {
    return handleError(error, res, next);
  }
}

module.exports = { getMine, create, getAll, updateStatus };
