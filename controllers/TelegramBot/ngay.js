const Room = require("../../models/room");
const { formatDateTime, getHolidayDays } = require("./timeUtils");

const handleRoomCommand = async(roomNumberInput,regex) => {
  const roomNumber = parseInt(roomNumberInput);
  const dataRoom = await Room.findOne({roomNumber: roomNumber});

  if (!dataRoom) return "❌ Không tìm thấy phòng.";

  

  const now = new Date();

  if(regex == "r") {
    dataRoom.checkInDate = "";
    await dataRoom.save();
    return `Phòng đã được xóa thành công`
  }

  if (!dataRoom.checkInDate) {
    // Nếu chưa nhận phòng thì cập nhật ngày nhận là thời gian hiện tại
    dataRoom.checkInDate = formatDateTime(now);
    await dataRoom.save();
    return `✅ Đã cập nhật ngày nhận phòng cho phòng ${roomNumber} là ${formatDateTime(now)}`;
  }

 


  const start = new Date(dataRoom.checkInDate);
  const end = now;

  if (end <= start) {
    return "❌ Thời gian trả phải sau thời gian nhận.";
  }

  const diffMs = end - start;
  const diffMinutes = Math.ceil(diffMs / 60000);
  const diffHours = Math.ceil(diffMs / 3600000);
  const startHour = start.getHours();
  const endHour = end.getHours();
  const isSameDay = start.toDateString() === end.toDateString();
  const isNightStay =
    startHour >= 19 &&
    startHour <= 23 &&
    endHour >= 0 &&
    endHour <= 2 &&
    diffHours <= 9;

  let total = 0;
  const notes = [];

  const holidays = {
    "01-01": "Tết Dương Lịch",
    "30-04": "Giải phóng miền Nam",
    "01-05": "Quốc tế Lao động",
    "02-09": "Quốc khánh",
  };

  let surcharge = 0;
  let holidaySurcharge = 0;
  let holidayHours = 0;

  if (isSameDay || isNightStay) {
    // Tính theo giờ
    total = dataRoom.firstHour;
    notes.push(`Giờ đầu: ${dataRoom.firstHour.toLocaleString()} VNĐ`);

    const extraMinutes = diffMinutes - 60;
    const extraHoursCharged =
      extraMinutes > 0 ? Math.floor((extraMinutes + 45) / 60) : 0;

    if (extraHoursCharged > 0) {
      let temp = new Date(start);
      temp.setMinutes(temp.getMinutes() + 60);

      let totalExtraHourSurcharge = 0;
      let holidayHourCount = 0;

      for (let i = 0; i < extraHoursCharged; i++) {
        const currentStr = temp
          .toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
          .replace(/\//g, "-");

        const isHoliday = holidays[currentStr];
        const hourPrice = dataRoom.extraHour + (isHoliday ? 10000 : 0);
        totalExtraHourSurcharge += hourPrice;
        if (isHoliday) holidayHourCount++;

        temp.setHours(temp.getHours() + 1);
      }

      notes.push(
        `Phụ thu: ${extraHoursCharged} giờ x ${dataRoom.extraHour.toLocaleString()} VNĐ ${
          holidayHourCount ? `(Ngày lễ: ${holidayHourCount} giờ)` : ""
        } = ${totalExtraHourSurcharge.toLocaleString()} VNĐ`
      );

      total += totalExtraHourSurcharge;
    }
  } else {
    // Qua đêm
    if (startHour >= 5 && startHour <= 12) {
      const surchargeHours = 12 - startHour;
      if (surchargeHours > 0) {
        surcharge += surchargeHours * dataRoom.extraHour;
        notes.push(
          `Phụ thu nhận sớm: ${surchargeHours} giờ x ${dataRoom.extraHour.toLocaleString()} VNĐ`
        );
      }
    }

    const firstDayEnd = new Date(start);
    firstDayEnd.setDate(firstDayEnd.getDate() + 1);
    firstDayEnd.setHours(12, 0, 0, 0);

    if (end <= firstDayEnd) {
      total = dataRoom.daily;
      notes.push(`Tính 1 ngày: ${dataRoom.daily.toLocaleString()} VNĐ`);
    } else {
      const lastNoon = new Date(end);
      lastNoon.setHours(12, 0, 0, 0);
      const fullDays = Math.round((lastNoon - firstDayEnd) / 86400000) + 1;
      total = fullDays * dataRoom.daily;
      notes.push(`${fullDays} ngày x ${dataRoom.daily.toLocaleString()} VNĐ`);
    }

    if (endHour >= 12) {
      const extraHours = endHour - 12;
      if (extraHours > 0) {
        surcharge += extraHours * dataRoom.extraHour;
        notes.push(
          `Phụ thu trả muộn: ${extraHours} giờ x ${dataRoom.extraHour.toLocaleString()} VNĐ`
        );
      }
    }

    const holidayCounts = getHolidayDays(start, end, holidays);
    for (const name in holidayCounts) {
      holidaySurcharge += holidayCounts[name] * 100000;
      notes.push(`Qua đêm ngày lễ ${name}: +100,000 VNĐ`);
    }

    if (endHour >= 12) {
      const extraHours = endHour - 12;
      if (extraHours > 0) {
        const temp = new Date(start);
        while (temp <= end) {
          const currentStr = temp
            .toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            })
            .replace(/\//g, "-");
          if (holidays[currentStr]) {
            holidayHours = extraHours;
            holidaySurcharge += extraHours * 10000;
            break;
          }
          temp.setHours(temp.getHours() + 1);
        }
      }
    }
  }

  if (holidayHours > 0) {
    notes.push(
      `Phụ thu ${holidayHours} giờ lễ x 10,000 VNĐ = ${(
        holidayHours * 10000
      ).toLocaleString()} VNĐ`
    );
  }

  if (holidaySurcharge > 0) {
    notes.push(`Tổng phụ thu lễ: +${holidaySurcharge.toLocaleString()} VNĐ`);
  }

  total += surcharge + holidaySurcharge;

  notes.push(
    `🕓 Tổng thời gian: ${
      diffMinutes >= 1440
        ? `${Math.floor(diffMinutes / 1440)} ngày${
            diffMinutes % 1440
              ? ` ${Math.floor((diffMinutes % 1440) / 60)} giờ ${
                  diffMinutes % 60
                } phút`
              : ""
          }`
        : `${Math.floor(diffMinutes / 60)} giờ ${diffMinutes % 60} phút`
    }`
  );

  notes.push(`💵 Tổng tiền: ${total.toLocaleString()} VNĐ`);

  return notes.join("\n");
};

module.exports = { handleRoomCommand };
