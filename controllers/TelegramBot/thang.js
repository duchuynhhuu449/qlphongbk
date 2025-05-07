
const RoomMonth = require("../../models/roomMonth")

exports.UpdateRoomMonth = async(bot,msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  const lines = text.split('\n');

for (const line of lines) {
  const parts = line.trim().split(' ');
  if (parts.length !== 4) {
    await bot.sendMessage(chatId, `Sai định dạng ở dòng: "${line}". Gửi theo mẫu: 001 18 118 3289`);
    continue;
  }

  const [soPhong, nuocNongMoi, nuocLanhMoi, dienMoi] = parts.map(x => parseInt(x));

  if ([soPhong, nuocNongMoi, nuocLanhMoi, dienMoi].some(isNaN)) {
    await bot.sendMessage(chatId, `Dữ liệu sai ở dòng: "${line}"`);
    continue;
  }

  const updated = await RoomMonth.findOneAndUpdate(
    { SoPhong: soPhong },
    {
      chisonuocnongmoi: nuocNongMoi,
      chisonuoclanhmoi: nuocLanhMoi,
      chisodienmoi: dienMoi
    },
    { new: true }
  );

  if (updated) {
    await bot.sendMessage(chatId, `✅ Đã cập nhật phòng ${soPhong}`);
  } else {
    await bot.sendMessage(chatId, `❌ Không tìm thấy phòng ${soPhong}`);
  }
}

}