// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// const dotenv = require('dotenv');

// dotenv.config();

// const connection = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// // Helper function to execute SQL queries
// function query(sql, args) {
//     return new Promise((resolve, reject) => {
//         connection.query(sql, args, (err, rows) => {
//             if (err) reject(err);
//             else resolve(rows);
//         });
//     });
// }

// // Function to sign JWT token
// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };

// async function createSkillProvidersTable() {
//     const createSkillProvidersTableQuery = `
//         CREATE TABLE IF NOT EXISTS skill_providers (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             firstName VARCHAR(255) NOT NULL,
//             lastName VARCHAR(255) NOT NULL,
//             email VARCHAR(255),
//             password VARCHAR(255) NOT NULL,
//             phone VARCHAR(20),
//             secondPhone VARCHAR(20),
//             stateOfResidence VARCHAR(255) NOT NULL,
//             city VARCHAR(255) NOT NULL,
//             street VARCHAR(255) NOT NULL,
//             address VARCHAR(255),
//             serviceTypeId INT,
//             subCategoryId INT,
//             openingHour VARCHAR(255),
//             referralCode VARCHAR(255),
//             imagePath VARCHAR(255),
//             userId INT,
//             FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
//             FOREIGN KEY (serviceTypeId) REFERENCES skill_types(id),
//             FOREIGN KEY (subCategoryId) REFERENCES skill_types(id),
//             latitude DECIMAL(10, 8),
//             longitude DECIMAL(11, 8),
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         );
//     `;
//     try {
//         await query(createSkillProvidersTableQuery);
//         console.log('SkillProviders table created successfully');
//     } catch (error) {
//         console.error('Error creating SkillProviders table:', error);
//         throw error;
//     }
// }

// async function createSkillTypesTable() {
//     const createSkillTypesTableQuery = `
//         CREATE TABLE IF NOT EXISTS skill_types (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceType VARCHAR(255) NOT NULL,
//             subCategory VARCHAR(255) NOT NULL,
//             UNIQUE(serviceType, subCategory)
//         );
//     `;
//     try {
//         await query(createSkillTypesTableQuery);
//         console.log('SkillTypes table created successfully');
//     } catch (error) {
//         console.error('Error creating SkillTypes table:', error);
//         throw error;
//     }
// }

// createSkillProvidersTable(); // Immediately create the skill_providers table on module load
// createSkillTypesTable(); // Immediately create the skill_types table on module load

// const skillProviderService = {};

// skillProviderService.emailExists = async (email) => {
//     try {
//         let selectQuery;
//         let queryParams;
        
//         if (email === null) {
//             selectQuery = 'SELECT COUNT(*) AS count FROM skill_providers WHERE email IS NULL';
//             queryParams = [];
//         } else {
//             selectQuery = 'SELECT COUNT(*) AS count FROM skill_providers WHERE email = ?';
//             queryParams = [email];
//         }

//         const result = await query(selectQuery, queryParams);
//         const count = result[0].count;
//         return count > 0;
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderService.phoneExists = async (phone) => {
//     try {
//         const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE phone = ?';
//         const result = await query(selectQuery, [phone]);
//         const count = result[0].count;
//         return count > 0;
//     } catch (error) {
//         throw error;
//     }
// };

// // skillProviderService.createSkillProvider = async (skillProviderData) => {
// //     try {
// //         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath } = skillProviderData;

// //         // Check if email or phone already exists
// //         const emailExists = await skillProviderService.emailExists(email);
// //         if (emailExists) {
// //             throw new Error('Email already exists');
// //         }

// //         const phoneExists = await skillProviderService.phoneExists(phone);
// //         if (phoneExists) {
// //             throw new Error('Phone number already exists');
// //         }

// //         // Hash the password
// //         const hashedPassword = await bcrypt.hash(password, 12);

// //         // Construct full address
// //         const address = `${street}, ${city}, ${stateOfResidence}`;

// //         // Insert data into skill_types table for service type and subcategory
// //         const [serviceTypeResult] = await query('INSERT IGNORE INTO skill_types (serviceType, subCategory) VALUES (?, ?)', [serviceType, subCategory]);

// //         // Retrieve the service type and subcategory IDs
// //         const serviceTypeId = serviceTypeResult.insertId;

// //         // Insert data into skill_providers table
// //         const insertProviderQuery = `
// //             INSERT INTO skill_providers (firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, address, serviceTypeId, subCategoryId, openingHour, referralCode, imagePath)
// //             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
// //         `;
// //         const providerResult = await query(insertProviderQuery, [firstName, lastName, email, hashedPassword, phone, secondPhone, stateOfResidence, city, street, address, serviceTypeId, serviceTypeId, openingHour, referralCode, imagePath]);

// //         // Retrieve the providerId
// //         const providerId = providerResult.insertId;

// //         // Insert data into users table with providerId
// //         const insertUserQuery = `
// //             INSERT INTO users (firstName, lastName, email, phone, password, role, userType, providerId)
// //             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
// //         `;
// //         const userResult = await query(insertUserQuery, [firstName, lastName, email, phone, hashedPassword, 'user', 'SkillProvider', providerId]);

// //         // Check if user insertion was successful
// //         if (!userResult.insertId) {
// //             throw new Error('Failed to insert user');
// //         }

// //         // Generate JWT token
// //         const token = signToken(userResult.insertId);

// //         // Return the newly created user data along with the token
// //         return { id: userResult.insertId, token, ...skillProviderData, address };
        
// //     } catch (error) {
// //         throw error;
// //     }
// // };



// skillProviderService.createSkillProvider = async (skillProviderData) => {
//     try {
//         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath } = skillProviderData;

//         // Check if email or phone already exists
//         const emailExists = await skillProviderService.emailExists(email);
//         if (emailExists) {
//             throw new Error('Email already exists');
//         }

//         const phoneExists = await skillProviderService.phoneExists(phone);
//         if (phoneExists) {
//             throw new Error('Phone number already exists');
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Construct full address
//         const address = `${street}, ${city}, ${stateOfResidence}`;

//         // Insert data into skill_types table for service type and subcategory if not exists
//         const [serviceTypeResult] = await query('INSERT IGNORE INTO skill_types (serviceType, subCategory) VALUES (?, ?)', [serviceType, subCategory]);

//         // Retrieve the service type and subcategory IDs
//         let serviceTypeId;
//         if (serviceTypeResult) {
//             serviceTypeId = serviceTypeResult.insertId;
//         } else {
//             // Retrieve service type ID if it already exists
//             const serviceTypeQuery = 'SELECT id FROM skill_types WHERE serviceType = ? AND subCategory = ?';
//             const [serviceTypeRow] = await query(serviceTypeQuery, [serviceType, subCategory]);
//             if (serviceTypeRow) {
//                 serviceTypeId = serviceTypeRow.id;
//             } else {
//                 throw new Error('Failed to retrieve service type ID');
//             }
//         }

//         // Insert data into skill_providers table
//         const insertProviderQuery = `
//             INSERT INTO skill_providers (firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, address, serviceTypeId, subCategoryId, openingHour, referralCode, imagePath)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const providerResult = await query(insertProviderQuery, [firstName, lastName, email, hashedPassword, phone, secondPhone, stateOfResidence, city, street, address, serviceTypeId, serviceTypeId, openingHour, referralCode, imagePath]);

//         // Retrieve the providerId
//         const providerId = providerResult.insertId;

//         // Insert data into users table with providerId
//         const insertUserQuery = `
//             INSERT INTO users (firstName, lastName, email, phone, password, role, userType, providerId)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const userResult = await query(insertUserQuery, [firstName, lastName, email, phone, hashedPassword, 'user', 'SkillProvider', providerId]);

//         // Check if user insertion was successful
//         if (!userResult.insertId) {
//             throw new Error('Failed to insert user');
//         }

//         // Generate JWT token
//         const token = signToken(userResult.insertId);

//         // Return the newly created user data along with the token
//         return { id: userResult.insertId, token, ...skillProviderData, address, serviceType, subCategory };
        
//     } catch (error) {
//         throw error;
//     }
// };


// skillProviderService.getAllSkillProviders = async () => {
//     try {
//         const selectAllQuery = `
//             SELECT sp.*, st.serviceType, st.subCategory 
//             FROM skill_providers sp
//             INNER JOIN skill_types st ON sp.serviceTypeId = st.id AND sp.subCategoryId = st.id
//         `;
//         const skillProviders = await query(selectAllQuery);
//         return skillProviders;
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderService.getSkillProviderById = async (id) => {
//     try {
//         const selectQuery = `
//             SELECT sp.*, st.serviceType, st.subCategory 
//             FROM skill_providers sp
//             INNER JOIN skill_types st ON sp.serviceTypeId = st.id AND sp.subCategoryId = st.id
//             WHERE sp.id = ?
//         `;
//         const skillProviders = await query(selectQuery, [id]);
//         return skillProviders[0];
//     } catch (error) {
//         throw error;
//     }
// };

// // skillProviderService.updateSkillProviderProfileWithImage = async (providerId, providerData) => {
// //     try {
// //         // Retrieve current skillProvider data from the database
// //         const currentProvider = await skillProviderService.getSkillProviderById(providerId);
// //         if (!currentProvider) {
// //             throw new Error('Skill provider not found');
// //         }

// //         // Construct the updated address
// //         const updatedAddress = [
// //             providerData.stateOfResidence || currentProvider.stateOfResidence,
// //             providerData.city || currentProvider.city,
// //             providerData.street || currentProvider.street
// //         ].filter(Boolean).join(', ');

// //         // Prepare update query based on changed fields
// //         const updateFields = Object.entries(providerData).filter(([key, value]) => value !== currentProvider[key] && key !== 'imagePath');
// //         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
// //         const updateParams = updateFields.map(([key, value]) => value);

// //         // Add imagePath and updated address to updateParams
// //         updateParams.push(providerData.imagePath || currentProvider.imagePath);
// //         updateParams.push(updatedAddress);

// //         // Add providerId at the end of updateParams
// //         updateParams.push(providerId);

// //         // Update skill provider data in the database
// //         const updateQuery = `
// //             UPDATE skill_providers 
// //             SET ${updateValues}, imagePath=?, address=?
// //             WHERE id=?
// //         `;
// //         await query(updateQuery, updateParams);

// //         // Return updated skill provider data
// //         return { ...currentProvider, ...providerData, address: updatedAddress };
// //     } catch (error) {
// //         throw error;
// //     }
// // };


// skillProviderService.updateSkillProviderProfileWithImage = async (providerId, providerData) => {
//     try {
//         // Retrieve current skill provider data from the database
//         const currentProvider = await skillProviderService.getSkillProviderById(providerId);
//         if (!currentProvider) {
//             throw new Error('Skill provider not found');
//         }

//         // Construct the updated address
//         const updatedAddress = [
//             providerData.stateOfResidence || currentProvider.stateOfResidence,
//             providerData.city || currentProvider.city,
//             providerData.street || currentProvider.street
//         ].filter(Boolean).join(', ');

//         // Prepare update query based on changed fields
//         const updateFields = Object.entries(providerData).filter(([key, value]) => value !== currentProvider[key] && key !== 'imagePath');
//         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
//         const updateParams = updateFields.map(([key, value]) => value);

//         // Add imagePath and updated address to updateParams
//         updateParams.push(providerData.imagePath || currentProvider.imagePath);
//         updateParams.push(updatedAddress);

//         // Add providerId at the end of updateParams
//         updateParams.push(providerId);

//         // Update skill provider data in the database
//         const updateQuery = `
//             UPDATE skill_providers 
//             SET ${updateValues}, imagePath=?, address=?
//             WHERE id=?
//         `;
//         await query(updateQuery, updateParams);

//         // Check if the user exists
//         const userExists = await skillProviderService.userExists(providerId);
//         if (!userExists) {
//             throw new Error('User not found');
//         }

//         // Update user data in the users table
//         const updateUserQuery = `
//             UPDATE users
//             SET firstName = ?, lastName = ?, email = ?, phone = ?
//             WHERE providerId = ?
//         `;
//         await query(updateUserQuery, [providerData.firstName, providerData.lastName, providerData.email, providerData.phone, providerId]);

//         // Return updated skill provider data
//         return { ...currentProvider, ...providerData, address: updatedAddress };
//     } catch (error) {
//         throw error;
//     }
// };



// skillProviderService.deleteSkillProvider = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM skill_providers WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };


// // CRUD operations for skill types and subcategories

// skillProviderService.createSkillType = async (serviceType, subCategory) => {
//     try {
//         const insertQuery = 'INSERT INTO skill_types (serviceType, subCategory) VALUES (?, ?)';
//         const result = await query(insertQuery, [serviceType, subCategory]);
//         return result.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderService.getSkillTypeById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM skill_types WHERE id = ?';
//         const result = await query(selectQuery, [id]);
//         return result[0];
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderService.getAllSkillTypes = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM skill_types';
//         const result = await query(selectAllQuery);
//         return result;
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderService.updateSkillType = async (id, serviceType, subCategory) => {
//     try {
//         const updateQuery = 'UPDATE skill_types SET serviceType=?, subCategory=? WHERE id=?';
//         await query(updateQuery, [serviceType, subCategory, id]);
//         return { id, serviceType, subCategory };
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderService.deleteSkillType = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM skill_types WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };


// module.exports = skillProviderService;


// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// const dotenv = require('dotenv');

// dotenv.config();

// const connection = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// // Helper function to execute SQL queries
// function query(sql, args) {
//     return new Promise((resolve, reject) => {
//         connection.query(sql, args, (err, rows) => {
//             if (err) reject(err);
//             else resolve(rows);
//         });
//     });
// }

// // Function to sign JWT token
// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };



// async function createSkillProvidersTable() {
//     const createSkillProvidersTableQuery = `
//         CREATE TABLE IF NOT EXISTS skill_providers (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             firstName VARCHAR(255) NOT NULL,
//             lastName VARCHAR(255) NOT NULL,
//             email VARCHAR(255),
//             password VARCHAR(255) NOT NULL,
//             phone VARCHAR(20),
//             secondPhone VARCHAR(20),
//             stateOfResidence VARCHAR(255) NOT NULL,
//             city VARCHAR(255) NOT NULL,
//             street VARCHAR(255) NOT NULL,
//             address VARCHAR(255),
//             serviceType VARCHAR(255),
//             subCategory VARCHAR(255),
//             openingHour VARCHAR(255),
//             referralCode VARCHAR(255),
//             imagePath VARCHAR(255),
//             userId INT,
//             FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
//             latitude DECIMAL(10, 8),
//             longitude DECIMAL(11, 8),
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         );
//     `;
//     try {
//         await query(createSkillProvidersTableQuery);
//         console.log('SkillProviders table created successfully');
//     } catch (error) {
//         console.error('Error creating SkillProviders table:', error);
//         throw error;
//     }
// }


// createSkillProvidersTable(); // Immediately create the table on module load

// const skillProviderService = {};


// skillProviderService.emailExists = async (email) => {
//     try {
//         let selectQuery;
//         let queryParams;
        
//         if (email === null) {
//             selectQuery = 'SELECT COUNT(*) AS count FROM skill_providers WHERE email IS NULL';
//             queryParams = [];
//         } else {
//             selectQuery = 'SELECT COUNT(*) AS count FROM skill_providers WHERE email = ?';
//             queryParams = [email];
//         }

//         const result = await query(selectQuery, queryParams);
//         const count = result[0].count;
//         return count > 0;
//     } catch (error) {
//         throw error;
//     }
// };


// skillProviderService.phoneExists = async (phone) => {
//     try {
//         const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE phone = ?';
//         const result = await query(selectQuery, [phone]);
//         const count = result[0].count;
//         return count > 0;
//     } catch (error) {
//         throw error;
//     }
// };

// // skillProviderService.createSkillProvider = async (skillProviderData) => {
// //     try {
// //         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath } = skillProviderData;

// //         // Check if email or phone already exists
// //         const emailExists = await skillProviderService.emailExists(email);
// //         if (emailExists) {
// //             throw new Error('Email already exists');
// //         }

// //         const phoneExists = await skillProviderService.phoneExists(phone);
// //         if (phoneExists) {
// //             throw new Error('Phone number already exists');
// //         }

// //         // Hash the password
// //         const hashedPassword = await bcrypt.hash(password, 12);

// //         // Construct full address
// //         const address = `${street}, ${city}, ${stateOfResidence}`;

// //         // Create new user
// //         const newUserQuery = 'INSERT INTO users (firstName, lastName, email, phone,  password, role, userType) VALUES (?, ?, ?, ?, ?, ?, ?)';
// //         const newUserResult = await query(newUserQuery, [firstName, lastName, email, phone,  hashedPassword, 'user', 'SkillProvider']);

// //         // Generate JWT token
// //         const token = jwt.sign({ id: newUserResult.insertId }, process.env.JWT_SECRET, {
// //             expiresIn: process.env.JWT_EXPIRES_IN,
// //         });

// //         // Insert skillProvider data into the skill_providers table
// //         const insertQuery = `
// //             INSERT INTO skill_providers (firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, address, serviceType, subCategory, openingHour, referralCode, imagePath, userId)
// //             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
// //         `;
// //         const result = await query(insertQuery, [firstName, lastName, email, hashedPassword, phone, secondPhone, stateOfResidence, city, street, address, serviceType, subCategory, openingHour, referralCode, imagePath, newUserResult.insertId]);

// //         return { id: result.insertId, token, ...skillProviderData, address, imagePath };
// //     } catch (error) {
// //         throw error;
// //     }
// // };


// skillProviderService.createSkillProvider = async (skillProviderData) => {
//     try {
//         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath } = skillProviderData;

//         // Check if email or phone already exists
//        // Check if email is null
//     //    if (!email) {
//     //         throw new Error('Email was not assigned');
//     //     }

//         const phoneExists = await skillProviderService.phoneExists(phone);
//         if (phoneExists) {
//             throw new Error('Phone number already exists');
//         }

//         const emailExists = await skillProviderService.emailExists(email);
//         if (emailExists) {
//             throw new Error('Email already exists');
//         }
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Construct full address
//         const address = `${street}, ${city}, ${stateOfResidence}`;

//         // Insert data into skill_providers table
//         const insertProviderQuery = `
//             INSERT INTO skill_providers (firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, address, serviceType, subCategory, openingHour, referralCode, imagePath)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const providerResult = await query(insertProviderQuery, [firstName, lastName, email, hashedPassword, phone, secondPhone, stateOfResidence, city, street, address, serviceType, subCategory, openingHour, referralCode, imagePath]);

//         // Retrieve the providerId
//         const providerId = providerResult.insertId;

//         // Insert data into users table with providerId
//         const insertUserQuery = `
//             INSERT INTO users (firstName, lastName, email, phone, password, role, userType, providerId)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const userResult = await query(insertUserQuery, [firstName, lastName, email, phone, hashedPassword, 'user', 'SkillProvider', providerId]);

//         // Check if user insertion was successful
//         if (!userResult.insertId) {
//             throw new Error('Failed to insert user');
//         }

//         // Generate JWT token
//         const token = signToken(userResult.insertId);

//         // Return the newly created user data along with the token
//         return { id: userResult.insertId, token, ...skillProviderData, address };
        
//     } catch (error) {
//         throw error;
//     }
// };


// skillProviderService.getAllSkillProviders = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM skill_providers';
//         const skillProviders = await query(selectAllQuery);
//         return skillProviders;
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderService.getSkillProviderById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM skill_providers WHERE id = ?';
//         const skillProviders = await query(selectQuery, [id]);
//         return skillProviders[0];
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderService.updateSkillProviderProfileWithImage = async (providerId, providerData) => {
//     try {
//         // Retrieve current skillProvider data from the database
//         const currentProvider = await skillProviderService.getSkillProviderById(providerId);
//         if (!currentProvider) {
//             throw new Error('Skill provider not found');
//         }

//         // Construct the updated address
//         const updatedAddress = [
//             providerData.stateOfResidence || currentProvider.stateOfResidence,
//             providerData.city || currentProvider.city,
//             providerData.street || currentProvider.street
//         ].filter(Boolean).join(', ');

//         // Prepare update query based on changed fields
//         const updateFields = Object.entries(providerData).filter(([key, value]) => value !== currentProvider[key] && key !== 'imagePath');
//         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
//         const updateParams = updateFields.map(([key, value]) => value);

//         // Add imagePath and updated address to updateParams
//         updateParams.push(providerData.imagePath || currentProvider.imagePath);
//         updateParams.push(updatedAddress);

//         // Add providerId at the end of updateParams
//         updateParams.push(providerId);

//         // Update skill provider data in the database
//         const updateQuery = `
//             UPDATE skill_providers 
//             SET ${updateValues}, imagePath=?, address=?
//             WHERE id=?
//         `;
//         await query(updateQuery, updateParams);
        

//                 // Update user data in the users table
//                 const updateUserQuery = `
//                 UPDATE users
//                 SET firstName = ?, lastName = ?, email = ?, phone = ?
//                 WHERE customerId = ?
//             `;
//             await query(updateUserQuery, [firstName, lastName, email, phone, providerId]);


//         // Return updated skill provider data
//         return { ...currentProvider, ...providerData, address: updatedAddress };
//     } catch (error) {
//         throw error;
//     }
// };




// skillProviderService.patchUpdateSkillProvider = async (providerId, updatedFields) => {
//     try {
//         // Retrieve current skillProvider data from the database
//         const currentProvider = await skillProviderService.getSkillProviderById(providerId);
//         if (!currentProvider) {
//             throw new Error('Skill provider not found');
//         }

//         // Construct the updated address
//         const updatedAddress = [
//             updatedFields.stateOfResidence || currentProvider.stateOfResidence,
//             updatedFields.city || currentProvider.city,
//             updatedFields.street || currentProvider.street
//         ].filter(Boolean).join(', ');

//         // Prepare update query based on changed fields
//         const updateFields = Object.entries(updatedFields).filter(([key, value]) => value !== currentProvider[key] && key !== 'imagePath');
//         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
//         const updateParams = updateFields.map(([key, value]) => value);

//         // Add imagePath and updated address to updateParams
//         updateParams.push(updatedFields.imagePath || currentProvider.imagePath);
//         updateParams.push(updatedAddress);

//         // Add providerId at the end of updateParams
//         updateParams.push(providerId);

//         // Update skill provider data in the database
//         const updateQuery = `
//             UPDATE skill_providers 
//             SET ${updateValues}, imagePath=?, address=?
//             WHERE id=?
//         `;
//         await query(updateQuery, updateParams);


//                 // Update user data in the users table
//                 const updateUserQuery = `
//                 UPDATE users
//                 SET firstName = ?, lastName = ?, email = ?, phone = ?
//                 WHERE customerId = ?
//             `;
//             await query(updateUserQuery, [firstName, lastName, email, phone, providerId]);

//         // Return updated skill provider data
//         return { ...currentProvider, ...updatedFields, address: updatedAddress };
//     } catch (error) {
//         throw error;
//     }
// };



// // skillProviderService.patchUpdateSkillProviderWithNoImage = async (providerId, updatedFields) => {
// //     try {
// //         // Retrieve current skillProvider data from the database
// //         const currentProvider = await skillProviderService.getSkillProviderById(providerId);
// //         if (!currentProvider) {
// //             throw new Error('Skill provider not found');
// //         }

// //         // Construct the updated address
// //         const updatedAddress = [
// //             updatedFields.stateOfResidence || currentProvider.stateOfResidence,
// //             updatedFields.city || currentProvider.city,
// //             updatedFields.street || currentProvider.street
// //         ].filter(Boolean).join(', ');

// //         // Prepare update query based on changed fields
// //         const updateFields = Object.entries(updatedFields).filter(([key, value]) => value !== currentProvider[key]);
// //         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
// //         const updateParams = updateFields.map(([key, value]) => value);

// //         // Add providerId at the end of updateParams
// //         updateParams.push(providerId);

// //         // Update skill provider data in the database
// //         const updateQuery = `
// //             UPDATE skill_providers 
// //             SET ${updateValues}, address=?
// //             WHERE id=?
// //         `;
// //         await query(updateQuery, [...updateParams, updatedAddress, providerId]);

// //         // Update user data in the users table if applicable
// //         if (updateFields.some(([key]) => ['firstName', 'lastName', 'email', 'phone'].includes(key))) {
// //             const { firstName, lastName, email, phone } = updatedFields;
// //             const updateUserQuery = `
// //                 UPDATE users
// //                 SET firstName = ?, lastName = ?, email = ?, phone = ?
// //                 WHERE customerId = ?
// //             `;
// //             await query(updateUserQuery, [firstName, lastName, email, phone, providerId]);
// //         }

// //         // Return updated skill provider data
// //         return { ...currentProvider, ...updatedFields, address: updatedAddress };
// //     } catch (error) {
// //         throw error;
// //     }
// // };



// skillProviderService.patchUpdateSkillProviderWithNoImage = async (providerId, updatedFields) => {
//     try {
//         // Retrieve current skillProvider data from the database
//         const currentProvider = await skillProviderService.getSkillProviderById(providerId);
//         if (!currentProvider) {
//             throw new Error('Skill provider not found');
//         }

//         // Construct the updated address
//         const updatedAddress = [
//             updatedFields.stateOfResidence || currentProvider.stateOfResidence,
//             updatedFields.city || currentProvider.city,
//             updatedFields.street || currentProvider.street
//         ].filter(Boolean).join(', ');

//         // Prepare update query based on changed fields
//         const updateFields = Object.entries(updatedFields).filter(([key, value]) => value !== currentProvider[key]);
//         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
//         const updateParams = updateFields.map(([key, value]) => value);

//         // Add updated address to updateParams
//         updateParams.push(updatedAddress);

//         // Add providerId at the end of updateParams
//         updateParams.push(providerId);

//         // Update skill provider data in the database
//         const updateQuery = `
//             UPDATE skill_providers 
//             SET ${updateValues}, address=?
//             WHERE id=?
//         `;
//         await query(updateQuery, updateParams);

//         // Update user data in the users table if applicable
//         if (updateFields.some(([key]) => ['firstName', 'lastName', 'email', 'phone'].includes(key))) {
//             const { firstName, lastName, email, phone } = updatedFields;
//             const updateUserQuery = `
//                 UPDATE users
//                 SET firstName = ?, lastName = ?, email = ?, phone = ?
//                 WHERE customerId = ?
//             `;
//             await query(updateUserQuery, [firstName, lastName, email, phone, providerId]);
//         }

//         // Return updated skill provider data
//         return { ...currentProvider, ...updatedFields, address: updatedAddress };
//     } catch (error) {
//         throw error;
//     }
// };



// const fs = require('fs');
// const { promisify } = require('util');

// const unlinkSync = promisify(fs.unlink);


// // Function to update only the image of a skill provider
// skillProviderService.updateOnlyImage = async (providerId, imagePath) => {
//     try {
//         // Retrieve current skill provider data from the database
//         const currentProvider = await skillProviderService.getSkillProviderById(providerId);
//         if (!currentProvider) {
//             throw new Error('Skill provider not found');
//         }

//         // Check if there's an existing image for the skill provider
//         if (currentProvider.imagePath) {
//             // Remove the existing image file from the server
//             fs.unlinkSync(currentProvider.imagePath);
//         }

//         // Update the skill provider's image path in the database
//         const updateQuery = `
//             UPDATE skill_providers 
//             SET imagePath=?
//             WHERE id=?
//         `;
//         await query(updateQuery, [imagePath, providerId]);

//         // Return the updated skill provider data
//         return { ...currentProvider, imagePath };
//     } catch (error) {
//         throw error;
//     }
// };


// skillProviderService.deleteSkillProvider = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM skill_providers WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = skillProviderService;



const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Helper function to execute SQL queries
function query(sql, args) {
    return new Promise((resolve, reject) => {
        connection.query(sql, args, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Function to sign JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};



async function createSkillProvidersTable() {
    const createSkillProvidersTableQuery = `
        CREATE TABLE IF NOT EXISTS skill_providers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstName VARCHAR(255) NOT NULL,
            lastName VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            secondPhone VARCHAR(20),
            stateOfResidence VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            street VARCHAR(255) NOT NULL,
            address VARCHAR(255),
            serviceType VARCHAR(255) NOT NULL,
            about TEXT DEFAULT NULL,
            skills TEXT DEFAULT NULL,
            subCategory JSON DEFAULT NULL,
            openingHour VARCHAR(255),
            referralCode VARCHAR(255),
            imagePath VARCHAR(255),
            isVerified ENUM('unverified', 'pending', 'accept', 'reject') DEFAULT 'unverified',
            userId INT,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await query(createSkillProvidersTableQuery);
        console.log('SkillProviders table created successfully');
    } catch (error) {
        console.error('Error creating SkillProviders table:', error);
        throw error;
    }
}


createSkillProvidersTable(); // Immediately create the table on module load

const skillProviderService = {};


// skillProviderService.emailExists = async (email) => {
//     try {
//         let selectQuery;
//         let queryParams;
        
//         if (email === null) {
//             selectQuery = 'SELECT COUNT(*) AS count FROM skill_providers WHERE email IS NULL';
//             queryParams = [];
//         } else {
//             selectQuery = 'SELECT COUNT(*) AS count FROM skill_providers WHERE email = ?';
//             queryParams = [email];
//         }

//         const result = await query(selectQuery, queryParams);
//         const count = result[0].count;
//         return count > 0;
//     } catch (error) {
//         throw error;
//     }
// };

skillProviderService.emailExists = async (email) => {
    try {
        const defaultEmail = 'admin@handiwork.com.ng';
        
        if (email === defaultEmail) {
            // Default email address allowed without restrictions
            return false; // Assume it doesn't exist since it's the default
        } else {
            let selectQuery;
            let queryParams;
            
            if (email === null) {
                selectQuery = 'SELECT COUNT(*) AS count FROM skill_providers WHERE email IS NULL';
                queryParams = [];
            } else {
                selectQuery = 'SELECT COUNT(*) AS count FROM skill_providers WHERE email = ?';
                queryParams = [email];
            }

            const result = await query(selectQuery, queryParams);
            const count = result[0].count;
            return count > 0;
        }
    } catch (error) {
        throw error;
    }
};


skillProviderService.phoneExists = async (phone) => {
    try {
        const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE phone = ?';
        const result = await query(selectQuery, [phone]);
        const count = result[0].count;
        return count > 0;
    } catch (error) {
        throw error;
    }
};



// skillProviderService.createSkillProvider = async (skillProviderData) => {
//     try {
//         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath } = skillProviderData;

//         // Check if email or phone already exists
//         const emailExists = await skillProviderService.emailExists(email);
//         if (emailExists) {
//             throw new Error('Email already exists');
//         }

//         const phoneExists = await skillProviderService.phoneExists(phone);
//         if (phoneExists) {
//             throw new Error('Phone number already exists');
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Construct full address
//         const address = `${street}, ${city}, ${stateOfResidence}`;

//         // Create new user
//         const newUserQuery = 'INSERT INTO users (firstName, lastName, email, phone,  password, role, userType) VALUES (?, ?, ?, ?, ?, ?, ?)';
//         const newUserResult = await query(newUserQuery, [firstName, lastName, email, phone,  hashedPassword, 'user', 'SkillProvider']);

//         // Generate JWT token
//         const token = jwt.sign({ id: newUserResult.insertId }, process.env.JWT_SECRET, {
//             expiresIn: process.env.JWT_EXPIRES_IN,
//         });

//         // Insert skillProvider data into the skill_providers table
//         const insertQuery = `
//             INSERT INTO skill_providers (firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, address, serviceType, subCategory, openingHour, referralCode, imagePath, userId)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const result = await query(insertQuery, [firstName, lastName, email, hashedPassword, phone, secondPhone, stateOfResidence, city, street, address, serviceType, subCategory, openingHour, referralCode, imagePath, newUserResult.insertId]);

//         return { id: result.insertId, token, ...skillProviderData, address, imagePath };
//     } catch (error) {
//         throw error;
//     }
// };


skillProviderService.createSkillProvider = async (skillProviderData) => {
    try {
        const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath } = skillProviderData;

        // Check if email or phone already exists
       // Check if email is null
    //    if (!email) {
    //         throw new Error('Email was not assigned');
    //     }

        const phoneExists = await skillProviderService.phoneExists(phone);
        if (phoneExists) {
            throw new Error('Phone number already exists');
        }

        const emailExists = await skillProviderService.emailExists(email);
        if (emailExists) {
            throw new Error('Email already exists');
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Construct full address
        const address = `${street}, ${city}, ${stateOfResidence}`;

        // Insert data into skill_providers table
        const insertProviderQuery = `
            INSERT INTO skill_providers (firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, address, serviceType, subCategory, openingHour, referralCode, imagePath)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const providerResult = await query(insertProviderQuery, [firstName, lastName, email, hashedPassword, phone, secondPhone, stateOfResidence, city, street, address, serviceType, subCategory, openingHour, referralCode, imagePath]);

        // Retrieve the providerId
        const providerId = providerResult.insertId;

        // Insert data into users table with providerId
        const insertUserQuery = `
            INSERT INTO users (firstName, lastName, email, phone, password, role, userType, providerId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const userResult = await query(insertUserQuery, [firstName, lastName, email, phone, hashedPassword, 'user', 'SkillProvider', providerId]);

        // Check if user insertion was successful
        if (!userResult.insertId) {
            throw new Error('Failed to insert user');
        }

        // Generate JWT token
        const token = signToken(userResult.insertId);

        // Return the newly created user data along with the token
        return { id: userResult.insertId, token, ...skillProviderData, address };
        
    } catch (error) {
        throw error;
    }
};


skillProviderService.getAllSkillProviders = async () => {
    try {
        const selectAllQuery = 'SELECT * FROM skill_providers';
        const skillProviders = await query(selectAllQuery);
        return skillProviders;
    } catch (error) {
        throw error;
    }
};

skillProviderService.getSkillProviderById = async (id) => {
    try {
        const selectQuery = 'SELECT * FROM skill_providers WHERE id = ?';
        const skillProviders = await query(selectQuery, [id]);
        return skillProviders[0];
    } catch (error) {
        throw error;
    }
};


skillProviderService.update = async (id, newData) => {
    try {
        // Construct update query dynamically based on the provided fields
        let updateQuery = 'UPDATE skill_providers SET ';
        const updateParams = [];
        Object.keys(newData).forEach((key, index) => {
            // Append field and value to the query
            updateQuery += `${key} = ?`;
            updateParams.push(newData[key]);
            // Append comma if it's not the last field
            if (index < Object.keys(newData).length - 1) {
                updateQuery += ', ';
            }
        });
        // Append WHERE clause for the skill provider ID
        updateQuery += ' WHERE id = ?';
        updateParams.push(id);

        // Execute the update query
        const result = await query(updateQuery, updateParams);

        // Check if update was successful
        if (result.affectedRows === 0) {
            throw new Error('Skill provider not found or no changes were made');
        }

        // Retrieve the updated skill provider data from the database
        const updatedSkillProvider = await skillProviderService.getSkillProviderById(id);

        return updatedSkillProvider;
    } catch (error) {
        throw error;
    }
};


// skillProviderService.update = async (id, newData) => {
//     try {
//         // Extract new data
//         const { firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode } = newData;

//         // Construct full address
//         const address = `${street}, ${city}, ${stateOfResidence}`;

//         // Check if email or phone already exists for other users
//         const emailExists = await skillProviderService.emailExists(email, id);
//         if (emailExists) {
//             throw new Error('Email already exists for another user');
//         }

//         const phoneExists = await skillProviderService.phoneExists(phone, id);
//         if (phoneExists) {
//             throw new Error('Phone number already exists for another user');
//         }

//         // Construct update query
//         const updateQuery = `
//             UPDATE skill_providers
//             SET firstName = ?, lastName = ?, email = ?, phone = ?, secondPhone = ?, stateOfResidence = ?, city = ?, street = ?, address = ?, serviceType = ?, subCategory = ?, openingHour = ?, referralCode = ?
//             WHERE id = ?
//         `;

//         // Execute update query
//         const result = await query(updateQuery, [firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, address, serviceType, subCategory, openingHour, referralCode, id]);

//         // Check if update was successful
//         if (result.affectedRows === 0) {
//             throw new Error('Skill provider not found or no changes were made');
//         }

//         return { id, ...newData };
//     } catch (error) {
//         throw error;
//     }
// };


skillProviderService.updateSkillProviderProfileWithImage = async (providerId, providerData) => {
    try {
        // Retrieve current skillProvider data from the database
        const currentProvider = await skillProviderService.getSkillProviderById(providerId);
        if (!currentProvider) {
            throw new Error('Skill provider not found');
        }

        // Construct the updated address
        const updatedAddress = [
            providerData.stateOfResidence || currentProvider.stateOfResidence,
            providerData.city || currentProvider.city,
            providerData.street || currentProvider.street
        ].filter(Boolean).join(', ');

        // Prepare update query based on changed fields
        const updateFields = Object.entries(providerData).filter(([key, value]) => value !== currentProvider[key] && key !== 'imagePath');
        const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
        const updateParams = updateFields.map(([key, value]) => value);

        // Add imagePath and updated address to updateParams
        updateParams.push(providerData.imagePath || currentProvider.imagePath);
        updateParams.push(updatedAddress);

        // Add providerId at the end of updateParams
        updateParams.push(providerId);

        // Update skill provider data in the database
        const updateQuery = `
            UPDATE skill_providers 
            SET ${updateValues}, imagePath=?, address=?
            WHERE id=?
        `;
        await query(updateQuery, updateParams);

        // Return updated skill provider data
        return { ...currentProvider, ...providerData, address: updatedAddress };
    } catch (error) {
        throw error;
    }
};




skillProviderService.patchUpdateSkillProvider = async (providerId, updatedFields) => {
    try {
        // Retrieve current skillProvider data from the database
        const currentProvider = await skillProviderService.getSkillProviderById(providerId);
        if (!currentProvider) {
            throw new Error('Skill provider not found');
        }


        // Construct the updated address
        const updatedAddress = [
            updatedFields.stateOfResidence || currentProvider.stateOfResidence,
            updatedFields.city || currentProvider.city,
            updatedFields.street || currentProvider.street
        ].filter(Boolean).join(', ');

        // Prepare update query based on changed fields
        const updateFields = Object.entries(updatedFields).filter(([key, value]) => value !== currentProvider[key] && key !== 'imagePath');
        const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
        const updateParams = updateFields.map(([key, value]) => value);

        // Add imagePath and updated address to updateParams
        updateParams.push(updatedFields.imagePath || currentProvider.imagePath);
        updateParams.push(updatedAddress);

        // Add providerId at the end of updateParams
        updateParams.push(providerId);

        // Update skill provider data in the database
        const updateQuery = `
            UPDATE skill_providers 
            SET ${updateValues}, imagePath=?, address=?
            WHERE id=?
        `;
        await query(updateQuery, updateParams);

        // Return updated skill provider data
        return { ...currentProvider, ...updatedFields, address: updatedAddress };
    } catch (error) {
        throw error;
    }
};

// skillProviderService.patchUpdateSkillProvider = async (providerId, updatedFields) => {
//     try {
//         // Retrieve current skillProvider data from the database
//         const currentProvider = await skillProviderService.getSkillProviderById(providerId);
//         if (!currentProvider) {
//             throw new Error('Skill provider not found');
//         }

//         // Prepare update query based on changed fields
//         const updateFields = [];
//         const updateValues = [];

//         // Construct the updated address
//         if (updatedFields.stateOfResidence) {
//             updateFields.push('stateOfResidence=?');
//             updateValues.push(updatedFields.stateOfResidence);
//         }
//         if (updatedFields.city) {
//             updateFields.push('city=?');
//             updateValues.push(updatedFields.city);
//         }
//         if (updatedFields.street) {
//             updateFields.push('street=?');
//             updateValues.push(updatedFields.street);
//         }

//         // Construct the updated address string
//         const updatedAddress = [updatedFields.stateOfResidence || currentProvider.stateOfResidence,
//                                 updatedFields.city || currentProvider.city,
//                                 updatedFields.street || currentProvider.street]
//                                 .filter(Boolean).join(', ');

//         // Add imagePath and updated address to updateValues
//         updateValues.push(updatedFields.imagePath || currentProvider.imagePath);
//         updateValues.push(updatedAddress);

//         // Add providerId at the end of updateValues
//         updateValues.push(providerId);

//         // Update skill provider data in the database
//         const updateQuery = `
//             UPDATE skill_providers 
//             SET ${updateFields.join(', ')}, imagePath=?, address=?
//             WHERE id=?
//         `;
//         await query(updateQuery, updateValues);

//         // Return updated skill provider data
//         return { ...currentProvider, ...updatedFields, address: updatedAddress };
//     } catch (error) {
//         throw error;
//     }
// };


const fs = require('fs');
const { promisify } = require('util');

const unlinkSync = promisify(fs.unlink);


// Function to update only the image of a skill provider
skillProviderService.updateOnlyImage = async (providerId, imagePath) => {
    try {
        // Retrieve current skill provider data from the database
        const currentProvider = await skillProviderService.getSkillProviderById(providerId);
        if (!currentProvider) {
            throw new Error('Skill provider not found');
        }

        // Check if there's an existing image for the skill provider
        if (currentProvider.imagePath) {
            // Remove the existing image file from the server
            fs.unlinkSync(currentProvider.imagePath);
        }

        // Update the skill provider's image path in the database
        const updateQuery = `
            UPDATE skill_providers 
            SET imagePath=?
            WHERE id=?
        `;
        await query(updateQuery, [imagePath, providerId]);

        // Return the updated skill provider data
        return { ...currentProvider, imagePath };
    } catch (error) {
        throw error;
    }
};


skillProviderService.deleteSkillProvider = async (id) => {
    try {
        const deleteQuery = 'DELETE FROM skill_providers WHERE id = ?';
        await query(deleteQuery, [id]);
        return { id };
    } catch (error) {
        throw error;
    }
};



skillProviderService.patchUpdateSkillProviderWithNoImage = async (providerId, updatedFields) => {
    try {
        // Retrieve current skillProvider data from the database
        const currentProvider = await skillProviderService.getSkillProviderById(providerId);
        if (!currentProvider) {
            throw new Error('Skill provider not found');
        }

        // Construct the updated address
        const updatedAddress = [
            updatedFields.stateOfResidence || currentProvider.stateOfResidence,
            updatedFields.city || currentProvider.city,
            updatedFields.street || currentProvider.street
        ].filter(Boolean).join(', ');

        // Prepare update query based on changed fields
        const updateFields = Object.entries(updatedFields).filter(([key, value]) => value !== currentProvider[key]);
        const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
        const updateParams = updateFields.map(([key, value]) => value);

        // Add updated address to updateParams
        updateParams.push(updatedAddress);

        // Add providerId at the end of updateParams
        updateParams.push(providerId);

        // Update skill provider data in the database
        const updateQuery = `
            UPDATE skill_providers 
            SET ${updateValues}, address=?
            WHERE id=?
        `;
        await query(updateQuery, updateParams);

        // Update user data in the users table if applicable
        if (updateFields.some(([key]) => ['firstName', 'lastName', 'email', 'phone'].includes(key))) {
            const { firstName, lastName, email, phone } = updatedFields;
            const updateUserQuery = `
                UPDATE users
                SET firstName = ?, lastName = ?, email = ?, phone = ?
                WHERE customerId = ?
            `;
            await query(updateUserQuery, [firstName, lastName, email, phone, providerId]);
        }

        // Return updated skill provider data
        return { ...currentProvider, ...updatedFields, address: updatedAddress };
    } catch (error) {
        throw error;
    }
};





skillProviderService.filterSkillProviders = async (filter) => {
    try {
        const { stateOfResidence, city, street, address, serviceType, subCategory } = filter;
        let selectQuery = 'SELECT * FROM skill_providers WHERE ';
        const queryParams = [];

        // Constructing the query based on the provided filter
        const conditions = [];
        if (stateOfResidence) {
            conditions.push('stateOfResidence = ?');
            queryParams.push(stateOfResidence);
        }
        if (city) {
            conditions.push('city = ?');
            queryParams.push(city);
        }
        if (street) {
            conditions.push('street = ?');
            queryParams.push(street);
        }
        if (address) {
            conditions.push('address = ?');
            queryParams.push(address);
        }
        if (serviceType) {
            conditions.push('serviceType = ?');
            queryParams.push(serviceType);
        }
        if (subCategory) {
            conditions.push('subCategory = ?');
            queryParams.push(subCategory);
        }

        // Combining conditions with AND operator
        selectQuery += conditions.join(' AND ');

        // Execute the query
        const skillProviders = await query(selectQuery, queryParams);
        return skillProviders;
    } catch (error) {
        throw error;
    }
};



skillProviderService.findByLocation = async (locationFilter) => {
    try {
        const { stateOfResidence, city, street, address } = locationFilter;
       
            let selectQuery = 'SELECT * FROM skill_providers WHERE ';
            const queryParams = [];
    
            // Constructing the query based on the provided filter
            const conditions = [];
            if (stateOfResidence) {
                conditions.push('stateOfResidence = ?');
                queryParams.push(stateOfResidence);
            }
            if (city) {
                conditions.push('city = ?');
                queryParams.push(city);
            }
            if (street) {
                conditions.push('street = ?');
                queryParams.push(street);
            }
            if (address) {
                conditions.push('address = ?');
                queryParams.push(address);
            }
           
    
            // Combining conditions with AND operator
            selectQuery += conditions.join(' AND ');
    
          
        // Execute the query
        const skillProviders = await query(selectQuery, queryParams);
        return skillProviders;
    } catch (error) {
        throw error;
    }
    
};


skillProviderService.findByServiceOrSubCategory = async (filter) => {
    try {
        const { serviceType, subCategory } = filter;
        let selectQuery = 'SELECT * FROM skill_providers WHERE ';
        const queryParams = [];

        // Constructing the query based on the provided filter
        if (serviceType && subCategory) {
            selectQuery += 'serviceType = ? AND subCategory = ?';
            queryParams.push(serviceType, subCategory);
        } else if (serviceType) {
            selectQuery += 'serviceType = ?';
            queryParams.push(serviceType);
        } else if (subCategory) {
            selectQuery += 'subCategory = ?';
            queryParams.push(subCategory);
        } else {
            throw new Error('Please provide at least one filter parameter (serviceType or subCategory)');
        }

        // Execute the query
        const skillProviders = await query(selectQuery, queryParams);
        return skillProviders;
    } catch (error) {
        throw error;
    }
};





// skillProviderService.searchSkillProviders = async (filter) => {
//     try {
//         const { stateOfResidence = '', city = '', street = '', address = '', serviceType = '', subCategory = '' } = filter;
//         const conditions = [];

//         if (stateOfResidence) conditions.push('stateOfResidence = ?');
//         if (city) conditions.push('city = ?');
//         if (street) conditions.push('street = ?');
//         if (address) conditions.push('address = ?');
//         if (serviceType) conditions.push('serviceType = ?');
//         if (subCategory) conditions.push('subCategory = ?');

//         let selectQuery = 'SELECT * FROM skill_providers';
//         if (conditions.length > 0) {
//             selectQuery += ' WHERE ' + conditions.join(' AND ');
//         }

//         const skillProviders = await query(selectQuery, Object.values(filter));
//         return skillProviders;
//     } catch (error) {
//         throw error;
//     }
// };



skillProviderService.searchSkillProviders = async (filter) => {
    try {
        const { stateOfResidence = '', city = '', street = '', address = '', serviceType = '', subCategory = '' } = filter;
        const conditions = [];
        const values = [];

        if (stateOfResidence) {
            conditions.push('stateOfResidence LIKE ?');
            values.push(`%${stateOfResidence}%`);
        }
        if (city) {
            conditions.push('city LIKE ?');
            values.push(`%${city}%`);
        }
        if (street) {
            conditions.push('street LIKE ?');
            values.push(`%${street}%`);
        }
        if (address) {
            conditions.push('address LIKE ?');
            values.push(`%${address}%`);
        }
        if (serviceType) {
            conditions.push('serviceType LIKE ?');
            values.push(`%${serviceType}%`);
        }
        if (subCategory) {
            conditions.push('subCategory LIKE ?');
            values.push(`%${subCategory}%`);
        }

        let selectQuery = 'SELECT * FROM skill_providers';
        if (conditions.length > 0) {
            selectQuery += ' WHERE ' + conditions.join(' AND ');
        }

        const skillProviders = await query(selectQuery, values);
        return skillProviders;
    } catch (error) {
        throw error;
    }
};



skillProviderService.searchByLocation = async (locationFilter) => {
    try {
        const { stateOfResidence = '', city = '', street = '', address = '' } = locationFilter;
        const conditions = [];

        if (stateOfResidence) conditions.push('stateOfResidence = ?');
        if (city) conditions.push('city = ?');
        if (street) conditions.push('street = ?');
        if (address) conditions.push('address = ?');

        let selectQuery = 'SELECT * FROM skill_providers';
        if (conditions.length > 0) {
            selectQuery += ' WHERE ' + conditions.join(' AND ');
        }

        const skillProviders = await query(selectQuery, Object.values(locationFilter));
        return skillProviders;
    } catch (error) {
        throw error;
    }
};

skillProviderService.searchByServiceOrSubCategory = async (filter) => {
    try {
        const { serviceType = '', subCategory = '' } = filter;
        let selectQuery = 'SELECT * FROM skill_providers WHERE ';

        if (serviceType && subCategory) {
            selectQuery += 'serviceType = ? AND subCategory = ?';
            const skillProviders = await query(selectQuery, [serviceType, subCategory]);
            return skillProviders;
        } else if (serviceType) {
            selectQuery += 'serviceType = ?';
            const skillProviders = await query(selectQuery, [serviceType]);
            return skillProviders;
        } else if (subCategory) {
            selectQuery += 'subCategory = ?';
            const skillProviders = await query(selectQuery, [subCategory]);
            return skillProviders;
        } else {
            throw new Error('Please provide at least one filter parameter (serviceType or subCategory)');
        }
    } catch (error) {
        throw error;
    }
};




// Function to get skill providers by service type and category table
skillProviderService.getSkillProvidersByServiceType = async (serviceType) => {
    try {
        const selectSkillProvidersQuery = `
            SELECT sp.*
            FROM skill_providers sp
            INNER JOIN skill_types st ON sp.id = st.providerId
            WHERE st.serviceType = ?
        `;
        const skillProviders = await query(selectSkillProvidersQuery, [serviceType]);
        
        // Format the skill providers data as required
        const formattedSkillProviders = skillProviders.map(provider => ({
            firstName: provider.firstName,
            lastName: provider.lastName,
            email: provider.email || null,
            phone: provider.phone || null,
            secondPhone: provider.secondPhone || null,
            stateOfResidence: provider.stateOfResidence,
            city: provider.city,
            street: provider.street,
            address: provider.address || null,
            serviceType: provider.serviceType || null,
            about: provider.about || null,
            skills: provider.skills || null,
            subCategory: provider.subCategory || null,
            openingHour: provider.openingHour || null,
            referralCode: provider.referralCode || null,
            imagePath: provider.imagePath || null,
            latitude: provider.latitude || null,
            longitude: provider.longitude || null,
            createdAt: provider.createdAt,
            updatedAt: provider.updatedAt
        }));
        
        return formattedSkillProviders;
    } catch (error) {
        console.error('Error fetching skill providers by service type:', error);
        throw error;
    }
};


// Function to get skill providers by service type
skillProviderService.findSkillProvidersByServiceType = async (serviceType) => {
    try {
        const selectSkillProvidersQuery = `
            SELECT * FROM skill_providers
            WHERE serviceType = ?
        `;
        const skillProviders = await query(selectSkillProvidersQuery, [serviceType]);

        // Format the skill providers data as required
        const formattedSkillProviders = skillProviders.map(provider => ({
            firstName: provider.firstName,
            lastName: provider.lastName,
            email: provider.email || null,
            phone: provider.phone || null,
            secondPhone: provider.secondPhone || null,
            stateOfResidence: provider.stateOfResidence,
            city: provider.city,
            street: provider.street,
            address: provider.address || null,
            serviceType: provider.serviceType,
            about: provider.about || null,
            skills: provider.skills || null,
            subCategory: JSON.parse(provider.subCategory) || null,
            openingHour: provider.openingHour || null,
            referralCode: provider.referralCode || null,
            imagePath: provider.imagePath || null,
            latitude: provider.latitude || null,
            longitude: provider.longitude || null,
            createdAt: provider.createdAt,
            updatedAt: provider.updatedAt
        }));

        return formattedSkillProviders;
    } catch (error) {
        console.error('Error fetching skill providers by service type:', error);
        throw error;
    }
};

// Function to get skill providers by matching keywords in various fields
skillProviderService.findSkillProvidersByKeyword = async (keyword) => {
    try {
        const selectSkillProvidersQuery = `
            SELECT * FROM skill_providers
            WHERE serviceType LIKE ? OR
                  firstName LIKE ? OR
                  lastName LIKE ? OR
                  skills LIKE ? OR
                  subCategory LIKE ? OR
                  about LIKE ?
        `;

        const wildcardKeyword = `%${keyword}%`;
        const skillProviders = await query(selectSkillProvidersQuery, [
            wildcardKeyword,
            wildcardKeyword,
            wildcardKeyword,
            wildcardKeyword,
            wildcardKeyword,
            wildcardKeyword
        ]);

        // Format the skill providers data as required
        const formattedSkillProviders = skillProviders.map(provider => ({
            firstName: provider.firstName,
            lastName: provider.lastName,
            email: provider.email || null,
            phone: provider.phone || null,
            secondPhone: provider.secondPhone || null,
            stateOfResidence: provider.stateOfResidence,
            city: provider.city,
            street: provider.street,
            address: provider.address || null,
            serviceType: provider.serviceType,
            about: provider.about || null,
            skills: provider.skills || null,
            subCategory: JSON.parse(provider.subCategory) || null,
            openingHour: provider.openingHour || null,
            referralCode: provider.referralCode || null,
            imagePath: provider.imagePath || null,
            latitude: provider.latitude || null,
            longitude: provider.longitude || null,
            createdAt: provider.createdAt,
            updatedAt: provider.updatedAt
        }));

        return formattedSkillProviders;
    } catch (error) {
        console.error('Error fetching skill providers by keyword:', error);
        throw error;
    }
};




skillProviderService.searchSkillServiceType = async (filter) => {
    try {
        const { serviceType = '', subCategory = '' } = filter;
        const conditions = [];

        if (serviceType) conditions.push('serviceType = ?');
        if (subCategory) conditions.push('subCategory = ?');

        let selectQuery = 'SELECT * FROM skill_providers';
        if (conditions.length > 0) {
            selectQuery += ' WHERE ' + conditions.join(' AND ');
        }

        const skillProviders = await query(selectQuery, Object.values(filter));
        return skillProviders;
    } catch (error) {
        throw error;
    }
};



module.exports = skillProviderService;

