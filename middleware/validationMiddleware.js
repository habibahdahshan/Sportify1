exports.validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("Please enter a valid email.");
  }

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
    errors.push("Password must include letters and numbers.");
  }

  if (errors.length > 0) {
    req.session.error = errors.join(" ");
    return res.redirect("/auth/signup");
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("Please enter a valid email.");
  }

  if (!password) {
    errors.push("Please enter your password.");
  }

  if (errors.length > 0) {
    req.session.error = errors.join(" ");
    return res.redirect("/auth/login");
  }

  next();
};

exports.validateProduct = (req, res, next) => {
  const { name, category } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push("Product name is required.");
  if (!category) errors.push("Category is required.");

  let sizesArr = [];
  if (req.body.sizes) {
    sizesArr = Array.isArray(req.body.sizes)
      ? req.body.sizes
      : Object.values(req.body.sizes);
  }
  const validSizes = sizesArr.filter((s) => s && s.size && Number(s.price) >= 0);
  if (validSizes.length === 0) {
    errors.push("At least one size with a valid price is required.");
  }

  if (!req.file && !req.body.existingImage && !req.body.imageUrl) {
    errors.push("A product image is required.");
  }

  if (errors.length > 0) {
    req.session.error = errors.join(" ");
    return res.redirect("back");
  }

  next();
};

exports.validateCheckout = (req, res, next) => {
  const rawAddress = req.body.address ?? req.body.shippingAddress ?? req.body.shipping_address ?? "";
  const name = req.body.name || "";
  const email = req.body.email || "";
  const phone = req.body.phone || "";
  const address = String(rawAddress).trim();
  const errors = [];

  if (!name || name.trim().length < 2) errors.push("Full name is required.");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("A valid email is required.");
  if (!phone || phone.trim().length < 6) errors.push("A valid phone number is required.");
  if (!address || address.length < 5) errors.push("Shipping address is required.");

  if (errors.length > 0) {
    req.session.error = errors.join(" ");
    return res.redirect("/checkout");
  }

  req.body.address = address;
  next();
};
