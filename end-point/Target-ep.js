const TargetDAO = require('../dao/Target-dao')
const TargetValidate = require('../Validations/Target-validation')



exports.getAllCropCatogory = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const result = await TargetDAO.getAllCropNameDAO()

    console.log("Successfully fetched gatogory");
    return res.status(200).json(result);
  } catch (error) {
    if (error.isJoi) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching crop names and verity:", error);
    return res.status(500).json({ error: "An error occurred while fetching crop names and verity" });
  }
}

exports.addDailyTarget = async (req, res) => {
  try {
    const target = req.body;
    console.log(target.TargetItems.length, req.user);
    const companyId = req.user.companyId;
    const userId = req.user.id;
    
    console.log(target, companyId, userId);


    const targetId = await TargetDAO.createDailyTargetDao(target, companyId, userId);

    if (!targetId) {
      return res.json({ message: "Faild create target try again!", status: false })
    }

    for (let i = 0; i < target.TargetItems.length; i++) {
      console.log(i);
      await TargetDAO.createDailyTargetItemsDao(target.TargetItems[i], targetId);
    }

    console.log("Daily Target Created Successfully");
    res.json({ message: "Daily Target Created Successfully!", status: true })
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching news:", err);
    res.status(500).json({ error: "An error occurred while fetching news" });
  }
};


exports.getAllDailyTarget = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const { searchText, page, limit } = await TargetValidate.getAllDailyTargetSchema.validateAsync(req.query);
    const companyId = req.user.companyId

    console.log(searchText, page, limit, companyId);

    const resultTarget = await TargetDAO.getAllDailyTargetDAO(companyId, searchText);
    const resultComplete = await TargetDAO.getAllDailyTargetCompleteDAO(companyId, searchText);
    const combinedData = [];


    for (const target of resultTarget) {
      const completeMatch = resultComplete.find(
        (complete) =>
          complete.cropNameEnglish === target.cropNameEnglish &&
          complete.varietyNameEnglish === target.varietyNameEnglish &&
          complete.grade === target.grade
        // &&
        // new Date(complete.buyDate) >= new Date(target.fromDate) &&
        // new Date(complete.buyDate) <= new Date(target.toDate)
      );


      // Logic for adding combined data
      if (target.qtyA !== undefined) {
        combinedData.push({
          cropNameEnglish: target.cropNameEnglish,
          varietyNameEnglish: target.varietyNameEnglish,
          toDate: target.toDate,
          toTime: target.toTime,
          grade: "A",
          status: parseFloat(completeMatch?.totA) >= parseFloat(target.qtyA) ? 'Completed' : 'Pending',
          TargetQty: target.qtyA,
          CompleteQty: completeMatch?.totA || "0.00",
        });
      }

      if (target.qtyB !== undefined) {
        combinedData.push({
          cropNameEnglish: target.cropNameEnglish,
          varietyNameEnglish: target.varietyNameEnglish,
          toDate: target.toDate,
          toTime: target.toTime,
          grade: "B",
          status: parseFloat(completeMatch?.totB) >= parseFloat(target.qtyB) ? 'Completed' : 'Pending',
          TargetQty: target.qtyB,
          CompleteQty: completeMatch?.totB || "0.00",
        });
      }

      if (target.qtyC !== undefined) {
        combinedData.push({
          cropNameEnglish: target.cropNameEnglish,
          varietyNameEnglish: target.varietyNameEnglish,
          toDate: target.toDate,
          toTime: target.toTime,
          grade: "C",
          status: parseFloat(completeMatch?.totC) >= parseFloat(target.qtyC) ? 'Completed' : 'Pending',
          TargetQty: target.qtyC,
          CompleteQty: completeMatch?.totC || "0.00",
        });
      }
    }

    const totalCount = combinedData.length;

    const totalPages = Math.ceil(totalCount / limit);


    const startIndex = (page - 1) * limit;
    const paginatedData = combinedData.slice(startIndex, startIndex + limit);

    console.log("Successfully transformed data");
    return res.status(200).json({
      items: paginatedData,
      totalPages: totalCount
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching crop names and verity:", error);
    return res.status(500).json({ error: "An error occurred while fetching crop names and verity" });
  }
};


exports.downloadDailyTarget = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const { fromDate, toDate } = await TargetValidate.downloadDailyTargetSchema.validateAsync(req.query);
    const companyId = req.user.companyId

    console.log(fromDate, toDate, companyId);

    const resultTarget = await TargetDAO.downloadAllDailyTargetDao(companyId, fromDate, toDate);
    const resultComplete = await TargetDAO.downloadAllDailyTargetCompleteDAO(companyId, fromDate, toDate);
    const combinedData = [];


    for (const target of resultTarget) {
      const completeMatch = resultComplete.find(
        (complete) =>
          complete.cropNameEnglish === target.cropNameEnglish &&
          complete.varietyNameEnglish === target.varietyNameEnglish &&
          complete.grade === target.grade
        // &&
        // new Date(complete.buyDate) >= new Date(target.fromDate) &&
        // new Date(complete.buyDate) <= new Date(target.toDate)
      );


      // Logic for adding combined data
      if (target.qtyA !== undefined) {
        combinedData.push({
          cropNameEnglish: target.cropNameEnglish,
          varietyNameEnglish: target.varietyNameEnglish,
          toDate: target.toDate,
          toTime: target.toTime,
          grade: "A",
          status: parseFloat(completeMatch?.totA) >= parseFloat(target.qtyA) ? 'Completed' : 'Pending',
          TargetQty: target.qtyA,
          CompleteQty: completeMatch?.totA || "0.00",
        });
      }

      if (target.qtyB !== undefined) {
        combinedData.push({
          cropNameEnglish: target.cropNameEnglish,
          varietyNameEnglish: target.varietyNameEnglish,
          toDate: target.toDate,
          toTime: target.toTime,
          grade: "B",
          status: parseFloat(completeMatch?.totB) >= parseFloat(target.qtyB) ? 'Completed' : 'Pending',
          TargetQty: target.qtyB,
          CompleteQty: completeMatch?.totB || "0.00",
        });
      }

      if (target.qtyC !== undefined) {
        combinedData.push({
          cropNameEnglish: target.cropNameEnglish,
          varietyNameEnglish: target.varietyNameEnglish,
          toDate: target.toDate,
          toTime: target.toTime,
          grade: "C",
          status: parseFloat(completeMatch?.totC) >= parseFloat(target.qtyC) ? 'Completed' : 'Pending',
          TargetQty: target.qtyC,
          CompleteQty: completeMatch?.totC || "0.00",
        });
      }
    }


    console.log("Successfully transformed data");
    return res.status(200).json({ message: 'Daily tartget find', status: true, data: combinedData });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error fetching crop names and verity:", error);
    return res.status(500).json({ error: "An error occurred while fetching crop names and verity" });
  }
};




exports.deleteTargetById = async (req, res) => {
  const targetId = req.params.id;

  if (!targetId) {
      return res.status(400).json({ error: "Target ID is required" });
  }

  try {
      await TargetDAO.deleteTargetByIdDao(targetId);
      res.status(200).json({ message: "Target deleted successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete target" });
  }
};



exports.getAllTargets = async (req, res) => {
  try {
      const targets = await TargetDAO.getAllTargetsDao();

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Reset time to start of the day

      const formattedTargets = targets.reduce((acc, target) => {
          const targetToDate = new Date(target.toDate);
          targetToDate.setHours(0, 0, 0, 0); // Reset time to start of the day for accurate comparison

          const targetType = targetToDate < currentDate ? "expired" : "active"; // Classify based on `toDate`

          const existing = acc[targetType].find((t) => t.targetId === target.targetId);
          if (existing) {
              existing.items.push({
                  itemId: target.itemId,
                  varietyId: target.varietyId,
                  qtyA: target.qtyA,
                  qtyB: target.qtyB,
                  qtyC: target.qtyC,
              });
          } else {
              acc[targetType].push({
                  targetId: target.targetId,
                  companyId: target.companyId,
                  fromDate: target.fromDate,
                  toDate: target.toDate,
                  fromTime: target.fromTime,
                  toTime: target.toTime,
                  createdBy: target.createdBy,
                  createdAt: target.createdAt,
                  items: target.itemId ? [{
                      itemId: target.itemId,
                      varietyId: target.varietyId,
                      qtyA: target.qtyA,
                      qtyB: target.qtyB,
                      qtyC: target.qtyC,
                  }] : [],
              });
          }
          return acc;
      }, { active: [], expired: [] }); // Initial structure for active and expired

      res.status(200).json(formattedTargets);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch targets" });
  }
};

