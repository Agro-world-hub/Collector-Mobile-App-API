require('dotenv').config();
const { createUsersTable } = require('./tables');
const { createAdminUsersTable } = require('./tables');
const { createContentTable } = require('./tables');
const { createCropCalenderTable } = require('./tables');
const { createCropCalenderDaysTable } = require('./tables');
const { createOngoingCultivationsTable } = require('./tables');
const { createMarketPriceTable } = require('./tables');
const { createOngoingCultivationsCropsTable } = require('./tables');
const { createFixedAsset } = require('./tables');
const { createCurrentAssetTable } = require('./tables');


const { createCollectionOfficer } = require('./tables');
const { createCollectionOfficerCompanyDetails } = require('./tables');
const { createCollectionOfficerBankDetails } = require('./tables');
const { createRegisteredFarmerPayments } = require('./tables');
const { createUserBankDetails } = require('./tables');


const {createSuperAdmin} = require('./admin')


const runSeeds = async () => {
  try {
    const messageUsers = await createUsersTable();
    console.log(messageUsers);
    const messageAdmin = await createAdminUsersTable();
    console.log(messageAdmin);
    const messageAdminCreate = await createSuperAdmin();
    console.log(messageAdminCreate);
    const messageContentTableCreate = await createContentTable();
    console.log(messageContentTableCreate);
    const messageCropCallender = await createCropCalenderTable();
    console.log(messageCropCallender);
    const messageCropCallenderDays = await createCropCalenderDaysTable();
    console.log(messageCropCallenderDays);
    const messageOngoingCultivation = await createOngoingCultivationsTable();
    console.log(messageOngoingCultivation);
    const messageMarketPrice = await createMarketPriceTable();
    console.log(messageMarketPrice);
    const createOngoingCultivationsCro = await createOngoingCultivationsCropsTable();
    console.log(createOngoingCultivationsCro);
    const messageCurrentAsset = await createCurrentAssetTable();
    console.log(messageCurrentAsset);
    const messageFixedAsset = await createFixedAsset();
    console.log(messageFixedAsset);





    const messageCreateCollectionOfficer = await createCollectionOfficer();
    console.log(messageCreateCollectionOfficer);
    const messageCreateCollectionOfficerCompanyDetails = await createCollectionOfficerCompanyDetails();
    console.log(messageCreateCollectionOfficerCompanyDetails);
    const messagecreateCollectionOfficerBankDetails = await createCollectionOfficerBankDetails();
    console.log(messagecreateCollectionOfficerBankDetails);
    const messageCreateRegisteredFarmerPayments = await createRegisteredFarmerPayments();
    console.log(messageCreateRegisteredFarmerPayments);
    const messageCreateUserBankDetails = await createUserBankDetails();
    console.log(messageCreateUserBankDetails);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

runSeeds();
