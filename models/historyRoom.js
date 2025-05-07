const mongoose = require("mongoose");

const historyRoomSchema = new mongoose.Schema({
  roomNumber: { type: Number, required: true }, // Số phòng
  checkInDate: { type: Date, required: true }, // Ngày nhận phòng
  checkOutDate: { type: Date, required: true }, // Ngày trả phòng
  totalAmount: { type: String, required: true }, // Tổng số tiền
  description: { type: String, required: true }, // Tổng số tiền
  createdAt: { type: Date, default: Date.now }, // Ngày tạo lịch sử
});

const History = mongoose.model("histories", historyRoomSchema);

module.exports = History;
