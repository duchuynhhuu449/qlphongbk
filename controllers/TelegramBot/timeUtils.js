function formatDateTime(date) {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  
  function convertToISODate(str) {
    return str.split(" ")[0]; // "2025-05-02 12:00:00" => "2025-05-02"
  }
  
  function getHolidayDays(start, end, holidays) {
    const holidayCounts = {};
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);
  
    while (current <= endDate) {
      const currentStr = current
        .toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
        .replace(/\//g, "-");
      if (holidays[currentStr]) {
        holidayCounts[holidays[currentStr]] =
          (holidayCounts[holidays[currentStr]] || 0) + 1;
      }
      current.setDate(current.getDate() + 1);
    }
    return holidayCounts;
  }
  
  module.exports = { formatDateTime, convertToISODate, getHolidayDays };
  