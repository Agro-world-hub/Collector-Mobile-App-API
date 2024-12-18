const ComplaintDao = require('../dao/complaint-dao');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs
const {
    createComplain
} = require('../Validations/complain-validation')
const asyncHandler = require("express-async-handler");
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
        // const { firstNameEnglish, lastNameEnglish, phoneNumber01 } = req.user;

        // Construct officerName and officerPhone from payload
        // const officerName = `${firstNameEnglish} ${lastNameEnglish}`;
        // const officerPhone = phoneNumber01;

        // Generate a unique reference number based on a pattern
        // const refNo = `COMP-${uuidv4().slice(0, 8)}`; // Example pattern: COMP-xxxxxx

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


exports.createOfficerComplain = asyncHandler(async(req, res) => {
    try {
        const coId = req.user.id;

        const { language, complain, category } = req.body;
        const status = "Opened";

        console.log("Creating complain:", { coId, language, complain, category, status });

        const newComplainId = await ComplaintDao.createOfficerComplaint(
            coId,
            language,
            complain,
            category,
            status
        );

        res.status(201).json({
            status: "success",
            message: "Complain created successfully.",
            complainId: newComplainId,
        });
    } catch (err) {
        console.error("Error creating complain:", err);

        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
});

exports.getComplains = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        const complains = await ComplaintDao.getAllComplaintsByUserId(userId);

        if (!complains || complains.length === 0) {
            return res.status(404).json({ message: "No complaints found" });
        }

        res.status(200).json(complains);
        console.log("Complaints fetched successfully", complains);
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ message: "Failed to fetch complaints" });
    }
});

// exports.getComplainReplyByid = asyncHandler(async(req, res) => {
//     try {
//         const reply = await ComplaintDao.getAllComplaintsByUserId(id);

//         if (!complains || complains.length === 0) {
//             return res.status(404).json({ message: "No complaints found" });
//         }

//         res.status(200).json(reply);
//         console.log("reply fetched successfully", reply);
//     } catch (error) {
//         console.error("Error fetching complaints:", error);
//         res.status(500).json({ message: "Failed to fetch complaints" });
//     }
// });