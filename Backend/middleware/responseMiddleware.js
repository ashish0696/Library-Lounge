// Standardized response helper middleware
// Attaches `sendResponse` and `sendError` to the Express `res` object
module.exports = (req, res, next) => {
  /**
   * Send a standardized success response
   * @param {any} data - primary response payload
   * @param {string} message - optional human readable message
   * @param {boolean} api_status - api logical status (true for success)
   * @param {number} status_code - HTTP status code
   */
  res.sendResponse = function (data = null, message = '', api_status = true, status_code = 200) {
    // keep standard json shape
    return res.status(status_code).json({
      data: data,
      message: message,
      api_status: api_status,
      status_code: status_code,
    });
  };

  /**
   * Send a standardized error response
   * @param {string} message - error message
   * @param {number} status_code - HTTP status code (default 400)
   * @param {any} data - optional extra data (validation errors, etc)
   */
  res.sendError = function (message = 'Error', status_code = 400, data = null) {
    return res.status(status_code).json({
      data: data,
      message: message,
      api_status: false,
      status_code: status_code,
    });
  };

  next();
};
