const db = require('../startup/database');

exports.getCollectionOfficers = async (req, res) => {
  const managerId = req.user.id;

  const sql = `
    SELECT 
      cod.empId AS empId, 
      CONCAT(co.firstNameEnglish, ' ', co.lastNameEnglish) AS fullName,
      co.phoneNumber01 AS phoneNumber1,
      co.phoneNumber02 AS phoneNumber2
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


exports.getFarmerPaymentsSummary = async (req, res) => {
  const getDailyReport = (collectionOfficerId, fromDate, toDate) => {
    return new Promise((resolve, reject) => {

      const query = `
      SELECT fpc.registerFarmerId , fpc.createdAt , SUM(gradeAquan) + SUM(gradeBquan) + SUM(gradeCquan) AS total, COUNT(fpc.registerFarmerId) AS TCount
      FROM registeredfarmerpayments rfp, farmerpaymentscrops fpc
      WHERE rfp.id = fpc.registerFarmerId AND fpc.createdAt AND rfp.collectionOfficerId = ? 
      `
      const params = [parseInt(collectionOfficerId), fromDate, toDate];

      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }

        // const reportData = results.map(row => ({
        //   date: row.date,
        //   noOfFarmers: row.noOfFarmers,
        //   noOfTransactions: row.noOfTransactions,
        //   totalWeight: row.totalWeight ? parseFloat(row.totalWeight) : 0,
        // }));
        
        console.log(results)

        resolve(results);
      });
    });
  };

  const generateDateRange = (fromDate, toDate) => {
    const dates = [];
    let currentDate = new Date(fromDate);
    const endDate = new Date(toDate);

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  
  };
  

  try {
    const { collectionOfficerId, fromDate, toDate } = req.query;

    // Basic validation
    if (!collectionOfficerId || !fromDate || !toDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: collectionOfficerId, fromDate, or toDate.',
      });
    }

    // Fetch report data
    const reportData = await getDailyReport(collectionOfficerId, fromDate, toDate);

    // Generate date range and merge with report data
    const dateRange = generateDateRange(fromDate, toDate);
    console.log(dateRange)
    const mergedData = dateRange.map(date => {
      const existingData = reportData.find(item => item.date === date);
      return existingData || { date, noOfFarmers: 0, noOfTransactions: 0, totalWeight: 0 };
    });
    console.log(mergedData)

    res.json({
      status: 'success',
      data: mergedData,
    });
    
  } catch (err) {
    console.error('Error fetching daily report:', err);
    res.status(500).send('An error occurred while fetching the report.');
  }
};
