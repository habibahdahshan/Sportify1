const translations = {
  en: {
    dir: "ltr",
    lang: "en",
    home: "Home",
    shop: "Shop",
    shop_all: "Shop all",
    for_men: "For men",
    for_women: "For women",
    unisex: "Unisex",
    flash_sale: "Flash sale",
    about_us: "About us",
    sign_in: "Sign in",
    sign_up: "Sign up",
    my_orders: "My orders",
    admin: "Admin",
    logout: "Log out",
    add_to_cart: "Add to cart",
    buy_now: "Buy now",
    your_cart: "Your Cart",
    empty_cart: "Your cart is empty.",
    total: "Total",
    checkout: "Checkout",
    best_sellers: "Best sellers",
    shop_by_category: "Shop by category",
    search: "Search",
    favorites: "Favorites"
  },
  ar: {
    dir: "rtl",
    lang: "ar",
    home: "الرئيسية",
    shop: "المتجر",
    shop_all: "كل المنتجات",
    for_men: "رجالي",
    for_women: "حريمي",
    unisex: "للجنسين",
    flash_sale: "تخفيضات سريعة",
    about_us: "من نحن",
    sign_in: "تسجيل الدخول",
    sign_up: "إنشاء حساب",
    my_orders: "طلباتي",
    admin: "الإدارة",
    logout: "تسجيل الخروج",
    add_to_cart: "أضف إلى السلة",
    buy_now: "اشترِ الآن",
    your_cart: "عربة التسوق",
    empty_cart: "عربة التسوق فارغة.",
    total: "الإجمالي",
    checkout: "الدفع",
    best_sellers: "الأكثر مبيعًا",
    shop_by_category: "تسوق حسب الفئة",
    search: "بحث",
    favorites: "المفضلة"
  }
};

module.exports = function i18n(req, res, next) {
  const queryLang = req.query.lang && translations[req.query.lang] ? req.query.lang : null;
  if (queryLang) {
    req.session.lang = queryLang;
  }
  const lang = translations[req.session.lang] ? req.session.lang : "en";
  const dict = translations[lang];

  res.locals.lang = lang;
  res.locals.dir = dict.dir;
  res.locals.t = (key) => (dict[key] !== undefined ? dict[key] : key);

  next();
};
