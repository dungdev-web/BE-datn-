const express = require("express");
const router = express.Router();
const {
  upload,
  validateRealImage,
} = require("../../middlewares/uploadProduct");

const {
  getAllProductsHandler,
  getProductDetailHandler,
  getBestSellingHandler,
  getNewestProductsHandler,
  getFeaturedProductsHandler,
  getProductsByCategoryHandler,
  getDealProductsHandler,
  getRelatedProductsHandler,
  getProductsByGenderHandler,
  addProductHandler,
  searchProductsHandler,
  getAllCouponsHandler,
  addToWishlistHandler,
  getReviewsByProductHandler,
  createProductReviewHandler,
  getProductsByBrandHandler,
  addToCart,
  addToCompareHandler,
  removeFromCompareHandler,
  getCompareProductsHandler,
  getCartHandler,
  updateCartHandler,
  removeFromCartHandler,
  checkoutHandler,
  removeWishlistItemHandler,
  filterProductsHandler,
  getOrderHandler,
  updateProductHandler,
  deleteProductHandler,
  getCouponsHandler,
  getUserVouchersHandler,
  getAllProductVariantHandler,
  getAllSizesHandler,
  getAllGendersHandler,
  getProductAdminHandler,
  getAllProductReviewHandler,
  getStatusReviewHandler,
  getByIdReviewHandler

} = require("../../../application/product/productHttpHandler");

router.get("/", getAllProductsHandler);
router.get("/prodashboard", getAllProductVariantHandler);
// router.put("/update/:id", updateProductHandler);
router.delete("/delete/:id", deleteProductHandler);
router.get("/filter", filterProductsHandler);
router.get("/brand/:brandId", getProductsByBrandHandler);
router.get("/detail/:id", getProductDetailHandler);
router.get("/detail/slug", getProductDetailHandler);
router.get("/best-selling", getBestSellingHandler);
router.get("/newest", getNewestProductsHandler);
router.get("/featured", getFeaturedProductsHandler);
router.get("/category", getProductsByCategoryHandler);
router.get("/deals", getDealProductsHandler);
router.get("/related/:productId", getRelatedProductsHandler);
router.get("/gender", getProductsByGenderHandler);
router.post(
  "/add-product",
  upload.any(), 
  validateRealImage,
  addProductHandler
);
router.put(
  "/update-product/:id",
  upload.any(),
  validateRealImage,
  updateProductHandler
);


router.get("/genderadmin", getAllGendersHandler);
router.get("/size", getAllSizesHandler);
router.post("/addToCart", addToCart);
router.post("/compare/add", addToCompareHandler);
router.get("/search", searchProductsHandler);
router.get("/coupons", getAllCouponsHandler);
router.post("/wishlist", addToWishlistHandler);
router.get("/reviews/:productId", getReviewsByProductHandler);
router.get("/all/reviews", getAllProductReviewHandler);
router.post("/reviews/status/:id", getStatusReviewHandler);
router.get("/all/reviews/:id", getByIdReviewHandler);
router.post("/reviews/:productId", createProductReviewHandler);
router.delete("/compare/remove", removeFromCompareHandler);
router.get("/compare", getCompareProductsHandler);
router.get("/cart", getCartHandler);
router.put("/cart/update", updateCartHandler);
router.delete("/cart/remove", removeFromCartHandler);
router.delete("/wishlist", removeWishlistItemHandler);
router.post("/checkout", checkoutHandler);
router.get("/order/:userId", getOrderHandler);
router.get("/couponsByCode", getCouponsHandler);
router.get("/user_vouchers/:userId", getUserVouchersHandler);
router.get("/proadmin/:id", getProductAdminHandler);

module.exports = router;
