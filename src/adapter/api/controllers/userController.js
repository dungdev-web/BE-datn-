const express = require("express");
const router = express.Router();
const { upload, validateRealImage } = require("../../middlewares/upload");
const {
  loginHandler,
  logoutHandler,
  registerHandler,
  updateUserHandler,
  addAddressHandler,
  checkTokenHandler,
  googleCallback,
  changePasswordHandler,
  getCartByUserHandler,
  getAddressesByUserHandler,
  updateAddressHandler,
  deleteAddressHandler,
  getUserProfileHandler,
  getReviewsByUserHandler,
  sendContactEmailHandler,
  getOrderDetailHandler,
  getWishlistByUserHandler,
  sendMailHandler ,
  getDefaultAddressHandler,
  confirmEmailHandler,
  getAddressesByIdHandler,
  sendResetPassHandler,
  ResetPassHandler,
  updateOrderStatusHandler,
  addUserVoucherHandler,
  getAllUsersHandler,
  updateUsersHandler
} = require("../../../application/user/userHttpHandler");
require("../../../infrastructure/repository/brandRepository");
// auth
router.post("/auth/login", loginHandler);
router.post("/auth/logout", logoutHandler);
router.post("/auth/register", registerHandler);
router.get("/auth/check-token", checkTokenHandler);
router.post("/google/callback",googleCallback);
router.post('/auth/forget', sendResetPassHandler);
router.post('/auth/confirm-email', confirmEmailHandler);
router.post('/auth/reset-password', ResetPassHandler);

//user
router.put("/update" , upload.single('avatar'), validateRealImage, updateUserHandler);
router.post("/add-address", addAddressHandler);
router.put("/change-pass", changePasswordHandler);
router.get('/get-cart/:userId', getCartByUserHandler);
router.get('/addresses/:userId', getAddressesByUserHandler);
router.get('/addressesbyid/:addressid', getAddressesByIdHandler);
router.put('/addresses/:addressId', updateAddressHandler);
router.delete('/addresses/:addressId', deleteAddressHandler);
router.get('/profile/:userId', getUserProfileHandler);
router.get('/reviews/:userId', getReviewsByUserHandler);
router.post('/contact', sendContactEmailHandler);
router.get('/orders/:orderId', getOrderDetailHandler);
router.get('/wishlist/:userId', getWishlistByUserHandler);
router.post('/send', sendMailHandler);
router.get('/user_default_address/:userId', getDefaultAddressHandler);
router.put('/update-order-status/:orderId', updateOrderStatusHandler);
router.post("/user-vouchers", addUserVoucherHandler);
router.get('/all-user', getAllUsersHandler);
router.put('/update-user/:userId', updateUsersHandler);
module.exports = router;
