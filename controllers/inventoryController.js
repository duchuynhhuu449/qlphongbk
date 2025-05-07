const Inventory = require('../models/inventoryModel');

// exports.saveRoom = async (req, res) => {
//   try {
//     const { roomNumber, checkInTime, checkOutTime, totalPrice } = req.body;
//     const newRoom = new Room({ roomNumber, checkInTime, checkOutTime, totalPrice });
//     await newRoom.save();
//     res.status(201).json({ message: "Lưu thành công", room: newRoom });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi lưu phòng", error });
//   }
// };

exports.themnuoc = async (req, res) => {
    const { tenNuoc, soLuongDau,soLuongCuoi } = req.body;

    if (!tenNuoc || !soLuongDau) return res.status(400).json({ msg: "Vui lòng cung cấp tên nước" });

    const tonTai = await Inventory.findOne({ tenNuoc }).sort({ ngay: -1 });
	
	
    if (tonTai) return res.status(400).json({ msg: "Đã có loại nước này, hãy dùng chức năng cập nhật." });

    const nuocMoi = new Inventory({
        tenNuoc,
        soLuongDau,
        nhap: 0,
        ban: 0,
        loi: 0,
        thucTeCuoiKy: 0,
        lech: 0
    });

    await nuocMoi.save();
    res.json(nuocMoi);
}

exports.capnhatluotban = async (req, res) => {
    try {
        const { tenNuoc, soLuong, nhap } = req.body;

        if (!tenNuoc) return res.status(400).json({ msg: "Vui lòng cung cấp tên nước" });

        const kyCuoi = await Inventory.findOne({ tenNuoc }).sort({ ngay: -1 });
        if (!kyCuoi) return res.status(404).json({ msg: "Không tìm thấy loại nước" });
		
		if(soLuong > (kyCuoi.soLuongDau - kyCuoi.ban)) {
			return res.status(200).json({ msg: "Hành vi của bạn đã bị chặn" });
		}
		
		
        kyCuoi.ban = (kyCuoi.ban || 0) + soLuong;
        kyCuoi.nhap = (kyCuoi.nhap || 0) + nhap;

        await kyCuoi.save();
        res.json(kyCuoi);
    } catch (err) {
        res.status(500).json({ msg: "Lỗi server", error: err.message });
    }
};


exports.kiemkethu = async (req, res) => {
    const { tenNuoc } = req.params;
    const ky = await Inventory.findOne({ tenNuoc }).sort({ ngay: -1 });
    if (!ky) return res.status(404).json({ msg: "Không tìm thấy loại nước" });
    
    const soluongDau = ky.soLuongDau || 0;
    const nhap = ky.nhap || 0;
    const ban = ky.ban || 0;
    const soLuongCuoi = soLuongDau - ban;
    const lech = soluongDau - soLuongCuoi - ban


    res.json({ soluongDau, nhap, soLuongCuoi,ban, lech, thongTin: ky });
}


exports.kiemkethuall = async (req, res) => {
    try {
		const danhSach = await Inventory.find();

		const ketQua = [];

		danhSach.forEach(nuoc => {
		  ketQua.push({
			tenNuoc: nuoc.tenNuoc,
			soLuongDau: (nuoc.soLuongDau + nuoc.nhap),
			nhap: nuoc.nhap,
			ban: nuoc.ban,
			thucTeCuoiKy: (nuoc.soLuongDau + nuoc.nhap) - nuoc.ban
		  });
		});

		res.json(ketQua);
  } catch (err) {
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
}

exports.capNhatKiemKe = async (req, res) => {
  try {
    const danhSach = await Inventory.find();

    for (const nuoc of danhSach) {
      const thucTeCuoiKy = (nuoc.soLuongDau || 0) - (nuoc.ban || 0);

      await Inventory.findByIdAndUpdate(nuoc._id, {
        soLuongDau: thucTeCuoiKy,
        nhap: 0,
        ban: 0
      });
    }

    res.json({ msg: "Cập nhật kiểm kê thành công" });
  } catch (err) {
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};



exports.xoanuoc = async (req, res) => {  
    const { tenNuoc } = req.params;

    if(tenNuoc === 'all') {
        const nuoc = await Inventory.deleteMany({})
        return res.json({status:200, msg: "Xóa hết tất cả", nuoc });
    }
    const nuoc = await Inventory.findOneAndDelete({ tenNuoc: tenNuoc })
    if(!nuoc) {
        return res.status(404).json({ msg: "Không tìm thấy loại nước" });
    }

    res.json({status:200, msg: "Xóa thành công", nuoc });
}


exports.layTatCaNuoc = async (req, res) => {
  try {
    const danhSach = await Inventory.find();

    const ketQua = [];

    danhSach.forEach(nuoc => {
      ketQua.push({
        tenNuoc: nuoc.tenNuoc,
        soLuongDau: nuoc.soLuongDau,
        nhap: nuoc.nhap,
        ban: nuoc.ban,
        loi: nuoc.loi,
        thucTeCuoiKy: (nuoc.soLuongDau + nuoc.nhap) - nuoc.ban,
        lech: nuoc.lech
      });
    });

    res.json(ketQua);
  } catch (err) {
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};
