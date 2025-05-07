const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN_TELEGRAM;

// Token Telegram
const bot = new TelegramBot(token, { polling: true });

const roomRoutes = require("./routes/roomRoutes");
const RoomMonth = require("./controllers/TelegramBot/thang");
const { handleRoomCommand } = require("./controllers/TelegramBot/ngay");

const app = express();
app.use(cors());
app.use(express.json());

// Chạy front-end trực tiếp trên máy
app.use(express.static("public"));


// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Kết nối MongoDB thành công"))
  .catch(err => console.log("Lỗi kết nối MongoDB", err));

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (/^\/(\d{3})\s*r?$/.test(text)) return;

    RoomMonth.UpdateRoomMonth(bot, msg)

    bot.sendMessage(chatId, `bạn vừa gửi ${text}`);
  });

  // Xử lý lệnh dạng /001, /101, /003...
  bot.onText(/^\/(\d{3})\s*r?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const roomNumber = match[1];

    const regex = match[0].split(" ")[1];

  
    try {
      const response = await handleRoomCommand(roomNumber,regex);
     
      bot.sendMessage(chatId, `Phòng ${roomNumber}: ${response}`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, "Đã xảy ra lỗi khi xử lý phòng.");
    }
  });
  
// Sử dụng Routes
app.use("/api", roomRoutes);
app.get('/download-contract', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'robots.txt');  // Đảm bảo đúng đường dẫn

  // Kiểm tra nếu tệp tồn tại
  res.download(filePath, 'robots.txt', (err) => {
    if (err) {
      console.error('Lỗi khi tải tệp:', err);
      res.status(500).send('Lỗi khi tải tệp.');
    }
  });
});

app.listen(3000, () => console.log("Server chạy trên cổng 3000"));
