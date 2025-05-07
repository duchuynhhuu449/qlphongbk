const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017"; // sửa lại nếu dùng Atlas
const dbName = "hotel";

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Lấy danh sách collection
  const collections = await db.listCollections().toArray();

  for (const col of collections) {
    const name = col.name;
    const data = await db.collection(name).find({}).toArray();

    // Lưu ra file JSON
    fs.writeFileSync(`${name}.json`, JSON.stringify(data, null, 2));
    console.log(`Đã xuất ${name}.json`);
  }

  await client.close();
})();
