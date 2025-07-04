const targetDDao = require('../dao/distributionManager-dao');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const distributionofficerDao = require('../dao/distributionManager-dao')


exports.getDCenterTarget = async (req, res) => {
  console.log("getOfficerTarget called");
  try {
    // Get officerId from the decoded token (set by auth middleware)
    const officerId = req.user.id; // Assuming your auth middleware sets req.user

    console.log("Officer ID from token:", officerId);

    // Validate officerId
    if (!officerId || isNaN(officerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid officer ID provided'
      });
    }

    // Get targets from DAO
    const targets = await targetDDao.getDCenterTarget(officerId);

    console.log("nwxsjklowcd", targets)

    res.status(200).json({
      success: true,
      message: 'Officer targets retrieved successfully',
      data: targets
    });
  } catch (error) {
    console.error('Error getting officer targets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve officer targets',
      error: error.message
    });
  }
};


/**
 * Alternative endpoint that returns separate arrays instead of nested structure
 */
// exports.getDCenterTargetSeparate = async (req, res) => {
//     console.log("getDCenterTargetSeparate endpoint called");

//     try {
//         const officerId = req.user.id;
//         console.log("Officer ID from token:", officerId);

//         // Validate officerId
//         if (!officerId || isNaN(officerId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid officer ID provided'
//             });
//         }

//         // Get targets from DAO (separate method)
//         const result = await targetDDao.getCenterTargetSeparate(officerId);
//         console.log("Separate DAO result counts:", {
//             officers: result.officers.length,
//             targets: result.targets.length,
//             targetItems: result.targetItems.length
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Distribution center targets retrieved successfully',
//             data: {
//                 officers: result.officers,
//                 targets: result.targets,
//                 targetItems: result.targetItems,
//                 summary: {
//                     totalOfficers: result.officers.length,
//                     totalTargets: result.targets.length,
//                     totalTargetItems: result.targetItems.length
//                 }
//             },
//             timestamp: new Date().toISOString()
//         });

//     } catch (error) {
//         console.error('Error in getDCenterTargetSeparate endpoint:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to retrieve distribution center targets',
//             error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//         });
//     }
// };
exports.getProfile = async (req, res) => {
  try {
    const officerId = req.user.id; // Assuming req.user.id is set after authentication
    console.log("Fetching details for Officer ID:", officerId);

    if (!officerId) {
      return res.status(400).json({ status: "error", message: "Officer ID is required" });
    }

    const officerDetails = await distributionofficerDao.getOfficerDetailsById(officerId);

    res.status(200).json({
      status: "success",
      data: officerDetails,
    });

  } catch (error) {
    console.error("Error fetching officer details:", error.message);

    if (error.message === "Officer not found") {
      return res.status(404).json({ status: "error", message: "Officer not found" });
    }

    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching officer details",
    });
  }
};


// In your controller file (e.g., replaceRequestController.js)
exports.getAllReplaceRequests = async (req, res) => {
  console.log("getAllReplaceRequests called");
  try {
    // Get all replace requests from DAO

    const managerId = req.user.id

    console.log("endpointt manager idd", managerId)

    const replaceRequests = await targetDDao.getAllReplaceRequests(managerId);

    console.log("Replace requests data:", replaceRequests);

    res.status(200).json({
      success: true,
      message: 'All replace requests retrieved successfully',
      data: replaceRequests
    });
  } catch (error) {
    console.error('Error getting replace requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve replace requests',
      error: error.message
    });
  }
};


exports.getRetailItemWithOutEclist = async (req, res) => {
  console.log("getRetailItemWithOutEclist called");
  try {
    const { ordreId } = req.params;
    console.log("Order ID:", ordreId);

    if (!ordreId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Get retail items excluding user's excluded items
    const retailItems = await targetDDao.getRetailItemsExcludingUserExclusions(ordreId);
    console.log("Retail items data:", retailItems);

    res.status(200).json({
      success: true,
      message: 'Retail items retrieved successfully',
      data: retailItems
    });
  } catch (error) {
    console.error('Error getting retail items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve retail items',
      error: error.message
    });
  }
};



// Controller Function
exports.getOrdreReplace = async (req, res) => {
  console.log("getOrdreReplace called");
  try {
    const { id } = req.params;
    console.log("Order Package ID:", id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order Package ID is required'
      });
    }

    // Get replace request data for the order package
    const replaceRequests = await targetDDao.getOrdreReplace(id);
    console.log("Replace request data:", replaceRequests);

    res.status(200).json({
      success: true,
      message: 'Replace request data retrieved successfully',
      data: replaceRequests,
      count: replaceRequests.length
    });
  } catch (error) {
    console.error('Error getting replace request data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve replace request data',
      error: error.message
    });
  }
};

exports.getReplaceReuset = async (req, res) => {
  console.log("getOrdreReplace called");
  try {
    const { id } = req.params;
    console.log("Order Package ID:", id);


    // Get replace request data for the order package
    const replaceRequests = await targetDDao.getReplaceReuset();
    console.log("Replace request data:", replaceRequests);

    res.status(200).json({
      success: true,
      message: 'Replace request data retrieved successfully',
      data: replaceRequests,
      count: replaceRequests.length
    });
  } catch (error) {
    console.error('Error getting replace request data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve replace request data',
      error: error.message
    });
  }
};


exports.approveReplaceRequest = async (req, res) => {
  console.log("approveReplaceRequest called");

  try {
    const {
      replaceRequestId,
      newProductId,
      quantity,
      price,
      orderId,
      newProduct
    } = req.body;

    console.log("Request body:", req.body);

    // Validate required fields
    if (!replaceRequestId || !newProductId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: replaceRequestId, newProductId, quantity, price'
      });
    }

    // Update the replace request with new product details
    const updateResult = await targetDDao.approveReplaceRequest({
      replaceRequestId,
      newProductId,
      quantity: parseFloat(quantity),
      price: parseFloat(price)
    });

    console.log("Update result:", updateResult);

    if (updateResult.success) {
      res.status(200).json({
        success: true,
        message: 'Replace request approved successfully',
        data: updateResult.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: updateResult.message || 'Failed to approve replace request'
      });
    }

  } catch (error) {
    console.error('Error approving replace request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve replace request',
      error: error.message
    });
  }
};