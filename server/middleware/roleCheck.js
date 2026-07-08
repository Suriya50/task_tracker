// Additional role-specific checks (e.g., company membership)
exports.isCompanyMember = (req, res, next) => {
  // Check if user belongs to the same company as the resource
  // This will be implemented in controllers for specific routes
  next();
};