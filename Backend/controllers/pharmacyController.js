const db = require("../config/db");

const getAllPharmacies = (_req, res) => {
  const sql = `
    SELECT id, name, address, city, phone, email
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

module.exports = {
  getAllPharmacies,
};
