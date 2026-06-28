/**
 * Send a standardized success response.
 *
 * @param {import('express').Response} res
 * @param {*}      data        - Payload to return
 * @param {string} message     - Human-readable message
 * @param {number} statusCode  - HTTP status code (default 200)
 * @param {object|null} pagination - { page, limit, total, totalPages }
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200, pagination = null) => {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
};

/**
 * Send a standardized error response.
 *
 * @param {import('express').Response} res
 * @param {string} message    - Human-readable error message
 * @param {number} statusCode - HTTP status code (default 400)
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message, data: null, pagination: null });
};

module.exports = { successResponse, errorResponse };
