const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const inventoryController = require("../controllers/inventoryController");
const rommMonthController = require("../controllers/roomMonthController")

router.post("/edit-room", roomController.editRoom); 
router.post("/save-room", roomController.saveRoom);  // API lưu phòng
router.get("/rooms", roomController.getRooms);      // API lấy danh sách phòng
router.put("/update-room", roomController.updateRoom);
router.post("/addRoom", roomController.addRoom);
router.get("/reset/:roomNumber", roomController.resetRoomDates);
router.post("/history", roomController.History);
router.get("/history/:type", roomController.HistoryRooms);


// ROUTER QUẢN LÝ NƯỚC
router.get("/water", inventoryController.layTatCaNuoc); // API thêm nước
router.get("/deletewater/:tenNuoc", inventoryController.xoanuoc); // API thêm nước
router.post("/themnuoc", inventoryController.themnuoc); // API thêm nước
router.post("/update-water", inventoryController.capnhatluotban); // API thêm nước
router.get("/kiemhangthu/:tenNuoc", inventoryController.kiemkethu); // API thêm nước
router.get("/kiemhangthuall", inventoryController.kiemkethuall); // API thêm nước
router.get("/resetwt", inventoryController.capNhatKiemKe); // API thêm nước


// ROUTER QUẢN LÝ PHÒNG THÁNG
router.post("/addroom/v2", rommMonthController.addRoom)
router.get("/delete/:id/v2", rommMonthController.deletedRoom)
router.get("/getallroom/v2", rommMonthController.getAllRooms)
router.put("/update/:id/v2", rommMonthController.updateRoom)

module.exports = router;
