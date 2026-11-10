const db = require("../config/db");

// ==========================================
// GET ALL STOCK
// ==========================================

const getAllStock = (req, res) => {
  const sql = `
    SELECT
      ps.id,
      ps.pharmacy_id,
      ps.medicine_id,
      ps.quantity,
      ps.price,
      ps.updated_at,

      p.name AS pharmacy_name,
      p.city AS pharmacy_city,

      m.name AS medicine_name,
      m.generic_name

    FROM pharmacy_stock ps

    JOIN pharmacies p
      ON ps.pharmacy_id = p.id

    JOIN medicines m
      ON ps.medicine_id = m.id

    ORDER BY
      p.name,
      m.name
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Could not load stock",
      });
    }

    res.status(200).json(results);
  });
};

// ==========================================
// ADD STOCK
// ==========================================

const addStock = (req, res) => {
  const { pharmacyId, medicineId, quantity, price } = req.body;

  if (!pharmacyId || !medicineId) {
    return res.status(400).json({
      message: "Pharmacy and medicine are required",
    });
  }

  if (quantity === undefined || Number(quantity) < 0) {
    return res.status(400).json({
      message: "Quantity must be 0 or greater",
    });
  }

  if (
    price !== "" &&
    price !== null &&
    price !== undefined &&
    Number(price) < 0
  ) {
    return res.status(400).json({
      message: "Price cannot be negative",
    });
  }

  const sql = `
    INSERT INTO pharmacy_stock
    (
      pharmacy_id,
      medicine_id,
      quantity,
      price
    )

    VALUES (?, ?, ?, ?)

    ON DUPLICATE KEY UPDATE
      quantity = VALUES(quantity),
      price = VALUES(price)
  `;

  db.query(
    sql,
    [pharmacyId, medicineId, Number(quantity), price === "" ? null : price],

    (err) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not save stock",
        });
      }

      res.status(201).json({
        message: "Stock saved successfully",
      });
    },
  );
};

// ==========================================
// UPDATE STOCK
// ==========================================

const updateStock = (req, res) => {
  const stockId = req.params.id;

  const { pharmacyId, medicineId, quantity, price } = req.body;

  if (!pharmacyId || !medicineId) {
    return res.status(400).json({
      message: "Pharmacy and medicine are required",
    });
  }

  if (quantity === undefined || Number(quantity) < 0) {
    return res.status(400).json({
      message: "Quantity must be 0 or greater",
    });
  }

  const sql = `
    UPDATE pharmacy_stock

    SET
      pharmacy_id = ?,
      medicine_id = ?,
      quantity = ?,
      price = ?

    WHERE id = ?
  `;

  db.query(
    sql,
    [
      pharmacyId,
      medicineId,
      Number(quantity),
      price === "" ? null : price,
      stockId,
    ],

    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not update stock",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Stock record not found",
        });
      }

      res.status(200).json({
        message: "Stock updated successfully",
      });
    },
  );
};

// ==========================================
// DELETE STOCK
// ==========================================

const deleteStock = (req, res) => {
  const stockId = req.params.id;

  db.query(
    `
    DELETE FROM pharmacy_stock
    WHERE id = ?
    `,

    [stockId],

    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not delete stock",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Stock record not found",
        });
      }

      res.status(200).json({
        message: "Stock deleted successfully",
      });
    },
  );
};

module.exports = {
  getAllStock,
  addStock,
  updateStock,
  deleteStock,
};
