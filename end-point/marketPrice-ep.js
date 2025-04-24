const marketPriceDAO = require('../dao/marketPrice-dao'); // Import the DAO layer
const  marketPriceRequestSchema  = require('../Validations/marketPrice-validation');


exports.insertMarketPriceRequestBatch = async (req, res) => {
    try {
        
        console.log('Market Price Request Body:', req.body); // For debugging purposes
        
          // Validate the request body using Joi
          const { error, value } = marketPriceRequestSchema.priceItemSchema.validate(req.body, { abortEarly: false });
        
          if (error) {
              const validationErrors = error.details.map(detail => detail.message);
              return res.status(400).json({ 
                  message: 'Validation failed', 
                  errors: validationErrors 
              });
          }
          
          
        const { prices } = req.body; // prices is an array of price update objects
        console.log(req.body); // For debugging purposes

        if (!prices || prices.length === 0) {
            return res.status(400).json({ message: 'No prices provided for update.' });
        }

        const userId = req.user.id; // Get the user ID from the authenticated user
        console.log(userId); // For debugging purposes

        const status = 'Pending'; // Default status

        // Step 1: Get the empId from collectionofficercompanydetails based on req.user.id
        const empId = await marketPriceDAO.getEmpIdFromCollectionOfficerCompanyDetails(userId);
        if (!empId) {
            return res.status(404).json({ message: 'Employee not found in collectionofficercompanydetails.' });
        }

        console.log(empId); // For debugging purposes

        // Step 2: Get the centerId of the employee (empId) from collectionofficer table
        const centerId = await marketPriceDAO.getCenterIdFromCollectionOfficer(empId);
        if (!centerId) {
            return res.status(404).json({ message: 'Employee not found in collectionofficer.' });
        }

        // Step 3: Prepare the price update data and fetch the corresponding marketPriceId for each grade
        const priceRequests = [];
        for (const price of prices) {
            const { varietyId, grade, requestPrice } = price;

            // Get the original price for the varietyId and grade from the marketprice table
            const originalPrice = await marketPriceDAO.getMarketPrice(varietyId, grade);
            if (!originalPrice) {
                return res.status(404).json({ message: `Market price for varietyId ${varietyId} and grade ${grade} not found.` });
            }

            // Compare the original price with the requestPrice
            if (parseFloat(originalPrice) !== parseFloat(requestPrice)) {
                // Get the marketPriceId for each price (varietyId and grade)
                const marketPriceId = await marketPriceDAO.getMarketPriceId(varietyId, grade);
                if (!marketPriceId) {
                    return res.status(404).json({ message: `Market price ID for varietyId ${varietyId} and grade ${grade} not found.` });
                }

                // Prepare the price request data only if the price has changed
                priceRequests.push([
                    marketPriceId, centerId, requestPrice, status, empId
                ]);
            }
        }

        // Step 4: Insert all the price requests in one query (batch insert)
        if (priceRequests.length > 0) {
            const insertResult = await marketPriceDAO.insertPriceRequests(priceRequests);

            return res.status(201).json({
                message: 'Market price requests created successfully.',
                requestId: insertResult.insertId
            });
        } else {
            return res.status(400).json({ message: 'No valid price data to insert (no price changes).' });
        }

    } catch (error) {
        console.error('Error inserting market price request:', error);
        return res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
};
