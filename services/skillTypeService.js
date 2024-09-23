const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

// Create a pool of MySQL connections
const pool = mysql.createPool({
    connectionLimit: process.env.CONNECTION_LIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Helper function to execute SQL queries
function query(sql, args) {
    return new Promise((resolve, reject) => {
        // Get a connection from the pool
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }

            // Execute the query using the acquired connection
            connection.query(sql, args, (err, rows) => {
                // Release the connection back to the pool
                connection.release();

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            });
        });
    });
}

// Function to create services table if it doesn't exist
async function createServicesTable() {
    const createServicesTableQuery = `
        CREATE TABLE IF NOT EXISTS services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            serviceType VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    try {
        await query(createServicesTableQuery);
        console.log('Services table created successfully');
    } catch (error) {
        console.error('Error creating Services table:', error);
        throw error;
    }
}

// Function to create subcategories table if it doesn't exist
async function createSubcategoriesTable() {
    const createSubcategoriesTableQuery = `
        CREATE TABLE IF NOT EXISTS subcategories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            serviceId INT,
            subCategory VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `;
    try {
        await query(createSubcategoriesTableQuery);
        console.log('Subcategories table created successfully');
    } catch (error) {
        console.error('Error creating Subcategories table:', error);
        throw error;
    }
}

// Immediately create the Services and Subcategories tables on module load
createServicesTable();
createSubcategoriesTable();

// Service functions object
const skillTypeService = {};

// Function to create a new service with categories
skillTypeService.createServiceWithCategories = async (serviceType, subCategories) => {
    let serviceId;
    try {
        // Insert serviceType into services table
        const insertServiceQuery = `
            INSERT INTO services (serviceType)
            VALUES (?)
        `;
        const serviceResult = await query(insertServiceQuery, [serviceType]);
        serviceId = serviceResult.insertId;

        // Insert each subCategory into subcategories table
        const insertSubcategoriesQuery = `
            INSERT INTO subcategories (serviceId, subCategory)
            VALUES (?, ?)
        `;
        const subcategoryPromises = subCategories.map(subCategory => {
            return query(insertSubcategoriesQuery, [serviceId, subCategory]);
        });
        await Promise.all(subcategoryPromises);

        // Return created service details
        return {
            id: serviceId,
            serviceType,
            subCategories
        };
    } catch (error) {
        // If any error occurs, rollback service creation
        if (serviceId) {
            try {
                await query('DELETE FROM services WHERE id = ?', [serviceId]);
            } catch (rollbackError) {
                console.error('Error rolling back service creation:', rollbackError);
            }
        }
        throw error;
    }
};

// Function to get a service with its categories by serviceId
skillTypeService.getServiceWithCategoriesById = async (serviceId) => {
    try {
        // Get service details
        const selectServiceQuery = 'SELECT * FROM services WHERE id = ?';
        const service = await query(selectServiceQuery, [serviceId]);

        if (service.length === 0) {
            return null;
        }

        // Get subcategories for the service
        const selectSubcategoriesQuery = 'SELECT * FROM subcategories WHERE serviceId = ?';
        const subcategories = await query(selectSubcategoriesQuery, [serviceId]);

        return {
            id: service[0].id,
            serviceType: service[0].serviceType,
            subCategories: subcategories.map(sub => sub.subCategory)
        };
    } catch (error) {
        throw error;
    }
};

// Function to update categories for a service
skillTypeService.updateCategoriesForService = async (serviceId, newSubCategories) => {
    try {
        // Delete existing subcategories for the service
        const deleteSubcategoriesQuery = 'DELETE FROM subcategories WHERE serviceId = ?';
        await query(deleteSubcategoriesQuery, [serviceId]);

        // Insert new subcategories
        const insertSubcategoriesQuery = `
            INSERT INTO subcategories (serviceId, subCategory)
            VALUES (?, ?)
        `;
        const subcategoryPromises = newSubCategories.map(subCategory => {
            return query(insertSubcategoriesQuery, [serviceId, subCategory]);
        });
        await Promise.all(subcategoryPromises);

        return {
            id: serviceId,
            subCategories: newSubCategories
        };
    } catch (error) {
        throw error;
    }
};

// Function to delete a service with its categories
skillTypeService.deleteServiceWithCategories = async (serviceId) => {
    try {
        // Delete subcategories first
        const deleteSubcategoriesQuery = 'DELETE FROM subcategories WHERE serviceId = ?';
        await query(deleteSubcategoriesQuery, [serviceId]);

        // Then delete the service
        const deleteServiceQuery = 'DELETE FROM services WHERE id = ?';
        await query(deleteServiceQuery, [serviceId]);

        return { id: serviceId };
    } catch (error) {
        throw error;
    }
};

// Function to get all services with their categories
skillTypeService.getAllServicesWithCategories = async () => {
    try {
        const selectServicesQuery = 'SELECT * FROM services';
        const services = await query(selectServicesQuery);

        // Map over services to get their subcategories
        const servicesWithCategories = await Promise.all(
            services.map(async service => {
                const selectSubcategoriesQuery = 'SELECT subCategory FROM subcategories WHERE serviceId = ?';
                const subcategories = await query(selectSubcategoriesQuery, [service.id]);
                return {
                    id: service.id,
                    serviceType: service.serviceType,
                    subCategories: subcategories.map(sub => sub.subCategory)
                };
            })
        );

        return servicesWithCategories;
    } catch (error) {
        throw error;
    }
};

// Function to get categories for a service by ID
skillTypeService.getCategoriesForService = async (serviceId) => {
    try {
        const selectSubcategoriesQuery = 'SELECT subCategory FROM subcategories WHERE serviceId = ?';
        const subcategories = await query(selectSubcategoriesQuery, [serviceId]);
        return subcategories.map(sub => sub.subCategory);
    } catch (error) {
        throw error;
    }
};

module.exports = skillTypeService;



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

// // Function to create services table if it doesn't exist
// async function createServicesTable() {
//     const createServicesTableQuery = `
//         CREATE TABLE IF NOT EXISTS services (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceType VARCHAR(255) NOT NULL,
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//         )
//     `;
//     try {
//         await query(createServicesTableQuery);
//         console.log('Services table created successfully');
//     } catch (error) {
//         console.error('Error creating Services table:', error);
//         throw error;
//     }
// }

// // Function to create subcategories table if it doesn't exist
// async function createSubcategoriesTable() {
//     const createSubcategoriesTableQuery = `
//         CREATE TABLE IF NOT EXISTS subcategories (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceId INT,
//             subCategory VARCHAR(255) NOT NULL,
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//             FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE
//         )
//     `;
//     try {
//         await query(createSubcategoriesTableQuery);
//         console.log('Subcategories table created successfully');
//     } catch (error) {
//         console.error('Error creating Subcategories table:', error);
//         throw error;
//     }
// }

// // Immediately create the Services and Subcategories tables on module load
// createServicesTable();
// createSubcategoriesTable();

// const skillTypeService = {};

// // Function to create a new service with categories
// // skillTypeService.createServiceWithCategories = async (serviceType, categories) => {
// //     try {
// //         let serviceId;

// //         await pool.getConnection(async (err, connection) => {
// //             if (err) {
// //                 throw err;
// //             }

// //             try {
// //                 await connection.beginTransaction();

// //                 // Insert service
// //                 const insertServiceQuery = 'INSERT INTO services (serviceType) VALUES (?)';
// //                 const result = await connection.query(insertServiceQuery, [serviceType]);
// //                 serviceId = result.insertId;

// //                 // Insert categories
// //                 const insertCategoryQuery = 'INSERT INTO subcategories (serviceId, subCategory) VALUES (?, ?)';
// //                 const insertPromises = categories.map(category => {
// //                     return connection.query(insertCategoryQuery, [serviceId, category]);
// //                 });
// //                 await Promise.all(insertPromises);

// //                 await connection.commit();
// //             } catch (error) {
// //                 await connection.rollback();
// //                 throw error;
// //             } finally {
// //                 connection.release();
// //             }
// //         });

// //         return { id: serviceId, serviceType, categories };
// //     } catch (error) {
// //         throw error;
// //     }
// // };


// // skillTypeService.createServiceWithCategories = async (serviceType, categories) => {
// //     if (!categories || !Array.isArray(categories)) {
// //         throw new Error("Categories must be an array");
// //     }

// //     try {
// //         const insertServiceQuery = 'INSERT INTO services (serviceType) VALUES (?)';
// //         const serviceResult = await query(insertServiceQuery, [serviceType]);
// //         const serviceId = serviceResult.insertId;

// //         const insertPromises = categories.map(category => {
// //             const insertCategoryQuery = 'INSERT INTO subcategories (serviceId, subCategory) VALUES (?, ?)';
// //             return query(insertCategoryQuery, [serviceId, category]);
// //         });

// //         await Promise.all(insertPromises);
// //         return { id: serviceId, serviceType, categories };
// //     } catch (error) {
// //         throw new Error(`Failed to create service with categories: ${error.message}`);
// //     }
// // }

// // / Function to create a new service with categories
// skillTypeService.createServiceWithCategories = async (serviceType, subCategories) => {
//     try {
//         // Validate inputs
//         if (!serviceType || !subCategories || subCategories.length === 0) {
//             throw new Error('ServiceType and subCategories are required');
//         }

//         // Start a transaction
//         // const connection = await getConnection();
//         // await connection.beginTransaction();

//         try {
//             // Insert serviceType into services table
//             const [serviceResult] = await connection.query(
//                 'INSERT INTO services (serviceType) VALUES (?)',
//                 [serviceType]
//             );
//             const serviceId = serviceResult.insertId;

//             // Insert each subCategory into subcategories table
//             const insertPromises = subCategories.map(async (category) => {
//                 await connection.query(
//                     'INSERT INTO subcategories (serviceId, subCategory) VALUES (?, ?)',
//                     [serviceId, category]
//                 );
//             });
//             await Promise.all(insertPromises);

//             // Commit transaction
//             await connection.commit();

//             // Return created service details
//             return { id: serviceId, serviceType, subCategories };
//         } catch (error) {
//             // Rollback transaction if any query fails
//             await connection.rollback();
//             throw error;
//         } finally {
//             // Release connection back to the pool
//             connection.release();
//         }
//     } catch (error) {
//         throw error;
//     }
// };

 
// // Function to delete a service with its categories by ID
// skillTypeService.deleteServiceWithCategories = async (serviceId) => {
//     try {
//         await pool.getConnection(async (err, connection) => {
//             if (err) {
//                 throw err;
//             }

//             try {
//                 await connection.beginTransaction();

//                 // Delete service
//                 const deleteServiceQuery = 'DELETE FROM services WHERE id = ?';
//                 await connection.query(deleteServiceQuery, [serviceId]);

//                 // Delete associated categories
//                 const deleteCategoriesQuery = 'DELETE FROM subcategories WHERE serviceId = ?';
//                 await connection.query(deleteCategoriesQuery, [serviceId]);

//                 await connection.commit();
//             } catch (error) {
//                 await connection.rollback();
//                 throw error;
//             } finally {
//                 connection.release();
//             }
//         });

//         return { serviceId };
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to update a service by ID
// skillTypeService.updateService = async (serviceId, serviceType) => {
//     try {
//         const updateServiceQuery = 'UPDATE services SET serviceType = ? WHERE id = ?';
//         await query(updateServiceQuery, [serviceType, serviceId]);
//         return { id: serviceId, serviceType };
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to update categories for a service
// skillTypeService.updateCategoriesForService = async (serviceId, categories) => {
//     try {
//         await pool.getConnection(async (err, connection) => {
//             if (err) {
//                 throw err;
//             }

//             try {
//                 await connection.beginTransaction();

//                 // Delete existing categories
//                 const deleteCategoriesQuery = 'DELETE FROM subcategories WHERE serviceId = ?';
//                 await connection.query(deleteCategoriesQuery, [serviceId]);

//                 // Insert new categories
//                 const insertCategoryQuery = 'INSERT INTO subcategories (serviceId, subCategory) VALUES (?, ?)';
//                 const insertPromises = categories.map(category => {
//                     return connection.query(insertCategoryQuery, [serviceId, category]);
//                 });
//                 await Promise.all(insertPromises);

//                 await connection.commit();
//             } catch (error) {
//                 await connection.rollback();
//                 throw error;
//             } finally {
//                 connection.release();
//             }
//         });

//         return { id: serviceId, categories };
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to get a service with its categories by serviceId ID
// skillTypeService.getServiceWithCategoriesById = async (serviceId) => {
//     try {
//         const selectServiceQuery = 'SELECT * FROM services WHERE id = ?';
//         const service = await query(selectServiceQuery, [serviceId]);

//         if (!service[0]) {
//             return null;
//         }

//         const selectCategoriesQuery = 'SELECT * FROM subcategories WHERE serviceId = ?';
//         const categories = await query(selectCategoriesQuery, [serviceId]);

//         return {
//             id: service[0].id,
//             serviceType: service[0].serviceType,
//             categories: categories.map(category => category.subCategory)
//         };
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to get all services with their categories
// skillTypeService.getAllServicesWithCategories = async () => {
//     try {
//         const selectAllServicesQuery = 'SELECT * FROM services';
//         const services = await query(selectAllServicesQuery);

//         const servicesWithCategories = [];
//         for (const service of services) {
//             const categories = await skillTypeService.getCategoriesForService(service.id);
//             servicesWithCategories.push({
//                 id: service.id,
//                 serviceType: service.serviceType,
//                 categories,
//             });
//         }

//         return servicesWithCategories;
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to get categories for a service by ID
// skillTypeService.getCategoriesForService = async (serviceId) => {
//     try {
//         const selectCategoriesQuery = 'SELECT subCategory FROM subcategories WHERE serviceId = ?';
//         const categories = await query(selectCategoriesQuery, [serviceId]);
//         return categories.map(category => category.subCategory);
//     } catch (error) {
//         throw error;
//     }
// };

// // Export the skillTypeService module
// module.exports = skillTypeService;




// const mysql = require('mysql');
// const dotenv = require('dotenv');

// dotenv.config();

// const connection = mysql.createConnection({
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

// // Function to create necessary tables if they don't exist
// const createTables = async () => {
//     const createServicesTable = `
//         CREATE TABLE IF NOT EXISTS services (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceType VARCHAR(255) NOT NULL,
//             providerId INT,
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//         )
//     `;
  
//     const createSubcategoriesTable = `
//         CREATE TABLE IF NOT EXISTS subcategories (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceId INT,
//             subCategory VARCHAR(255),
//             FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE
//         )
//     `;
  
//     try {
//         await query(createServicesTable);
//         await query(createSubcategoriesTable);
//         console.log('Tables created successfully');
//     } catch (error) {
//         console.error('Error creating tables:', error);
//     } finally {
//         // Close the MySQL connection after table creation
//         connection.end();
//     }
// };

// // Immediately create the tables on module load
// createTables();

// const skillTypeService = {};

// // Function to create a new service
// skillTypeService.createService = async (serviceData) => {
//     try {
//         const { serviceType, providerId } = serviceData;
        
//         // Insert service data into the services table
//         const insertQuery = `
//             INSERT INTO services (serviceType, providerId)
//             VALUES (?, ?)
//         `;
//         const result = await query(insertQuery, [serviceType, providerId]);

//         return { id: result.insertId, ...serviceData };
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to create a new subcategory for a service
// skillTypeService.createSubcategory = async (serviceId, subcategory) => {
//     try {
//         // Insert subcategory data into the subcategories table
//         const insertQuery = `
//             INSERT INTO subcategories (serviceId, subCategory)
//             VALUES (?, ?)
//         `;
//         const result = await query(insertQuery, [serviceId, subcategory]);

//         return { id: result.insertId, serviceId, subcategory };
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to get all services
// skillTypeService.getAllServices = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM services';
//         const services = await query(selectAllQuery);
//         return services;
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to get service by ID
// skillTypeService.getServiceById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM services WHERE id = ?';
//         const service = await query(selectQuery, [id]);
//         return service[0];
//     } catch (error) {
//         throw error;
//     }
// };

// // Export skillTypeService object to make its methods accessible
// module.exports = skillTypeService;



// // const mysql = require('mysql');
// // const dotenv = require('dotenv');

// // dotenv.config();

// // const connection = mysql.createConnection({
// //     host: process.env.DB_HOST,
// //     user: process.env.DB_USER,
// //     password: process.env.DB_PASSWORD,
// //     database: process.env.DB_NAME,
// // });

// // // Helper function to execute SQL queries
// // function query(sql, args) {
// //     return new Promise((resolve, reject) => {
// //         connection.query(sql, args, (err, rows) => {
// //             if (err) reject(err);
// //             else resolve(rows);
// //         });
// //     });
// // }

// // // Function to create necessary tables if they don't exist
// // const createTables = async () => {
// //     const createServicesTable = `
// //         CREATE TABLE IF NOT EXISTS services (
// //             id INT AUTO_INCREMENT PRIMARY KEY,
// //             serviceType VARCHAR(255) NOT NULL,
// //             providerId INT,
// //             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// //             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// //         )
// //     `;
  
// //     const createSubcategoriesTable = `
// //         CREATE TABLE IF NOT EXISTS subcategories (
// //             id INT AUTO_INCREMENT PRIMARY KEY,
// //             serviceId INT,
// //             subCategory VARCHAR(255),
// //             FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE
// //         )
// //     `;
  
// //     try {
// //         await query(createServicesTable);
// //         await query(createSubcategoriesTable);
// //         console.log('Tables created successfully');
// //     } catch (error) {
// //         console.error('Error creating tables:', error);
// //     }
// // };

// // // Immediately create the tables on module load
// // createTables();

// // const skillTypeService = {};

// // // Function to create a new service
// // skillTypeService.createService = async (serviceData) => {
// //     try {
// //         const { serviceType, providerId } = serviceData;
        
// //         // Insert service data into the services table
// //         const insertQuery = `
// //             INSERT INTO services (serviceType, providerId)
// //             VALUES (?, ?)
// //         `;
// //         const result = await query(insertQuery, [serviceType, providerId]);

// //         return { id: result.insertId, ...serviceData };
// //     } catch (error) {
// //         throw error;
// //     }
// // };

// // // Function to create a new subcategory for a service
// // skillTypeService.createSubcategory = async (serviceId, subcategory) => {
// //     try {
// //         // Insert subcategory data into the subcategories table
// //         const insertQuery = `
// //             INSERT INTO subcategories (serviceId, subCategory)
// //             VALUES (?, ?)
// //         `;
// //         const result = await query(insertQuery, [serviceId, subcategory]);

// //         return { id: result.insertId, serviceId, subcategory };
// //     } catch (error) {
// //         throw error;
// //     }
// // };

// // // Function to get all services
// // skillTypeService.getAllServices = async () => {
// //     try {
// //         const selectAllQuery = 'SELECT * FROM services';
// //         const services = await query(selectAllQuery);
// //         return services;
// //     } catch (error) {
// //         throw error;
// //     }
// // };

// // // Function to get service by ID
// // skillTypeService.getServiceById = async (id) => {
// //     try {
// //         const selectQuery = 'SELECT * FROM services WHERE id = ?';
// //         const service = await query(selectQuery, [id]);
// //         return service[0];
// //     } catch (error) {
// //         throw error;
// //     }
// // };

// // // Export skillTypeService object to make its methods accessible
// // module.exports = skillTypeService;
