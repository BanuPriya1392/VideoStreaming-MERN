const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

const categoryImages = {
  "AI": ["1677442136019-21780ecad995", "1620712946870-11b71373ad9b", "1509228468518-180dd4f852bc"],
  "Cinema": ["1485846234645-a62644f84728", "1440404653325-ab127d49abc1", "1475070929565-c985b496cb9f"],
  "Education": ["1503676260728-1c00da096a0b", "1434039390530-076a501df3f5", "1524995997946-a1c2e315a42f"],
  "Family": ["1511895426328-dc8714191300", "1536640712-4d4c36ff0e4e", "1491333078122-038bca87779f"],
  "Gaming": ["1542751371-adc38448a05e", "1511512578047-dfb367046420", "1538481199705-c710c4e965fc"],
  "Lifestyle": ["1469474968028-56623f02e42e", "1511632765486-a01980e01a18", "1523275335684-37898b6baf30"],
  "Live": ["1517976487492-5750f3195933", "1501281668745-f7f57925c3b4", "1533174072545-7a4b6ad7a6c3"],
  "Music": ["1511379938547-c1f69419868d", "1514525253344-932d5ef9eaff", "1508700115892-45ecd05ae2ad"],
  "Science": ["1635070041078-e363dbe005cb", "1532094349884-54a21159af8c", "1451187580459-43490279c0fa"],
  "Sports": ["1461896756970-4384666cf647", "1517649763962-0c623066013b", "1504450758481-7338eba7524a"],
  "Tech": ["1498050108023-c5249f4df085", "1518770660439-4636190af475", "1550745165-9bc0b252726f"],
  "Vlog": ["1516035069371-29a1b244cc32", "1520110120305-650117b4ec2e", "1476512398462-cc5a36c423c5"],
  "Other": ["1441974231531-c6227db76b6e", "1501785888041-af3ef285b470", "1464822759023-ed6303ad335b"]
};

async function fixThumbnails() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const videos = await Video.find({});
    console.log(`Fixing ${videos.length} thumbnails...`);

    const bulkOps = videos.map((video, index) => {
      const ids = categoryImages[video.tag] || categoryImages["Other"];
      const unsplashId = ids[index % ids.length];
      
      // Stable Unsplash image URL with unique seed/sig to force different crops or variants if available
      const fixedUrl = `https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&q=80&w=800&sig=${video._id}`;
      
      return {
        updateOne: {
          filter: { _id: video._id },
          update: { $set: { thumbnail: fixedUrl } }
        }
      };
    });

    if (bulkOps.length > 0) {
      const result = await Video.bulkWrite(bulkOps);
      console.log(`Successfully fixed ${result.modifiedCount} thumbnails!`);
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error fixing thumbnails:", err);
    process.exit(1);
  }
}

fixThumbnails();
