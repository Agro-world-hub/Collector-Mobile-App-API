const collectionDao = require('../dao/collection-dao');
const asyncHandler = require('express-async-handler');

//this is a endpoint

exports.getAllCollectionRequest = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the authenticated request
        console.log('User ID:', userId);
        // Use default values or empty strings if query params are undefined
        const status = req.query.status || '';
        const assignedStatus = req.query.assignedStatus || '';

        console.log('Received Query Parameters:', {
            status: status || 'No status filter',
            assignedStatus: assignedStatus || 'No assignedStatus filter'
        });

        const collectionRequests = await collectionDao.getAllCollectionRequest(
            status,
            assignedStatus,
            userId
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

exports.getViewDetailsById = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: 'Request ID is required'
            });
        }

        const collectionRequest = await collectionDao.getViewDetailsById(requestId);

        if (!collectionRequest) {
            return res.status(404).json({
                success: false,
                message: 'Collection request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: collectionRequest
        });
    } catch (error) {
        console.error('Error fetching collection request details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve collection request details',
            details: error.message
        });
    }
};



exports.cancellRequest = async (req, res) => {
    try {
        const { requestId, cancelReason } = req.body;

        // Validate request parameters
        if (!requestId || !cancelReason) {
            return res.status(400).json({
                success: false,
                message: 'Request ID and cancellation reason are required'
            });
        }

        // Get user ID from the authenticated request
        const userId = req.user.id;

        // Call the DAO function to cancel the request
        const result = await collectionDao.cancelRequest(requestId, cancelReason, userId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        // Return successful response
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in cancellRequest endpoint:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while cancelling the collection request',
            error: error.message
        });
    }
};

exports.updateCollectionRequest = async (req, res) => {
    console.log('Update Collection Request Endpoint Hit');
    try {
      const { requestId } = req.params;
      const { scheduleDate } = req.body;
  
      console.log('Request ID:', requestId);
      console.log('Schedule Date:', scheduleDate);
  
      // Validate request parameters
      if (!requestId || !scheduleDate) {
        return res.status(400).json({
          success: false,
          message: 'Request ID and schedule date are required'
        });
      }
  
      const result = await collectionDao.updateCollectionRequest(requestId, scheduleDate);
      console.log('Update Result:', result);
  
      // Check if the update was successful
      if (!result.success) {
        return res.status(404).json(result); 
      }
  
      // Return successful response
      return res.status(200).json(result); // Success response with message
  
    } catch (error) {
      console.error('Error in updateCollectionRequest endpoint:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while updating the collection request',
        error: error.message
      });
    }
  };
  