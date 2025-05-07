const Room = require('../models/RoomMonth'); // đảm bảo đúng đường dẫn

exports.addRoom = async (req, res) => {
    const data = req.body;

    try {
        // Danh sách trường bắt buộc
        const requiredFields = [
            'hovaten', 'SoPhong', 'GiaPhong',
            'chisodiencu', 'chisodienmoi',
            'chisonuoclanhcu', 'chisonuoclanhmoi',
            'chisonuocnongcu', 'chisonuocnongmoi',
            'sinhhoatchung', 'ghichu'
        ];

        // Kiểm tra từng trường có bị thiếu không
        for (let field of requiredFields) {
            if (data[field] === undefined || data[field] === '') {
                return res.status(400).json({ message: `Thiếu trường bắt buộc: ${field}` });
            }
        }

        // Kiểm tra giá phòng
        if (Number(data.GiaPhong) <= 0) {
            return res.status(400).json({ message: 'Giá phòng phải lớn hơn 0' });
        }

        // Kiểm tra chỉ số có âm không
        const numericFields = [
            'chisodiencu', 'chisodienmoi',
            'chisonuoclanhcu', 'chisonuoclanhmoi',
            'chisonuocnongcu', 'chisonuocnongmoi',
            'sinhhoatchung'
        ];
        for (let field of numericFields) {
            if (Number(data[field]) < 0) {
                return res.status(400).json({ message: `Trường ${field} không được âm` });
            }
        }

        const chisodiencu = Number(data.chisodiencu);
        const chisodienmoi = Number(data.chisodienmoi);

    
        // Nếu không, kiểm tra như bình thường
            if (chisodiencu < chisodienmoi) {
                return res.status(400).json({ message: 'Chỉ số điện mới phải lớn hơn chỉ số điện cũ' });
            }
   

        // Tạo mới phòng
        const newRoom = new Room(data); // không cần { data } mà truyền thẳng
        await newRoom.save();

        res.status(200).json({ message: 'Phòng đã được thêm vào', room: newRoom });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};


exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ SoPhong: 1 }); // Sắp xếp theo số phòng tăng dần
        res.status(200).json({ message: "Lấy dữ liệu thành công", data: rooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu", error });
    }
};

exports.deletedRoom = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === "all") {
            await Room.deleteMany({});
            return res.status(200).json({ message: "Đã xóa toàn bộ dữ liệu thành công" });
        }

        const deleted = await Room.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Không tìm thấy phòng để xóa" });
        }

        res.status(200).json({ message: "Đã xóa dữ liệu thành công" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server, không xóa được dữ liệu", error });
    }
};


// UPDATE FILED ROOM
exports.updateRoom = async (req, res) => {
    const requiredFields = [
        'hovaten', 'SoPhong', 'GiaPhong',
        'chisodiencu', 'chisodienmoi',
        'chisonuoclanhcu', 'chisonuoclanhmoi',
        'chisonuocnongcu', 'chisonuocnongmoi',
        'sinhhoatchung', 'ghichu', 'loainuoc', 'giakhoangnuoc', 'songuoikhoang'
    ];
    try {
        const { id } = req.params;
        const updates = req.body;

        // Kiểm tra có trường không hợp lệ không
        const invalidFields = Object.keys(updates).filter(key => !requiredFields.includes(key));
        if (invalidFields.length > 0) {
            return res.status(400).json({ message: `Trường không hợp lệ: ${invalidFields.join(", ")}` });
        }

        // Nếu có update số âm
        for (let key of ['GiaPhong', 'chisodiencu', 'chisodienmoi', 'chisonuoclanhcu', 'chisonuoclanhmoi', 'chisonuocnongcu', 'chisonuocnongmoi', 'sinhhoatchung']) {
            if (updates[key] !== undefined && updates[key] < 0) {
                return res.status(400).json({ message: `Trường ${key} không được âm` });
            }
        }

        // Kiểm tra chỉ số mới phải lớn hơn chỉ số cũ
       

        const updatedRoom = await Room.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedRoom) {
            return res.status(404).json({ message: "Không tìm thấy phòng để cập nhật" });
        }

        res.status(200).json({ message: "Cập nhật thành công", data: updatedRoom });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật", error });
    }
};