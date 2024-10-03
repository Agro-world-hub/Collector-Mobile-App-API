const db = require('../startup/database');

const createUsersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      phoneNumber VARCHAR(255) NOT NULL,
      NICnumber VARCHAR(255) NOT NULL,
      profileImage VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating users table: ' + err);
      } else {
        resolve('Users table created successfully.');
      }
    });
  });
};

const createAdminUsersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS adminUsers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mail VARCHAR(255) NOT NULL,
      userName VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating adminUsers table: ' + err);
      } else {
        resolve('adminUsers table created successfully.');
      }
    });
  });
};


const createContentTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titleEnglish VARCHAR(255) NOT NULL,
      titleSinhala VARCHAR(255) NOT NULL,
      titleTamil VARCHAR(255) NOT NULL,
      descriptionEnglish  VARCHAR(1000) NOT NULL,
      descriptionSinhala VARCHAR(1000) NOT NULL,
      descriptionTamil VARCHAR(1000) NOT NULL,
      image VARCHAR(255),
      status VARCHAR(50) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      createdBy INT,
      FOREIGN KEY (createdBy) REFERENCES adminUsers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating content table: ' + err);
      } else {
        resolve('Content table created successfully.');
      }
    });
  });
};


const createCropCalenderTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS cropCalender (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cropName VARCHAR(255) NOT NULL,
      variety VARCHAR(255) NOT NULL,
      CultivationMethod VARCHAR(255) NOT NULL,
      NatureOfCultivation VARCHAR(255) NOT NULL,
      CropDuration VARCHAR(255) NOT NULL,
      SpecialNotes TEXT,
      image VARCHAR(255),
      cropColor VARCHAR(50),
      SuitableAreas TEXT NOT NULL,
      Category VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating cropCalender table: ' + err);
      } else {
        resolve('CropCalender table created successfully.');
      }
    });
  });
};



const createCropCalenderDaysTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS cropcalendardays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cropId INT(11) NULL,
    taskIndex INT(255) NULL,
    days INT(11) NULL,
    taskTypeEnglish VARCHAR(255) COLLATE latin1_swedish_ci NULL,
    taskTypeSinhala VARCHAR(255) COLLATE utf8_unicode_ci NULL,
    taskCategoryEnglish VARCHAR(255) COLLATE latin1_swedish_ci NULL,
    taskCategorySinhala VARCHAR(255) COLLATE utf8_unicode_ci NULL,
    taskEnglish VARCHAR(255) COLLATE latin1_swedish_ci NULL,
    taskSinhala VARCHAR(255) COLLATE utf8_unicode_ci NULL,
    taskDescriptionEnglish VARCHAR(5000) COLLATE latin1_swedish_ci NULL,
    taskDescriptionSinhala VARCHAR(5000) COLLATE utf8_unicode_ci NULL,
    taskDescriptionTamil VARCHAR(5000) COLLATE utf8_unicode_ci NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (cropId) REFERENCES cropCalender(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating cropCalenderDays table: ' + err);
      } else {
        resolve('CropCalenderDays table created successfully.');
      }
    });
  });
};

const createOngoingCultivationsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS ongoingCultivations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating ongoingCultivations table: ' + err);
      } else {
        resolve('OngoingCultivations table created successfully.');
      }
    });
  });
};



const createMarketPriceTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS marketprice (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titleEnglish VARCHAR(255) NOT NULL,
      titleSinhala VARCHAR(255) NOT NULL,
      titleTamil VARCHAR(255) NOT NULL,
      descriptionEnglish TEXT NOT NULL,
      descriptionSinhala TEXT NOT NULL,
      descriptionTamil TEXT NOT NULL,
      image VARCHAR(255),
      status VARCHAR(50) NOT NULL,
      price VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      createdBy INT,
      FOREIGN KEY (createdBy) REFERENCES adminUsers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating market-price table: ' + err);
      } else {
        resolve('market-price table created successfully.');
      }
    });
  });
};


const createOngoingCultivationsCropsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS ongoingCultivationsCrops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ongoingCultivationId INT,
      cropCalendar INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ongoingCultivationId) REFERENCES ongoingCultivations(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (cropCalendar) REFERENCES cropCalender(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating ongoingCultivationsCrops table: ' + err);
      } else {
        resolve('OngoingCultivationsCrops table created successfully.');
      }
    });
  });
};


const createCurrentAssetTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS currentasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      assetType VARCHAR(255) NOT NULL,
      assetName VARCHAR(255) NOT NULL,
      value INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating current asset table: ' + err);
      } else {
        resolve('current asset table created successfully.');
      }
    });
  });
};

const createFixedAsset = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS fixedasset (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      tool VARCHAR(255) NOT NULL,
      toolType VARCHAR(255) NOT NULL,
      brandName VARCHAR(255) NOT NULL,
      purchaseDate DATETIME NOT NULL,
      unit VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      warranty VARCHAR(255),
      expireDate DATETIME ,
      depreciation INT,
      warrantyStatus VARCHAR(255) ,
      category VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating fixed asset table: ' + err);
      } else {
        resolve('Fixed asset table created successfully.');
      }
    });
  });
};



//Collection officer tables

const createCollectionOfficer = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS collectionofficer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      phoneNumber01 VARCHAR(255) NOT NULL,
      phoneNumber02 VARCHAR(255) NOT NULL,
      image VARCHAR(255) NOT NULL,
      nic VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      passwordUpdated  VARCHAR(255) NOT NULL,
      houseNumber VARCHAR(255) NOT NULL,
      streetName VARCHAR(255) NOT NULL,
      district VARCHAR(255) NOT NULL,
      province VARCHAR(255) NOT NULL,
      country VARCHAR(255) NOT NULL,
      languages VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating collection officer table: ' + err);
      } else {
        resolve('collection officer table created successfully.');
      }
    });
  });
};


const createCollectionOfficerCompanyDetails = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS collectionofficercompanydetails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      collectionOfficerId INT,
      companyName VARCHAR(255) NOT NULL,
      jobRole VARCHAR(255) NOT NULL,
      IRMname VARCHAR(255) NOT NULL,
      managerContactNumber VARCHAR(255) NOT NULL,
      companyEmail VARCHAR(255) NOT NULL,
      assignedDistrict VARCHAR(255) NOT NULL,
      employeeType VARCHAR(255) NOT NULL,
      FOREIGN KEY (collectionOfficerId) REFERENCES collectionofficer(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating collection officer company details table: ' + err);
      } else {
        resolve('collection officer company details table created successfully.');
      }
    });
  });
};



const createCollectionOfficerBankDetails = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS collectionofficerbankdetails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      collectionOfficerId INT,
      accHolderName VARCHAR(255) NOT NULL,
      accNumber VARCHAR(255) NOT NULL,
      bankName VARCHAR(255) NOT NULL,
      FOREIGN KEY (collectionOfficerId) REFERENCES collectionofficer(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating collection bank details officer table: ' + err);
      } else {
        resolve('collection officer bank details table created successfully.');
      }
    });
  });
};


const createRegisteredFarmerPayments = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS registeredfarmerpayments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      collectionOfficerId INT,
      cropName VARCHAR(255) NOT NULL,
      quality VARCHAR(255) NOT NULL,
      unitPrice DECIMAL(20, 2) NOT NULL,
      quantity INT NOT NULL,
      total DECIMAL(20, 2) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      FOREIGN KEY (collectionOfficerId) REFERENCES collectionofficer(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating registeredfarmerpayments table: ' + err);
      } else {
        resolve('registeredfarmerpayments table created successfully.');
      }
    });
  });
};

const createUserBankDetails = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS userbankdetails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      address VARCHAR(255) NOT NULL,
      accNumber VARCHAR(255) NOT NULL,
      accHolderName VARCHAR(255) NOT NULL,
      bankName VARCHAR(255) NOT NULL,
      branchName VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject('Error creating userbankdetails table: ' + err);
      } else {
        resolve('userbankdetails table created successfully.');
      }
    });
  });
};


module.exports = {
  createUsersTable,
  createAdminUsersTable,
  createContentTable,
  createCropCalenderTable,
  createCropCalenderDaysTable,
  createOngoingCultivationsTable,
  createMarketPriceTable,
  createOngoingCultivationsCropsTable,
  createCurrentAssetTable,
  createFixedAsset,

  //collection officer
  createCollectionOfficer,
  createCollectionOfficerCompanyDetails,
  createCollectionOfficerBankDetails,
  createRegisteredFarmerPayments,
  createUserBankDetails
};
