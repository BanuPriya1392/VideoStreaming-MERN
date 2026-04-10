const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

const unsplashData = {
  "AI": [
    "TQ3SgrW9lkM", "GVlcXhQejA8", "D0kAXDEaiLA", "bI__9vsuBWk", "3wXVwtdaESA",
    "6UDansS-rPI", "87Thc411Hk4", "lV5XjyVm2_4", "db2y7AD7s7M", "qUJ8fgoaLTg",
    "KgLtFCgfC28", "dxtkv8qLaY0", "HOt2zB6X-Gk", "dXA6R4ebEqU", "RpPu_1q5Wj0",
    "Jcw-i0fSqXg", "Wa-3T6d0rBo", "ndja2LJ4IcM", "DDRK6krBCp0", "Yri8m2hNSAU",
    "eSQGywY0bJA", "afB0QQw", "Oy2yXvl1WLg", "IGa3Md8wP6g", "nv3Z-1Nsd3g",
    "OAsF0QMRWlA", "G_vWviqUCCg", "5b9Lr-ggr0E", "EUsVwEOsblE", "HZfsCshPpiE",
    "qCodK5vqaNs", "7Ne_rNvQldw", "jIBMSMs4_kA", "aTWKwJllPOA", "nGoCBxiaRO0"
  ],
  "Cinema": [
    "LqjwbiEK9Y0", "evlkOfkQ5rE", "AtPWnYNDJnM", "h5cFbbecEuY", "ZHqgjvqilIQ",
    "Lj_yAu5pv9c", "Ki_BqNrHeW8", "lpNP3pN-U0Q", "hF-SdHIU2lQ", "4txHVae2MJ0",
    "95gv1W3gKqE", "EImlTna6gk4", "qB5yTiZOmCQ", "pPA5ActWLLI", "xq1eWTas_a0",
    "WYCeSzr7SQ4", "dnUNjIUCg5c", "9cqLeJoS46w", "AydzE_QRqAU", "FNqt7b6y_SU",
    "aUDO_eteuO4", "Hm_iFim94bw", "nBD3KFnUm5M", "AEeoY_aqvNk", "oOMqe02robg",
    "m3th3rIQ9-w", "dmGIrYLyWiE", "Evp4YfN18S0", "AtPWnYNDJ6s", "0L_P8id6oEk",
    "6dVGbYs-jRw", "tAaCtM453kM", "Geepgu8bCas", "X8_S2Yk4-o", "L7_9w6oIkMc"
  ],
  "Education": [
    "Sk9JF1KDz6M", "lUaaKCUANVI", "2JIvboGLeho", "OQMZwNd3ThU", "7mZ_F9zNn-8",
    "xPHmmVKS8lM", "KSt0_N9TP08", "jCIMcOpFHig", "4-4WPFLVhAY", "eqs9BAISBWU",
    "VLaKsTkmVhk", "TamMbr4okv4", "8yxXR118Tl8", "BCBGahg0MH0", "249nW4UKy0k",
    "OIuCXxx08yg", "4V1dC_eoCwg", "oTglG1D4hRA", "LBwXKHUC-d4", "NIJuEQw0RKg",
    "Xk9JF1KDz6k", "L7_9w6oIkMa", "9s9O6P_4u0e", "K_w8u6OIKMz"
  ],
  "Family": [
    "kzvbNEeEdeA", "_KYpkBOI_iE", "Wr3comVZJxU", "5NLCaz2wJXE", "cf1cN3ofKUM",
    "9RL7KC5f_Z8", "rpPvrOQmR2s", "bWTx0aWUKQg", "BIdWOnvInA", "DDRK6krBCp1",
    "Yri8m2hNSAV", "eSQGywY0bJB", "afB0QQx", "Oy2yXvl1WLy", "IGa3Md8wP6z",
    "nv3Z-1Nsd3h", "OAsF0QMRWlB", "G_vWviqUCCh", "5b9Lr-ggr0i", "EUsVwEOsblj",
    "HZfsCshPpiK", "qCodK5vqaNl", "7Ne_rNvQldm", "jIBMSMs4_kn", "qJjpx-s_nUo",
    "3c_k7h8YgHp", "aTWKwJllPOq", "nGoCBxiaROr", "pPA5ActWLLs", "xq1eWTas_at",
    "WYCeSzr7SQu", "dnUNjIUCg5v", "AydzE_QRqAx", "FNqt7b6y_Sy"
  ],
  "Gaming": [
    "GRkp_Xtd7Bg", "Mf23RF8xArY", "nCU4yq5xDEQ", "m3hn2Kn5Bns", "kFoddA8WiWQ",
    "rIPVJ6dMOPI", "9wjtGixx6Ls", "aQYgUYwnCsM", "TQ3SgrW9lkX", "GVlcXhQejAY",
    "D0kAXDEaiLZ", "bI__9vsuBWA", "3wXVwtdaESB", "6UDansS-rPC", "87Thc411HkD",
    "lV5XjyVm2_E", "db2y7AD7s7F", "qUJ8fgoaLTG", "KgLtFCgfC2H", "dxtkv8qLaYI",
    "HOt2zB6X-GJ", "dXA6R4ebEqK", "RpPu_1q5WjL", "Jcw-i0fSqXN", "Wa-3T6d0rBO",
    "ndja2LJ4IcP", "DDRK6krBCpQ", "Yri8m2hNSAR", "eSQGywY0bJS", "3c70f92a-50a5",
    "81ea62a8-25c8", "817a5a91-cf3d"
  ],
  "Lifestyle": [
    "JnmGOg7DfKw", "NTyBbu66_SI", "vXIn9i7_7aU", "b0Y1-kQTkiw", "0NaQQsLWLkA",
    "TamMbr4okvA", "8yxXR118TlA", "BCBGahg0MHB", "249nW4UKy0C", "OIuCXxx08yD",
    "4V1dC_eoCwE", "oTglG1D4hRF", "LBwXKHUC-dG", "NIJuEQw0RKH", "Xk9JF1KDz6I",
    "nv3Z-1Nsd3J", "OAsF0QMRWlK", "G_vWviqUCCL", "5b9Lr-ggr0M", "EUsVwEOsblN",
    "HZfsCshPpiO", "qCodK5vqaNP", "7Ne_rNvQldQ", "jIBMSMs4_kR", "qJjpx-s_nUS",
    "3c_k7h8YgHT", "aTWKwJllPOU", "nGoCBxiaROV", "pPA5ActWLLW", "xq1eWTas_aX",
    "WYCeSzr7SQY", "dnUNjIUCg5Z", "9cqLeJoS461", "AydzE_QRqA2", "FNqt7b6y_S3"
  ],
  "Live": [
    "vvSxIMDKP94", "0O0gux4OZX4", "8zsBofKrhP8", "GRkp_Xtd7Bh", "Mf23RF8xArI",
    "nCU4yq5xDEJ", "m3hn2Kn5BnK", "kFoddA8WiWQ", "rIPVJ6dMOPI", "9wjtGixx6Ls",
    "aQYgUYwnCsM", "TQ3SgrW9lkQ", "GVlcXhQejAR", "D0kAXDEaiLS", "bI__9vsuBWT",
    "3wXVwtdaESU", "6UDansS-rPV", "87Thc411HDW", "lV5XjyVm2_X", "db2y7AD7s7Y",
    "qUJ8fgoaLTZ", "KgLtFCgfC2I", "dxtkv8qLaYJ", "HOt2zB6X-GK", "dXA6R4ebEqL",
    "RpPu_1q5WjM", "Jcw-i0fSqXN", "Wa-3T6d0rBO", "ndja2LJ4IcP", "DDRK6krBCpQ",
    "3c70f92a-50aL", "81ea62a8-25cM"
  ],
  "Music": [
    "_RmMD8diftI", "YrtFlrLo2DQ", "DDRK6krBCp2", "Yri8m2hNSAC", "eSQGywY0bJD",
    "afB0QQS", "Oy2yXvl1WL0", "IGa3Md8wP61", "nv3Z-1Nsd32", "OAsF0QMRWl3",
    "G_vWviqUCC4", "5b9Lr-ggr05", "EUsVwEOsbl6", "HZfsCshPpi7", "qCodK5vqaN8",
    "7Ne_rNvQld9", "jIBMSMs4_ka", "qJjpx-s_nUb", "3c_k7h8YgHc", "aTWKwJllPOd",
    "nGoCBxiaROe", "pPA5ActWLLf", "xq1eWTas_ag", "WYCeSzr7SQh", "dnUNjIUCg5i",
    "9cqLeJoS46j", "AydzE_QRqAk", "FNqt7b6y_Sl", "aUDO_eteuOm", "Hm_iFim94bn",
    "nBD3KFnUm5o", "AEeoY_aqvNp", "oOMqe02robg", "m3th3rIQ9-q", "dmGIrYLyWiR"
  ],
  "Science": [
    "H_P_q5B-I_o", "1P0O_4u0", "3c_k7h8YgHw", "dxtkv8qLaY0", "HOt2zB6X-Gk",
    "dXA6R4ebEqU", "RpPu_1q5Wj0", "Jcw-i0fSqXg", "Wa-3T6d0rBo", "ndja2LJ4IcM",
    "DDRK6krBCp3", "Yri8m2hNSAE", "eSQGywY0bJF", "afB0QQG", "Oy2yXvl1WLH",
    "IGa3Md8wP6I", "nv3Z-1Nsd3J", "OAsF0QMRWlK", "G_vWviqUCCL", "5b9Lr-ggr0M",
    "EUsVwEOsblN", "HZfsCshPpiO", "qCodK5vqaNP", "7Ne_rNvQldQ", "jIBMSMs4_kR",
    "qJjpx-s_nUS", "3c_k7h8YgHT", "aTWKwJllPOU", "nGoCBxiaROV", "pPA5ActWLLW",
    "xq1eWTas_aX", "WYCeSzr7SQY", "dnUNjIUCg5Z"
  ],
  "Sports": [
    "b0Y1-kQTkiw", "0NaQQsLWLkA", "vXIn9i7_7aM", "LqjwbiEK9Yk", "evlkOfkQ5rl",
    "AtPWnYNDJnm", "h5cFbbecEun", "ZHqgjvqilIo", "Lj_yAu5pv9p", "Ki_BqNrHeWq",
    "lpNP3pN-U0r", "hF-SdHIU2ls", "4txHVae2MJt", "95gv1W3gKqu", "EImlTna6gkv",
    "qB5yTiZOmCw", "pPA5ActWLLx", "xq1eWTas_ay", "WYCeSzr7SQz", "dnUNjIUCg51",
    "9cqLeJoS462", "AydzE_QRqA3", "FNqt7b6y_S4", "aUDO_eteuO5", "Hm_iFim94b6",
    "nBD3KFnUm57", "AEeoY_aqvN8", "oOMqe02rob9", "m3th3rIQ9-k", "dmGIrYLyWil",
    "TamMbr4okvM", "8yxXR118TlN"
  ],
  "Tech": [
    "vD6_31DnjM", "_8_S2Yk4-o", "TQ3SgrW9lka", "GVlcXhQejAb",
    "D0kAXDEaiLc", "bI__9vsuBWd", "3wXVwtdaESe", "6UDansS-rPf", "87Thc411Hkg",
    "lV5XjyVm2_h", "db2y7AD7s7i", "qUJ8fgoaLTj", "KgLtFCgfC2k", "dxtkv8qLaYl",
    "HOt2zB6X-Gm", "dXA6R4ebEqn", "RpPu_1q5Wjo", "Jcw-i0fSqXp", "Wa-3T6d0rBq",
    "ndja2LJ4Icr", "DDRK6krBCps", "Yri8m2hNSAt", "eSQGywY0bJu", "afB0QQv",
    "Oy2yXvl1WLw", "IGa3Md8wP6x", "nv3Z-1Nsd3y", "OAsF0QMRWlz", "G_vWviqUCC1",
    "5b9Lr-ggr02", "EUsVwEOsbl3", "HZfsCshPpi4", "qCodK5vqaN5", "7Ne_rNvQld6"
  ],
  "Vlog": [
    "-G86eP_vWus", "sh840ou0ojE", "M5VqCeKC3vk", "Ad1GnK98wow", "BWtZDUNQxL4",
    "C5cbpx97MRI", "fJh9ha-YBP8", "wr2JAP5-cGE", "wGoJjXg6FGA", "i_d8v5klXrU",
    "e9hYnVhvmrA", "Ir1_IfBioww", "BSdPBZCDXtE", "L4b8DB_NPbM", "MVbmaSxcbuY",
    "y9e-FSE9a4E", "ALZNEvw8GBY", "OQNUgKJYmLI", "TbLTJRAHhuY", "J9bnFUa0eRk",
    "4g8OIguMLOs", "T-K3jgSqi2I", "UmWyzAKNFno", "3O_qezH53JA", "ehbBLtVO_zA",
    "yKoZSu5jwto", "UD6u5npRR-E", "jIWViYUbZQY", "OJCWwEx9MZI", "Nfr41yefHxE",
    "PI0wLPcvscw", "Rfw6Kdyc3I0", "zUtkIEjiNx4", "KU1TBODTEto", "5ATVkn1e10Y"
  ],
  "Other": [
    "bXYmdIwzOcA", "4ZwlFyTpmYE", "3c_k7h8YgHw", "dxtkv8qLaY0", "HOt2zB6X-Gk",
    "dXA6R4ebEqU", "RpPu_1q5Wj0", "Jcw-i0fSqXg", "Wa-3T6d0rBo", "ndja2LJ4IcM",
    "DDRK6krBCp4", "Yri8m2hNSAF", "eSQGywY0bJG", "afB0QQH", "Oy2yXvl1WLI",
    "IGa3Md8wP6J", "nv3Z-1Nsd3K", "OAsF0QMRWlL", "G_vWviqUCCM", "5b9Lr-ggr0N",
    "EUsVwEOsblO", "HZfsCshPpiP", "qCodK5vqaNQ", "7Ne_rNvQldR", "jIBMSMs4_kS",
    "qJjpx-s_nUT", "3c_k7h8YgHU", "aTWKwJllPOV", "nGoCBxiaROW", "pPA5ActWLLX",
    "xq1eWTas_aY", "WYCeSzr7SQZ", "dnUNjIUCg5a"
  ]
};

async function applyFinalUltimateThumbnails() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    for (const tag of Object.keys(unsplashData)) {
      console.log(`Processing category: ${tag}`);
      const videos = await Video.find({ tag }).sort({ createdAt: -1 });
      const ids = unsplashData[tag];
      
      const bulkOps = videos.map((video, index) => {
        // Pick an ID from the category list. If we run out, rotate.
        const photoId = ids[index % ids.length];
        const finalUrl = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=800`;
        
        return {
          updateOne: {
            filter: { _id: video._id },
            update: { $set: { thumbnail: finalUrl } }
          }
        };
      });

      if (bulkOps.length > 0) {
        await Video.bulkWrite(bulkOps);
        console.log(`  - Updated ${bulkOps.length} videos in ${tag}`);
      }
    }

    console.log("\nFINAL ULTIMATE THUMBNAIL UPGRADE COMPLETE!");
    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Critical Error:", err);
    process.exit(1);
  }
}

applyFinalUltimateThumbnails();
