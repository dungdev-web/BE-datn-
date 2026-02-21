const userRepository = require("../../infrastructure/repository/userRepository");

const loginUsecase = require("../../infrastructure/usecase/user/loginUsecase");
const registerUsecase = require("../../infrastructure/usecase/user/registerUsecase");
const updateUserUsecase = require("../../infrastructure/usecase/user/updateUserUsecase");

const addAddressUsecase = require("../../infrastructure/usecase/user/addAddressUsecase");
const checkTokenUsecase = require("../../infrastructure/usecase/user/checkTokenUsecase");
const GoogleAuthUsecase = require("../../infrastructure/usecase/user/googleAuthUsecase");
const GoogleAuthRepository = require("../../infrastructure/repository/googleAuthRepository");

const changePasswordUsecase = require("../../infrastructure/usecase/user/changePasswordUsecase");
const getCartByUserUsecase = require("../../infrastructure/usecase/user/getCartByUserUsecase");
const getAddressesByUserUsecase = require("../../infrastructure/usecase/user/getAddressesByUserUsecase");
const updateAddressUsecase = require("../../infrastructure/usecase/user/updateAddressUsecase");
const deleteAddressUsecase = require("../../infrastructure/usecase/user/deleteAddressUsecase");
const getUserProfileUsecase = require("../../infrastructure/usecase/user/getUserProfileUsecase");
const getReviewsByUserUsecase = require("../../infrastructure/usecase/user/getReviewsByUserUsecase");
const sendContactEmailUsecase = require("../../infrastructure/usecase/user/sendContactEmailUsecase");
const getOrderDetail = require("../../infrastructure/usecase/user/getOrderDetailUseCase");
const getWishlistByUserUsecase = require("../../infrastructure/usecase/user/getWishlistByUserUsecase");
const sendMailUsecase = require("../../infrastructure/usecase/user/sendMailUsecase");
const getDefaultAddressUsecase = require("../../infrastructure/usecase/user/getDefaultAddressUsecase");
const confirmEmailUsecase = require("../../infrastructure/usecase/user/confirmEmailUsecase");
const getAddressesByIdUsecase = require("../../infrastructure/usecase/user/getAddressesByIdUsecase");
const sendResetPassUsecase = require("../../infrastructure/usecase/user/sendResetPassUsecase");
const ResetPassUsecase = require("../../infrastructure/usecase/user/ResetPassUsecase");
const updateOrderStatusUsecase = require("../../infrastructure/usecase/user/updateOrderStatusUsecase");
const addUserVoucherUsecase = require("../../infrastructure/usecase/user/addUserVoucherUsecase");
const getAllUsersUsecase = require("../../infrastructure/usecase/user/getAllUserUsecase");
const updateUsersUsecase = require("../../infrastructure/usecase/user/updateUsersUsecase");
const FRONTEND_URL = process.env.FRONTEND_URL;
const CLIENT_ID= process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET= process.env.GOOGLE_CLIENT_SECRET;
// Tạo repository và usecase
const googleAuthRepository = new GoogleAuthRepository();
const googleAuthUsecase = new GoogleAuthUsecase(googleAuthRepository);

async function updateOrderStatusHandler(req, res) {
  const orderId = parseInt(req.params.orderId);
  const { status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết" });
  }

  try {
    const result = await updateOrderStatusUsecase(orderId, status);
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công.",
      data: result,
    });
  } catch (error) {
    console.error("[Handler] Lỗi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái đơn hàng." });
  }
}

async function googleCallback(req, res) {
  try {
    const { code } = req.body;
    const client_id =CLIENT_ID;
    const client_secret = CLIENT_SECRET
    const redirect_uri = `${FRONTEND_URL}/google/callback`;
    const jwtSecret = process.env.JWT_SECRET || "YOUR_JWT_SECRET";

    const result = await googleAuthUsecase.handleGoogleLogin(
      code,
      client_id,
      client_secret,
      redirect_uri,
      jwtSecret
    );
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 60 * 60 * 24, 
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: err.message || "Đăng nhập Google thất bại" });
  }
}

async function ResetPassHandler(req, res) {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết" });
  }
  try {
    const result = await ResetPassUsecase(email, otp, newPassword);
    res
      .status(200)
      .json({ message: "Mật khẩu đã được cập nhật thành công", result });
  } catch (error) {
    console.error("[Handler] Lỗi reset password:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật mật khẩu." });
  }
}
async function sendResetPassHandler(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Thiếu email" });
  }

  try {
    const result = await sendResetPassUsecase(email);
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi reset password:", error);
    res.status(500).json({ error: "Lỗi khi gửi email reset password." });
  }
}

async function loginHandler(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;
    const result = await loginUsecase({ usernameOrEmail, password }, res);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

async function getAddressesByIdHandler(req, res) {
  const addressId = parseInt(req.params.addressid);
  try {
    const result = await getAddressesByIdUsecase(addressId);
    if (!result) {
      return res.status(404).json({ error: "Địa chỉ không tìm thấy." });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi getAddressesById:", error);
    res.status(500).json({ error: "Lỗi khi lấy địa chỉ." });
  }
}

async function confirmEmailHandler(req, res) {
  const { email, token } = req.body;
  try {
    if (!email) {
      return res
        .status(400)
        .json({ error: "Thiếu email hoặc token xác nhận." });
    }
    const result = await confirmEmailUsecase(email, token);
    if (result) {
      return res
        .status(200)
        .json({ message: "Email đã được xác nhận thành công." });
    } else {
      return res
        .status(400)
        .json({ error: "Xác nhận email không thành công." });
    }
  } catch (error) {
    console.error("[Handler] Lỗi xác nhận email:", error);
    return res.status(500).json({ error: "Lỗi máy chủ khi xác nhận email." });
  }
}

async function getDefaultAddressHandler(req, res) {
  const userId = parseInt(req.params.userId);
  try {
    const result = await getDefaultAddressUsecase(userId);
    if (!result) {
      return res
        .status(404)
        .json({ error: "Địa chỉ mặc định không tìm thấy." });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi getDefaultAddress:", error);
    res.status(500).json({ error: "Lỗi khi lấy địa chỉ mặc định." });
  }
}

const getOrderDetailHandler = async (req, res) => {
  const orderId = parseInt(req.params.orderId);

  const result = await getOrderDetail(orderId);

  if (result.error) {
    if (result.error === "Order not found.") {
      return res.status(404).json({ error: result.error });
    }
    return res.status(400).json({ error: result.error });
  }
  return res.json(result.data);
};

const getWishlistByUserHandler = async (req, res) => {
  const user_id = parseInt(req.params.userId);
  const result = await getWishlistByUserUsecase(user_id);
  if (result.error) {
    if (result.error === "wishlist not found.") {
      return res.status(404).json({ error: result.error });
    }
    return res.status(400).json({ error: result.error });
  }

  if (!result || result.length === 0) {
    return res.status(200).json({ message: "wishlist is empty", result: [] });
  }

  return res.json(result);
};

async function checkTokenHandler(req, res) {
  try {
    const result = await checkTokenUsecase(req);

    res.status(200).json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message || "Token không hợp lệ hoặc đã hết hạn",
    });
  }
}

async function logoutHandler(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "Đăng xuất thành công" });
}

async function registerHandler(req, res) {
  try {
    const result = await registerUsecase(req.body, res);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateUserHandler(req, res) {
  try {
    const { userId, ...userData } = req.body;

    if (!userId) return res.status(400).json({ error: "Thiếu userId" });

    if (req.file) {
      userData.avatar = req.file.filename;
    }

    const result = await updateUserUsecase(userId, userData);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function addAddressHandler(req, res) {
  const userId = req.user?.user_id || req.body.user_id; // tuỳ vào middleware xác thực
  const { full_name, phone, address_line, is_default } = req.body;

  if (!userId || !full_name || !phone || !address_line) {
    return res.status(400).json({ error: "Thiếu thông tin địa chỉ" });
  }

  try {
    const result = await addAddressUsecase(userRepository)(userId, {
      full_name,
      phone,
      address_line,

      is_default: is_default ?? false,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || "Lỗi server" });
  }
}

async function changePasswordHandler(req, res) {
  try {
    // const userId = req.body?.user_id; // hoặc lấy từ JWT decode
    const { userId, oldPassword, newPassword } = req.body;
    console.log("[DEBUG] req.body:", req.body);
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Thiếu mật khẩu cũ hoặc mới" });
    }

    const result = await changePasswordUsecase({
      userId,
      oldPassword,
      newPassword,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("[Handler] Lỗi đổi mật khẩu:", err);
    res.status(400).json({ error: err.message || "Đổi mật khẩu thất bại" });
  }
}

async function getCartByUserHandler(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const result = await getCartByUserUsecase({ userId });
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi getCartByUser:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi lấy giỏ hàng." });
  }
}

async function getAddressesByUserHandler(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const result = await getAddressesByUserUsecase({ userId });
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi getAddressesByUser:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách địa chỉ." });
  }
}

async function updateAddressHandler(req, res) {
  try {
    const addressId = parseInt(req.params.addressId);
    const payload = req.body;
    const result = await updateAddressUsecase({ addressId, payload });
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi updateAddress:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật địa chỉ." });
  }
}

async function deleteAddressHandler(req, res) {
  try {
    const addressId = parseInt(req.params.addressId);
    const result = await deleteAddressUsecase({ addressId });
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi deleteAddress:", error);
    res.status(500).json({ error: "Lỗi khi xóa địa chỉ." });
  }
}

async function getUserProfileHandler(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const result = await getUserProfileUsecase({ userId });
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi getUserProfile:", error);
    res.status(500).json({ error: "Lỗi khi lấy thông tin người dùng." });
  }
}

async function getReviewsByUserHandler(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const result = await getReviewsByUserUsecase({ userId });
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi getReviewsByUser:", error);
    res.status(500).json({ error: "Lỗi khi lấy đánh giá của người dùng." });
  }
}

async function sendContactEmailHandler(req, res) {
  const { name, email, phone, message } = req.body;

  const result = await sendContactEmailUsecase({
    name,
    email,
    phone,
    message,
  });

  if (result?.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json(result);
}
async function sendMailHandler(req, res) {
  const { to, subject, html } = req.body;

  try {
    await sendMailUsecase({ to, subject, html });
    res.status(200).json({ message: "Gửi email thành công." });
  } catch (error) {
    console.error("[Handler] Lỗi gửi email:", error);
    res.status(500).json({ error: "Không thể gửi email." });
  }
}
async function addUserVoucherHandler(req, res) {
  try {
    const { user_id, coupon_code } = req.body;

    const result = await addUserVoucherUsecase({ user_id, coupon_code });
    res.status(200).json(result);
  } catch (error) {
    console.error("[Handler] Lỗi thêm voucher cho người dùng:", error);
    res.status(500).json({ error: "Lỗi khi lưu mã giảm giá cho người dùng." });
  }
}
async function getAllUsersHandler(req, res) {
  try {
    const {
      page,
      limit,
      sortField,
      sortDirection,
      role,
      status,
      name,
      email,
      user_id,
      phone,
      search,
    } = req.query;

    const filters = { role, status, name, email, user_id, phone };

    if (search) {
      filters.search = search;
    }

    const result = await getAllUsersUsecase({
      page,
      limit,
      sortField: sortField || "created_at",
      sortDirection: sortDirection === "asc" ? "asc" : "desc",
      filters,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[Handler] Lỗi getAllUsers:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách người dùng." });
  }
}

async function updateUsersHandler(req, res) {
  const userId = req.params.userId;

  const { role, status } = req.body;

  try {
    const updated = await updateUsersUsecase(userId, { role, status });

    res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công.",
      data: updated,
    });
  } catch (error) {
    console.error("[Handler] Lỗi updateUser:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật người dùng." });
  }
}
module.exports = {
  loginHandler,
  logoutHandler,
  registerHandler,
  updateUserHandler,
  addAddressHandler,
  changePasswordHandler,
  googleCallback,
  checkTokenHandler,
  getCartByUserHandler,
  getAddressesByUserHandler,
  updateAddressHandler,
  deleteAddressHandler,
  getUserProfileHandler,
  getReviewsByUserHandler,
  sendContactEmailHandler,
  getOrderDetailHandler,
  getWishlistByUserHandler,
  sendMailHandler,
  getDefaultAddressHandler,
  confirmEmailHandler,
  getAddressesByIdHandler,
  sendResetPassHandler,
  ResetPassHandler,
  updateOrderStatusHandler,
  addUserVoucherHandler,
  getAllUsersHandler,
  updateUsersHandler,
};
