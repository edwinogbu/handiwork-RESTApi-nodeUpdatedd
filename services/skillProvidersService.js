const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

// Create SkillProviders table if it doesn't exist
async function createSkillProvidersTable() {
    const createSkillProvidersTableQuery = `
        CREATE TABLE IF NOT EXISTS skill_providers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            serviceCategoryId INT,
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
            referralCode VARCHAR(255),
            imagePath VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (serviceCategoryId) REFERENCES service_categories(id) ON DELETE CASCADE
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

// Create ServiceCategories table if it doesn't exist
async function createServiceCategoriesTable() {
    const createServiceCategoriesTableQuery = `
        CREATE TABLE IF NOT EXISTS service_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            serviceType VARCHAR(255) NOT NULL,
            subCategory VARCHAR(255) NOT NULL,
            UNIQUE KEY(serviceType, subCategory)
        );
    `;
    try {
        await query(createServiceCategoriesTableQuery);
        console.log('ServiceCategories table created successfully');
    } catch (error) {
        console.error('Error creating ServiceCategories table:', error);
        throw error;
    }
}

createSkillProvidersTable(); // Immediately create the table on module load
createServiceCategoriesTable(); // Immediately create the table on module load

const skillProvidersService = {};

skillProvidersService.emailExists = async (email) => {
    try {
        const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
        const result = await query(selectQuery, [email]);
        const count = result[0].count;
        return count > 0;
    } catch (error) {
        throw error;
    }
};

skillProvidersService.phoneExists = async (phone) => {
    try {
        const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE phone = ?';
        const result = await query(selectQuery, [phone]);
        const count = result[0].count;
        return count > 0;
    } catch (error) {
        throw error;
    }
};

skillProvidersService.createSkillProvider = async (skillProviderData) => {
    try {
        const { serviceType, subCategory, ...providerDataWithoutService } = skillProviderData;

        // Check if the service category exists
        let categoryId;
        if (serviceType && subCategory) {
            const categoryQuery = 'SELECT id FROM service_categories WHERE serviceType = ? AND subCategory = ?';
            const categoryResult = await query(categoryQuery, [serviceType, subCategory]);
            if (categoryResult.length > 0) {
                categoryId = categoryResult[0].id;
            } else {
                const insertCategoryQuery = 'INSERT INTO service_categories (serviceType, subCategory) VALUES (?, ?)';
                const insertCategoryResult = await query(insertCategoryQuery, [serviceType, subCategory]);
                categoryId = insertCategoryResult.insertId;
            }
        }

        // Insert data into the skill_providers table with reference to the service category
        const insertProviderQuery = `
            INSERT INTO skill_providers (serviceCategoryId, ${Object.keys(providerDataWithoutService).join(', ')})
            VALUES (?, ${Object.keys(providerDataWithoutService).map(() => '?').join(', ')})
        `;
        const providerResult = await query(insertProviderQuery, [categoryId, ...Object.values(providerDataWithoutService)]);

        // Retrieve the providerId
        const providerId = providerResult.insertId;

        // Insert data into users table with providerId
        const insertUserQuery = `
            INSERT INTO users (firstName, lastName, email, phone, password, role, userType, providerId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const userResult = await query(insertUserQuery, [skillProviderData.firstName, skillProviderData.lastName, skillProviderData.email, skillProviderData.phone, skillProviderData.password, 'user', 'SkillProvider', providerId]);

        // Check if user insertion was successful
        if (!userResult.insertId) {
            throw new Error('Failed to insert user');
        }

        // Generate JWT token
        const token = signToken(userResult.insertId);

        // Return the newly created user data along with the token
        return { id: userResult.insertId, token, ...skillProviderData };

    } catch (error) {
        throw error;
    }
};

skillProvidersService.getAllSkillProviders = async () => {
    try {
        const selectAllQuery = 'SELECT * FROM skill_providers';
        const skillProviders = await query(selectAllQuery);
        return skillProviders;
    } catch (error) {
        throw error;
    }
};

skillProvidersService.getSkillProviderById = async (id) => {
    try {
        const selectQuery = 'SELECT * FROM skill_providers WHERE id = ?';
        const skillProviders = await query(selectQuery, [id]);
        return skillProviders[0];
    } catch (error) {
        throw error;
    }
};

skillProvidersService.updateSkillProviderProfileWithImage = async (providerId, providerData) => {
    try {
        // Retrieve current skillProvider data from the database
        const currentProvider = await skillProvidersService.getSkillProviderById(providerId);
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

skillProvidersService.deleteSkillProvider = async (id) => {
    try {
        const deleteQuery = 'DELETE FROM skill_providers WHERE id = ?';
        await query(deleteQuery, [id]);
        return { id };
    } catch (error) {
        throw error;
    }
};

module.exports = skillProvidersService;


// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
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

// // Create SkillProviders table if it doesn't exist
// async function createSkillProvidersTable() {
//     const createSkillProvidersTableQuery = `
//         CREATE TABLE IF NOT EXISTS skill_providers (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceCategoryId INT,
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
//             referralCode VARCHAR(255),
//             imagePath VARCHAR(255),
//             latitude DECIMAL(10, 8),
//             longitude DECIMAL(11, 8),
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY (serviceCategoryId) REFERENCES service_categories(id) ON DELETE CASCADE
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

// // Create ServiceCategories table if it doesn't exist
// async function createServiceCategoriesTable() {
//     const createServiceCategoriesTableQuery = `
//         CREATE TABLE IF NOT EXISTS service_categories (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceType VARCHAR(255) NOT NULL,
//             subCategory VARCHAR(255) NOT NULL,
//             UNIQUE KEY(serviceType, subCategory)
//         );
//     `;
//     try {
//         await query(createServiceCategoriesTableQuery);
//         console.log('ServiceCategories table created successfully');
//     } catch (error) {
//         console.error('Error creating ServiceCategories table:', error);
//         throw error;
//     }
// }

// createSkillProvidersTable(); // Immediately create the table on module load
// createServiceCategoriesTable(); // Immediately create the table on module load

// const skillProvidersService = {};

// skillProvidersService.emailExists = async (email) => {
//     try {
//         const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
//         const result = await query(selectQuery, [email]);
//         const count = result[0].count;
//         return count > 0;
//     } catch (error) {
//         throw error;
//     }
// };

// skillProvidersService.phoneExists = async (phone) => {
//     try {
//         const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE phone = ?';
//         const result = await query(selectQuery, [phone]);
//         const count = result[0].count;
//         return count > 0;
//     } catch (error) {
//         throw error;
//     }
// };

// skillProvidersService.createSkillProvider = async (skillProviderData) => {
//     try {
//         const { serviceType, subCategory, ...providerDataWithoutService } = skillProviderData;

//         // Check if the service category exists
//         let categoryId;
//         if (serviceType && subCategory) {
//             const categoryQuery = 'SELECT id FROM service_categories WHERE serviceType = ? AND subCategory = ?';
//             const categoryResult = await query(categoryQuery, [serviceType, subCategory]);
//             if (categoryResult.length > 0) {
//                 categoryId = categoryResult[0].id;
//             } else {
//                 const insertCategoryQuery = 'INSERT INTO service_categories (serviceType, subCategory) VALUES (?, ?)';
//                 const insertCategoryResult = await query(insertCategoryQuery, [serviceType, subCategory]);
//                 categoryId = insertCategoryResult.insertId;
//             }
//         }

//         // Insert data into the skill_providers table with reference to the service category
//         const insertProviderQuery = `
//             INSERT INTO skill_providers (serviceCategoryId, ${Object.keys(providerDataWithoutService).join(', ')})
//             VALUES (?, ${Object.keys(providerDataWithoutService).map(() => '?').join(', ')})
//         `;
//         const providerResult = await query(insertProviderQuery, [categoryId, ...Object.values(providerDataWithoutService)]);

//         // Retrieve the providerId
//         const providerId = providerResult.insertId;

//         // Insert data into users table with providerId
//         const insertUserQuery = `
//             INSERT INTO users (firstName, lastName, email, phone, password, role, userType, providerId)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const userResult = await query(insertUserQuery, [skillProviderData.firstName, skillProviderData.lastName, skillProviderData.email, skillProviderData.phone, skillProviderData.password, 'user', 'SkillProvider', providerId]);

//         // Check if user insertion was successful
//         if (!userResult.insertId) {
//             throw new Error('Failed to insert user');
//         }

//         // Generate JWT token
//         const token = signToken(userResult.insertId);

//         // Return the newly created user data along with the token
//         return { id: userResult.insertId, token, ...skillProviderData };

//     } catch (error) {
//         throw error;
//     }
// };

// skillProvidersService.getAllSkillProviders = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM skill_providers';
//         const skillProviders = await query(selectAllQuery);
//         return skillProviders;
//     } catch (error) {
//         throw error;
//     }
// };

// skillProvidersService.getSkillProviderById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM skill_providers WHERE id = ?';
//         const skillProviders = await query(selectQuery, [id]);
//         return skillProviders[0];
//     } catch (error) {
//         throw error;
//     }
// };

// skillProvidersService.updateSkillProviderProfileWithImage = async (providerId, providerData) => {
//     try {
//         // Retrieve current skillProvider data from the database
//         const currentProvider = await skillProvidersService.getSkillProviderById(providerId);
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

//         // Return updated skill provider data
//         return { ...currentProvider, ...providerData, address: updatedAddress };
//     } catch (error) {
//         throw error;
//     }
// };

// skillProvidersService.deleteSkillProvider = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM skill_providers WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = skillProvidersService;

