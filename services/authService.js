
const mysql = require('mysql');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const sendEmailWithOTP = require('./sendEmailWithOTP');

dotenv.config();


// Function to generate a random token
// const generateResetToken = () => {
//     return crypto.randomBytes(32).toString('hex');
// };


// Function to generate a random token and OTP
const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    return { resetToken, otp };
};


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
        status BOOLEAN DEFAULT FALSE,
        role ENUM('Admin', 'Staff', 'FieldStaff', 'SuperAdmin') NOT NULL DEFAULT 'Admin',
        userType ENUM('Customer', 'SkillProvider', 'Staff') NOT NULL,
        defaultEmail VARCHAR(255),
        adminId VARCHAR(255),
        pinCode INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

const createPasswordResetTokenTableQuery = `
   CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

`;


// Function to create Users table
async function createUsersTable() {
    try {
        // await query(createUsersTableQuery);
        console.log('Users table created successfully');
    } catch (error) {
        console.error('Error creating Users table:', error);
    }
}


// Execute table creation and alteration queries
(async () => {
    await createUsersTable();
    // await alterUsersTable();
    // await query(createPasswordResetTokenTableQuery);
    console.log('Tables created successfully');
})();



// Function to sign JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Function to generate a random OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const authenticationService = {};



// Sign in user
authenticationService.AdminAuthentication = async (loginData) => {
    try {
        // Ensure loginData is provided and contains emailOrPhone and password properties
        if (!loginData || !loginData.emailOrPhone || !loginData.password) {
            throw new Error('Both email/phone and password are required for authentication');
        }

        const emailOrPhone = loginData.emailOrPhone;
        const password = loginData.password;

        // Check if the login data is an email or phone number
        const isEmail = emailOrPhone.includes('@');
        const column = isEmail ? 'email' : 'phone';

        // Fetch user data from the database based on email or phone
        const selectQuery = `SELECT * FROM users WHERE ${column} = ?`;
        const userResult = await query(selectQuery, [emailOrPhone]);

        // If user not found, return error
        if (userResult.length === 0) {
            throw new Error('User not found');
        }

        const user = userResult[0];

        // Check if the pinCode exists
        if (!user.pinCode) {
            throw new Error('PIN code not found for user');
        }

        // Check if the email is verified and the status is active
        if (!user.emailVerified) {
            throw new Error('Email not verified');
        }

        if (!user.status) {
            throw new Error('User account not active');
        }

        // Verify password
        const hashedPassword = user.password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        // If password is invalid, return error
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = signToken(user.id);

        return { id: user.id, token, ...user };
    } catch (error) {
        throw error;
    }
};



// Authenticate user with email/phone and password
authenticationService.authenticateUser = async (loginData) => {
    try {
        // Ensure loginData is provided and contains emailOrPhone and password properties
        if (!loginData || !loginData.emailOrPhone || !loginData.password) {
            throw new Error('Both email/phone and password are required for authentication');
        }

        const emailOrPhone = loginData.emailOrPhone;
        const password = loginData.password;

        // Check if the login data is an email or phone number
        const isEmail = emailOrPhone.includes('@');
        const column = isEmail ? 'email' : 'phone';

        // Fetch user data from the database based on email or phone
        const selectQuery = `SELECT * FROM users WHERE ${column} = ?`;
        const user = await query(selectQuery, [emailOrPhone]);

        // If user not found, return error
        if (user.length === 0) {
            throw new Error('User not found');
        }

        // Verify password
        const hashedPassword = user[0].password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        // If password is invalid, return error
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = signToken(user[0].id);

        // Return user data along with token
        return { user: user[0], token };
    } catch (error) {
        throw error;
    }
};


// Authenticate user with email/phone and password
authenticationService.authenticateCustomer = async (loginData) => {
    try {
        // Ensure loginData is provided and contains emailOrPhone and password properties
        if (!loginData || !loginData.emailOrPhone || !loginData.password) {
            throw new Error('Both email/phone and password are required for authentication');
        }

        const emailOrPhone = loginData.emailOrPhone;
        const password = loginData.password;

        // Check if the login data is an email or phone number
        const isEmail = emailOrPhone.includes('@');
        const column = isEmail ? 'email' : 'phone';

        // Fetch user data from the database based on email or phone
        const selectQuery = `SELECT * FROM customers WHERE ${column} = ?`;
        const user = await query(selectQuery, [emailOrPhone]);

        // If user not found, return error
        if (user.length === 0) {
            throw new Error('User not found');
        }

        // Verify password
        const hashedPassword = user[0].password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        // If password is invalid, return error
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = signToken(user[0].id);

        // Return user data along with token
        return { user: user[0], token };
    } catch (error) {
        throw error;
    }
};


// Authenticate user with email/phone and password
authenticationService.authenticateSkillProvider = async (loginData) => {
    try {
        // Ensure loginData is provided and contains emailOrPhone and password properties
        if (!loginData || !loginData.emailOrPhone || !loginData.password) {
            throw new Error('Both email/phone and password are required for authentication');
        }

        const emailOrPhone = loginData.emailOrPhone;
        const password = loginData.password;

        // Check if the login data is an email or phone number
        const isEmail = emailOrPhone.includes('@');
        const column = isEmail ? 'email' : 'phone';

        // Fetch user data from the database based on email or phone
        const selectQuery = `SELECT * FROM skill_providers WHERE ${column} = ?`;
        const user = await query(selectQuery, [emailOrPhone]);

        // If user not found, return error
        if (user.length === 0) {
            throw new Error('User not found');
        }

        // Verify password
        const hashedPassword = user[0].password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        // If password is invalid, return error
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = signToken(user[0].id);

        // Return user data along with token
        return { user: user[0], token };
    } catch (error) {
        throw error;
    }
};


authenticationService.emailExists = async (email) => {
    try {
        // Fetch the default email address from the database
        const defaultEmailQuery = 'SELECT defaultEmail FROM users LIMIT 1';
        const defaultEmailResult = await query(defaultEmailQuery);
        const defaultEmail = defaultEmailResult.length > 0 ? defaultEmailResult[0].defaultEmail : null;

        if (email === defaultEmail) {
            // Default email address allowed without restrictions
            return false; // Assume it doesn't exist since it's the default
        } else {
            let selectQuery;
            let queryParams;
            
            if (email === null) {
                selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE email IS NULL';
                queryParams = [];
            } else {
                selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
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


// Generate a random 4-digit pin code
const generatePinCode = () => {
    return Math.floor(1000 + Math.random() * 9000);
};



// Register user
authenticationService.registerUser = async (userData) => {
    try {
        const { firstName, lastName, email, phone, password, role, userType,  adminId } = userData;
        const emailAlreadyExists = await authenticationService.emailExists(email);

        if (emailAlreadyExists) throw new Error('Email already exists');
        const hashedPassword = await bcrypt.hash(password, 12);
        const pinCode = generatePinCode();

        const insertQuery = 'INSERT INTO users (firstName, lastName, email, phone, password, role, userType, adminId, pinCode,  emailVerified, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const result = await query(insertQuery, [firstName, lastName, email, phone, hashedPassword, role, 'Staff',  adminId, pinCode, true, 'pending' ]);

        if (!result.insertId) throw new Error('Failed to register user');
        const token = signToken(result.insertId);

        return { id: result.insertId, token, pinCode, ...userData };
    } catch (error) {
        throw error;
    }
};



// Register user with email verification
authenticationService.registerUserWithEmailVerification = async (userData) => {
    try {
        const { firstName, lastName, email, phone, password, role, userType } = userData;
        const emailAlreadyExists = await authenticationService.emailExists(email);

        if (emailAlreadyExists) throw new Error('Email already exists');
        const hashedPassword = await bcrypt.hash(password, 12);
        const pinCode = generatePinCode();

        const insertQuery = `
            INSERT INTO users 
                (firstName, lastName, email, phone, password, emailVerified, status, role, userType, pinCode) 
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await query(insertQuery, [firstName, lastName, email, phone, hashedPassword, false, 'pending', role, userType, pinCode]);

        if (!result.insertId) throw new Error('Failed to register user');
        const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        const emailVerificationToken = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        const verificationLink = `${process.env.APP_BASE_URL}/verify-email?token=${emailVerificationToken}`;
        console.log('====================================');
        console.log(verificationLink);
        console.log('====================================');
        await sendEmailVerification(email, `${verificationLink}`);

        return { id: result.insertId, token, pinCode, ...userData };
    } catch (error) {
        throw error;
    }
};



authenticationService.registerUserWithOutEmailVerification = async (userData) => {
    try {
        const { firstName, lastName, email, phone, password, role, adminId } = userData;

        // Check if email already exists
        const emailAlreadyExists = await authenticationService.emailExists(email);
        if (emailAlreadyExists) {
            throw new Error('Email already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate a PIN code
        const pinCode = generatePinCode();

        // Insert user into the database
        const insertQuery = `
            INSERT INTO users 
                (firstName, lastName, email, phone, password, emailVerified, status, role, adminId, userType, pinCode) 
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await query(insertQuery, [firstName, lastName, email, phone, hashedPassword, true, 'pending', role, adminId, 'Staff', pinCode]);

        // Check if insertion was successful
        if (!result.insertId) {
            throw new Error('Failed to register user');
        }

        // Generate JWT token for the user
        const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // Return the user data along with the generated token and pinCode
        return { id: result.insertId, token, pinCode, ...userData };

    } catch (error) {
        throw error;
    }
};


authenticationService.handleEmailVerification = async (token) => {
    try {
        // Verify the email verification token
        const decodedToken = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

        // Extract user ID from the decoded token
        const userId = decodedToken.userId;

        // Update user's email verification status in the database
        const updateQuery = 'UPDATE users SET emailVerified = ? WHERE id = ?';
        await query(updateQuery, [true, userId]);

        return { message: 'Email verification successful' };
    } catch (error) {
        // Handle token verification failure
        if (error.name === 'TokenExpiredError') {
            throw new Error('Email verification link has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid email verification token');
        } else {
            throw new Error('Unknown error occurred during email verification');
        }
    }
};


// Authenticate user with email/phone and password
authenticationService.signInAuthentication = async (loginData) => {
    try {
        // Ensure loginData is provided and contains emailOrPhone and password properties
        if (!loginData || !loginData.emailOrPhone || !loginData.password) {
            throw new Error('Both email/phone and password are required for authentication');
        }

        const emailOrPhone = loginData.emailOrPhone;
        const password = loginData.password;

        // Check if the login data is an email or phone number
        const isEmail = emailOrPhone.includes('@');
        const column = isEmail ? 'email' : 'phone';

        // Fetch user data from the database based on email or phone
        const selectQuery = `SELECT * FROM users WHERE ${column} = ?`;
        const user = await query(selectQuery, [emailOrPhone]);

        // If user not found, return error
        if (user.length === 0) {
            throw new Error('User not found');
        }

        // Check if user's status is approved
        if (user[0].status !== 'approved') {
            throw new Error('User account is not approved');
        }

        // Verify password
        const hashedPassword = user[0].password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        // If password is invalid, return error
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // Return user data along with token
        return { user: user[0], token };
    } catch (error) {
        throw error;
    }
};

authenticationService.changePassword = async (userId, currentPassword, newPassword) => {
    try {
        // Fetch current password hash from database
        const selectUserQuery = 'SELECT password FROM users WHERE id = ?';
        const userResult = await query(selectUserQuery, [userId]);

        if (userResult.length === 0) {
            throw new Error('User not found');
        }

        const user = userResult[0];
        const hashedPassword = user.password;

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash the new password
        const newHashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password in database
        const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
        await query(updatePasswordQuery, [newHashedPassword, userId]);

        return { message: 'Password changed successfully' };
    } catch (error) {
        throw error;
    }
};


authenticationService.changeCustomerPassword = async (customerId, currentPassword, newPassword) => {
    try {
        // Fetch current password hash from database
        const selectUserQuery = 'SELECT password FROM customers WHERE id = ?';
        const userResult = await query(selectUserQuery, [customerId]);

        if (userResult.length === 0) {
            throw new Error('Customer not found');
        } 

        const user = userResult[0];
        const hashedPassword = user.password;

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash the new password
        const newHashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password in database
        const updatePasswordQuery = 'UPDATE customers SET password = ? WHERE id = ?';
        await query(updatePasswordQuery, [newHashedPassword, customerId]);

        return { message: 'Password changed successfully' };
    } catch (error) {
        throw error;
    }
};

authenticationService.changeSkillProviderPassword = async (skillProviderId, currentPassword, newPassword) => {
    try {
        // Fetch current password hash from database
        const selectUserQuery = 'SELECT password FROM skill_providers WHERE id = ?';
        const userResult = await query(selectUserQuery, [skillProviderId]);

        if (userResult.length === 0) {
            throw new Error('skill provider not found');
        }

        const user = userResult[0];
        const hashedPassword = user.password;

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash the new password
        const newHashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password in database
        const updatePasswordQuery = 'UPDATE skill_providers SET password = ? WHERE id = ?';
        await query(updatePasswordQuery, [newHashedPassword, userId]);

        return { message: 'Password changed successfully' };
    } catch (error) {
        throw error;
    }
};


// Register a new user
// authenticationService.registerUser = async (userData) => {
//     try {
//         const { firstName, lastName, email, phone, password, role, userType } = userData;

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Insert user data into the database
//         const insertQuery = 'INSERT INTO users (firstName, lastName, email, phone, password, role, userType) VALUES (?, ?, ?, ?, ?, ?, ?)';
//         const result = await query(insertQuery, [firstName, lastName, email, phone, hashedPassword, role, userType]);

//         // Check if user insertion was successful
//         if (!result.insertId) {
//             throw new Error('Failed to register user');
//         }

//         // Generate JWT token
//         const token = signToken(result.insertId);

//         // Return the newly registered user data along with the token
//         return { id: result.insertId, token, ...userData };
//     } catch (error) {
//         throw error;
//     }
// };

// Request password reset: Generate OTP and send it via email
// authenticationService.requestPasswordReset = async (emailOrPhone) => {
//     try {
//         // Check if the provided email or phone exists in the database
//         const isEmail = emailOrPhone.includes('@');
//         const column = isEmail ? 'email' : 'phone';
//         const selectQuery = `SELECT * FROM users WHERE ${column} = ?`;
//         const user = await query(selectQuery, [emailOrPhone]);

//         // If user not found, return error
//         if (user.length === 0) {
//             throw new Error('User not found');
//         }

//         // Generate OTP
//         const otp = generateOTP();

//         // Store OTP in the database
//         const insertOtpQuery = 'INSERT INTO otps (user_id, otp) VALUES (?, ?)';
//         await query(insertOtpQuery, [user[0].id, otp]);

//         // Send OTP via email
//         await sendEmailWithOTP(user[0].email, otp);

//         // Return the generated OTP and user ID
//         return { userId: user[0].id, otp };
//     } catch (error) {
//         throw error;
//     }
// };


// Function to reset password
// authenticationService.resetPassword = async (userId, otp, newPassword) => {
//     try {
//         // Validate OTP
//         const selectOtpQuery = 'SELECT * FROM otps WHERE user_id = ? AND otp = ?';
//         const otpResult = await query(selectOtpQuery, [userId, otp]);

//         if (otpResult.length === 0) {
//             throw new Error('Invalid or expired OTP');
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 12);

//         // Update the password in the database
//         const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
//         await query(updatePasswordQuery, [hashedPassword, userId]);

//         // Remove OTP from the database
//         const deleteOtpQuery = 'DELETE FROM otps WHERE user_id = ?';
//         await query(deleteOtpQuery, [userId]);

//         return { message: 'Password reset successful' };
//     } catch (error) {
//         throw error;
//     }
// };
// Reset password: Validate OTP, update password, and remove OTP from database
// authenticationService.resetPassword = async (resetData) => {
//     try {
//         const { userId, newPassword, otp } = resetData;

//         // Fetch OTP from the database
//         const selectOtpQuery = 'SELECT * FROM otps WHERE user_id = ? AND otp = ? ORDER BY created_at DESC LIMIT 1';
//         const otpRecord = await query(selectOtpQuery, [userId, otp]);

//         // If OTP not found or expired, return error
//         if (otpRecord.length === 0) {
//             throw new Error('Invalid or expired OTP');
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 12);

//         // Update user's password in the database
//         const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
//         await query(updatePasswordQuery, [hashedPassword, userId]);

//         // Delete OTP record from the database
//         const deleteOtpQuery = 'DELETE FROM otps WHERE id = ?';
//         await query(deleteOtpQuery, [otpRecord[0].id]);

//         return { message: 'Password reset successful' };
//     } catch (error) {
//         throw error;
//     }
// };


// Verify OTP
authenticationService.verifyOTP = async (userId, otp) => {
    try {
        // Fetch OTP from the database
        const selectOtpQuery = 'SELECT * FROM otps WHERE user_id = ? AND otp = ? ORDER BY created_at DESC LIMIT 1';
        const otpRecord = await query(selectOtpQuery, [userId, otp]);

        // If OTP not found or expired, return false
        if (otpRecord.length === 0) {
            return { valid: false, message: 'Invalid or expired OTP' };
        }

        // Check if OTP is expired (assuming expiration time is stored in the database)
        const otpExpiration = otpRecord[0].created_at.getTime() + 25 * 60 * 1000; // Assuming 5 minutes expiration time
        const currentTime = Date.now();

        if (currentTime > otpExpiration) {
            // OTP has expired, delete it from the database
            const deleteOtpQuery = 'DELETE FROM otps WHERE id = ?';
            await query(deleteOtpQuery, [otpRecord[0].id]);

            return { valid: false, message: 'OTP has expired' };
        }

        // OTP is valid and not expired
        return { valid: true, message: 'OTP is valid' };
    } catch (error) {
        throw error;
    }
};

authenticationService.getAllUsers = async () => {
    try {
        const selectAllUsersQuery = 'SELECT * FROM users';
        const users = await query(selectAllUsersQuery);

        // Check if users array is empty
        if (users.length === 0) {
            return { message: "Users table is empty" };
        }

        return users;
    } catch (error) {
        throw error;
    }
};





// Update Default Email
authenticationService.updateDefaultEmail = async (defaultEmail, userId) => {
    try {
        const updateQuery = 'UPDATE users SET defaultEmail = ? WHERE id = ?';
        await query(updateQuery, [defaultEmail, userId]);
    } catch (error) {
        throw error;
    }
};



authenticationService.readDefaultEmail = async () => {
    try {
        const selectQuery = 'SELECT id, defaultEmail FROM users';
        const result = await query(selectQuery);
        return result.map(row => ({ userId: row.id, defaultEmail: row.defaultEmail }));
    } catch (error) {
        throw error;
    }
};


authenticationService.userExists = async (id) => {
    try {
        const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE id = ?';
        const result = await query(selectQuery, [id]);
        const count = result[0].count;
        return count > 0;
    } catch (error) {
        throw error;
    }
};




authenticationService.toggleApprovalStatusWithUserId = async (id, action) => {
    try {
        const userExists = await authenticationService.userExists(id);
        console.log('====================================');
        console.log(userExists);
        console.log('====================================');

        if (userExists === 0) {
            throw new Error(`User with ID ${id} not found.`);
        }

        // Determine the new status based on the action
        let newStatus;
        if (action === 'approve') {
            newStatus = true;
        } else if (action === 'disapprove') {
            // Delete the user from the users table
            const deleteUserQuery = `
                DELETE FROM users
                WHERE id = ?
            `;
            await query(deleteUserQuery, [id]);
            // Sending email notification for disapproval
            await sendEmail('User Disapproved', `User with ID ${id} has been disapproved and deleted.`, 'recipient@example.com');
            return { id, message: `User with ID ${id} has been disapproved and deleted.` };
        } else if (action === 'pending') {
            newStatus = false;
        } else {
            throw new Error('Invalid action specified.');
        }

        // Update the database with the new status
        const updateQuery = `
            UPDATE users
            SET status = ?
            WHERE id = ?
        `;
        await query(updateQuery, [newStatus, id]);

        // Sending email notification for approval
        await EmailSending('User Approved', `Approval status updated to ${newStatus} for user with ID ${id}.`, 'recipient@example.com');

        // Return a message indicating the updated status
        return { id, status: newStatus, message: `Approval status updated to ${newStatus}.` };
    } catch (error) {
        throw error;
    }
};

// Function to check if a user exists
authenticationService.getUserById = async (id) => {
    try {
        const selectQuery = 'SELECT * FROM users WHERE id = ?';
        const customers = await query(selectQuery, [id]);
        return customers[0];
    } catch (error) {
        throw error;
    }
};



authenticationService.changeEmailVerificationStatusById = async (id) => {
    try {
        // Check if the user exists
        const userExists = await authenticationService.getUserById(id);

        // If user does not exist, throw an error
        if (!userExists) {
            throw new Error('User not found');
        }

        // Construct SQL UPDATE query to change emailVerified status to true
        const updateQuery = `
            UPDATE users
            SET emailVerified = true
            WHERE id = ?
        `;
        
        // Execute the update query with the provided userId
        await query(updateQuery, [id]);
        
        // Return a success message
        return { success: true, message: 'Email verification status updated successfully' };
    } catch (error) {
        // If an error occurs, throw it to be handled by the calling function or middleware
        throw error;
    }
}


authenticationService.viewUserById = async (id) => {
    try {
        // Fetch user data from the database based on user ID
        const selectQuery = 'SELECT * FROM users WHERE id = ?';
        const userResult = await query(selectQuery, [id]);

        // If user not found, return error
        if (userResult.length === 0) {
            throw new Error(`User with ID ${id} not found.`);
        }

        // Return the user data
        return userResult[0];
    } catch (error) {
        throw error;
    }
};


authenticationService.updateUser = async (id, userData) => {
    try {
        // Check if user exists
        const userExists = await authenticationService.userExists(id);
        const currentUser = await authenticationService.getUserById(id);

        if (!userExists) {
            throw new Error(`User with ID ${id} not found.`);
        }

        // Construct the update query dynamically based on provided userData
        const updateFields = [];
        const queryParams = [];

        for (const key in userData) {
            if (userData.hasOwnProperty(key)) {
                updateFields.push(`${key} = ?`);
                queryParams.push(userData[key]);
            }
        }

        // Add the user ID to the query parameters
        queryParams.push(id);

        // Update query
        const updateQuery = `
            UPDATE users
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;

        // Execute the update query
        await query(updateQuery, queryParams);
        await query(updateQuery, [...queryParams, id]);
        // Return updated customer data
        return { ...currentUser, ...userData };
        // Return a success message
        // return { message: `User with ID ${id} updated successfully.` };
    } catch (error) {
        throw error;
    }
};


authenticationService.deleteUser = async (id) => {
    try {
        // Check if user exists
        const userExists = await authenticationService.userExists(id);
        if (!userExists) {
            throw new Error(`User with ID ${id} not found.`);
        }

        // Delete user from the database
        const deleteQuery = 'DELETE FROM users WHERE id = ?';
        await query(deleteQuery, [id]);

        // Return a success message
        return { message: `User with ID ${id} deleted successfully.` };
    } catch (error) {
        throw error;
    }
};



// authenticationService.requestPasswordReset = async (email) => {
//     try {
//         const selectUserQuery = `SELECT * FROM users WHERE email = ?`;
//         const userResult = await query(selectUserQuery, [email]);

//         if (userResult.length === 0) {
//             throw new Error('User not found');
//         }

//         const user = userResult[0];
//         const resetToken = generateResetToken();
//         const expiresAt = new Date(Date.now() + 3600000); // Token valid for 1 hour

//         const insertTokenQuery = `
//             INSERT INTO password_reset_tokens (user_id, token, expires_at) 
//             VALUES (?, ?, ?)
//         `;
//         await query(insertTokenQuery, [user.id, resetToken, expiresAt]);

//         const resetLink = `${process.env.APP_BASE_URL}/reset-password?token=${resetToken}`;
//         await sendEmailWithOTP(user.email, `Password Reset`, `Click the link to reset your password: ${resetLink}`);
       

//         return { message: 'Password reset link has been sent to your email' };
//     } catch (error) {
//         throw error;
//     }
// };


// Add requestPasswordReset function
// authenticationService.requestPasswordReset = async (email) => {
//     try {
//         const userResult = await query('SELECT id FROM users WHERE email = ?', [email]);

//         if (userResult.length === 0) {
//             throw new Error('User not found');
//         }

//         const user = userResult[0];
//         const resetToken = generateResetToken();

//         const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now
//         await query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, resetToken, expiresAt]);

//         const resetLink = `${process.env.APP_BASE_URL}/reset-password?token=${resetToken}`;
//         await sendEmailWithOTP(user.email, 'Password Reset', `Click the link to reset your password: ${resetLink}`);

//         return { message: 'Password reset email has been sent' };
//     } catch (error) {
//         console.error('Error during password reset request:', error);
//         throw new Error('Internal server error');
//     }
// };


// Function to create a password reset token for a user
// authenticationService.requestPasswordReset = async (emailOrPhone) => {
//     try {
//         // Check if the login data is an email or phone number
//         const isEmail = emailOrPhone.includes('@');
//         const column = isEmail ? 'email' : 'phone';

//         // Fetch user data from the database based on email or phone
//         const selectQuery = `SELECT * FROM users WHERE ${column} = ?`;
//         const userResult = await query(selectQuery, [emailOrPhone]);

//         // If user not found, throw error
//         if (userResult.length === 0) {
//             throw new Error('User not found');
//         }

//         const user = userResult[0];

//         // Generate reset token
//         const resetToken = generateResetToken();

//         // Set expiry time for the token (e.g., 1 hour from now)
//         const expiresIn = new Date();
//         expiresIn.setHours(expiresIn.getHours() + 1); // 1 hour expiry

//         // Store the reset token and expiry in the database
//         const insertTokenQuery = `
//             INSERT INTO password_reset_tokens (user_id, token, expires_at)
//             VALUES (?, ?, ?)
//             ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)
//         `;
//         await query(insertTokenQuery, [user.id, resetToken, expiresIn]);

//         // Send email with the reset link
//         // const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
//         const resetLink = `${process.env.APP_BASE_URL}/reset-password?token=${resetToken}`;
//         const userName = `${user.firstName} ${user.lastName}`;
//         await sendEmailWithOTP(user.email, 'Password Reset', userName, resetLink);

//         return { message: 'Password reset email sent successfully' };
//     } catch (error) {
//         throw error;
//     }
// };

// Function to create a password reset token for a user
authenticationService.requestPasswordReset = async (emailOrPhone) => {
    try {
        // Check if the login data is an email or phone number
        const isEmail = emailOrPhone.includes('@');
        const column = isEmail ? 'email' : 'phone';

        // Fetch user data from the database based on email or phone
        const selectQuery = `SELECT * FROM users WHERE ${column} = ?`;
        const userResult = await query(selectQuery, [emailOrPhone]);

        // If user not found, throw error
        if (userResult.length === 0) {
            throw new Error('User not found');
        }

        const user = userResult[0];

        // Generate reset token
        const resetToken = generateResetToken();

        // Set expiry time for the token (e.g., 5 minutes from now)
        const expiresIn = new Date();
        expiresIn.setMinutes(expiresIn.getMinutes() + 5); // 5 minutes expiry

        // Store the reset token and expiry in the database
        const insertTokenQuery = `
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)
        `;
        await query(insertTokenQuery, [user.id, resetToken, expiresIn]);

        // Send email with the reset link
        const resetLink = `${process.env.APP_BASE_URL}/reset-password?token=${resetToken}`;
        const userName = `${user.firstName} ${user.lastName}`;
        await sendEmailWithOTP(user.email, 'Password Reset', userName, resetLink);

        // Schedule deletion of password reset token if token expires
        setTimeout(async () => {
            try {
                const deleteTokenQuery = `DELETE FROM password_reset_tokens WHERE token = ?`;
                await query(deleteTokenQuery, [resetToken]);

                console.log(`Expired password reset token ${resetToken} deleted.`);
            } catch (deleteError) {
                console.error('Error deleting token:', deleteError);
            }
        }, expiresIn - Date.now()); // Delete after expiry time

        return { message: 'Password reset email sent successfully' };
    } catch (error) {
        throw error;
    }
};


// Function to create a password reset token for a user
// authenticationService.requestPasswordReset = async (emailOrPhone) => {
//     try {
//         // Check if the login data is an email or phone number
//         const isEmail = emailOrPhone.includes('@');
//         const column = isEmail ? 'email' : 'phone';

//         // Fetch user data from the database based on email or phone
//         const selectQuery = `SELECT * FROM users WHERE ${column} = ?`;
//         const userResult = await query(selectQuery, [emailOrPhone]);

//         // If user not found, throw error
//         if (userResult.length === 0) {
//             throw new Error('User not found');
//         }

//         const user = userResult[0];

//         // Generate reset token and OTP
//         const { resetToken, otp } = generateResetToken();

//         // Set expiry time for the token (e.g., 5 minutes from now)
//         const expiresIn = new Date();
//         expiresIn.setMinutes(expiresIn.getMinutes() + 5); // 5 minutes expiry

//         // Store the reset token, OTP, and expiry in the database
//         const insertTokenQuery = `
//             INSERT INTO password_reset_tokens (user_id, token, otp, expires_at)
//             VALUES (?, ?, ?, ?)
//             ON DUPLICATE KEY UPDATE token = VALUES(token), otp = VALUES(otp), expires_at = VALUES(expires_at)
//         `;
//         await query(insertTokenQuery, [user.id, resetToken, otp, expiresIn]);

//         // Send email with the reset link and OTP
//         const resetLink = `${process.env.APP_BASE_URL}/reset-password?token=${resetToken}`;
//         const userName = `${user.firstName} ${user.lastName}`;
//         const emailSubject = 'Password Reset';
//         const emailContent = `Dear ${userName},\n\nPlease use the following OTP to reset your password: ${otp}\n\nReset Link: ${resetLink}`;
//         await sendEmailWithOTP(user.email, emailSubject, userName, emailContent);

//         // Schedule deletion of password reset token if token expires
//         setTimeout(async () => {
//             try {
//                 const deleteTokenQuery = `DELETE FROM password_reset_tokens WHERE token = ?`;
//                 await query(deleteTokenQuery, [resetToken]);

//                 console.log(`Expired password reset token ${resetToken} deleted.`);
//             } catch (deleteError) {
//                 console.error('Error deleting token:', deleteError);
//             }
//         }, expiresIn - Date.now()); // Delete after expiry time

//         return { message: 'Password reset email sent successfully' };
//     } catch (error) {
//         throw error;
//     }
// };



authenticationService.resetPassword = async (token, newPassword) => {
    try {
        const selectTokenQuery = `SELECT * FROM password_reset_tokens WHERE token = ?`;
        const tokenResult = await query(selectTokenQuery, [token]);

        if (tokenResult.length === 0) {
            throw new Error('Invalid or expired token');
        }

        const resetToken = tokenResult[0];

        if (new Date(resetToken.expires_at) < new Date()) {
            throw new Error('Token has expired');
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 12);

        const updatePasswordQuery = `UPDATE users SET password = ? WHERE id = ?`;
        await query(updatePasswordQuery, [newHashedPassword, resetToken.user_id]);

        const deleteTokenQuery = `DELETE FROM password_reset_tokens WHERE id = ?`;
        await query(deleteTokenQuery, [resetToken.id]);

        return { message: 'Password reset successfully' };
    } catch (error) {
        throw error;
    }
};


// Function to reset password using token and OTP verification
// authenticationService.resetPassword = async (token, otp, newPassword) => {
//     try {
//         // Query to select the token and OTP from the database
//         const selectTokenQuery = `SELECT * FROM password_reset_tokens WHERE token = ?`;
//         const tokenResult = await query(selectTokenQuery, [token]);

//         if (tokenResult.length === 0) {
//             throw new Error('Invalid or expired token');
//         }

//         const resetToken = tokenResult[0];

//         if (new Date(resetToken.expires_at) < new Date()) {
//             throw new Error('Token has expired');
//         }

//         if (resetToken.otp !== otp) {
//             throw new Error('Invalid OTP');
//         }

//         // Generate new hashed password
//         const newHashedPassword = await bcrypt.hash(newPassword, 12);

//         // Update user's password in the database
//         const updatePasswordQuery = `UPDATE users SET password = ? WHERE id = ?`;
//         await query(updatePasswordQuery, [newHashedPassword, resetToken.user_id]);

//         // Delete the used token from the database
//         const deleteTokenQuery = `DELETE FROM password_reset_tokens WHERE id = ?`;
//         await query(deleteTokenQuery, [resetToken.id]);

//         return { message: 'Password reset successfully' };
//     } catch (error) {
//         throw error;
//     }
// };


module.exports = authenticationService;


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

// const authService = {};

// authService.signup = async (username, password, email, phone, role, userType) => {
//     try {
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create new user
//         const newUserQuery = 'INSERT INTO users (username, email, password, role, userType) VALUES (?, ?, ?, ?, ?)';
//         const newUserResult = await query(newUserQuery, [username, email, phone, hashedPassword, role, userType]);

//         // Check if user insertion was successful
//         if (!newUserResult.insertId) {
//             throw new Error('Failed to insert user');
//         }

//         // Generate JWT token
//         const token = signToken(newUserResult.insertId);

//         // Return token and user data
//         return { token, user: { id: newUserResult.insertId, username, email, phone, role, userType } };
//     } catch (error) {
//         throw error;
//     }
// };


// // Function to fetch user by identifier (email, username, or phone)
// // authService.getUserByIdentifier = async (identifier) => {
// //     try {
// //         const selectUserQuery = 'SELECT * FROM users WHERE email = ? OR username = ? OR phone = ?';
// //         const users = await query(selectUserQuery, [identifier, identifier, identifier]);
// //         return users.length > 0 ? users[0] : null;
// //     } catch (error) {
// //         throw error;
// //     }
// // };


// authService.getUserByIdentifier = async (identifier) => {
//     try {
//         console.log("Identifier:", identifier); // Log the identifier being passed
        
//         const selectUserQuery = 'SELECT * FROM users WHERE email = ? OR username = ? OR phone = ?';
//         const users = await query(selectUserQuery, [identifier, identifier, identifier]);

//         console.log("Database Query Result:", users); // Log the results returned by the database query
        
//         return users.length > 0 ? users[0] : null;
//     } catch (error) {
//         throw error;
//     }
// };



// // Function to handle user login
// authService.login = async (identifier, password) => {
//     try {

//         console.log(identifier);
//         // const {email, username, phone} = identifier
//         // const identifier =`SELECT * FROM users WHERE email = 'email' OR phone = 'phone' OR username = 'username`;
//         // Check if user with the provided identifier exists
//         const user = await authService.getUserByIdentifier(identifier);

//         if (!user) {
//             throw new Error('User not found');
//         }

//         // Compare the provided password with the hashed password stored in the database
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             throw new Error('Invalid password');
//         }

//         // Generate JWT token
//         const token = signToken(user.id);

//         // Remove sensitive data from the user object
//         delete user.password;

//         // Return user details along with the JWT token
//         return { token, user };
//     } catch (error) {
//         throw error;
//     }
// };

// // Add a service to retrieve all users
// authService.getAllUsers = async () => {
//     try {
//         const selectAllUsersQuery = 'SELECT * FROM users';
//         const users = await query(selectAllUsersQuery);

//         // Check if users array is empty
//         if (users.length === 0) {
//             return { message: "Users table is empty" };
//         }

//         return users;
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = authService;




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

// // Function to sign JWT token
// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };

// const authService = {};

// authService.signup = async (username, password, email, role, userType) => {
//     try {
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create new user
//         const newUserQuery = 'INSERT INTO users (username, email, password, role, userType) VALUES (?, ?, ?, ?, ?)';
//         const newUserResult = await query(newUserQuery, [username, email, hashedPassword, role, userType]);

//         // Check if user insertion was successful
//         if (!newUserResult.insertId) {
//             throw new Error('Failed to insert user');
//         }

//         // Generate JWT token
//         const token = signToken(newUserResult.insertId);

//         // Return token and user data
//         return { token, user: { id: newUserResult.insertId, username, email, role, userType } };
//     } catch (error) {
//         throw error;
//     }
// };

// authService.getUserByEmail = async (email) => {
//     try {
//         const selectUserQuery = 'SELECT * FROM users WHERE email = ?';
//         const users = await query(selectUserQuery, [email]);
//         return users.length > 0 ? users[0] : null;
//     } catch (error) {
//         throw error;
//     }
// };

// authService.login = async (email, password) => {
//     try {
//         // Check if user with the provided email exists
//         const user = await authService.getUserByEmail(email);

//         if (!user) {
//             throw new Error('User not found');
//         }

//         // Compare the provided password with the hashed password stored in the database
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             throw new Error('Invalid password');
//         }

//         // Generate JWT token
//         const token = signToken(user.id);

//         // Remove sensitive data from the user object
//         delete user.password;

//         // Return user details along with the JWT token
//         return { token, user };
//     } catch (error) {
//         throw error;
//     }
// };

// // Add a service to retrieve all users
// authService.getAllUsers = async () => {
//     try {
//         const selectAllUsersQuery = 'SELECT * FROM users';
//         const users = await query(selectAllUsersQuery);

//         // Check if users array is empty
//         if (users.length === 0) {
//             return { message: "Users table is empty" };
//         }

//         return users;
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = authService;


