
const mongoose = require("mongoose");

const kiemKeSchema = new mongoose.Schema({
    tenNuoc: String,
    soLuongDau: Number,
    nhap: { type: Number, default: 0 },
    ban: { type: Number, default: 0 },
    loi: { type: Number, default: 0 },
    thucTeCuoiKy: Number,
    lech: Number,
    ngay: { type: Date, default: Date.now }
  });
  
module.exports = mongoose.model('KiemKe', kiemKeSchema);