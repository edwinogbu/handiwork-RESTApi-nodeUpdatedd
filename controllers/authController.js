const authenticationService = require('../services/authService');

// Function to sanitize input to prevent XSS attacks
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    // Replace potentially dangerous characters with HTML entities
    return input.replace(/[&<>"'/]/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&#x27;'; // &apos; is not recommended, use &#x27; instead
            case '/':
                return '&#x2F;'; // Forward slash is included as it could end an HTML entity
            default:
                return char;
        }
    });
}


// Sign in user controller
async function AdminAuthentication(req, res) {
    try {
        const loginData = req.body;
        const user = await authenticationService.AdminAuthentication(loginData);

        return res.status(200).json({ success: true, message: 'Sign-in successful', user });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}



async function authenticateUser(req, res) {
    try {
        const { emailOrPhone, password } = req.body;
        const sanitizedEmailOrPhone = sanitizeInput(emailOrPhone);
        const sanitizedPassword = sanitizeInput(password);
        const result = await authenticationService.authenticateUser({ emailOrPhone: sanitizedEmailOrPhone, password: sanitizedPassword });
        res.status(200).json({ success: true, user: result.user, token: result.token });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
}

async function authenticateCustomer(req, res) {
    try {
        const { emailOrPhone, password } = req.body;
        const sanitizedEmailOrPhone = sanitizeInput(emailOrPhone);
        const sanitizedPassword = sanitizeInput(password);
        const result = await authenticationService.authenticateCustomer({ emailOrPhone: sanitizedEmailOrPhone, password: sanitizedPassword });
        res.status(200).json({ success: true, user: result.user, token: result.token });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
}


async function authenticateSkillProvider(req, res) {
    try {
        const { emailOrPhone, password } = req.body;
        const sanitizedEmailOrPhone = sanitizeInput(emailOrPhone);
        const sanitizedPassword = sanitizeInput(password);
        const result = await authenticationService.authenticateSkillProvider({ emailOrPhone: sanitizedEmailOrPhone, password: sanitizedPassword });
        res.status(200).json({ success: true, user: result.user, token: result.token });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
}

async function registerUser(req, res) {
    try {
        const userData = req.body;
        const sanitizedUserData = {};
        for (const key in userData) {
            sanitizedUserData[key] = sanitizeInput(userData[key]);
        }
        const result = await authenticationService.registerUser(sanitizedUserData);
        res.status(201).json({ success: true, user: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


// const registerUserWithEmailVerification = async (req, res) => {
//     try {
//         const userData = req.body;

//         // Call the registerUserWithEmailVerification function from the authenticationService
//         const newUser = await authenticationService.registerUserWithEmailVerification(userData);

//         // Send success response with the newly registered user's data and token
//         res.status(201).json({
//             success: true,
//             message: 'Registration successful. An email verification link has been sent to your email address.',
//             user: newUser
//         });
//     } catch (error) {
//         // If registration fails, send error response with appropriate message
//         let errorMessage = 'Registration failed. Please try again later.';
//         if (error.message === 'Email already exists') {
//             errorMessage = 'Email already exists. Please use a different email address.';
//         }
//         res.status(400).json({ success: false, error: errorMessage });
//     }
// };


const registerUserWithEmailVerification = async (req, res) => {
    try {
        const userData = req.body; // Assuming user data is sent in the request body
        const newUser = await authenticationService.registerUserWithEmailVerification(userData);
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification.',
            user: newUser
        });
    } catch (error) {
        // Error handling
        console.error('Registration failed:', error.message);
        let errorMessage = 'Failed to register user. Please try again later.';
        if (error.message === 'Email already exists') {
            errorMessage = 'Registration failed: Email already exists';
        } else if (error.message === 'Failed to send email verification') {
            errorMessage = 'Registration failed: Email verification could not be sent';
        } else if (error.message === 'Registration failed: Database error occurred') {
            errorMessage = 'Failed to register user due to database error. Please try again later.';
        }
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};


const registerUserWithOutEmailVerification = async (req, res) => {
    try {
        const userData = req.body; // Assuming user data is sent in the request body
        const newUser = await authenticationService.registerUserWithOutEmailVerification(userData);
        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: newUser
        });
    } catch (error) {
        // Error handling
        console.error('Registration failed:', error.message);
        let errorMessage = 'Failed to register user. Please try again later.';
        if (error.message === 'Email already exists') {
            errorMessage = 'Registration failed: Email already exists';
        } else if (error.message === 'Failed to send email verification') {
            errorMessage = 'Registration failed: Email verification could not be sent';
        } else if (error.message === 'Registration failed: Database error occurred') {
            errorMessage = 'Failed to register user due to database error. Please try again later.';
        }
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};


const handleEmailVerification = async (req, res) => {
    try {
        const token = req.params.token;

        // Handle email verification using authentication service
        const result = await authenticationService.handleEmailVerification(token);

        // Email verification successful
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        // Handle errors during email verification
        res.status(400).json({ success: false, message: error.message });
    }
};


// Sign in user with email/phone and password
// Sign in user with email/phone and password
// const signInAuthentication = async (req, res) => {
//     try {
//         // Extract email/phone and password from request body
//         const { emailOrPhone, password } = req.body;

//         // Authenticate user
//         const { user, token } = await authenticationService.signInAuthentication({ emailOrPhone, password });

//         // If authentication is successful, send user data and token in response
//         res.status(200).json({ success: true, message: 'Sign in successful', user, token });
//     } catch (error) {
//         let message = 'Authentication failed';
//         if (error.message === 'User not found') {
//             message = 'User not found';
//         } else if (error.message === 'Invalid password') {
//             message = 'Invalid password';
//         } else if (error.message === 'User account is not approved') {
//             message = 'User account is not approved';
//         }

//         // If authentication fails, send error message in response
//         res.status(401).json({ success: false, message });
//     }
// };

const signInAuthentication = async (req, res) => {
    const { emailOrPhone, password } = req.body;

    try {
        // Validate inputs
        if (!emailOrPhone || !password) {
            return res.status(400).json({ error: 'Email or phone and password must be provided' });
        }

        // Call authentication service to sign in user
        const result = await authenticationService.signInAuthentication({ emailOrPhone, password });

        // Check if authentication was successful
        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        // Return successful response with user data and token
        return res.status(200).json(result);
    } catch (error) {
        // Handle errors
        console.error('Error during sign-in:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

}


async function changePassword(req, res){
    const { userId, currentPassword, newPassword } = req.body;

    try {
        const result = await authenticationService.changePassword(userId, currentPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


async function changeCustomerPassword(req, res){
    const { userId, currentPassword, newPassword } = req.body;

    try {
        const result = await authenticationService.changeCustomerPassword(userId, currentPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


async function changeSkillProviderPassword(req, res){
    const { userId, currentPassword, newPassword } = req.body;

    try {
        const result = await authenticationService.changeSkillProviderPassword(userId, currentPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// async function requestPasswordReset(req, res) {
//     try {
//         const { emailOrPhone } = req.body;
//         const sanitizedEmailOrPhone = sanitizeInput(emailOrPhone);
//         const result = await authenticationService.requestPasswordReset(sanitizedEmailOrPhone);
//         res.status(200).json({ success: true, userId: result.userId, message: 'OTP sent to email' });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// }


// async function resetPassword(req, res){
//     const { userId, otp, newPassword } = req.body;

//     try {
//         const result = await authenticationService.resetPassword(userId, otp, newPassword);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

// async function resetPassword(req, res) {
//     try {
//         const resetData = req.body;
//         const sanitizedResetData = {};
//         for (const key in resetData) {
//             sanitizedResetData[key] = sanitizeInput(resetData[key]);
//         }
//         await authenticationService.resetPassword(sanitizedResetData);
//         res.status(200).json({ success: true, message: 'Password reset successful' });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// }

async function verifyOTP(req, res) {
    try {
        const { userId, otp } = req.body;
        const sanitizedUserId = sanitizeInput(userId);
        const sanitizedOtp = sanitizeInput(otp);
        const otpVerificationResult = await authenticationService.verifyOTP(sanitizedUserId, sanitizedOtp);
        if (otpVerificationResult.valid) {
            res.status(200).json({ success: true, message: otpVerificationResult.message });
        } else {
            res.status(400).json({ success: false, error: otpVerificationResult.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await authenticationService.getAllUsers();
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Create Default Email
async function createDefaultEmail(req, res, next){
    try {
        const { defaultEmail, userId } = req.body;
        await authenticationService.updateDefaultEmail({defaultEmail, userId}); // Update the default email parameter in the users table
        res.status(201).json({ message: 'Default email created successfully' });
    } catch (error) {
        next(error);
    }
};

// Read Default Email
async function readDefaultEmail(req, res, next){
    try {
        const defaultEmail = await authenticationService.readDefaultEmail(); // Read the default email parameter from the users table
        res.status(200).json({ defaultEmail });
    } catch (error) {
        next(error);
    }
};

// Update Default Email
async function updateDefaultEmail(req, res, next){
    try {
        const { defaultEmail, userId } = req.body;
        await authenticationService.updateDefaultEmail({defaultEmail, userId}); // Update the default email parameter in the users table
        res.status(200).json({ message: 'Default email updated successfully' });
    } catch (error) {
        next(error);
    }
};



async function toggleApprovalStatusWithUserId(req, res) {
    const { id } = req.params;
    const { action } = req.body;

    try {
        const result = await authenticationService.toggleApprovalStatusWithUserId(id, action);

        let message = '';
        if (action === 'approve') {
            message = `User with ID ${id} has been approved... CONGRATULATIONS!!!`;
        } else if (action === 'disapprove') {
            message = `User with ID ${id} has been disapproved and deleted.`;
        } else if (action === 'pending') {
            message = `User with ID ${id} has been marked as pending.`;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action specified.' });
        }

        return res.status(200).json({ success: true, message });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


async function changeEmailVerificationStatusById(req, res) {
    try {
        const userId = req.params.id;
        const customer = await authenticationService.changeEmailVerificationStatusById(userId);
        if (!customer) {
            res.status(404).json({ success: false, error: 'Unable to change email verification status.... ' });
            return;
        }
        res.status(200).json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


async function getUserById(req, res){
    try {
        const {id} = req.params;
    const user = await authenticationService.getUserById(id);
    if (!user) {
        res.status(400).json({success: false, error:'Unable to fetch user record'});
    }
    res.status(200).json({success:true, user});

    } catch (error) {
        res.status(500).json({success: false, error:error.message})
    }
    
}


// async function getUserById(req, res) {
//     try {
//         const userId = req.params.id;
//         const user = await authenticationService.getUserById(userId);
//         if (!user) {
//             res.status(404).json({ success: false, error: 'Customer not found' });
//             return;
//         }
//         res.status(200).json({ success: true, user });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

async function  updateUser(req, res) {
    const userId = req.params.id;
    const userData = req.body;

    try {
        const result = await authenticationService.updateUser(userId, userData);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


async function  updateUserByField(req, res) {
    const userId = req.params.id;
    const userData = req.body;

    try {
        const result = await authenticationService.updateUser(userId, userData);
        // res.status(200).json(result);
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification.',
            user: result
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



async function viewUserById(req, res) {
    const userId = req.params.id;

    try {
        const user = await authenticationService.viewUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};


async function deleteUser(req, res) {
    const userId = req.params.id;

    try {
        const result = await authenticationService.deleteUser(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// async function requestPasswordReset (req, res) {
//     try {
//         const { email } = req.body;
//         const result = await authenticationService.requestPasswordReset(email);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };


// Controller method to handle password reset request
async function requestPasswordReset (req, res, next) {
    const { emailOrPhone } = req.body;

    try {
        const result = await authenticationService.requestPasswordReset(emailOrPhone);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ error: 'Failed to request password reset' });
    }
};

async function resetPassword (req, res) {
    try {
        const { token, newPassword } = req.body;
        const result = await authenticationService.resetPassword(token, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    authenticateUser,
    registerUser,
    requestPasswordReset,
    resetPassword,
    verifyOTP,
    getAllUsers,
    authenticateCustomer,
    authenticateSkillProvider,
    createDefaultEmail,
    readDefaultEmail,
    updateDefaultEmail,
    registerUserWithEmailVerification,
    signInAuthentication,
    handleEmailVerification,
    toggleApprovalStatusWithUserId,
    AdminAuthentication,
    changeEmailVerificationStatusById,
    getUserById,
    registerUserWithOutEmailVerification,
    updateUser,
    viewUserById,
    deleteUser,
    updateUserByField,
    changePassword,
    changeCustomerPassword,
    changeSkillProviderPassword,
};




// const authenticationService = require('../services/authService');


// async function authenticateUser(req, res) {
//     try {
//         const { emailOrPhone, password } = req.body;
//         const result = await authenticationService.authenticateUser({ emailOrPhone, password });
//         res.status(200).json({ success: true, user: result.user, token: result.token });
//     } catch (error) {
//         res.status(401).json({ success: false, error: error.message });
//     }
// }

// async function registerUser(req, res) {
//     try {
//         const userData = req.body;
//         const result = await authenticationService.registerUser(userData);
//         res.status(201).json({ success: true, user: result });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function requestPasswordReset(req, res) {
//     try {
//         const { emailOrPhone } = req.body;
//         const result = await authenticationService.requestPasswordReset(emailOrPhone);
//         res.status(200).json({ success: true, userId: result.userId, message: 'OTP sent to email' });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// }

// async function resetPassword(req, res) {
//     try {
//         const resetData = req.body;
//         await authenticationService.resetPassword(resetData);
//         res.status(200).json({ success: true, message: 'Password reset successful' });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// }

// async function verifyOTP(req, res) {
//     try {
//         const { userId, otp } = req.body;
//         const otpVerificationResult = await authenticationService.verifyOTP(userId, otp);
//         if (otpVerificationResult.valid) {
//             res.status(200).json({ success: true, message: otpVerificationResult.message });
//         } else {
//             res.status(400).json({ success: false, error: otpVerificationResult.message });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getAllUsers(req, res) {
//     try {
//         const users = await authenticationService.getAllUsers();
//         res.status(200).json({ success: true, users });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     authenticateUser,
//     registerUser,
//     requestPasswordReset,
//     resetPassword,
//     verifyOTP,
//     getAllUsers,
// };



// const authenticationService = require('../services/authService');

// async function authenticateUser(req, res) {
//     try {
//         const { emailOrPhone, password } = req.body;
//         const result = await authenticationService.authenticateUser({ emailOrPhone, password });
//         res.status(200).json({ success: true, user: result.user, token: result.token });
//     } catch (error) {
//         res.status(401).json({ success: false, error: error.message });
//     }
// }

// async function registerUser(req, res) {
//     try {
//         const userData = req.body;
//         const result = await authenticationService.registerUser(userData);
//         res.status(201).json({ success: true, user: result });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function requestPasswordReset(req, res) {
//     try {
//         const { emailOrPhone } = req.body;
//         const result = await authenticationService.requestPasswordReset(emailOrPhone);
//         res.status(200).json({ success: true, userId: result.userId, message: 'OTP sent to email' });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// }

// async function resetPassword(req, res) {
//     try {
//         const resetData = req.body;
//         await authenticationService.resetPassword(resetData);
//         res.status(200).json({ success: true, message: 'Password reset successful' });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// }

// async function verifyToken(req, res) {
//     try {
//         const token = req.headers.authorization.split(' ')[1];
//         const user = await authenticationService.verifyToken(token);
//         res.status(200).json({ success: true, user });
//     } catch (error) {
//         res.status(401).json({ success: false, error: error.message });
//     }
// }

// async function getAllUsers(req, res) {
//     try {
//         const users = await authenticationService.getAllUsers();
//         res.status(200).json({ success: true, users });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function verifyOTP(req, res) {
//     try {
//         const { userId, otp } = req.body;
//         await authenticationService.verifyOTP(userId, otp);
//         res.status(200).json({ success: true, message: 'OTP verified successfully' });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     authenticateUser,
//     registerUser,
//     requestPasswordReset,
//     resetPassword,
//     verifyToken,
//     getAllUsers,
//     verifyOTP,
// };



// const authenticationService = require('../services/authService');

// async function authenticateUser(req, res) {
//     try {
//         const { emailOrPhone, password } = req.body;
//         const result = await authenticationService.authenticateUser({ emailOrPhone, password });
//         res.status(200).json({ success: true, user: result.user, token: result.token });
//     } catch (error) {
//         res.status(401).json({ success: false, error: error.message });
//     }
// }

// async function registerUser(req, res) {
//     try {
//         const userData = req.body;
//         const result = await authenticationService.registerUser(userData);
//         res.status(201).json({ success: true, user: result });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // async function requestPasswordReset(req, res) {
// //     try {
// //         const emailOrPhone = req.body.emailOrPhone;
// //         const resetToken = await authenticationService.requestPasswordReset(emailOrPhone);
// //         res.status(200).json({ success: true, resetToken });
// //     } catch (error) {
// //         res.status(400).json({ success: false, error: error.message });
// //     }
// // }


// async function requestPasswordReset(req, res) {
//     try {
//         const { emailOrPhone } = req.body;
//         const result = await authenticationService.requestPasswordReset(emailOrPhone);
//         res.status(200).json({ success: true, userId: result.userId, message: 'OTP sent to email' });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// }


// async function resetPassword(req, res) {
//     try {
//         const resetData = req.body;
//         await authenticationService.resetPassword(resetData);
//         res.status(200).json({ success: true, message: 'Password reset successful' });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// }

// async function verifyToken(req, res) {
//     try {
//         const token = req.headers.authorization.split(' ')[1];
//         const user = await authenticationService.verifyToken(token);
//         res.status(200).json({ success: true, user });
//     } catch (error) {
//         res.status(401).json({ success: false, error: error.message });
//     }
// }

// async function getAllUsers(req, res) {
//     try {
//         const users = await authenticationService.getAllUsers();
//         res.status(200).json({ success: true, users });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     authenticateUser,
//     registerUser,
//     requestPasswordReset,
//     resetPassword,
//     verifyToken,
//     getAllUsers,
// };



// const authService = require('../services/authService');

// async function signup(req, res) {
//     try {
//         const { username, password, email, role, userType } = req.body;
//         const { token, user } = await authService.signup(username, password, email, role, userType);
//         res.status(201).json({ token, user });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// }

// async function login(req, res) {
//     try {
//         const { identifier, password } = req.body;
//         const { token, user } = await authService.login(identifier, password);
//         res.json({ token, user });
//     } catch (error) {
//         res.status(401).json({ message: error.message });
//     }
// }


// async function getAllUsers(req, res) {
//     try {
//         const users = await authService.getAllUsers();
//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// module.exports = {
//     signup,
//     login,
//     getAllUsers
// };


// const authService = require('../services/authService');

// async function signup(req, res) {
//     try {
//         const { username, password, email, role, userType } = req.body;
//         const { token, user } = await authService.signup(username, password, email, role, userType);
//         res.status(201).json({ token, user });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// }

// async function login(req, res) {
//     try {
//         const { email, password } = req.body;
//         const { token, user } = await authService.login(email, password);
//         res.json({ token, user });
//     } catch (error) {
//         res.status(401).json({ message: error.message });
//     }
// }

// async function getAllUsers(req, res) {
//     try {
//         const users = await authService.getAllUsers();
//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// module.exports = {
//     signup,
//     login,
//     getAllUsers
// };


