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

// Function to create conversations table if not exists
const createConversationsTableQuery = `
    CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

const createParticipantsTableQuery =`
    CREATE TABLE IF NOT EXISTS participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        conversation_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
`;

// Function to create messages table if not exists
const createMessagesTableQuery =`
    CREATE TABLE IF NOT EXISTS messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT,
        sender_id INT,
        recipient_id INT,
        message_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )
`;

// Execute table creation queries
(async () => {
    try {
        await query(createConversationsTableQuery);
        await query(createMessagesTableQuery);
        await query(createParticipantsTableQuery);
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
})();

// CRUD operations for Chatting
const chattingService = {};

chattingService.createConversation = async (participants) => {
    try {
        // Insert conversation into the database
        const insertConversationQuery = 'INSERT INTO conversations (participants) VALUES (?)';
        // const insertConversationQuery = 'INSERT INTO conversations (participants) VALUES (?)';
        const result = await query(insertConversationQuery, [JSON.stringify(participants)]);

        // const result = await query(insertConversationQuery);
        const conversationId = result.insertId;

        // Save participants to the participants table
        for (let i = 0; i < participants.length; i++) {
            const insertParticipantQuery = 'INSERT INTO participants (user_id, conversation_id) VALUES (?, ?)';
            await query(insertParticipantQuery, [participants[i], conversationId]);
        }

        // Return the ID of the newly created conversation
        return conversationId;
    } catch (error) {
        throw error;
    }
};

chattingService.getConversationMessages = async (conversationId) => {
    try {
        // Retrieve messages for the specified conversation ID
        const selectMessagesQuery = 'SELECT * FROM messages WHERE conversation_id = ?';
        const messages = await query(selectMessagesQuery, [conversationId]);
        
        return messages;
    } catch (error) {
        throw error;
    }
};

chattingService.createMessage = async (conversation_id, sender_id, recipient_id, content) => {
    try {
        // Insert message into the database
        const insertMessageQuery = 'INSERT INTO messages (conversation_id, sender_id, recipient_id, message_text) VALUES (?, ?, ?, ?)';
        const result = await query(insertMessageQuery, [conversation_id, sender_id, recipient_id, content]);

        // Return the ID of the newly created message
        return result.insertId;
    } catch (error) {
        throw error;
    }
};

chattingService.updateMessage = async (messageId, content) => {
    try {
        // Update message content in the database
        const updateMessageQuery = 'UPDATE messages SET message_text = ? WHERE message_id = ?';
        await query(updateMessageQuery, [content, messageId]);
    } catch (error) {
        throw error;
    }
};

chattingService.deleteMessage = async (messageId) => {
    try {
        // Delete message from the database
        const deleteMessageQuery = 'DELETE FROM messages WHERE message_id = ?';
        await query(deleteMessageQuery, [messageId]);
    } catch (error) {
        throw error;
    }
};

module.exports = chattingService;


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

// // Function to create conversations table if not exists
// const createConversationsTableQuery = `
//     CREATE TABLE IF NOT EXISTS conversations (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `;



// const createParticipantsTableQuery =`
//     CREATE TABLE IF NOT EXISTS participants (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT,
//         conversation_id INT,
//         FOREIGN KEY (user_id) REFERENCES users(id),
//         FOREIGN KEY (conversation_id) REFERENCES conversations(id)
//     )
// `;



// // Function to create messages table if not exists
// const createMessagesTableQuery =`
//     CREATE TABLE IF NOT EXISTS messages (
//         message_id INT AUTO_INCREMENT PRIMARY KEY,
//         conversation_id INT,
//         sender_id INT,
//         recipient_id INT,
//         message_text TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (conversation_id) REFERENCES conversations(id),
//         FOREIGN KEY (sender_id) REFERENCES users(id),
//         FOREIGN KEY (recipient_id) REFERENCES users(id)
//     )
// `;

// // Execute table creation queries
// (async () => {
//     try {
//         await query(createConversationsTableQuery);
//         await query(createMessagesTableQuery);
//         await query(createParticipantsTableQuery);
//         console.log('Tables created successfully');
//     } catch (error) {
//         console.error('Error creating tables:', error);
//     }
// })();

// // CRUD operations for Chatting
// const chattingService = {};

// chattingService.createConversation = async (participants) => {
//     try {
//         // Insert conversation into the database
//         const insertConversationQuery = 'INSERT INTO conversations (participants) VALUES (?)';
//         const result = await query(insertConversationQuery, [JSON.stringify(participants)]);

//         // Return the ID of the newly created conversation
//         return result.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// chattingService.getConversationMessages = async (conversationId) => {
//     try {
//         // Retrieve messages for the specified conversation ID
//         const selectMessagesQuery = 'SELECT * FROM messages WHERE conversation_id = ?';
//         const messages = await query(selectMessagesQuery, [conversationId]);
        
//         return messages;
//     } catch (error) {
//         throw error;
//     }
// };

// chattingService.createMessage = async (conversation_id, sender_id, recipient_id, message_text) => {
//     try {
//         // Insert message into the database
//         const insertMessageQuery = 'INSERT INTO messages (conversation_id, sender_id, recipient_id, message_text) VALUES (?, ?, ?, ?)';
//         const result = await query(insertMessageQuery, [conversation_id, sender_id, recipient_id, message_text]);

//         // Return the ID of the newly created message
//         return result.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// chattingService.updateMessage = async (messageId, content) => {
//     try {
//         // Update message content in the database
//         const updateMessageQuery = 'UPDATE messages SET message_text = ? WHERE message_id = ?';
//         await query(updateMessageQuery, [content, messageId]);
//     } catch (error) {
//         throw error;
//     }
// };

// chattingService.deleteMessage = async (messageId) => {
//     try {
//         // Delete message from the database
//         const deleteMessageQuery = 'DELETE FROM messages WHERE message_id = ?';
//         await query(deleteMessageQuery, [messageId]);
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = chattingService;




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

// // Function to create conversations table if not exists
// const createConversationsTableQuery = `
//     CREATE TABLE IF NOT EXISTS conversations (
//         conversation_id INT AUTO_INCREMENT PRIMARY KEY,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `;

// const createParticipantsTableQuery =`
//     CREATE TABLE IF NOT EXISTS participants (
//         participant_id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT,
//         conversation_id INT,
//         FOREIGN KEY (user_id) REFERENCES users(id),
//         FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),
//         UNIQUE (user_id, conversation_id)
//     )
// `;

// // Function to create messages table if not exists
// const createMessagesTableQuery =`
//     CREATE TABLE IF NOT EXISTS messages (
//         message_id INT AUTO_INCREMENT PRIMARY KEY,
//         conversation_id INT,
//         sender_id INT,
//         recipient_id INT,
//         message_text TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),
//         FOREIGN KEY (sender_id) REFERENCES users(id),
//         FOREIGN KEY (recipient_id) REFERENCES users(id)
//     )
// `;

// // Execute table creation queries
// (async () => {
//     try {
//         await query(createConversationsTableQuery);
//         await query(createMessagesTableQuery);
//         await query(createParticipantsTableQuery);
//         console.log('Tables created successfully');
//     } catch (error) {
//         console.error('Error creating tables:', error);
//     }
// })();

// // CRUD operations for Chatting
// const chattingService = {};

// chattingService.createConversation = async (participants) => {
//     try {
//         // Insert conversation into the database
//         const insertConversationQuery = 'INSERT INTO conversations (participants) VALUES (?)';
//         const result = await query(insertConversationQuery, [JSON.stringify(participants)]);

//         // Return the ID of the newly created conversation
//         return result.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// chattingService.getConversationMessages = async (conversationId) => {
//     try {
//         // Retrieve messages for the specified conversation ID
//         const selectMessagesQuery = 'SELECT * FROM messages WHERE conversation_id = ?';
//         const messages = await query(selectMessagesQuery, [conversationId]);
        
//         return messages;
//     } catch (error) {
//         throw error;
//     }
// };

// chattingService.createMessage = async (conversation_id, sender_id, recipient_id, content) => {
//     try {
//         // Insert message into the database
//         const insertMessageQuery = 'INSERT INTO messages (conversation_id, sender_id, recipient_id, message_text) VALUES (?, ?, ?, ?)';
//         const result = await query(insertMessageQuery, [conversation_id, sender_id, recipient_id, content]);

//         // Return the ID of the newly created message
//         return result.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// chattingService.updateMessage = async (messageId, content) => {
//     try {
//         // Update message content in the database
//         const updateMessageQuery = 'UPDATE messages SET message_text = ? WHERE message_id = ?';
//         await query(updateMessageQuery, [content, messageId]);
//     } catch (error) {
//         throw error;
//     }
// };

// chattingService.deleteMessage = async (messageId) => {
//     try {
//         // Delete message from the database
//         const deleteMessageQuery = 'DELETE FROM messages WHERE message_id = ?';
//         await query(deleteMessageQuery, [messageId]);
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = chattingService;


// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
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

// // Function to create conversations table if not exists
// const createConversationsTableQuery = `
//     CREATE TABLE IF NOT EXISTS conversations (
//         conversation_id INT AUTO_INCREMENT PRIMARY KEY,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `;

// const createParticipantsTableQuery =`
//     CREATE TABLE IF NOT EXISTS participants (
//         participant_id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT,
//         conversation_id INT,
//         FOREIGN KEY (user_id) REFERENCES users(id),
//         FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),
//         UNIQUE (user_id, conversation_id)
//     )
// `;

// // Function to create messages table if not exists
// const createMessagesTableQuery =`
//     CREATE TABLE IF NOT EXISTS messages (
//         message_id INT AUTO_INCREMENT PRIMARY KEY,
//         conversation_id INT,
//         sender_id INT,
//         recipient_id INT,
//         message_text TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),
//         FOREIGN KEY (sender_id) REFERENCES users(id),
//         FOREIGN KEY (recipient_id) REFERENCES users(id)
//     )
// `;

// // Execute table creation queries
// (async () => {
//     try {
//         await query(createConversationsTableQuery);
//         await query(createMessagesTableQuery);
//         await query(createParticipantsTableQuery);
//         console.log('Tables created successfully');
//     } catch (error) {
//         console.error('Error creating tables:', error);
//     }
// })();

// exports.createConversation = async (participants) => {
//     try {
//         // Insert conversation into the database
//         const insertConversationQuery = 'INSERT INTO conversations (participants) VALUES (?)';
//         const result = await query(insertConversationQuery, [JSON.stringify(participants)]);

//         // Return the ID of the newly created conversation
//         return result.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// exports.getConversationMessages = async (conversationId) => {
//     try {
//         // Retrieve messages for the specified conversation ID
//         const selectMessagesQuery = 'SELECT * FROM messages WHERE conversation_id = ?';
//         const messages = await query(selectMessagesQuery, [conversationId]);
        
//         return messages;
//     } catch (error) {
//         throw error;
//     }
// };

// exports.createMessage = async (conversation_id, sender_id, recipient_id, content) => {
//     try {
//         // Insert message into the database
//         const insertMessageQuery = 'INSERT INTO messages (conversation_id, sender_id, recipient_id, message_text) VALUES (?, ?, ?, ?)';
//         const result = await query(insertMessageQuery, [conversation_id, sender_id, recipient_id, content]);

//         // Return the ID of the newly created message
//         return result.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// exports.updateMessage = async (messageId, content) => {
//     try {
//         // Update message content in the database
//         const updateMessageQuery = 'UPDATE messages SET message_text = ? WHERE message_id = ?';
//         await query(updateMessageQuery, [content, messageId]);
//     } catch (error) {
//         throw error;
//     }
// };

// exports.deleteMessage = async (messageId) => {
//     try {
//         // Delete message from the database
//         const deleteMessageQuery = 'DELETE FROM messages WHERE message_id = ?';
//         await query(deleteMessageQuery, [messageId]);
//     } catch (error) {
//         throw error;
//     }
// };
