const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { isAdminRole } = require("../middleware/authMiddleware");

exports.getAuthEntry = (req, res) => {
  if (req.session && req.session.user) {
    if (isAdminRole(req.session.user.role)) {
      return res.redirect("/admin");
    }
    return res.redirect("/");
  }
  return res.redirect("/auth/login");
};

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    title: "Sign in · Sportify",
    activePage: "login"
  });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    title: "Create account · Sportify",
    activePage: "signup"
  });
};

exports.postSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      req.session.error = "Email already exists.";
      return res.redirect("/auth/signup");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user"
    });

    req.session.success = "Account created successfully. Please sign in.";
    res.redirect("/auth/login");
  } catch (err) {
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      req.session.error = "Invalid email or password.";
      return res.redirect("/auth/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.session.error = "Invalid email or password.";
      return res.redirect("/auth/login");
    }

    const sessionUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.session.regenerate((regenErr) => {
      if (regenErr) return next(regenErr);

      req.session.user = sessionUser;
      req.session.success = "Signed in successfully.";

      if (isAdminRole(user.role)) {
        return res.redirect("/admin");
      }
      res.redirect("/");
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout session destroy error:", err);
    res.redirect("/?loggedOut=1");
  });
};
