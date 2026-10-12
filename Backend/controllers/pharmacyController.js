const db = require("../config/db");

// ==========================================
// GET ALL PHARMACIES
// ==========================================

const getAllPharmacies = (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      address,
      city,
      phone,
      email,
      created_at,
      updated_at
    FROM pharmacies
    ORDER BY name
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Could not load pharmacies",
      });
    }

    res.status(200).json(results);
  });
};

// ==========================================
// ADD PHARMACY
// ==========================================

const addPharmacy = (req, res) => {
  const { name, address, city, phone, email } = req.body;

  if (!name || !address) {
    return res.status(400).json({
      message: "Pharmacy name and address are required",
    });
  }

  const sql = `
    INSERT INTO pharmacies
    (
      name,
      address,
      city,
      phone,
      email
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,

    [name, address, city || null, phone || null, email || null],

    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not add pharmacy",
        });
      }

      res.status(201).json({
        message: "Pharmacy added successfully",

        pharmacy: {
          id: result.insertId,
          name,
          address,
          city,
          phone,
          email,
        },
      });
    },
  );
};

// ==========================================
// UPDATE PHARMACY
// ==========================================

const updatePharmacy = (req, res) => {
  const pharmacyId = req.params.id;

  const { name, address, city, phone, email } = req.body;

  if (!name || !address) {
    return res.status(400).json({
      message: "Pharmacy name and address are required",
    });
  }

  const sql = `
    UPDATE pharmacies

    SET
      name = ?,
      address = ?,
      city = ?,
      phone = ?,
      email = ?

    WHERE id = ?
  `;

  db.query(
    sql,

    [name, address, city || null, phone || null, email || null, pharmacyId],

    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not update pharmacy",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Pharmacy not found",
        });
      }

      res.status(200).json({
        message: "Pharmacy updated successfully",
      });
    },
  );
};

// ==========================================
// DELETE PHARMACY
// ==========================================

const deletePharmacy = (req, res) => {
  const pharmacyId = req.params.id;

  db.query(
    "DELETE FROM pharmacies WHERE id = ?",

    [pharmacyId],

    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not delete pharmacy",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Pharmacy not found",
        });
      }

      res.status(200).json({
        message: "Pharmacy deleted successfully",
      });
    },
  );
};

module.exports = {
  getAllPharmacies,
  addPharmacy,
  updatePharmacy,
  deletePharmacy,
};
