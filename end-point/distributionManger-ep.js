const targetDDao = require('../dao/distributionManager-dao');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

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