const collectionDao = require('../dao/collection-dao');
const asyncHandler = require('express-async-handler');

exports.getAllCollectionRequest = async (req, res) => {
    try {
        // Use default values or empty strings if query params are undefined
        const status = req.query.status || '';
        const assignedStatus = req.query.assignedStatus || '';

        console.log('Received Query Parameters:', {
            status: status || 'No status filter',
            assignedStatus: assignedStatus || 'No assignedStatus filter'
        });

        const collectionRequests = await collectionDao.getAllCollectionRequest(
            status,
            assignedStatus
        );

        if (!collectionRequests || collectionRequests.length === 0) {
            return res.status(404).json({
                message: 'No collection requests found',
                params: { status, assignedStatus }
            });
        }

        res.status(200).json(collectionRequests);
    } catch (error) {
        console.error('Error fetching collection requests:', error);
        res.status(500).json({
            error: 'Failed to retrieve collection requests',
            details: error.message
        });
    }
};
