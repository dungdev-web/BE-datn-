const axios = require("axios");
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");
const productRepository = require("../../repository/productRepository");
const userRepository = require("../../repository/userRepository");
const { renderOrderEmail } = require("../../../utils/orderEmailTemplate");

// ✅ Lấy từ .env — không hardcode key
const config = {
  app_id:   process.env.ZALOPAY_APP_ID  ,
  key1:     process.env.ZALOPAY_KEY1    ,
  key2:     process.env.ZALOPAY_KEY2    ,
  endpoint: process.env.ZALOPAY_ENDPOINT ,
  queryUrl: "https://sb-openapi.zalopay.vn/v2/query",
};

const FRONTEND_URL = process.env.FRONTEND_URL;

// ✅ Tự động chọn callback URL theo môi trường
const getCallbackUrl = () => {
  if (process.env.ZALOPAY_CALLBACK_URL) return process.env.ZALOPAY_CALLBACK_URL;
  if (process.env.NGROK_URL) return `${process.env.NGROK_URL}/api/payment/zalopay/callback`;

  const port = process.env.PORT || 3000;
  console.warn("⚠️  Chưa có CALLBACK_URL — callback từ ZaloPay sẽ không nhận được ở local.");
  return `http://localhost:${port}/api/payment/zalopay/callback`;
};

// Map lưu app_trans_id ↔ order_id
const transIdMap = new Map();

module.exports = {
  createPayment: async ({ amount, order_data }) => {
    const transID = Math.floor(Math.random() * 1000000);

    const embed_data = {
      order_data,
      redirecturl: `${FRONTEND_URL}/checkout?payment=success`,
    };

    const order = {
      app_id:       config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
      app_user:     String(order_data.user_id || "user"),
      app_time:     Date.now(),
      item:         JSON.stringify([{}]),
      embed_data:   JSON.stringify(embed_data),
      amount,
      description:  `Thanh toán đơn hàng`,
      callback_url: getCallbackUrl(), // ✅ đúng route
    };

    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const result = await axios.post(config.endpoint, null, { params: order });

    return {
      ...result.data,
      app_trans_id: order.app_trans_id,
    };
  },

  handleCallback: async (body) => {
    try {
      const dataStr = body.data;
      const reqMac  = body.mac;

      // ✅ Verify chữ ký từ ZaloPay
      const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      if (reqMac !== mac) {
        return { return_code: -1, return_message: "mac not equal" };
      }

      const dataJson  = JSON.parse(dataStr);
      const embedData = JSON.parse(dataJson.embed_data || "{}");
      const orderData = embedData.order_data;

      // ✅ Kiểm tra lại trạng thái giao dịch với ZaloPay
      const status = await module.exports.checkStatus(dataJson.app_trans_id);

      if (status.return_code === 1) {
        const order = await productRepository.createOrder({
          ...orderData,
          payment_status: "PAID",
        });

        await productRepository.clearCart(order.user_id);
        transIdMap.set(dataJson.app_trans_id, order.orders_id);

        // 📩 Gửi email xác nhận
        const fullOrder = await userRepository.getOrderDetailById(order.orders_id);
        const html = renderOrderEmail(fullOrder);

        if (fullOrder.user?.email) {
          const orderDate   = moment(order.created_at);
          const customSubject = `Đơn hàng TERA${orderDate.format("MM")}${orderDate.format("DD")}${order.orders_id} của bạn đã được xác nhận`;

          await userRepository.sendMail({
            to:      fullOrder.user.email,
            subject: customSubject,
            html,
          });
        }

        return {
          return_code:    1,
          return_message: "success",
          order_id:       order.orders_id,
          redirect_url:   `${FRONTEND_URL}/checkout?payment=success&orderId=${order.orders_id}`,
        };
      }

      return { return_code: 2, return_message: "payment not completed" };
    } catch (err) {
      console.error("ZaloPay callback error:", err);
      return { return_code: 0, return_message: err.message };
    }
  },

  checkStatus: async (app_trans_id) => {
    const postData = {
      app_id: config.app_id,
      app_trans_id,
    };

    const data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`;
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const result = await axios({
      method:  "post",
      url:     config.queryUrl,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data:    qs.stringify(postData),
    });

    return {
      ...result.data,
      order_id: transIdMap.get(app_trans_id) || null,
    };
  },
};