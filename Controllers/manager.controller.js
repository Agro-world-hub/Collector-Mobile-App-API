const db = require('../startup/database');

exports.getCollectionOfficers = async (req, res) => {
  const managerId = req.user.id;

  const sql = `
    SELECT 
      cod.empId AS empId, 
      CONCAT(co.firstNameEnglish, ' ', co.lastNameEnglish) AS fullName,
      co.phoneNumber01 AS phoneNumber1,
      co.phoneNumber02 AS phoneNumber2,
      co.id AS collectionOfficerId
    FROM collectionofficer AS co
    JOIN collectionofficercompanydetails AS cod 
      ON cod.collectionOfficerId = co.id
    WHERE cod.collectionManagerId = ? 
      AND cod.jobRole = 'Collection Officer'
  `;

  try {
    const [rows] = await db.promise().query(sql, [managerId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No collection officers found for the given manager ID.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching collection officers:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching collection officers.',
    });
  }
};


const Joi = require('joi'); // Make sure to install Joi: npm install joi

exports.getFarmerPaymentsSummary = async (req, res) => {
  // Define the Joi schema
  const schema = Joi.object({
    collectionOfficerId: Joi.number().integer().required().messages({
      'any.required': 'CollectionOfficerId is required.',
      'number.base': 'CollectionOfficerId must be a number.',
      'number.integer': 'CollectionOfficerId must be an integer.',
    }),
    fromDate: Joi.date().iso().required().messages({
      'any.required': 'FromDate is required.',
      'date.base': 'FromDate must be a valid date.',
      'date.format': 'FromDate must be in ISO format (YYYY-MM-DD).',
    }),
    toDate: Joi.date().iso().required().greater(Joi.ref('fromDate')).messages({
      'any.required': 'ToDate is required.',
      'date.base': 'ToDate must be a valid date.',
      'date.greater': 'ToDate must be later than FromDate.',
      'date.format': 'ToDate must be in ISO format (YYYY-MM-DD).',
    }),
  });

  try {
    const { collectionOfficerId, fromDate, toDate } = req.query;

    // Validate query parameters
    const { error } = schema.validate({ collectionOfficerId, fromDate, toDate });

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
      });
    }

    // Fetch report data
    const getDailyReport = (collectionOfficerId, fromDate, toDate) => {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
          DATE(CONVERT_TZ(fpc.createdAt, '+00:00', '+05:30')) AS date, 
          SUM(gradeAquan) + SUM(gradeBquan) + SUM(gradeCquan) AS total, 
          COUNT(fpc.registerFarmerId) AS TCount
        FROM 
          registeredfarmerpayments rfp
        JOIN 
          farmerpaymentscrops fpc ON rfp.id = fpc.registerFarmerId
        WHERE 
          rfp.collectionOfficerId = ? 
          AND DATE(CONVERT_TZ(fpc.createdAt, '+00:00', '+05:30')) BETWEEN ? AND ?
        GROUP BY 
          DATE(CONVERT_TZ(fpc.createdAt, '+00:00', '+05:30'))

        `;
        const params = [parseInt(collectionOfficerId), fromDate, toDate];

        db.query(query, params, (err, results) => {
          if (err) {
            return reject(err);
          }

          const reportData = results.map(row => ({
            date: new Date(row.date).toLocaleDateString('en-US', { timeZone: 'Asia/Colombo' }),
            TCount: row.TCount,
            total: row.total ? parseFloat(row.total) : 0,
          }));
          resolve(reportData);
        });
      });
    };

    const reportData = await getDailyReport(collectionOfficerId, fromDate, toDate);
    res.status(200).json({
      status: 'success',
      data: reportData,
    });

  } catch (err) {
    console.error('Error fetching daily report:', err);
    res.status(500).send('An error occurred while fetching the report.');
  }
};


// exports.getFarmerPaymentsSummary = async (req, res) => {
//   const getDailyReport = (collectionOfficerId, fromDate, toDate) => {
//     return new Promise((resolve, reject) => {
//       const query = `
//         SELECT 
//           fpc.registerFarmerId, 
//           DATE(fpc.createdAt) AS date, 
//           SUM(gradeAquan) + SUM(gradeBquan) + SUM(gradeCquan) AS total, 
//           COUNT(fpc.registerFarmerId) AS TCount
//         FROM 
//           registeredfarmerpayments rfp
//         JOIN 
//           farmerpaymentscrops fpc ON rfp.id = fpc.registerFarmerId
//         WHERE 
//           rfp.collectionOfficerId = ? 
//           AND fpc.createdAt BETWEEN ? AND ?
//         GROUP BY 
//           DATE(fpc.createdAt), fpc.registerFarmerId
//       `;

//       const params = [parseInt(collectionOfficerId), fromDate, toDate];

//       db.query(query, params, (err, results) => {
//         if (err) {
//           console.error('Query Error:', err);
//           return reject(err);
//         }

//         console.log('Query Results:', results);

//         // Map the results to format the output as needed
//         const formattedResults = results.map((row) => ({
//           farmerId: row.registerFarmerId,
//           date: row.date,
//           total: row.total,
//           paymentCount: row.TCount,
//         }));

//         resolve(formattedResults);
//       });
//     });
//   };

//   try {
//     const { collectionOfficerId, fromDate, toDate } = req.query;

//     if (!collectionOfficerId || !fromDate || !toDate) {
//       return res.status(400).json({ message: 'Missing required parameters' });
//     }

//     const dailyReport = await getDailyReport(collectionOfficerId, fromDate, toDate);

//     res.status(200).json({
//       success: true,
//       data: dailyReport,
//     });
//   } catch (error) {
//     console.error('Error in getFarmerPaymentsSummary:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//     });
//   }
// };


exports.getOfficerDetailsForReport = async (req, res) => {
  const { empId } = req.params;
  console.log(empId);

  if (!empId) {
    return res.status(400).json({
      status: 'error',
      message: 'Employee ID is required.',
    });
  }

  try {
    const query = `
      SELECT 
        co.firstNameEnglish AS firstName, 
        co.lastNameEnglish AS lastName, 
        cocd.jobRole 
      FROM 
        collectionofficer co
      JOIN 
        collectionofficercompanydetails cocd ON co.id = cocd.collectionOfficerId
      WHERE 
        cocd.empId = ?;
    `;

    const [results] = await db.promise().query(query, [empId]);

    if (results.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No employee found with the provided empId.',
      });
    }

    const employeeDetails = results[0];

    return res.status(200).json({
      status: 'success',
      data: employeeDetails,
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching employee details.',
    });
  }
};