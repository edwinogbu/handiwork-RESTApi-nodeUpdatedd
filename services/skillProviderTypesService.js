const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
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


const createTables = async () => {
    const createServicesTable = `
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serviceType VARCHAR(255) NOT NULL,
        providerId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
  
    const createSubcategoriesTable = `
      CREATE TABLE IF NOT EXISTS subcategories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serviceId INT,
        subCategory VARCHAR(255),
        FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE
      );
    `;
  
    try {
      await query(createServicesTable);
      await query(createSubcategoriesTable);
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  };
  
  createTables();

// createSkillTypesTable(); // Immediately create the table on module load




const skillProviderTypesService = {};


// Function to create a new skill type
skillProviderTypesService.createSkillType = async (skillTypeData) => {
    try {
        const { serviceType, subCategory, providerId } = skillTypeData;

        // Insert skill type data into the skill_types table
        const insertQuery = `
            INSERT INTO skill_types (serviceType, subCategory, providerId)
            VALUES (?, ?, ?)
        `;
        const result = await query(insertQuery, [serviceType, JSON.stringify(subCategory), providerId]);

        return { id: result.insertId, ...skillTypeData };
    } catch (error) {
        throw error;
    }
};

// Function to get skill type by ID
skillProviderTypesService.getSkillTypeById = async (id) => {
    try {
        const selectQuery = 'SELECT * FROM skill_types WHERE id = ?';
        const skillType = await query(selectQuery, [id]);
        return skillType[0];
    } catch (error) {
        throw error;
    }
};

// Function to get all skill types
skillProviderTypesService.getAllSkillTypes = async () => {
    try {
        const selectAllQuery = 'SELECT * FROM skill_types';
        const skillTypes = await query(selectAllQuery);
        return skillTypes;
    } catch (error) {
        throw error;
    }
};

// Function to update skill type by ID
skillProviderTypesService.updateSkillType = async (id, skillTypeData) => {
    try {
        const { serviceType, subCategory, providerId } = skillTypeData;

        // Update skill type data in the database
        const updateQuery = `
            UPDATE skill_types 
            SET serviceType=?, subCategory=?, providerId=?, updatedAt=NOW()
            WHERE id=?
        `;
        await query(updateQuery, [serviceType, JSON.stringify(subCategory), providerId, id]);

        // Return updated skill type data
        return { id, ...skillTypeData };
    } catch (error) {
        throw error;
    }
};

// Function to delete skill type by ID
skillProviderTypesService.deleteSkillType = async (id) => {
    try {
        const deleteQuery = 'DELETE FROM skill_types WHERE id = ?';
        await query(deleteQuery, [id]);
        return { id };
    } catch (error) {
        throw error;
    }
};

module.exports = skillProviderTypesService;


// // Function to create a new skill provider type
// skillProviderTypesService.createSkillProviderType = async (skillProviderTypeData) => {
//     try {
//         const { serviceType, subCategory, providerId } = skillProviderTypeData;

//         // Insert skill provider type data into the skillProviderTypes table
//         const insertQuery = `
//             INSERT INTO skill_types (serviceType, subCategory, providerId)
//             VALUES (?, ?, ?)
//         `;
//         const result = await query(insertQuery, [JSON.stringify(serviceType), JSON.stringify(subCategory), providerId]);

//         return { id: result.insertId, ...skillProviderTypeData };
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to get skill provider type by ID
// skillProviderTypesService.getSkillProviderTypeById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM skill_types WHERE id = ?';
//         const skillProviderType = await query(selectQuery, [id]);
//         return skillProviderType[0];
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to get all skill provider types
// skillProviderTypesService.getAllSkillProviderTypes = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM skill_types';
//         const skillProviderTypes = await query(selectAllQuery);
//         return skillProviderTypes;
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to update skill provider type by ID
// skillProviderTypesService.updateSkillProviderType = async (id, skillProviderTypeData) => {
//     try {
//         const { serviceType, subCategory, providerId } = skillProviderTypeData;

//         // Prepare update query based on changed fields
//         const updateFields = Object.entries(skillProviderTypeData).filter(([key, value]) => key !== 'id' && value !== undefined);
//         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
//         const updateParams = updateFields.map(([key, value]) => value);

//         // Add skillProviderTypeId at the end of updateParams
//         updateParams.push(id);

//         // Update skill provider type data in the database
//         const updateQuery = `
//             UPDATE skill_types 
//             SET ${updateValues}
//             WHERE id=?
//         `;
//         await query(updateQuery, [...updateParams]);

//         // Return updated skill provider type data
//         return { id, ...skillProviderTypeData };
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to delete skill provider type by ID
// skillProviderTypesService.deleteSkillProviderType = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM skill_types WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };


// skillProviderTypesService.getSkillProvidersByServiceType = async (serviceType) => {
//     try {
//         const selectSkillProvidersQuery = `
//             SELECT skill_providers.*
//             FROM skill_providers
//             INNER JOIN skill_types ON skill_types.providerId = skill_providers.id
//             WHERE skill_types.serviceType = ?
//         `;
//         const skillProviders = await query(selectSkillProvidersQuery, [serviceType]);

//         // Format the skill providers data as required
//         const formattedSkillProviders = skillProviders.map(provider => ({
//             id: provider.id,
//             firstName: provider.firstName,
//             lastName: provider.lastName,
//             email: provider.email,
//             phone: provider.phone,
//             secondPhone: provider.secondPhone,
//             stateOfResidence: provider.stateOfResidence,
//             city: provider.city,
//             street: provider.street,
//             address: provider.address,
//             serviceType: provider.serviceType,
//             subCategory: provider.subCategory,
//             openingHour: provider.openingHour,
//             referralCode: provider.referralCode,
//             imagePath: provider.imagePath,
//             userId: provider.userId,
//             latitude: provider.latitude,
//             longitude: provider.longitude,
//             createdAt: provider.createdAt,
//             updatedAt: provider.updatedAt
//         }));

//         return formattedSkillProviders;
//     } catch (error) {
//         console.error('Error fetching skill providers by service type:', error);
//         throw error;
//     }
// };


// skillProviderTypesService.getSkillProvidersByLocation = async (serviceType, stateOfResidence, city, street)=> {
//     try {
//         let selectSkillProvidersQuery = `
//             SELECT skill_providers.*
//             FROM skill_providers
//             INNER JOIN skill_types ON skill_types.providerId = skill_providers.id
//             WHERE skill_types.serviceType = ?
//         `;
//         const queryParams = [serviceType];

//         // Add conditions based on the provided parameters
//         if (stateOfResidence) {
//             selectSkillProvidersQuery += ` AND stateOfResidence = ?`;
//             queryParams.push(stateOfResidence);
//         }
//         if (city) {
//             selectSkillProvidersQuery += ` AND city = ?`;
//             queryParams.push(city);
//         }
//         if (street) {
//             selectSkillProvidersQuery += ` AND street = ?`;
//             queryParams.push(street);
//         }

//         const skillProviders = await query(selectSkillProvidersQuery, queryParams);

//         // Format the skill providers data as required
//         const formattedSkillProviders = skillProviders.map(provider => ({
//             id: provider.id,
//             firstName: provider.firstName,
//             lastName: provider.lastName,
//             email: provider.email,
//             phone: provider.phone,
//             secondPhone: provider.secondPhone,
//             stateOfResidence: provider.stateOfResidence,
//             city: provider.city,
//             street: provider.street,
//             address: provider.address,
//             serviceType: provider.serviceType,
//             subCategory: provider.subCategory,
//             openingHour: provider.openingHour,
//             referralCode: provider.referralCode,
//             imagePath: provider.imagePath,
//             userId: provider.userId,
//             latitude: provider.latitude,
//             longitude: provider.longitude,
//             createdAt: provider.createdAt,
//             updatedAt: provider.updatedAt
//         }));

//         return formattedSkillProviders;
//     } catch (error) {
//         console.error('Error fetching skill providers by service type:', error);
//         throw error;
//     }
// }
// module.exports = skillProviderTypesService;


// const mysql = require('mysql');
// const dotenv = require('dotenv');

// dotenv.config();

// // Create a pool of MySQL connections
// const pool = mysql.createPool({
//     connectionLimit: process.env.CONNECTION_LIMIT,
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// // Helper function to execute SQL queries
// function query(sql, args) {
//     return new Promise((resolve, reject) => {
//         // Get a connection from the pool
//         pool.getConnection((err, connection) => {
//             if (err) {
//                 return reject(err);
//             }

//             // Execute the query using the acquired connection
//             connection.query(sql, args, (err, rows) => {
//                 // Release the connection back to the pool
//                 connection.release();

//                 if (err) {
//                     return reject(err);
//                 }

//                 resolve(rows);
//             });
//         });
//     });
// }

// // Create SkillProviderTypes table if it doesn't exist
// const createSkillProviderTypesTableQuery = `
//     CREATE TABLE IF NOT EXISTS skillProviderTypes (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         serviceType JSON,
//         subCategory JSON,
//         providerId INT,
//         FOREIGN KEY (providerId) REFERENCES skill_providers(id) ON DELETE CASCADE,
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `;

// // Execute table creation query
// (async () => {
//     try {
//         await query(createSkillProviderTypesTableQuery);
//         console.log('SkillProviderTypes table created successfully');
//     } catch (error) {
//         console.error('Error creating SkillProviderTypes table:', error);
//     }
// })();

// const skillProviderTypesService = {};

// skillProviderTypesService.createSkillProviderType = async (typeData) => {
//     try {
//         const { serviceType, subCategory, providerId } = typeData;

//         // Insert type data into the skillProviderTypes table
//         const insertQuery = `
//             INSERT INTO skillProviderTypes (serviceType, subCategory, providerId)
//             VALUES (?, ?, ?)
//         `;
//         const result = await query(insertQuery, [JSON.stringify(serviceType), JSON.stringify(subCategory), providerId]);

//         return { id: result.insertId, ...typeData };
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderTypesService.getAllSkillProviderTypes = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM skillProviderTypes';
//         const types = await query(selectAllQuery);
//         return types;
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderTypesService.getSkillProviderTypeById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM skillProviderTypes WHERE id = ?';
//         const type = await query(selectQuery, [id]);
//         return type[0];
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderTypesService.updateSkillProviderType = async (typeId, typeData) => {
//     try {
//         // Retrieve current type data from the database
//         const currentType = await skillProviderTypesService.getSkillProviderTypeById(typeId);
//         if (!currentType) {
//             throw new Error('Type not found');
//         }

//         // Prepare update query based on changed fields
//         const updateFields = Object.entries(typeData).filter(([key, value]) => value !== currentType[key] && key !== 'id');
//         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
//         const updateParams = updateFields.map(([key, value]) => value);

//         // Add typeId to updateParams
//         updateParams.push(typeId);

//         // Update type data in the database
//         const updateQuery = `
//             UPDATE skillProviderTypes 
//             SET ${updateValues}
//             WHERE id=?
//         `;
//         await query(updateQuery, updateParams);

//         // Return updated type data
//         return { ...currentType, ...typeData };
//     } catch (error) {
//         throw error;
//     }
// };

// skillProviderTypesService.deleteSkillProviderType = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM skillProviderTypes WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = skillProviderTypesService;
