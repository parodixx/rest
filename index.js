const express = require("express");
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const db = require("./connection");
const response = require("./response");
const jwt = require("jsonwebtoken");
const config = require("./config");
const bcrypt = require("bcrypt");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const key = process.env.SECRET_KEY;
app.use(bodyParser.json());
app.use(cookieParser());

// routes utama

app.get("/", (req, res) => {
  res.json("Dashboard ieu teh");
});

// QUERY UNTUK MENAMPILKAN SELURUH DATA WARGA
app.get("/datawarga", (req, res) => {
  db.query("SELECT * FROM warga", (err, result) => {
    // console.log(res)
    // res.send(result)
    if (err) throw err;
    response(200, result, "ini semua data warga", res);
  });
  // res.send('utama')
});

app.get("/datatoken", (req, res) => {
  db.query("SELECT * FROM token_active", (err, result) => {
    if (err) throw err;
    response(200, result, "ini semua data warga", res);
  });
});

app.get("/datauser", (req, res) => {
  db.query(`SELECT * FROM user`, (err, result) => {
    if (err) throw err;
    response(200, result, "ini data semua user ", res);
  });
});

app.get("/datapengumuman", (req, res) => {
  db.query(`SELECT * FROM pengumuman`, (err, result) => {
    if (err) throw err;
    response(200, result, "ini data semua pengumuman", res);
  });
});

// INI QUERY UNTUK MENAMPILKAN NAMA WARGA SESUAI ID TERTENTU
app.get("/tokenwarga", (req, res) => {
  console.log("find token", req.query.token);
  const sql = `SELECT id FROM token_active WHERE token = ?`;
  db.query(sql, [req.query.token], (err, result) => {
    if (err) throw err;

    if (result && result.length > 0) {
      const userId = result[0].id;
      const query = `SELECT * FROM warga WHERE id_user = ${userId}`;
      db.query(query, (err, result) => {
        if (err) throw err;
        response(200, result, "ini data warga", res);
        return result[0].username;
        // console.log(result[0].username);
      });
    } else {
      response(404, err, "Token not found", res);
    }
  });
});

// app.get("/datakeluarga", (req, res) => {
//   console.log("find kepala keluarga", req.query.kk);
//   const sql = `SELECT * FROM kpl_klrg WHERE no_kk = ?`;
//   db.query(sql, [req.query.kk], (err, result) => {
//     if (err) throw err;

//     if (result && result.length > 0) {
//       const userKK = result[0].noKK;
//       const query = `SELECT * FROM warga WHERE no_kk = ${userKK}`;
//       db.query(query, (err, result) => {
//         if (err) throw err;
//         response(200, result, "ini data warga", res);
//         return result[0].username;
//       });
//     } else {
//       response(404, err, "nama kepala keluarga not found", res);
//     }
//   });
// });

app.get("/datakeluarga", (req, res) => {
  console.log("Mencari kepala keluarga dengan nomor KK", req.query.kk);
  const sql = `SELECT * FROM kpl_klrg WHERE no_kk = ?`;
  db.query(sql, [req.query.kk], (err, resultKeluarga) => {
    if (err) {
      console.error(err);
      return response(500, null, "Internal Server Error", res);
    }

    if (resultKeluarga && resultKeluarga.length > 0) {
      const userKK = resultKeluarga[0].no_kk;
      const query = `SELECT * FROM warga WHERE no_kk = ?`;
      db.query(query, [userKK], (err, resultWarga) => {
        if (err) {
          console.error(err);
          return response(500, null, "Internal Server Error", res);
        }

        if (resultWarga && resultWarga.length > 0) {
          const username = resultWarga[0].username;
          response(
            200,
            resultWarga,
            `Data warga ditemukan, username: ${username}`,
            res
          );
        } else {
          response(404, null, "Data warga tidak ditemukan", res);
        }
      });
    } else {
      response(404, null, "Nomor KK kepala keluarga tidak ditemukan", res);
    }
  });
});

// app.get("/datakeluarga", (req, res) => {
//   console.log("Find kepala keluarga", req.query.kk);

//   const sql = `SELECT nama_lengkap, id FROM kpl_klrg WHERE no_kk = ?`;
//   db.query(sql, [req.query.kk], (err, kplResult) => {
//     if (err) {
//       console.error(err);
//       response(500, err, "Internal Server Error", res);
//       return;
//     }

//     if (kplResult && kplResult.length > 0) {
//       const userID = kplResult[0].id;
//       const query = `SELECT * FROM warga WHERE id = ?`;

//       db.query(query, [userID], (err, wargaResult) => {
//         if (err) {
//           console.error(err);
//           response(500, err, "Internal Server Error", res);
//           return;
//         }

//         if (wargaResult && wargaResult.length > 0) {
//           const username = wargaResult[0].username;
//           response(200, wargaResult, "Ini data warga", res);
//         } else {
//           response(404, null, "Data warga not found", res);
//         }
//       });
//     } else {
//       response(404, null, "Nama kepala keluarga not found", res);
//     }
//   });
// });

app.get("/data/:nik", (req, res) => {
  const nik = req.params.nik;
  const sql = `SELECT * FROM warga WHERE nik = ${nik}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    response(200, result, "ini nik data warga", res);
  });
});

// app.get("/user/:id", (req, res) => {
//   const id = req.params.id;
//   const sql = `SELECT * FROM token_active WHERE id = ${id}`
//   db.query(sql, (err, result) => {
//     if (err)  response(500, err.message, "error", res);
//     response(200, result, "ini data user berdasarkan token user, res");
//   })
// })

app.get("/usertoken", (req, res) => {
  console.log("find token", req.query.token);
  const sql = `SELECT id FROM token_active WHERE token = ?`;
  db.query(sql, [req.query.token], (err, result) => {
    if (err) throw err;

    if (result && result.length > 0) {
      const userId = result[0].id;
      const query = `SELECT * FROM user WHERE id_user = ${userId}`;
      db.query(query, (err, result) => {
        if (err) throw err;
        response(200, result, "ini data warga", res);
        return result[0].username;
        // console.log(result[0].username);
      });
    } else {
      response(404, err, "Token not found", res);
    }
  });
});

app.get("/jadwalronda", (req, res) => {
  console.log("Ini nama warga yang ronda", req.query.hari);
  const sql = `SELECT nama_lengkap FROM anggota_ronda WHERE hari = ?`;
  db.query(sql, [req.query.hari], (err, result) => {
    if (err) throw err;
    response(200, result, "ini data warga ronda", res);
  });
});

// app.get("/data/:token", (req, res) => {
//   const token = req.params.token;
//   const sql = "SELECT * FROM user WHERE id = ?";
//   db.query(sql, [token], (err, result) => {
//     if (err) {
//       console.error("Error executing query:", err);
//       return response(500, "Internal Server Error", "error", res);
//     }
//     response(200, result, "ini data user berdasarkan token user", res);
//   });
// });

// INI QUERY UNTUK MENAMPILKAN DATA WARGA SESUAI ID TETAPI IDNYA MUNCUL DI URL
// app.get('/warga/:id', (req, res) => {
//   const id = req.params.id
//   res.send(`ini ada idnya ${id}`)
// })

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  try {
    const query =
      "SELECT id_user, username, password, role_id FROM user WHERE username = ?";
    db.query(query, [username], (err, results) => {
      if (results.length > 0) {
        const user = results[0];

        bcrypt.compare(password, user.password, (err, resu) => {
          if (err) response(404, "invalid", "error", res);
          if (resu) {
            const token = jwt.sign(
              { id: user.id, username: user.username, role_id: user.role_id },
              key,
              { expiresIn: "1h" }
            );

            // const myDate = new Date();
            // const waktu = myDate.toLocaleTimeString();
            // const tanggal = myDate.getDate();
            // const bulan = myDate.getMonth();
            // const tahun = myDate.getFullYear();
            // const dateFormat = `${tahun}-${bulan + 1}-${tanggal + 1} ${waktu}`;
            // db.query(
            //   `INSERT INTO token_active (id, token, expired ) VALUES ('${user.id}', '${token}', '${dateFormat}' )`,

            const myDate = new Date();
            const waktu = myDate.toLocaleTimeString();
            const tanggal = myDate.getDate();
            const bulan = myDate.getMonth() + 1; // Adding 1 to adjust for zero-based indexing
            const tahun = myDate.getFullYear();
            const dateFormat = `${tahun}-${
              bulan < 10 ? "0" : ""
            }${bulan}-${tanggal} ${waktu}`;

            db.query(
              `INSERT INTO token_active (id, token, expired) VALUES ('${user.id}', '${token}', '${dateFormat}')`,
              (err, result) => {
                if (err) response(500, err.message, "error", res);
                res.cookie("Token", token, {
                  httpOnly: true,
                  maxAge: 172800000,
                  sameSite: "lax",
                });
                res.json({ token });
              }
            );
          } else {
            // Passwords do not match
            console.log("Authentication failed: Passwords do not match");
            res.status(401).json({ message: "Authentication failed" });
          }
        });
      } else {
        // User not found
        console.log("Authentication failed: User not found");
        res.status(404).json({ message: "User not found" });
      }
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

function verifyToken(req, res, next) {
  const auth = req.headers["authorization"];
  const tokens = auth && auth.split(" ")[1];

  if (!auth || auth.split(" ")[0] !== "Bearer") {
    return response(401, "error", "Invalid authorization", res);
  }

  if (!tokens) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(tokens, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.token = tokens;
    next();
  });
}
// Memeriksa role_id dalam token jika diperlukan
// if (decoded.role_id === 1) {
//   // Role_id 1 memiliki akses ke endpoint tertentu
//   next();
// } else {
//   res.status(403).json({ message: "Insufficient permissions" });
// }
// Contoh penggunaan middleware
app.get("/secure", verifyToken, (req, res) => {
  res.json({ message: "Secure data accessed", user: req.user });
});

app.post("/warga", (req, res) => {
  const {
    namaLengkap,
    nik,
    jenisKelamin,
    tempatLahir,
    tanggal,
    agama,
    pendidikan,
    jenisPekerjaan,
    golDarah,
    noTelepon,
    noKK,
  } = req.body;

  const sql = `INSERT INTO warga ( nama_lengkap, nik, jenis_kelamin, tempat_lahir, tanggal, agama, pendidikan, jenis_pekerjaan, gol_darah, no_telepon, no_kk) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`;
  const values = [
    namaLengkap,
    nik,
    jenisKelamin,
    tempatLahir,
    tanggal,
    agama,
    pendidikan,
    jenisPekerjaan,
    golDarah,
    noTelepon,
    noKK,
  ];
  db.query(sql, values, (err, result) => {
    if (err) response(500, "invalid", "error", res);
    if (result?.affectedRows) {
      const data = {
        isSuccess: result.affectedRows,
        id: result.insertId,
      };
      response(200, data, "data berhasil di input", res);
    } else {
      response(404, "Gagal input data warga", "error", res);
    }
  });
});

app.post("/user", (req, res) => {
  const { username, password, roleId } = req.body;

  // Hash password menggunakan bcrypt
  bcrypt.hash(password, 10, (err, hashPassword) => {
    if (err) {
      return response(500, "invalid", "error", res);
    }

    // Gunakan parameterized query untuk mencegah SQL injection
    const sql =
      "INSERT INTO user (username, password, role_id) VALUES (?, ?, ?)";
    const values = [username, hashPassword, roleId];

    db.query(sql, values, (err, result) => {
      if (err) {
        return response(500, "invalid", "errors", res);
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          id: result.insertId,
        };
        response(200, data, "Data berhasil diinput", res);
      } else {
        response(404, "Gagal input data user", "error", res);
      }
    });
  });
});

app.put("/warga/:id", (req, res) => {
  const {
    namaLengkap,
    jenisKelamin,
    tempatLahir,
    tanggal,
    agama,
    pendidikan,
    jenisPekerjaan,
    golDarah,
    noTelepon,
    noKK,
  } = req.body;

  const id = req.params.id;
  const sql = `UPDATE warga SET nama_lengkap = '${namaLengkap}', jenis_kelamin = '${jenisKelamin}', tempat_lahir = '${tempatLahir}',
             tanggal = '${tanggal}', agama = '${agama}', pendidikan = '${pendidikan}', jenis_pekerjaan = '${jenisPekerjaan}', gol_darah = '${golDarah}', no_telepon = '${noTelepon}', no_kk ='${noKK}' WHERE id = '${id}'`;

  db.query(sql, (err, result) => {
    if (err) response(500, err.message, "error", res);
    if (result?.affectedRows) {
      const data = {
        isSuccess: result.affectedRows,
        message: result.message,
      };
      response(200, data, "Update success", res);
    } else {
      response(404, "Data gagal di update", "error", res);
    }
  });
});

app.put("/user/:id", (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hashPassword) => {
    if (err) {
      response(500, "invalid", "error", res);
    }

    const id = req.params.id;
    const sql = `UPDATE user SET username = '${username}', password = '${hashPassword}' WHERE id = '${id}'`;

    db.query(sql, (err, result) => {
      if (err) response(500, err.message, "error", res);
      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          message: result.message,
        };
        response(200, data, "Update success", res);
      } else {
        response(404, "Data gagal di update", "error", res);
      }
    });
  });
});

app.delete("/warga", (req, res) => {
  const { id } = req.body;
  const sql = `DELETE FROM warga WHERE id = ${id}`;
  db.query(sql, (err, result) => {
    if (err) response(500, "invalid", "error", res);
    if (result?.affectedRows) {
      const data = {
        isDeleted: result.affectedRows,
      };
      response(200, data, "Delete success", res);
    } else {
      response(404, "NIK warga gagal di hapus", "error", res);
    }
  });
});

app.delete("/user", (req, res) => {
  const { id } = req.body;
  const sql = `DELETE FROM user WHERE id = ${id}`;
  db.query(sql, (err, results) => {
    if (err) response(500, "invalid", "error", res);
    if (results?.affectedRows) {
      const data = {
        isDeleted: results.affectedRows,
      };
      response(200, data, "Deleted success", res);
    } else {
      response(404, "Data user gagal di hapus", "error", res);
    }
  });
});

app.delete("/logout", (req, res) => {
  const authToken = req.headers["authorization"];
  const token = authToken && authToken.split(" ")[1];

  if (!authToken || authToken.split(" ")[0] !== "Bearer" || !token) {
    return response(401, "error", "Invalid ", res);
  }

  // Delete the token from the token_active table
  db.query(
    "DELETE FROM token_active WHERE token = ?",
    [token],
    (err, result) => {
      if (err) {
        return response(500, err.message, "error", res);
      }

      // Clear the cookie on the client-side
      res.clearCookie("Token", { httpOnly: true, sameSite: "lax" });
      res.json({ message: "Logout successful" });
    }
  );
});

// Add this middleware to routes that require authentication
function verifyToken(req, res, next) {
  const auth = req.headers["authorization"];
  const token = auth && auth.split(" ")[1];

  if (!auth || auth.split(" ")[0] !== "Bearer") {
    return response(401, "error", "Invalid authorization", res);
  }

  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.token = token;
    next();
  });
}

// app.post("/logout", (req, res) => {
//   const tokenId = req.tokenId;
//   console.log(tokenId)

//   if (!tokenId) {
//     return response(401, "error", "Invalid token", res);
//   }

//   // Delete the token from the token_active table based on its ID
//   db.query(
//     "DELETE FROM token_active WHERE id = ?",
//     [tokenId],
//     (err, result) => {
//       if (err) {
//         return response(500, err.message, "error", res);
//       }

//       // Clear the cookie on the client-side
//       res.clearCookie("Token", { httpOnly: true, sameSite: "lax" });
//       res.json({ message: "Logout successful" });
//     }
//   );
// });

// // Add this middleware to routes that require authentication
// function verifyToken(req, res, next) {
//   const auth = req.headers["authorization"];
//   const token = auth && auth.split(" ")[1];

//   if (!auth || auth.split(" ")[0] !== "Bearer") {
//     return response(401, "error", "Invalid authorization", res);
//   }

//   if (!token) {
//     return res.status(403).json({ message: "Token not provided" });
//   }

//   jwt.verify(token, config.secret, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     // Add the token ID to the request object for later use
//     req.tokenId = decoded.id;
//     next();
//   });
// }

app.listen(port, () => {
  console.log(`Dibuka di port ${port}`);
});
