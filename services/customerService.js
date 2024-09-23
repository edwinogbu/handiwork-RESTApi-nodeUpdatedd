const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

// Create Customers table if it doesn't exist
const createCustomersTableQuery = `
    CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address VARCHAR(255) NOT NULL,
        imagePath VARCHAR(255),
        userId INT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

// Create Users table if it doesn't exist
const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        emailVerified BOOLEAN DEFAULT FALSE,
        status VARCHAR(255) NOT NULL DEFAULT 'pending',
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        userType ENUM('Customer', 'SkillProvider') NOT NULL,
        defaultEmail VARCHAR(255),
        customerId INT,
        providerId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

const createOtpsTableQuery = `
    CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        otp VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`;

// Function to create Users table
async function createUsersTable() {
    try {
        await query(createUsersTableQuery);
        console.log('Users table created successfully');
    } catch (error) {
        console.error('Error creating Users table:', error);
    }
}

// Function to alter Users table
// async function alterUsersTable() {
//     try {
//         const alterTableQuery = `ALTER TABLE users ADD COLUMN defaultEmail VARCHAR(255)`;
//         await query(alterTableQuery); // Add the defaultEmail column to the users table
//         console.log('Users table altered successfully');
//     } catch (error) {
//         console.error('Error altering Users table:', error);
//     }
// }

// Execute table creation and alteration queries
(async () => {
    await createUsersTable();
    // await alterUsersTable();
    await query(createCustomersTableQuery);
    await query(createOtpsTableQuery);
    console.log('Tables created successfully');
})();

// Function to sign JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// CRUD operations for Default Email
const customerService = {};



customerService.emailExists = async (email) => {
    try {
        const selectQuery = 'SELECT COUNT(*) AS count FROM customers WHERE email = ?';
        const result = await query(selectQuery, [email]);
        const count = result[0].count;
        return count > 0;
    } catch (error) {
        throw error;
    }
};

customerService.phoneExists = async (phone) => {
    try {
        const selectQuery = 'SELECT COUNT(*) AS count FROM customers WHERE phone = ?';
        const result = await query(selectQuery, [phone]);
        const count = result[0].count;
        return count > 0;
    } catch (error) {
        throw error;
    }
};



customerService.createCustomer = async (customerData) => {
    try {
        const { firstName, lastName, email, password, phone, address } = customerData;

        // Check if email already exists
        const emailExists = await customerService.emailExists(email);
        if (emailExists) {
            throw new Error('Email already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert customer data into the customers table
        const insertCustomerQuery = `
            INSERT INTO customers (firstName, lastName, email, password, phone, address)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const customerResult = await query(insertCustomerQuery, [firstName, lastName, email, hashedPassword, phone, address]);

        // Check if customer insertion was successful
        if (!customerResult.insertId) {
            throw new Error('Failed to insert customer');
        }

        // Generate JWT token
        const token = jwt.sign({ id: customerResult.insertId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // Return the newly created customer data along with the user token
        return { id: customerResult.insertId, token, ...customerData, address };
    } catch (error) {
        throw error;
    }
};



// Function to check if a user exists
customerService.userExists = async (customerId) => {
    try {
        const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE customerId = ?';
        const result = await query(selectQuery, [customerId]);
        const count = result[0].count;
        return count > 0;
    } catch (error) {
        throw error;
    }
};

// Function to check if a customer exists
customerService.customerExists = async (customerId) => {
    try {
        const selectQuery = 'SELECT COUNT(*) AS count FROM customers WHERE id = ?';
        const result = await query(selectQuery, [customerId]);
        const count = result[0].count;
        return count > 0;
    } catch (error) {
        throw error;
    }
};



// Function to update customer information
customerService.updateCustomer = async (customerId, updatedCustomerData) => {
    try {
        // Check if the customer exists
        const customerExists = await customerService.customerExists(customerId);
        if (!customerExists) {
            throw new Error('Customer not found');
        }

        const { firstName, lastName, email, phone, address } = updatedCustomerData;

        // Update customer data in the customers table
        const updateCustomerQuery = `
            UPDATE customers
            SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ?
            WHERE id = ?
        `;
        await query(updateCustomerQuery, [firstName, lastName, email, phone, address, customerId]);
          
       
        // Check if the user exists
        const userExists = await customerService.userExists(customerId);
        if (!userExists) {
            throw new Error('User not found');
        }

        // Update user data in the users table
        const updateUserQuery = `
            UPDATE users
            SET firstName = ?, lastName = ?, email = ?, phone = ?
            WHERE customerId = ?
        `;
        await query(updateUserQuery, [firstName, lastName, email, phone, customerId]);

        // Return the updated customer data
        return { id: customerId, ...updatedCustomerData };
    } catch (error) {
        throw error;
    }
};



// customerService.updateCustomer = async (customerId, updatedCustomerData) => {
//     try {
//         const { firstName, lastName, email, phone, address } = updatedCustomerData;

//         // Check if customer exists
//         const customerExistsQuery = `
//             SELECT id FROM customers WHERE id = ?
//         `;
//         const customerExistsResult = await query(customerExistsQuery, [customerId]);

//         if (customerExistsResult.length === 0) {
//             throw new Error('Customer not found');
//         }

//         // Check if user exists and retrieve user ID
//         const userExistsQuery = `
//             SELECT id FROM users WHERE customerId = ?
//         `;
//         const userExistsResult = await query(userExistsQuery, [customerId]);

//         if (userExistsResult.length === 0) {
//             throw new Error('User not found');
//         }

//         const userId = userExistsResult[0].id;

//         // Update customer data in the customers table
//         const updateCustomerQuery = `
//             UPDATE customers
//             SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ?
//             WHERE id = ?
//         `;
//         await query(updateCustomerQuery, [firstName, lastName, email, phone, address, customerId]);

//         // Update user data in the users table
//         const updateUserQuery = `
//             UPDATE users
//             SET firstName = ?, lastName = ?, email = ?, phone = ?
//             WHERE id = ?
//         `;
//         await query(updateUserQuery, [firstName, lastName, email, phone, userId]);

//         // Return the updated customer data
//         return { id: customerId, ...updatedCustomerData };
//     } catch (error) {
//         throw error;
//     }
// };


// customerService.updateCustomer = async (customerId, updatedCustomerData) => {
//     try {
//         const { firstName, lastName, email, phone, address } = updatedCustomerData;

  
//         // Update customer data in the customers table
//         const updateCustomerQuery = `
//             UPDATE customers
//             SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ?
//             WHERE id = ?
//         `;
//         await query(updateCustomerQuery, [firstName, lastName, email, phone, address, customerId]);

//         // Update user data in the users table
//         const updateUserQuery = `
//             UPDATE users
//             SET firstName = ?, lastName = ?, email = ?, phone = ?
//             WHERE customerId = ?
//         `;
//         await query(updateUserQuery, [firstName, lastName, email, phone, customerId]);

//         // Return the updated customer data
//         return { id: customerId, ...updatedCustomerData };
//     } catch (error) {
//         throw error;
//     }
// };


// customerService.updateCustomer = async (customerId, customerData) => {
//     try {
//         // Retrieve current customer data from the database
//         const currentCustomer = await customerService.getCustomerById(customerId);
//         if (!currentCustomer) {
//             throw new Error('Customer not found');
//         }

//         // Check for changes in customer data
//         const updatedCustomerData = { ...currentCustomer, ...customerData };
//         const hasChanges = Object.keys(updatedCustomerData).some(key => updatedCustomerData[key] !== currentCustomer[key]);

//         if (!hasChanges) {
//             // No changes made, return current customer data
//             return currentCustomer;
//         }

//         // Prepare update query based on changed fields
//         const updateFields = Object.entries(customerData).filter(([key, value]) => value !== currentCustomer[key]);
//         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
//         const updateParams = updateFields.map(([key, value]) => value);

//         // Add customerId to updateParams
//         updateParams.push(customerId);

//         // Update customer data in the database
//         const updateQuery = `
//             UPDATE customers 
//             SET ${updateValues}
//             WHERE id=?
//         `;
//         await query(updateQuery, updateParams);

//         // Return updated customer data
//         return { ...currentCustomer, ...customerData };
//     } catch (error) {
//         throw error;
//     }
// };


customerService.getCustomerById = async (id) => {
    try {
        const selectQuery = 'SELECT * FROM customers WHERE id = ?';
        const customers = await query(selectQuery, [id]);
        return customers[0];
    } catch (error) {
        throw error;
    }
};

customerService.getCustomerByUserId = async (userId) => {
    try {
        const selectQuery = 'SELECT * FROM customers WHERE userId = ?';
        const customers = await query(selectQuery, [userId]);
        return customers[0];
    } catch (error) {
        throw error;
    }
};


customerService.getAllCustomers = async () => {
    try {
        const selectAllQuery = 'SELECT * FROM customers';
        const customers = await query(selectAllQuery);

        // Check if customers array is empty
        if (customers.length === 0) {
            return { message: "Customers table is empty" };
        }

        return customers;
    } catch (error) {
        throw error;
    }
};



customerService.updateCustomerWithImage = async (customerId, customerData) => {
    try {
        // Retrieve current customer data from the database
        const currentCustomer = await customerService.getCustomerById(customerId);
        if (!currentCustomer) {
            throw new Error('Customer not found');
        }

        // Check for changes in customer data
        const updatedCustomerData = { ...currentCustomer, ...customerData };
        const hasChanges = Object.keys(updatedCustomerData).some(key => updatedCustomerData[key] !== currentCustomer[key]);

        if (!hasChanges) {
            // No changes made, return current customer data
            return currentCustomer;
        }

        // Prepare update query based on changed fields
        const updateFields = Object.entries(customerData).filter(([key, value]) => value !== currentCustomer[key]);
        const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
        const updateParams = updateFields.map(([key, value]) => value);

        // Add imagePath to updateParams
        updateParams.push(customerData.imagePath);

        // Update customer data in the database
        const updateQuery = `
            UPDATE customers 
            SET ${updateValues}, imagePath=?
            WHERE id=?
        `;
        await query(updateQuery, [...updateParams, customerId]);

        // Return updated customer data
        return { ...currentCustomer, ...customerData };
    } catch (error) {
        throw error;
    }
};



customerService.patchedUpdateCustomer = async (customerId, customerData) => {
    try {
        // Retrieve current customer data from the database
        const currentCustomer = await customerService.getCustomerById(customerId);
        if (!currentCustomer) {
            throw new Error('Customer not found');
        }

        // Check for changes in customer data
        const updatedCustomerData = { ...currentCustomer, ...customerData };
        const hasChanges = Object.keys(updatedCustomerData).some(key => updatedCustomerData[key] !== currentCustomer[key]);

        if (!hasChanges) {
            // No changes made, return current customer data
            return currentCustomer;
        }

        // Prepare update query based on changed fields
        const updateFields = Object.entries(customerData).filter(([key, value]) => value !== currentCustomer[key]);
        const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
        const updateParams = updateFields.map(([key, value]) => value);

        // Update customer data in the database
        const updateQuery = `
            UPDATE customers 
            SET ${updateValues}
            WHERE id=?
        `;

        // Log the update query and parameters for debugging
        console.log('Update Query:', updateQuery);
        console.log('Update Parameters:', [...updateParams, customerId]);

        // Execute the update query
        await query(updateQuery, [...updateParams, customerId]);

        // Return updated customer data
        return { ...currentCustomer, ...customerData };
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
};


customerService.deleteCustomer = async (id) => {
    try {
        const deleteQuery = 'DELETE FROM customers WHERE id = ?';
        await query(deleteQuery, [id]);
        return { id };
    } catch (error) {
        throw error;
    }
};

const fs = require('fs');
const { promisify } = require('util');

const unlinkSync = promisify(fs.unlink);

// Function to update only the image of a customer
customerService.updateCustomerOnlyImage = async (customerId, imagePath) => {
    try {

        const currentCustomer = await customerService.getCustomerById(customerId);
        if (!currentCustomer) {
            throw new Error('Customer not found');
        }

        // Check if there's an existing image for the skill provider
        if (currentCustomer.imagePath) {
            // Remove the existing image file from the server
            fs.unlinkSync(currentCustomer.imagePath);
        }

        // Update the skill provider's image path in the database
        const updateQuery = `
            UPDATE customers 
            SET imagePath=?
            WHERE id=?
        `;
        await query(updateQuery, [imagePath, customerId]);

        // Return the updated skill provider data
        return { ...currentCustomer, imagePath };
    } catch (error) {
        throw error;
    }
};


module.exports = customerService;




// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
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
//             if (err) return reject(err);
//             resolve(rows);
//         });
//     });
// }

// // Create Customers table if it doesn't exist
// const createCustomersTableQuery = `
//     CREATE TABLE IF NOT EXISTS customers (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         firstName VARCHAR(255) NOT NULL,
//         lastName VARCHAR(255) NOT NULL,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         phone VARCHAR(20),
//         address VARCHAR(255),
//         userId INT NOT NULL,
//         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `;

// // Create Users table if it doesn't exist
// const createUsersTableQuery = `
//     CREATE TABLE IF NOT EXISTS users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         username VARCHAR(255) NOT NULL UNIQUE,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
//         userType ENUM('Customer', 'Provider') NOT NULL,
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `;

// // Create tables if they don't exist
// connection.query(createUsersTableQuery, (err, result) => {
//     if (err) {
//         console.error('Error creating users table:', err);
//         return;
//     }
//     console.log('Users table created successfully');
// });

// connection.query(createCustomersTableQuery, (err, result) => {
//     if (err) {
//         console.error('Error creating customers table:', err);
//         return;
//     }
//     console.log('Customers table created successfully');
// });

// // Function to sign JWT token
// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };

// // CRUD operations for Customers
// const customerService = {};

// customerService.createCustomer = async (customerData) => {
//     try {
//         const { firstName, lastName, email, password, phone, address } = customerData;

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create new user
//         const newUserQuery = 'INSERT INTO users (username, email, password, role, userType) VALUES (?, ?, ?, ?, ?)';
//         const newUserResult = await query(newUserQuery, [email, email, hashedPassword, 'user', 'Customer']);

//         // Check if user insertion was successful
//         if (!newUserResult.insertId) {
//             throw new Error('Failed to insert user');
//         }

//         // Generate JWT token
//         const token = signToken(newUserResult.insertId);

//         // Insert customer data into the customers table
//         const insertQuery = `
//             INSERT INTO customers (firstName, lastName, email, password, phone, address, userId)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//         `;
//         const result = await query(insertQuery, [firstName, lastName, email, hashedPassword, phone, address, newUserResult.insertId]);

//         // Check if customer insertion was successful
//         if (!result.insertId) {
//             throw new Error('Failed to insert customer');
//         }

//         // Return the newly created customer data along with the user token
//         return { id: result.insertId, token, ...customerData };
//     } catch (error) {
//         throw error;
//     }
// };

// customerService.getCustomerById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM customers WHERE id = ?';
//         const customers = await query(selectQuery, [id]);
//         return customers[0];
//     } catch (error) {
//         throw error;
//     }
// };


// customerService.getAllCustomers = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM customers';
//         const customers = await query(selectAllQuery);

//         // Check if customers array is empty
//         if (customers.length === 0) {
//             return { message: "Customers table is empty" };
//         }

//         return customers;
//     } catch (error) {
//         throw error;
//     }
// };



// customerService.updateCustomer = async (id, updates) => {
//     try {
//         const updateQuery = `
//             UPDATE customers
//             SET ?
//             WHERE id = ?
//         `;
//         await query(updateQuery, [updates, id]);
//         return { id, ...updates };
//     } catch (error) {
//         throw error;
//     }
// };

// customerService.deleteCustomer = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM customers WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };

// // Export the customer service object
// module.exports = customerService;



// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
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
//             if (err) return reject(err);
//             resolve(rows);
//         });
//     });
// }

// // Create Customers table if it doesn't exist
// const createCustomersTableQuery = `
//     CREATE TABLE IF NOT EXISTS customers (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         firstName VARCHAR(255) NOT NULL,
//         lastName VARCHAR(255) NOT NULL,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         phone VARCHAR(20),
//         address VARCHAR(255),
//         userId INT NOT NULL,
//         imagePath VARCHAR(255), // New column for storing image path
//         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `;

// // Create Users table if it doesn't exist
// const createUsersTableQuery = `
//     CREATE TABLE IF NOT EXISTS users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         username VARCHAR(255) NOT NULL UNIQUE,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
//         userType ENUM('Customer', 'Provider') NOT NULL,
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `;

// // Create tables if they don't exist
// connection.query(createUsersTableQuery, (err, result) => {
//     if (err) {
//         console.error('Error creating users table:', err);
//         return;
//     }
//     console.log('Users table created successfully');
// });

// connection.query(createCustomersTableQuery, (err, result) => {
//     if (err) {
//         console.error('Error creating customers table:', err);
//         return;
//     }
//     console.log('Customers table created successfully');
// });

// // Function to sign JWT token
// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };

// // CRUD operations for Customers
// const customerService = {};

// customerService.createCustomer = async (customerData) => {
//     try {
//         const { firstName, lastName, email, password, phone, address, imagePath } = customerData;

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create new user
//         const newUserQuery = 'INSERT INTO users (username, email, password, role, userType) VALUES (?, ?, ?, ?, ?)';
//         const newUserResult = await query(newUserQuery, [email, email, hashedPassword, 'user', 'Customer']);

//         // Check if user insertion was successful
//         if (!newUserResult.insertId) {
//             throw new Error('Failed to insert user');
//         }

//         // Generate JWT token
//         const token = signToken(newUserResult.insertId);

//         // Insert customer data into the customers table
//         const insertQuery = `
//             INSERT INTO customers (firstName, lastName, email, password, phone, address, userId, imagePath)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const result = await query(insertQuery, [firstName, lastName, email, hashedPassword, phone, address, newUserResult.insertId, imagePath]);

//         // Check if customer insertion was successful
//         if (!result.insertId) {
//             throw new Error('Failed to insert customer');
//         }

//         // Return the newly created customer data along with the user token
//         return { id: result.insertId, token, ...customerData };
//     } catch (error) {
//         throw error;
//     }
// };

// customerService.getCustomerById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM customers WHERE id = ?';
//         const customers = await query(selectQuery, [id]);
//         return customers[0];
//     } catch (error) {
//         throw error;
//     }
// };

// customerService.getAllCustomers = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM customers';
//         const customers = await query(selectAllQuery);

//         // Check if customers array is empty
//         if (customers.length === 0) {
//             return { message: "Customers table is empty" };
//         }

//         return customers;
//     } catch (error) {
//         throw error;
//     }
// };

// customerService.updateCustomer = async (id, updates) => {
//     try {
//         const updateQuery = `
//             UPDATE customers
//             SET ?
//             WHERE id = ?
//         `;
//         await query(updateQuery, [updates, id]);
//         return { id, ...updates };
//     } catch (error) {
//         throw error;
//     }
// };

// customerService.deleteCustomer = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM customers WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = customerService;
