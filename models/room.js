const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: { type: Number, required: true, unique: true }, // Số phòng
  daily: { type: Number, required: true }, // Giá phòng ngày
  firstHour: { type: Number, required: true }, // giờ đầu tiên
  extraHour: { type: Number, required: true }, // thêm giờ
  checkInDate: { type: Date, required: false }, // Ngày nhận phòng
  checkOutDate: { type: Date, required: false }, // Ngày trả phòng
  ghichu: { type: Number, required: false }, // Ngày trả phòng
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;