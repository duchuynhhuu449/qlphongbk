const Room = require("../models/room");
const History = require("../models/historyRoom");
const moment = require("moment-timezone"); // Thư viện xử lý thời gian
// Lưu thông tin đặt phòng
exports.saveRoom = async (req, res) => {
  try {
    const { roomNumber, checkInTime, checkOutTime, totalPrice } = req.body;
    const newRoom = new Room({ roomNumber, checkInTime, checkOutTime, totalPrice });
    await newRoom.save();
    res.status(201).json({ message: "Lưu thành công", room: newRoom });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lưu phòng", error });
  }
};


exports.History = async (req, res) => {
  try {
    const data = req.body;

    const formattedCheckInDate = moment(data.checkInDate, "HH:mm DD/MM/YYYY").tz("Asia/Ho_Chi_Minh").toDate();
    const formattedCheckOutDate = moment(data.checkOutDate, "HH:mm DD/MM/YYYY").tz("Asia/Ho_Chi_Minh").toDate();

    const history = new History({
      roomNumber: data.roomNumber,
      totalAmount: (data.totalAmount), // ép thành số
      checkInDate: formattedCheckInDate,
      checkOutDate: formattedCheckOutDate,
      description: data.description,
    });

    await history.save();

    res.status(200).json({ message: "Lưu lịch sử ở thành công" });

  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lưu lịch sử", error });
  }
};


exports.updateRoom = async (req, res) => {
    try {
      const { roomNumber, checkInTime, checkOutTime,extraHour,firstHour,daily } = req.body;
  
      // Tìm phòng theo roomNumber
      const existingRoom = await Room.findOne({ roomNumber });
  
      if (!existingRoom) {
        return res.status(404).json({ message: "Phòng không tồn tại" });
      }
  
      // Cập nhật dữ liệu

      existingRoom.extraHour = extraHour || existingRoom.extraHour;
      existingRoom.firstHour = firstHour || existingRoom.firstHour;
      existingRoom.daily = daily || existingRoom.daily;
      existingRoom.checkInTime = checkInTime || existingRoom.checkInTime;
      existingRoom.checkOutTime = checkOutTime || existingRoom.checkOutTime;
  
      await existingRoom.save();
  
      res.json({ message: "Cập nhật thành công", room: existingRoom });
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật phòng", error });
    }
  };
  

  exports.getRooms = async (req, res) => {
    try {
        // Thêm .lean() để nhận plain JavaScript objects thay vì Mongoose documents
        const rooms = await Room.find().lean();

        // Chuyển đổi thời gian cho từng phòng
        const updatedRooms = rooms.map(room => {
            const updatedRoom = { ...room };

            // Chuyển đổi checkInDate
            if (updatedRoom.checkInDate) {
                updatedRoom.checkInDate = moment(updatedRoom.checkInDate)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("YYYY-MM-DD HH:mm:ss");
            }

            // Chuyển đổi checkOutDate
            if (updatedRoom.checkOutDate) {
                updatedRoom.checkOutDate = moment(updatedRoom.checkOutDate)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("YYYY-MM-DD HH:mm:ss");
            }

            return updatedRoom;
        });

        res.json(updatedRooms);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách phòng", error });
    }
};


exports.HistoryRooms = async (req, res) => {
  try {
    const { type } = req.params;
  
    if (type === "all") {
      // Thêm .lean() để nhận plain JavaScript objects thay vì Mongoose documents
      const rooms = await History.find().lean();
  
      // Chuyển đổi thời gian cho từng phòng
      const updatedRooms = rooms.map(room => {
        const updatedRoom = { ...room };
  
        // Chuyển đổi checkInDate
        if (updatedRoom.checkInDate) {
          updatedRoom.checkInDate = moment(updatedRoom.checkInDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("YYYY-MM-DD HH:mm:ss");
        }
  
        // Chuyển đổi checkOutDate
        if (updatedRoom.checkOutDate) {
          updatedRoom.checkOutDate = moment(updatedRoom.checkOutDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("YYYY-MM-DD HH:mm:ss");
        }
  
        return updatedRoom;
      });
  
      return res.json(updatedRooms);
    } else if (type === "delete") {
      // Xóa tất cả dữ liệu trong History
      await History.deleteMany({});
      return res.status(200).json({
        success: true,
        message: "All history records have been deleted successfully"
      });
    } else {
	  await History.findByIdAndDelete(type);	
      return res.status(200).json({
		status: 200,
        success: true,
        message: `${type} All history records have been deleted successfully`
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request"
    });
  }
};





exports.addRoom = async (req, res) => {
  try {
    // Lấy dữ liệu từ req.body thay vì req.query
    let { roomNumber, daily, firstHour, extraHour, checkInDate, checkOutDate } = req.body;

    // Kiểm tra nếu thiếu dữ liệu
    if (![roomNumber, daily, firstHour, extraHour].every(Boolean)) {
      return res.status(400).json({ message: "Thiếu thông tin phòng" });
    }

    // Chuyển đổi roomNumber thành số và kiểm tra hợp lệ
    roomNumber = Number(roomNumber);
    if (isNaN(roomNumber) || roomNumber <= 0) {
      return res.status(400).json({ message: "Số phòng không hợp lệ" });
    }

    // Kiểm tra xem phòng đã tồn tại chưa
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: `Phòng số ${roomNumber} đã tồn tại` });
    }

    // Chuyển đổi ngày từ dd-MM-yyyy sang định dạng Date của MongoDB và đồng bộ với múi giờ Việt Nam
    const formattedCheckInDate = moment(checkInDate, "DD-MM-YYYY").tz("Asia/Ho_Chi_Minh").toDate();
    const formattedCheckOutDate = moment(checkOutDate, "DD-MM-YYYY").tz("Asia/Ho_Chi_Minh").toDate();

    // Tạo phòng mới
    const newRoom = new Room({
      roomNumber,
      daily: Number(daily),
      firstHour: Number(firstHour),
      extraHour: Number(extraHour)
    });

    // Lưu phòng vào database
    await newRoom.save();

    // Trả về kết quả
    res.json({ message: "Thêm phòng thành công", room: newRoom });
  } catch (error) {
    // Xử lý lỗi nếu có
    res.status(500).json({ message: "Lỗi thêm phòng", error: error.message });
  }
};


exports.editRoom = async (req, res) => {
  try {
    const { roomNumber, newDetails } = req.body;
	
	if(newDetails.deleted) {
		await Room.findByIdAndDelete(roomNumber);	
		return res.status(200).json({
				  success: true,
				  message: "Room updated successfully"
		});
	}

    // Kiểm tra đầu vào hợp lệ
    if (!roomNumber || typeof newDetails !== "object" || Object.keys(newDetails).length === 0) {
      return res.status(400).json({ success: false, message: "Invalid roomNumber or newDetails" });
    }

    // Xử lý định dạng ngày giờ
    const format = "DD-MM-YYYY HH:mm";

    if (newDetails.checkInDate) {
      const parsed = moment(newDetails.checkInDate, format, true);
      if (!parsed.isValid()) {
        return res.status(400).json({ success: false, message: "Invalid checkInDate format" });
      }
      newDetails.checkInDate = parsed.tz("Asia/Ho_Chi_Minh").toDate();
    }

    if (newDetails.checkOutDate) {
      const parsed = moment(newDetails.checkOutDate, format, true);
      if (!parsed.isValid()) {
        return res.status(400).json({ success: false, message: "Invalid checkOutDate format" });
      }
      newDetails.checkOutDate = parsed.tz("Asia/Ho_Chi_Minh").toDate();
    }

    // Cập nhật thời gian updatedAt
    newDetails.updatedAt = moment().tz("Asia/Ho_Chi_Minh").toDate();

    // Cập nhật thông tin phòng
    const updatedRoom = await Room.findOneAndUpdate(
      { roomNumber },
      newDetails,
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ success: false, message: `Room with number ${roomNumber} not found` });
    }

    // Format lại kết quả trả về
    if (updatedRoom.checkInDate) {
      updatedRoom.checkInDate = moment(updatedRoom.checkInDate).tz("Asia/Ho_Chi_Minh").format(format);
    }

    if (updatedRoom.checkOutDate) {
      updatedRoom.checkOutDate = moment(updatedRoom.checkOutDate).tz("Asia/Ho_Chi_Minh").format(format);
    }

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


exports.resetRoomDates = async (req, res) => {
  try {
    const { roomNumber } = req.params;

    // Nếu param là 'all', xóa checkInDate và checkOutDate của tất cả các phòng
    if (roomNumber === "all") {
      // Cập nhật tất cả các phòng, xóa checkInDate và checkOutDate
      await Room.updateMany(
        {},
        {
          $unset: {
            checkInDate: "",
            checkOutDate: ""
          }
        }
      );
      return res.status(200).json({
        success: true,
        message: "All room dates have been reset successfully"
      });
    }

    // Nếu có roomNumber, xóa checkInDate và checkOutDate cho phòng đó
    const updatedRoom = await Room.findOneAndUpdate(
      { roomNumber },
      {
        $unset: {
          checkInDate: "",
          checkOutDate: ""
        }
      },
      { new: true }
    );

    // Nếu không tìm thấy phòng
    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: `Room with number ${roomNumber} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: `Room ${roomNumber} dates have been reset successfully`,
      room: updatedRoom
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
