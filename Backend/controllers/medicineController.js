const db = require("../config/db");

// GET ALL MEDICINES
const getAllMedicines = (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      generic_name,
      category,
      manufacturer,
      description
    FROM medicines
    ORDER BY name
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Database error",
      });
    }

    res.status(200).json(results);
  });
};

// SEARCH MEDICINES
const searchMedicines = (req, res) => {
  const search = req.query.q || "";

  const value = `%${search}%`;

  const sql = `
    SELECT
      m.id AS medicine_id,
      m.name AS medicine_name,
      m.generic_name,
      m.category,
      m.manufacturer,

      p.id AS pharmacy_id,
      p.name AS pharmacy_name,
      p.address,
      p.city,
      p.phone,

      ps.quantity,
      ps.price

    FROM medicines m

    LEFT JOIN pharmacy_stock ps
      ON m.id = ps.medicine_id

    LEFT JOIN pharmacies p
      ON ps.pharmacy_id = p.id

    WHERE
      m.name LIKE ?
      OR m.generic_name LIKE ?

    ORDER BY
      m.name,
      ps.quantity DESC
  `;

  db.query(
    sql,
    [value, value],

    (err, results) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Database error",
        });
      }

      res.status(200).json(results);
    },
  );
};

const addMedicine = (req, res) => {
  const { name, genericName, category, manufacturer, description } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Medicine name is required",
    });
  }

  const sql = `
    INSERT INTO medicines
    (
      name,
      generic_name,
      category,
      manufacturer,
      description
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      genericName || null,
      category || null,
      manufacturer || null,
      description || null,
    ],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not add medicine",
        });
      }

      res.status(201).json({
        message: "Medicine added successfully",
        medicine: {
          id: result.insertId,
          name,
          genericName,
          category,
          manufacturer,
          description,
        },
      });
    },
  );
};

const updateMedicine = (req, res) => {
  const medicineId = req.params.id;

  const { name, genericName, category, manufacturer, description } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Medicine name is required",
    });
  }

  const sql = `
    UPDATE medicines

    SET
      name = ?,
      generic_name = ?,
      category = ?,
      manufacturer = ?,
      description = ?

    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      genericName || null,
      category || null,
      manufacturer || null,
      description || null,
      medicineId,
    ],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not update medicine",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Medicine not found",
        });
      }

      res.json({
        message: "Medicine updated successfully",
      });
    },
  );
};

const deleteMedicine = (req, res) => {
  const medicineId = req.params.id;

  db.query(
    "DELETE FROM medicines WHERE id = ?",
    [medicineId],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not delete medicine",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Medicine not found",
        });
      }

      res.json({
        message: "Medicine deleted successfully",
      });
    },
  );
};

module.exports = {
  getAllMedicines,
  searchMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
};
