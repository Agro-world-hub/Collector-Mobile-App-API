const ComplaintDao = require('../dao/complaint-dao');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs

// Function to create a farmer complaint
exports.createFarmerComplaint = async (req, res) => {
    try {
        const { complain, language, userId, category } = req.body;
        console.log('Request payload:', req.body);

        // Validate required fields
        if (!complain || !language || !userId || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const userExists = await ComplaintDao.checkIfUserExists(userId);
        
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }else{
            console.log('User exists');
        }
        farmerId = userExists.id;
        // Extract officer details from the request user
        const { firstNameEnglish, lastNameEnglish, phoneNumber01 } = req.user;

        // Construct officerName and officerPhone from payload
        const officerName = `${firstNameEnglish} ${lastNameEnglish}`;
        const officerPhone = phoneNumber01;

        // Generate a unique reference number based on a pattern
        const refNo = `COMP-${uuidv4().slice(0, 8)}`; // Example pattern: COMP-xxxxxx

        // Default status
        const status = 'Opened';

        // Call the DAO to insert the complaint into the database
     const compain =   await ComplaintDao.createComplaint(complain, language, farmerId, category, status );
        console.log(compain )

        return res.status(201).json({ message: 'Complaint registered successfully'});
    } catch (error) {
        console.error('Error inserting complaint:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
