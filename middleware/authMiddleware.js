function sessionUser(req) {
  return req.session && req.session.user ? req.session.user : null;
}

function isAdminRole(role) {
  return role === "admin" || role === "superadmin";
}

exports.isAdminRole = isAdminRole;

exports.isSuperAdmin = (req) => {
  const user = sessionUser(req);
  return !!(user && user.role === "superadmin");
};

exports.requireLogin = (req, res, next) => {
  if (!sessionUser(req)) {
    req.session.error = "Please sign in first.";
    return res.redirect("/auth/login");
  }
  next();
};

exports.requireLoginApi = (req, res, next) => {
  if (!sessionUser(req)) {
    return res.status(401).json({ success: false, message: "Please sign in first." });
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  const user = sessionUser(req);
  if (!user) {
    req.session.error = "Please sign in first.";
    return res.redirect("/auth/login");
  }
  if (!isAdminRole(user.role)) {
    return res.status(403).render("pages/error", {
      title: "Access denied",
      message: "You do not have permission to view this page."
    });
  }
  next();
};

exports.requireSuperAdmin = (req, res, next) => {
  const user = sessionUser(req);
  if (!user) {
    req.session.error = "Please sign in first.";
    return res.redirect("/auth/login");
  }
  if (user.role !== "superadmin") {
    req.session.error = "Only a super admin can manage staff accounts.";
    return res.redirect("/admin");
  }
  next();
};

exports.requireGuest = (req, res, next) => {
  const user = sessionUser(req);
  if (user) {
    if (isAdminRole(user.role)) {
      return res.redirect("/admin");
    }
    return res.redirect("/");
  }
  next();
};
