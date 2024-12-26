exports.getDailyReport = (collectionOfficerId, fromDate, toDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        DATE(rfp.createdAt) AS date,
        COUNT(DISTINCT rfp.id) AS totalPayments,
        SUM(IFNULL(fpc.gradeAquan, 0) + IFNULL(fpc.gradeBquan, 0) + IFNULL(fpc.gradeCquan, 0)) AS totalWeight
      FROM 
        registeredfarmerpayments rfp
      LEFT JOIN 
        farmerpaymentscrops fpc ON rfp.id = fpc.registerFarmerId
      WHERE 
        rfp.collectionOfficerId = ? 
        AND rfp.createdAt BETWEEN ? AND ?
      GROUP BY 
        DATE(rfp.createdAt)
      ORDER BY 
        date ASC;
    `;
    

    const params = [collectionOfficerId, fromDate, toDate];

    db.query(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      
      const reportData = results.map(row => ({
        date: row.date,
        totalPayments: row.totalPayments,
        totalWeight: row.totalWeight ? parseFloat(row.totalWeight) : 0,
      }));

      resolve(reportData);
    });
  });
};