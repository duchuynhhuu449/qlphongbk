const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  hovaten: { type: String, required: true },
  SoPhong: { type: Number, required: false }, // Không nên unique nếu muốn lưu nhiều tháng
  GiaPhong: { type: Number, required: true }, // Giá phòng theo tháng
  chisodiencu: { type: Number, required: true },
  chisodienmoi: { type: Number, required: true },
  chisonuoclanhcu: { type: Number, required: true },
  chisonuoclanhmoi: { type: Number, required: true },
  chisonuocnongcu: { type: Number, required: true },
  chisonuocnongmoi: { type: Number, required: true },
  sinhhoatchung: { type: Number, required: true },
  ghichu: { type: String, default: "" },
  loainuoc: { type: String, default: "chiso" },
  songuoikhoang: { type: Number, default: 0 }, // Không bắt buộc phải ghi
  giakhoangnuoc: { type: Number,default: 90000 }, // Không bắt buộc phải ghi
 
}, { timestamps: true });

const RoomMonth = mongoose.models.RoomMonth || mongoose.model('RoomMonth', roomSchema);


module.exports = RoomMonth;
