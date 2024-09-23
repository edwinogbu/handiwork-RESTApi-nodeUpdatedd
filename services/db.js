//db.js
  
const mysql = require('mysql');
 
  
  
const pool = mysql.createPool({
    connectionLimit: process.env.CONNECTION_LIMIT,    // the number of connections node.js will hold open to our database
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    database: process.env.MYSQL_DB,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
    
});
    
 
  //  //create the User table
 
  // pool.query('CREATE TABLE User (' +
  //       'id int(11) NOT NULL AUTO_INCREMENT,' +
  //       'user_name varchar(255) NOT NULL,' +
  //       'role varchar(255) default "employee",' +
  //       'email varchar(255) NOT NULL,' +
  //       'password varchar(255) NOT NULL,' +
  //       'PRIMARY KEY (id),'+
  //       'UNIQUE KEY email_UNIQUE (email),' +
  //       'UNIQUE KEY password_UNIQUE (password))', function (err, result) {
  //           if (err) throw err;
  //           console.log("User created");
  //         }
  //      );
    
   
    
let db = {};
 
// ***Requests to the User table ***
 
db.allUser = () =>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM User ', (error, users)=>{
            if(error){
                return reject(error);
            }
            return resolve(users);
        });
    });
};
 
 
db.getUserByEmail = (email) =>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM User WHERE email = ?', [email], (error, users)=>{
            if(error){
                return reject(error);
            }
            return resolve(users[0]);
        });
    });
};
 
 
 
db.insertUser = (userName, email, password) =>{
    return new Promise((resolve, reject)=>{
        pool.query('INSERT INTO User (user_name, email, password) VALUES (?,  ?, ?)', [userName, email, password], (error, result)=>{
            if(error){
                return reject(error);
            }
             
              return resolve(result.insertId);
        });
    });
};
 
 
db.updateUser = (userName, role, email, password, id) =>{
    return new Promise((resolve, reject)=>{
        pool.query('UPDATE User SET user_name = ?, role= ?, email= ?, password=? WHERE id = ?', [userName, role, email, password, id], (error)=>{
            if(error){
                return reject(error);
            }
             
              return resolve();
        });
    });
};
 
 
 
db.deleteUser = (id) =>{
    return new Promise((resolve, reject)=>{
        pool.query('DELETE FROM User WHERE id = ?', [id], (error)=>{
            if(error){
                return reject(error);
            }
            return resolve(console.log("User deleted"));
        });
    });
};
 
db.getUserByColumn = async (column, identifier) => {
    try {
        // Construct the SQL query dynamically based on the provided column
        const selectQuery = `SELECT * FROM users WHERE ${column} = ?`;
        const user = await query(selectQuery, [identifier]);

        // Return the user data if found, otherwise return null
        return user.length > 0 ? user[0] : null;
    } catch (error) {
        throw error;
    }
};

 
    
module.exports = db

// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = mysql.createPool({
//     connectionLimit: process.env.CONNECTION_LIMIT,
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT
// });

// const db = {};

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

// // Create Users table if it doesn't exist
// const createUserTableQuery = `
//     CREATE TABLE IF NOT EXISTS User (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         username VARCHAR(255) NOT NULL UNIQUE,
//         email VARCHAR(255),
//         phone VARCHAR(255) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
//         userType ENUM('Customer', 'Provider') NOT NULL,
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `;

// // Execute table creation query
// (async () => {
//     try {
//         await query(createUserTableQuery);
//         console.log('User table created successfully');
//     } catch (error) {
//         console.error('Error creating user table:', error);
//     }
// })();

// // CRUD operations for User
// db.allUser = () => {
//     return query('SELECT * FROM User');
// };

// db.getUserByEmail = (email) => {
//     return query('SELECT * FROM User WHERE email = ?', [email]);
// };

// db.getUserByEmailOrPhone = (emailOrPhone) => {
//     return query('SELECT * FROM User WHERE email = ? OR phone = ?', [emailOrPhone, emailOrPhone]);
// };

// db.insertUser = async (userName, email, phone, password) => {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     return query('INSERT INTO User (username, email, phone, password) VALUES (?, ?, ?, ?)', [userName, email, phone, hashedPassword]);
// };

// db.updateUser = async (userName, role, email, phone, password, id) => {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     return query('UPDATE User SET username = ?, role = ?, email = ?, phone = ?, password = ? WHERE id = ?', [userName, role, email, phone, hashedPassword, id]);
// };

// db.deleteUser = (id) => {
//     return query('DELETE FROM User WHERE id = ?', [id]);
// };

// db.getAllUsers = () => {
//     return query('SELECT * FROM User');
// };

// module.exports = db;


// const mysql = require('mysql');
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = mysql.createPool({
//     connectionLimit: process.env.CONNECTION_LIMIT,
//     password: process.env.DB_PASSWORD,
//     user: process.env.DB_USER,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT
// });

// const db = {};

// // ***Requests to the User table ***

// db.allUser = () => {
//     return new Promise((resolve, reject) => {
//         pool.query('SELECT * FROM User ', (error, users) => {
//             if (error) {
//                 return reject(error);
//             }
//             return resolve(users);
//         });
//     });
// };

// db.getUserByEmail = (email) => {
//     return new Promise((resolve, reject) => {
//         pool.query('SELECT * FROM User WHERE email = ?', [email], (error, users) => {
//             if (error) {
//                 return reject(error);
//             }
//             return resolve(users[0]);
//         });
//     });
// };

// db.getUserByEmailOrPhone = (emailOrPhone) => {
//     return new Promise((resolve, reject) => {
//         pool.query('SELECT * FROM User WHERE email = ? OR phone = ?', [emailOrPhone, emailOrPhone], (error, users) => {
//             if (error) {
//                 return reject(error);
//             }
//             return resolve(users[0]);
//         });
//     });
// };

// db.insertUser = (userName, email, password) => {
//     return new Promise((resolve, reject) => {
//         pool.query('INSERT INTO User (user_name, email, password) VALUES (?,  ?, ?)', [userName, email, password], (error, result) => {
//             if (error) {
//                 return reject(error);
//             }

//             return resolve(result.insertId);
//         });
//     });
// };

// db.updateUser = (userName, role, email, password, id) => {
//     return new Promise((resolve, reject) => {
//         pool.query('UPDATE User SET user_name = ?, role= ?, email= ?, password=? WHERE id = ?', [userName, role, email, password, id], (error) => {
//             if (error) {
//                 return reject(error);
//             }

//             return resolve();
//         });
//     });
// };

// db.deleteUser = (id) => {
//     return new Promise((resolve, reject) => {
//         pool.query('DELETE FROM User WHERE id = ?', [id], (error) => {
//             if (error) {
//                 return reject(error);
//             }
//             return resolve(console.log("User deleted"));
//         });
//     });
// };

// db.getAllUsers = () => {
//     return new Promise((resolve, reject) => {
//         pool.query('SELECT * FROM User', (error, users) => {
//             if (error) {
//                 return reject(error);
//             }
//             return resolve(users);
//         });
//     });
// };

// module.exports = db;

// const mysql = require('mysql');
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = mysql.createPool({
//     connectionLimit: process.env.CONNECTION_LIMIT,
//     password: process.env.DB_PASS,
//     user: process.env.DB_USER,
//     database: process.env.MYSQL_DB,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT
// });

// const db = {};

// // ***Requests to the User table ***

// db.allUser = () => {
//     return new Promise((resolve, reject) => {
//         pool.query('SELECT * FROM User ', (error, users) => {
//             if (error) {
//                 return reject(error);
//             }
//             return resolve(users);
//         });
//     });
// };


// db.getUserByEmail = (email) => {
//     return new Promise((resolve, reject) => {
//         pool.query('SELECT * FROM User WHERE email = ?', [email], (error, users) => {
//             if (error) {
//                 return reject(error);
//             }
//             return resolve(users[0]);
//         });
//     });
// };

// db.getUserByEmailOrPhone = (emailOrPhone) => {
//     return new Promise((resolve, reject) => {
//         pool.query('SELECT * FROM User WHERE email = ? OR phone = ?', [emailOrPhone, emailOrPhone], (error, users) => {
//             if (error) {
//                 return reject(error);
//             }
//             return resolve(users[0]);
//         });
//     });
// };

// db.insertUser = (userName, email, password) => {
//     return new Promise((resolve, reject) => {
//         pool.query('INSERT INTO User (user_name, email, password) VALUES (?,  ?, ?)', [userName, email, password], (error, result) => {
//             if (error) {
//                 return reject(error);
//             }

//             return resolve(result.insertId);
//         });
//     });
// };

// db.updateUser = (userName, role, email, password, id) => {
//     return new Promise((resolve, reject) => {
//         pool.query('UPDATE User SET user_name = ?, role= ?, email= ?, password=? WHERE id = ?', [userName, role, email, password, id], (error) => {
//             if (error) {
//                 return reject(error);
//             }

//             return resolve();
//         });
//     });
// };

// db.deleteUser = (id) => {
//     return new Promise((resolve, reject) => {
//         pool.query('DELETE FROM User WHERE id = ?', [id], (error) => {
//             if (error) {
//                 return reject(error);
//             }
//             return resolve(console.log("User deleted"));
//         });
//     });
// };

// module.exports = db;
