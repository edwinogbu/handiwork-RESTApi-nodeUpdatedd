const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

// Function to sign JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Create VerifySkillProviders table if it doesn't exist
// async function createVerifySkillProvidersTable() {
//     const createVerifySkillProvidersTableQuery = `
//         CREATE TABLE IF NOT EXISTS verify_skill_providers (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             bio TEXT,
//             profileUrl VARCHAR(255),
//             socialPlatform JSON,
//             socialPlatformUrl JSON,
//             cacImagePath VARCHAR(255),
//             providerId INT,
//             followers INT,
//             isVerified BOOLEAN DEFAULT FALSE,
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY (providerId) REFERENCES skill_providers(id) ON DELETE CASCADE
//         );
//     `;
//     try {
//         await query(createVerifySkillProvidersTableQuery);
//         console.log('VerifySkillProviders table created successfully');
//     } catch (error) {
//         console.error('Error creating VerifySkillProviders table:', error);
//         throw error;
//     }
// }

async function createVerifySkillProvidersTable() {
    const createVerifySkillProvidersTableQuery = `
        CREATE TABLE IF NOT EXISTS verify_skill_providers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bio TEXT,
            profileUrl VARCHAR(255),
            socialPlatform JSON,
            socialPlatformUrl JSON,
            cacImagePath VARCHAR(255),
            providerId INT,
            followers INT,
            isVerified ENUM('unverified', 'pending', 'accept', 'reject') DEFAULT 'unverified',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (providerId) REFERENCES skill_providers(id) ON DELETE CASCADE
        );
    `;
    try {
        await query(createVerifySkillProvidersTableQuery);
        console.log('VerifySkillProviders table created successfully');
    } catch (error) {
        console.error('Error creating VerifySkillProviders table:', error);
        throw error;
    }
}


createVerifySkillProvidersTable(); // Immediately create the table on module load

const verifySkillProviderService = {};


verifySkillProviderService.providerExists = async (providerId) => {
    try {
        // Query to check if the providerId exists in both tables
        const selectQuery = `
            SELECT 
                (SELECT COUNT(*) FROM skill_providers WHERE id = ?) AS skill_provider_count,
                (SELECT COUNT(*) FROM verify_skill_providers WHERE providerId = ?) AS verify_provider_count
        `;
        
        // Execute the query
        const result = await query(selectQuery, [providerId, providerId]);

        // Extract counts from the result
        const skillProviderCount = result[0].skill_provider_count;
        const verifyProviderCount = result[0].verify_provider_count;

        // Return true if the providerId exists in both tables, otherwise false
        return skillProviderCount > 0 && verifyProviderCount > 0;
    } catch (error) {
        throw error;
    }
};


// verifySkillProviderService.createVerifySkillProvider = async (verifySkillProviderData) => {
//     try {
//         const { bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, providerId, followers } = verifySkillProviderData;

//         // Convert arrays to JSON strings
//         const socialPlatformJSON = JSON.stringify(socialPlatform);
//         const socialPlatformUrlJSON = JSON.stringify(socialPlatformUrl);

//         // Insert verifySkillProvider data into the verify_skill_providers table
//         const insertQuery = `
//             INSERT INTO verify_skill_providers (bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, providerId, followers)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//         `;
//         const result = await query(insertQuery, [bio, profileUrl, socialPlatformJSON, socialPlatformUrlJSON, cacImagePath, providerId, followers]);
       
//             // when verifySkillProviderData data is inserted Update the skill_providers and verify_skill_providers table to set isVerified to 'pending'
 
//         return { id: result.insertId, ...verifySkillProviderData };
//     } catch (error) {
//         throw error;
//     }
// };


verifySkillProviderService.createVerifySkillProvider = async (verifySkillProviderData) => {
    try {
        const { bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, providerId, followers } = verifySkillProviderData;

        // Convert arrays to JSON strings
        const socialPlatformJSON = JSON.stringify(socialPlatform);
        const socialPlatformUrlJSON = JSON.stringify(socialPlatformUrl);

        // Insert verifySkillProvider data into the verify_skill_providers table with isVerified set to 'pending'
        const insertQuery = `
            INSERT INTO verify_skill_providers (bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, providerId, followers, isVerified)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        const result = await query(insertQuery, [bio, profileUrl, socialPlatformJSON, socialPlatformUrlJSON, cacImagePath, providerId, followers]);

        if (!result.insertId) {
            throw new Error('Failed to insert verifySkillProvider data');
        }

        // Update skill_providers table to set isVerified to 'pending'
        const updateSkillProvidersQuery = `
            UPDATE skill_providers
            SET isVerified = 'pending'
            WHERE id = ?
        `;
        const skillProvidersUpdateResult = await query(updateSkillProvidersQuery, [providerId]);
        
        if (skillProvidersUpdateResult.affectedRows === 0) {
            throw new Error('Failed to update skill_providers table');
        }

        return { 
            message: 'Verification is pending and waiting for admin approval.',
            id: result.insertId, 
            ...verifySkillProviderData 
        };
    } catch (error) {
        console.error('Error in createVerifySkillProvider:', error);
        throw error;
    }
};



verifySkillProviderService.getVerifySkillProviderById = async (id) => {
    try {
        const selectQuery = 'SELECT * FROM verify_skill_providers WHERE id = ?';
        const verifySkillProviders = await query(selectQuery, [id]);
        return verifySkillProviders[0];
    } catch (error) {
        throw error;
    }
};

verifySkillProviderService.getAllVerifySkillProviders = async () => {
    try {
        const selectAllQuery = 'SELECT * FROM verify_skill_providers';
        const verifySkillProviders = await query(selectAllQuery);
        return verifySkillProviders;
    } catch (error) {
        throw error;
    }
};

verifySkillProviderService.updateVerifySkillProvider = async (id, verifySkillProviderData) => {
    try {
        const { bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, providerId, followers } = verifySkillProviderData;

        // Convert arrays to JSON strings
        const socialPlatformJSON = JSON.stringify(socialPlatform);
        const socialPlatformUrlJSON = JSON.stringify(socialPlatformUrl);

        // Prepare update query based on changed fields
        const updateFields = Object.entries(verifySkillProviderData).filter(([key, value]) => key !== 'id' && value !== undefined);
        const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
        const updateParams = updateFields.map(([key, value]) => value);

        // Add verifySkillProviderId at the end of updateParams
        updateParams.push(id);

        // Update verifySkillProvider data in the database
        const updateQuery = `
            UPDATE verify_skill_providers 
            SET ${updateValues}
            WHERE id=?
        `;
        await query(updateQuery, [...updateParams]);

        // Return updated verifySkillProvider data
        return { id, ...verifySkillProviderData };
    } catch (error) {
        throw error;
    }
};

verifySkillProviderService.deleteVerifySkillProvider = async (id) => {
    try {
        const deleteQuery = 'DELETE FROM verify_skill_providers WHERE id = ?';
        await query(deleteQuery, [id]);
        return { id };
    } catch (error) {
        throw error;
    }
};

verifySkillProviderService.getVerifySkillProviderDetailsById = async (id) => {
    try {
        const selectQuery = `
            SELECT sp.*, vsp.*
            FROM skill_providers sp
            INNER JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
            WHERE sp.id = ?
        `;
        const skillProviderDetails = await query(selectQuery, [id]);
        return skillProviderDetails[0];
    } catch (error) {
        throw error;
    }
};

verifySkillProviderService.updateSkillProviderDetails = async (id, skillProviderData, verifySkillProviderData) => {
    try {
        // Start a transaction
        await query('START TRANSACTION');

        // Update skill provider details
        const { firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath } = skillProviderData;
        const skillProviderUpdateQuery = `
            UPDATE skill_providers 
            SET firstName=?, lastName=?, email=?, phone=?, secondPhone=?, stateOfResidence=?, city=?, street=?, serviceType=?, subCategory=?, openingHour=?, referralCode=?, imagePath=?
            WHERE id=?
        `;
        await query(skillProviderUpdateQuery, [firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath, id]);

        // Update verify skill provider details
        const { bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, followers } = verifySkillProviderData;

        // Convert arrays to JSON strings
        const socialPlatformJSON = JSON.stringify(socialPlatform);
        const socialPlatformUrlJSON = JSON.stringify(socialPlatformUrl);

        const verifySkillProviderUpdateQuery = `
            UPDATE verify_skill_providers 
            SET bio=?, profileUrl=?, socialPlatform=?, socialPlatformUrl=?, cacImagePath=?, followers=?
            WHERE providerId=?
        `;
        await query(verifySkillProviderUpdateQuery, [bio, profileUrl, socialPlatformJSON, socialPlatformUrlJSON, cacImagePath, followers, id]);

        // Commit the transaction
        await query('COMMIT');

        // Return updated skill provider details
        const updatedSkillProvider = await verifySkillProviderService.getVerifySkillProviderDetailsById(id);
        return updatedSkillProvider;
    } catch (error) {
        // Rollback the transaction if an error occurs
        await query('ROLLBACK');
        throw error;
    }
};


// verifySkillProviderService.checkVerificationStatus = async (id) => {
//     try {
//         // Retrieve detailed information about the verified skill provider
//         const skillProviderDetails = await verifySkillProviderService.getVerifySkillProviderDetailsById(id);
        
//         // Check if any field is null or empty
//         const isAnyFieldEmpty = Object.values(skillProviderDetails).some(value => value === null || value === '');

//         // Update the verification status based on the check
//         const isVerified = !isAnyFieldEmpty;

//         // Update the isVerified status in the verify_skill_providers table
//         const updateQuery = `
//             UPDATE verify_skill_providers 
//             SET isVerified=?
//             WHERE providerId=?
//         `;
//         await query(updateQuery, [isVerified, id]);

//         return isVerified;
//     } catch (error) {
//         throw error;
//     }
// };



verifySkillProviderService.checkVerificationStatus = async (id) => {
    try {
        // Retrieve detailed information about the verified skill provider
        const skillProviderDetails = await verifySkillProviderService.getVerifySkillProviderDetailsById(id);
        
        // Check if any field is null or empty
        const emptyFields = [];
        const isAnyFieldEmpty = Object.entries(skillProviderDetails).some(([key, value]) => {
            if (value === null || value === '') {
                emptyFields.push(key);
                return true;
            }
            return false;
        });

        // Update the verification status based on the check
        const isVerified = !isAnyFieldEmpty;

        // Update the isVerified status in the verify_skill_providers table
        const updateQuery = `
            UPDATE verify_skill_providers 
            SET isVerified=?
            WHERE providerId=?
        `;
        await query(updateQuery, [isVerified, id]);

        // Return the appropriate message based on the isVerified status
        if (isVerified) {
            return { isVerified: true, message: 'The provider is verified and all documents submitted.' };
        } else {
            return { isVerified: false, message: `The status is not verified because of the following missing credentials: ${emptyFields.join(', ')}` };
        }
    } catch (error) {
        throw error;
    }
};


verifySkillProviderService.updateCACImage = async (id, cacImageFilePath) => {
    try {
        // Update the CAC image path for the specified provider ID
        const updateQuery = `
            UPDATE verify_skill_providers 
            SET cacImagePath=?
            WHERE providerId=?
        `;
        await query(updateQuery, [cacImageFilePath, id]);

        // Return a success message
        return { success: true, message: 'CAC image uploaded successfully.' };
    } catch (error) {
        throw error;
    }
};


const fs = require('fs');

verifySkillProviderService.uploadCACImage = async (id, cacImageFilePath) => {
    try {
        // Read the CAC image file
        const cacImageFile = fs.readFileSync(cacImageFilePath);

        // Define the destination path to save the CAC image file
        const destinationPath = `uploads/${id}-cac-image.jpg`; // You can adjust the file name and extension as needed

        // Write the CAC image file to the destination path
        fs.writeFileSync(destinationPath, cacImageFile);

        // Insert a new record for the CAC image path into the database
        const insertQuery = `
            INSERT INTO verify_skill_providers (cacImagePath, providerId)
            VALUES (?, ?)
        `;
        await query(insertQuery, [destinationPath, id]);

        // Return a success message with the file path
        return { success: true, message: 'CAC image uploaded successfully.', imagePath: destinationPath };
    } catch (error) {
        throw error;
    }
};

verifySkillProviderService.uploadCACImage = async (id, cacImageFilePath) => {
    try {
        // Save the uploaded file path to the database
        const updateQuery = `
            UPDATE verify_skill_providers 
            SET cacImagePath=?
            WHERE providerId=?
        `;
        await query(updateQuery, [cacImageFilePath, id]);

        // Return a success message
        return { success: true, message: 'CAC image uploaded successfully.' };
    } catch (error) {
        throw error;
    }
};


verifySkillProviderService.viewCACById = async (id) => {
    try {
        const selectQuery = `
            SELECT cacImagePath
            FROM verify_skill_providers 
            WHERE providerId=?
        `;
        const result = await query(selectQuery, [id]);
        return result[0];
    } catch (error) {
        throw error;
    }
};

verifySkillProviderService.updateCACImage = async (id, cacImageFilePath) => {
    try {
        // Update the CAC image path for the specified provider ID
        const updateQuery = `
            UPDATE verify_skill_providers 
            SET cacImagePath=?
            WHERE providerId=?
        `;
        await query(updateQuery, [cacImageFilePath, id]);

        // Return a success message
        return { success: true, message: 'CAC image updated successfully.' };
    } catch (error) {
        throw error;
    }
};

verifySkillProviderService.viewAllCAC = async () => {
    try {
        const selectQuery = `
            SELECT providerId, cacImagePath
            FROM verify_skill_providers
        `;
        const result = await query(selectQuery);
        return result;
    } catch (error) {
        throw error;
    }
};


verifySkillProviderService.deleteCAC = async (id) => {
    try {
        const deleteQuery = `
            UPDATE verify_skill_providers 
            SET cacImagePath = NULL
            WHERE providerId=?
        `;
        await query(deleteQuery, [id]);
        return { success: true, message: 'CAC image deleted successfully.' };
    } catch (error) {
        throw error;
    }
};

// Function to create a new entry in verify_skill_providers table with CAC image file
verifySkillProviderService.createSkillProviderCAC = async (cacImageFile) => {
    try {
        // Upload the CAC image and get the file path
        const { filePath } = await verifySkillProviderService.uploadCACImage(cacImageFile);

        // Insert verifySkillProvider data with CAC image path into the verify_skill_providers table
        const insertQuery = `
            INSERT INTO verify_skill_providers (cacImagePath)
            VALUES (?)
        `;
        const result = await query(insertQuery, [filePath]);

        return { id: result.insertId, cacImagePath: filePath };
    } catch (error) {
        throw error;
    }
};


// verifySkillProviderService.toggleVerificationStatus = async (id) => {
//     try {
//         // Retrieve the current verification status
//         const verifySkillProvider = await verifySkillProviderService.getVerifySkillProviderById(id);

//         // Calculate the new verification status
//         const newVerificationStatus = !verifySkillProvider.isVerified;

//         // Update the database with the new verification status
//         const updateQuery = `
//             UPDATE verify_skill_providers 
//             SET isVerified=?
//             WHERE id=?
//         `;
//         await query(updateQuery, [newVerificationStatus, id]);

//         // Return a message indicating the updated status
//         return { id, isVerified: newVerificationStatus, message: `Verification status updated to ${newVerificationStatus}.` };
//     } catch (error) {
//         throw error;
//     }
// };

// verifySkillProviderService.toggleVerificationStatus = async (id) => {
//     try {
//         // Retrieve the current verification status
//         const verifySkillProvider = await verifySkillProviderService.getVerifySkillProviderById(id);

//         // If skill provider is not found, return early
//         if (!verifySkillProvider) {
//             throw new Error(`Skill provider with ID ${id} not found.`);
//         }

//         // Determine the new verification status
//         const newVerificationStatus = verifySkillProvider.isVerified ? false : true;

//         // Update the database with the new verification status
//         const updateQuery = `
//             UPDATE verify_skill_providers 
//             SET isVerified=?
//             WHERE id=?
//         `;
//         await query(updateQuery, [newVerificationStatus, id]);

//         // Return a message indicating the updated status
//         return { id, isVerified: newVerificationStatus, message: `Verification status updated to ${newVerificationStatus}.` };
//     } catch (error) {
//         throw error;
//     }
// };

// this uses the verifySkillProviders primary key id to change the isVerified status
verifySkillProviderService.toggleVerificationStatus = async (id, action) => {
    try {
        // Retrieve the current verification status
        const verifySkillProvider = await verifySkillProviderService.getVerifySkillProviderById(id);

        // If skill provider is not found, return early
        if (!verifySkillProvider) {
            throw new Error(`Skill provider with ID ${id} not found.`);
        }

        // Determine the new verification status based on the action
        let newVerificationStatus;
        if (action === 'accept') {
            newVerificationStatus = true;
        } else if (action === 'reject') {
            newVerificationStatus = false;
        } else {
            throw new Error('Invalid action specified.');
        }

        // Update the database with the new verification status
        const updateQuery = `
            UPDATE verify_skill_providers 
            SET isVerified=?
            WHERE id=?
        `;
        await query(updateQuery, [newVerificationStatus, id]);

        // Return a message indicating the updated status
        return { id, isVerified: newVerificationStatus, message: `Verification status updated to ${newVerificationStatus}.` };
    } catch (error) {
        throw error;
    }
};



// this uses the ProviderId instead of primary key id to change the isVerified status
// verifySkillProviderService.toggleVerificationStatusWithproviderId = async (providerId, action) => {
//     try {
//         // Retrieve the current verification status
//         const verifySkillProvider = await verifySkillProviderService.providerExists(providerId);

//         // If skill provider is not found, return early
//         if (!verifySkillProvider) {
//             throw new Error(`Skill provider with providerId ${providerId} not found.`);
//         }

//         // Determine the new verification status based on the action
//         let newVerificationStatus;
//         if (action === 'accept') {
//             newVerificationStatus = true;
//         } else if (action === 'reject') {
//             newVerificationStatus = false;
//         } else {
//             throw new Error('Invalid action specified.');
//         }

//         // Update the database with the new verification status
//         const updateQuery = `
//             UPDATE verify_skill_providers 
//             SET isVerified=?
//             WHERE providerId=?
//         `;
//         await query(updateQuery, [newVerificationStatus, providerId]);

//         // Return a message indicating the updated status
//         return { providerId, isVerified: newVerificationStatus, message: `Verification status updated to ${newVerificationStatus}.` };
//     } catch (error) {
//         throw error;
//     }
// };

// verifySkillProviderService.toggleVerificationStatusWithproviderId = async (providerId, action) => {
//     try {
//         // Check if the providerId exists as a primary key in the skill_providers table
//         const providerExistsQuery = 'SELECT COUNT(*) AS count FROM skill_providers WHERE id = ?';
//         const providerExistsResult = await query(providerExistsQuery, [providerId]);
//         const providerExistsCount = providerExistsResult[0].count;

//         if (providerExistsCount === 0) {
//             throw new Error(`Skill provider with providerId ${providerId} not found.`);
//         }

//         // Check if the providerId exists as a foreign key in the verify_skill_providers table
//         const verificationExistsQuery = 'SELECT COUNT(*) AS count FROM verify_skill_providers WHERE providerId = ?';
//         const verificationExistsResult = await query(verificationExistsQuery, [providerId]);
//         const verificationExistsCount = verificationExistsResult[0].count;

//         if (verificationExistsCount === 0) {
//             throw new Error(`Skill provider with providerId ${providerId} does not have verification details.`);
//         }

//         // Determine the new verification status based on the action
//         let newVerificationStatus;
//         if (action === 'accept') {
//             newVerificationStatus = true;
//         } else if (action === 'reject') {
//             newVerificationStatus = false;
//         } else {
//             throw new Error('Invalid action specified.');
//         }

//         // Update the database with the new verification status
//         const updateQuery = `
//             UPDATE verify_skill_providers 
//             SET isVerified=?
//             WHERE providerId=?
//         `;
//         await query(updateQuery, [newVerificationStatus, providerId]);

//         // Return a message indicating the updated status
//         return { providerId, isVerified: newVerificationStatus, message: `Verification status updated to ${newVerificationStatus}.` };
//     } catch (error) {
//         throw error;
//     }
// };

// verifySkillProviderService.toggleVerificationStatusWithproviderId = async (providerId, action) => {
//     try {
//         // Check if the providerId exists in both tables
//         const verificationExistsQuery = `
//             SELECT COUNT(*) AS count
//             FROM skill_providers AS sp
//             JOIN verify_skill_providers AS vsp ON sp.id = vsp.providerId
//             WHERE sp.id = ?
//         `;
//         const verificationExistsResult = await query(verificationExistsQuery, [providerId]);
//         const verificationExistsCount = verificationExistsResult[0].count;

//         if (verificationExistsCount === 0) {
//             throw new Error(`Skill provider with providerId ${providerId} either not found or does not have verification details.`);
//         }

//         // Determine the new verification status based on the action
//         let newVerificationStatus;
//         if (action === 'accept') {
//             newVerificationStatus = true;
//         } else if (action === 'pending') {
//             newVerificationStatus = false;
//         }else if(action === 'reject'){
//              const deleteCAC =`
//              DELETE vsp
//              FROM verify_skill_providers vsp
//              JOIN skill_providers sp ON sp.id = vsp.providerId
//              WHERE sp.id = ?
             
//              `;

//              const result = await query(deleteCAC, [providerId])
//              console.log('====================================');
//              console.log('deleted id =='+result);
//              console.log('====================================');

//             if(result ===true){
//                 throw new Error(`Skill provider with providerId ${providerId} verification details has been rejected upload new CAC.`);

//             }
//         } 
//         else {
//             throw new Error('Invalid action specified.');
//         }

//         // Update the database with the new verification status
//         const updateQuery = `
//             UPDATE verify_skill_providers 
//             SET isVerified=?
//             WHERE providerId=?
//         `;
//         await query(updateQuery, [newVerificationStatus, providerId]);

//         // Return a message indicating the updated status
//         return { providerId, isVerified: newVerificationStatus, message: `Verification status updated to ${newVerificationStatus}.` };
//     } catch (error) {
//         throw error;
//     }
// };


// verifySkillProviderService.toggleVerificationStatusWithproviderId = async (providerId, action) => {
//     try {
//         // Check if the providerId exists in both tables
//         const verificationExistsQuery = `
//             SELECT COUNT(*) AS count
//             FROM skill_providers AS sp
//             JOIN verify_skill_providers AS vsp ON sp.id = vsp.providerId
//             WHERE sp.id = ?
//         `;
//         const verificationExistsResult = await query(verificationExistsQuery, [providerId]);
//         const verificationExistsCount = verificationExistsResult[0].count;

//         if (verificationExistsCount === 0) {
//             throw new Error(`Skill provider with providerId ${providerId} either not found or does not have verification details.`);
//         }

//         // Determine the new verification status based on the action
//         let newVerificationStatus;
//         if (action === 'accept') {
//             newVerificationStatus = true;
//         } else if (action === 'pending') {
//             newVerificationStatus = false;
//         } else if (action === 'reject') {
//             // Delete the verification details
//             const deleteCAC = `
//                 DELETE vsp
//                 FROM verify_skill_providers vsp
//                 JOIN skill_providers sp ON sp.id = vsp.providerId
//                 WHERE sp.id = ?
//             `;

//             const result = await query(deleteCAC, [providerId]);
//             console.log('====================================');
//             console.log('deleted id == ' + result);
//             console.log('====================================');

//             if (result.affectedRows > 0) {
//                 // Update the skill_providers table to set isVerified to false
//                 const updateSkillProvidersQuery = `
//                     UPDATE skill_providers 
//                     SET isVerified = false
//                     WHERE id = ?
//                 `;
//                 await query(updateSkillProvidersQuery, [providerId]);

//                 throw new Error(`Skill provider with providerId ${providerId} verification details have been rejected. Please upload new CAC.`);
//             }
//         } else {
//             throw new Error('Invalid action specified.');
//         }

//         // Update the verify_skill_providers table with the new verification status
//         const updateVerificationQuery = `
//             UPDATE verify_skill_providers 
//             SET isVerified = ?
//             WHERE providerId = ?
//         `;
//         await query(updateVerificationQuery, [newVerificationStatus, providerId]);

//         // Update the skill_providers table with the new verification status
//         const updateSkillProvidersQuery = `
//             UPDATE skill_providers 
//             SET isVerified = ?
//             WHERE id = ?
//         `;
//         await query(updateSkillProvidersQuery, [newVerificationStatus, providerId]);

//         // Return a message indicating the updated status
//         return { providerId, isVerified: newVerificationStatus, message: `Verification status updated to ${newVerificationStatus}.` };
//     } catch (error) {
//         throw error;
//     }

// }


verifySkillProviderService.toggleVerificationStatusWithproviderId = async (providerId, action) => {
    try {
        // Check if the providerId exists in both tables
        const verificationExistsQuery = `
            SELECT COUNT(*) AS count
            FROM skill_providers AS sp
            JOIN verify_skill_providers AS vsp ON sp.id = vsp.providerId
            WHERE sp.id = ?
        `;
        const verificationExistsResult = await query(verificationExistsQuery, [providerId]);
        const verificationExistsCount = verificationExistsResult[0].count;

        if (verificationExistsCount === 0) {
            throw new Error(`Skill provider with providerId ${providerId} either not found or does not have verification details.`);
        }

        // Determine the new verification status based on the action
        let newVerificationStatus;
        if (action === 'accept') {
            newVerificationStatus = 'accept';
        } else if (action === 'pending') {
            newVerificationStatus = 'pending';
        } else if (action === 'reject') {
            // Delete the verification details
            const deleteCAC = `
                DELETE vsp
                FROM verify_skill_providers vsp
                JOIN skill_providers sp ON sp.id = vsp.providerId
                WHERE sp.id = ?
            `;
            const result = await query(deleteCAC, [providerId]);
            console.log('====================================');
            console.log('deleted id == ' + result);
            console.log('====================================');

            if (result.affectedRows > 0) {
                // Update the skill_providers table to set isVerified to 'unverified'
                const updateSkillProvidersQuery = `
                    UPDATE skill_providers 
                    SET isVerified = 'reject'
                    WHERE id = ?
                `;
                await query(updateSkillProvidersQuery, [providerId]);

                throw new Error(`Skill provider with providerId ${providerId} verification details have been rejected. Please upload new CAC.`);
            }
        } else {
            throw new Error('Invalid action specified.');
        }

        // Update the verify_skill_providers table with the new verification status
        const updateVerificationQuery = `
            UPDATE verify_skill_providers 
            SET isVerified = ?
            WHERE providerId = ?
        `;
        await query(updateVerificationQuery, [newVerificationStatus, providerId]);

        // Update the skill_providers table with the new verification status
        const updateSkillProvidersQuery = `
            UPDATE skill_providers 
            SET isVerified = ?
            WHERE id = ?
        `;
        await query(updateSkillProvidersQuery, [newVerificationStatus, providerId]);

        // Return a message indicating the updated status
        return { providerId, isVerified: newVerificationStatus, message: `Verification status updated to ${newVerificationStatus}.` };
    } catch (error) {
        throw error;
    }
}




// verifySkillProviderService.toggleVerificationStatusWithproviderId = async (providerId, action) => {
//     try {
//         // Check if the providerId exists in both tables
//         const verificationExistsQuery = `
//             SELECT COUNT(*) AS count
//             FROM skill_providers AS sp
//             JOIN verify_skill_providers AS vsp ON sp.id = vsp.providerId
//             WHERE sp.id = ?
//         `;
//         const verificationExistsResult = await query(verificationExistsQuery, [providerId]);
//         const verificationExistsCount = verificationExistsResult[0].count;

//         if (verificationExistsCount === 0) {
//             throw new Error(`Skill provider with providerId ${providerId} either not found or does not have verification details.`);
//         }

//         // Determine the new verification status based on the action
//         let newVerificationStatus;
//         if (action === 'accept') {
//             newVerificationStatus = true;
//         } else if (action === 'pending') {
//             newVerificationStatus = false;
//         } else if (action === 'reject') {
//             const deleteCAC = `
//                 DELETE vsp
//                 FROM verify_skill_providers vsp
//                 JOIN skill_providers sp ON sp.id = vsp.providerId
//                 WHERE sp.id = ?
//             `;

//             const result = await query(deleteCAC, [providerId]);
//             console.log('====================================');
//             console.log('deleted id == ' + result);
//             console.log('====================================');
             
//             if (result.affectedRows > 0) {
//                 throw new Error(`Skill provider with providerId ${providerId} verification details have been rejected. Please upload new CAC.`);
//             }
//         } else {
//             throw new Error('Invalid action specified.');
//         }

//         // Update the verify_skill_providers table with the new verification status
//         const updateVerificationQuery = `
//             UPDATE verify_skill_providers 
//             SET isVerified = ?
//             WHERE providerId = ?
//         `;
//         await query(updateVerificationQuery, [newVerificationStatus, providerId]);

//         // Update the skill_providers table with the new verification status
//         const updateSkillProvidersQuery = `
//             UPDATE skill_providers 
//             SET isVerified = ?
//             WHERE id = ?
//         `;
//         await query(updateSkillProvidersQuery, [newVerificationStatus, providerId]);

//         // Return a message indicating the updated status
//         return { providerId, isVerified: newVerificationStatus, message: `Verification status updated to ${newVerificationStatus}.` };
//     } catch (error) {
//         throw error;
//     }
// };


verifySkillProviderService.getVerifiedSkillDetails = async (providerId) => {
    try {
        // Check if the providerId exists in both tables
        const verificationExistsQuery = `
            SELECT COUNT(*) AS count
            FROM skill_providers AS sp
            JOIN verify_skill_providers AS vsp ON sp.id = vsp.providerId
            WHERE sp.id = ?
        `;
        const verificationExistsResult = await query(verificationExistsQuery, [providerId]);
        const verificationExistsCount = verificationExistsResult[0].count;

        if (verificationExistsCount === 0) {
            throw new Error(`Skill provider with providerId ${providerId} either not found or does not have verification details.`);
        }

        // Retrieve all details for the skill provider from both tables
        const detailsQuery = `
            SELECT sp.*, vsp.*
            FROM skill_providers AS sp
            JOIN verify_skill_providers AS vsp ON sp.id = vsp.providerId
            WHERE sp.id = ?
        `;
        const detailsResult = await query(detailsQuery, [providerId]);

        // Extract and return the details
        return detailsResult[0];
    } catch (error) {
        throw error;
    }
};

// verifySkillProviderService.getAllVerifiedSkillDetails = async () => {
//     try {
//         // Retrieve all verified skill provider details from both tables
//         const allDetailsQuery = `
//             SELECT sp.*, vsp.*
//             FROM skill_providers AS sp
//             JOIN verify_skill_providers AS vsp ON sp.id = vsp.providerId
//         `;
//         const allDetailsResult = await query(allDetailsQuery);

//         // Return all details
//         return allDetailsResult;
//     } catch (error) {
//         throw error;
//     }
// };



// this function retrieve all skill providers who are not verified in the application.
verifySkillProviderService.getUnverifiedSkillProviders = async () => {
    try {
        // SQL query to select skill providers who are not verified
        const selectQuery = `
        SELECT sp.*
        FROM skill_providers sp
        LEFT JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
        WHERE vsp.isVerified = FALSE OR vsp.isVerified IS NULL
        `;
        
        // Execute the SQL query asynchronously
        const unverifiedSkillProviders = await query(selectQuery);
        
        // Return the unverified skill providers
        return unverifiedSkillProviders;
    } catch (error) {
        throw error;
    }
};



// verifySkillProviderService.getUnverifiedSkillProviders = async () => {
//     try {
//         // Query to check if there are any records in both tables
//         const relationshipQuery = `
//             SELECT EXISTS(SELECT * FROM skill_providers) AS hasSkillProviders, 
//                    EXISTS(SELECT * FROM verify_skill_providers) AS hasVerifySkillProviders
//         `;

//         // Execute the query to check relationship records
//         const relationshipResult = await query(relationshipQuery);

//         // Check if both tables have records
//         if (relationshipResult[0].hasSkillProviders === 0 || relationshipResult[0].hasVerifySkillProviders === 0) {
//             const error = new Error('No relationship records found.');
//             error.code = 'NO_RELATIONSHIP_ERROR';
//             throw error;
//         }

//         // If both tables have records, proceed to fetch unverified skill providers

//         // Query to get unverified skill providers
//         const unverifiedSkillProvidersQuery = `
//             SELECT sp.* 
//             FROM skill_providers sp
//             LEFT JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
//             WHERE vsp.isVerified = 0 OR vsp.isVerified IS NULL
//         `;

//         // Execute the query to get unverified skill providers
//         const unverifiedSkillProviders = await query(unverifiedSkillProvidersQuery);

//         // Check if any unverified skill providers are found
//         if (unverifiedSkillProviders.length === 0) {
//             const error = new Error('No unverified skill providers found.');
//             error.code = 'NO_UNVERIFIED_PROVIDERS_ERROR';
//             throw error;
//         }

//         // Return the unverified skill providers
//         return unverifiedSkillProviders;

//     } catch (error) {
//         throw error;
//     }
// }

verifySkillProviderService.getUnverifiedSkillProviders = async () => {
    try {
        // Query to check if there are any records in both tables
        const relationshipQuery = `
            SELECT EXISTS(SELECT * FROM skill_providers) AS hasSkillProviders, 
                   EXISTS(SELECT * FROM verify_skill_providers) AS hasVerifySkillProviders
        `;

        // Execute the query to check relationship records
        const relationshipResult = await query(relationshipQuery);

        // Check if both tables have records
        if (relationshipResult[0].hasSkillProviders === 0 || relationshipResult[0].hasVerifySkillProviders === 0) {
            const error = new Error('No relationship records found.');
            error.code = 'NO_RELATIONSHIP_ERROR';
            throw error;
        }

        // If both tables have records, proceed to fetch unverified skill providers

        // Query to get unverified skill providers
        const unverifiedSkillProvidersQuery = `
            SELECT sp.* 
            FROM skill_providers sp
            LEFT JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
            WHERE vsp.isVerified = 0 OR vsp.isVerified IS NULL
        `;

        // Execute the query to get unverified skill providers
        const unverifiedSkillProviders = await query(unverifiedSkillProvidersQuery);

        // Check if any unverified skill providers are found
        if (unverifiedSkillProviders.length === 0) {
            const error = new Error('No unverified skill providers found.');
            error.code = 'NO_UNVERIFIED_PROVIDERS_ERROR';
            throw error;
        }

        // Return the unverified skill providers
        return unverifiedSkillProviders;

    } catch (error) {
        throw error;
    }
}


// Function to get skill providers with their verification details
// verifySkillProviderService.getSkillProvidersWithVerificationDetails = async () => {
//     try {
//         // Query to retrieve all skill providers along with their verification details
//         const selectQuery = `
//             SELECT sp.*, vsp.*
//             FROM skill_providers sp
//             LEFT JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
//         `;

//         // Execute the query to fetch skill providers and their verification details
//         const skillProvidersWithVerificationDetails = await query(selectQuery);

//         // Check if any skill providers are found
//         if (skillProvidersWithVerificationDetails.length === 0) {
//             const error = new Error('No skill providers found.');
//             error.code = 'NO_SKILL_PROVIDERS_ERROR';
//             throw error;
//         }

//         // Separate skill provider details and verification details
//         const formattedData = skillProvidersWithVerificationDetails.map(provider => {
//             const skillProviderDetails = {
//                 id: provider.id,
//                 firstName: provider.firstName,
//                 lastName: provider.lastName,
//                 email: provider.email,
//                 phone: provider.phone,
//                 secondPhone: provider.secondPhone,
//                 stateOfResidence: provider.stateOfResidence,
//                 city: provider.city,
//                 street: provider.street,
//                 serviceType: provider.serviceType,
//                 subCategory: provider.subCategory,
//                 openingHour: provider.openingHour,
//                 referralCode: provider.referralCode,
//                 imagePath: provider.imagePath,
//                 // Add other skill provider details as needed
//             };
//             const verificationDetails = {
//                 bio: provider.bio,
//                 profileUrl: provider.profileUrl,
//                 socialPlatform: provider.socialPlatform,
//                 socialPlatformUrl: provider.socialPlatformUrl,
//                 cacImagePath: provider.cacImagePath,
//                 followers: provider.followers,
//                 isVerified: provider.isVerified,
//                 createdAt: provider.createdAt,
//                 updatedAt: provider.updatedAt,
//                 // Add other verification details as needed
//             };
//             return { skillProviderDetails, verificationDetails };
//         });

//         // Return the formatted data
//         return formattedData;

//     } catch (error) {
//         throw error;
//     }
// };

// Function to get skill providers with their verification details
// verifySkillProviderService.getSkillProvidersWithVerificationDetails = async () => {
//     try {
//         // Query to retrieve all skill providers along with their verification details
//         const selectQuery = `
//             SELECT sp.*, vsp.*
//             FROM skill_providers sp
//             LEFT JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
//         `;

//         // Execute the query to fetch skill providers and their verification details
//         const skillProvidersWithVerificationDetails = await query(selectQuery);

//         // Check if any skill providers are found
//         if (skillProvidersWithVerificationDetails.length === 0) {
//             const error = new Error('No skill providers found.');
//             error.code = 'NO_SKILL_PROVIDERS_ERROR';
//             throw error;
//         }

//         // Separate skill provider details and verification details
//         // const formattedData = skillProvidersWithVerificationDetails.map(provider => {
//         //     // const skillProviderDetails = {
//         //     //     providerId: provider.providerId,
//         //     //     firstName: provider.firstName,
//         //     //     lastName: provider.lastName,
//         //     //     email: provider.email,
//         //     //     phone: provider.phone,
//         //     //     secondPhone: provider.secondPhone,
//         //     //     stateOfResidence: provider.stateOfResidence,
//         //     //     city: provider.city,
//         //     //     street: provider.street,
//         //     //     serviceType: provider.serviceType,
//         //     //     subCategory: provider.subCategory,
//         //     //     openingHour: provider.openingHour,
//         //     //     referralCode: provider.referralCode,
//         //     //     imagePath: provider.imagePath,
//         //     //     // Add other skill provider details as needed
//         //     // };
//         //     // const verificationDetails = {
//         //     //     id: provider.id,
//         //     //     bio: provider.bio,
//         //     //     profileUrl: provider.profileUrl,
//         //     //     socialPlatform: provider.socialPlatform,
//         //     //     socialPlatformUrl: provider.socialPlatformUrl,
//         //     //     cacImagePath: provider.cacImagePath,
//         //     //     followers: provider.followers,
//         //     //     isVerified: provider.isVerified,
//         //     //     createdAt: provider.createdAt,
//         //     //     updatedAt: provider.updatedAt,
//         //     //     // Add other verification details as needed
//         //     // };
//         //     return { skillProviderDetails, verificationDetails };
//         // });

//         // Return the formatted data
//         return skillProvidersWithVerificationDetails;

//     } catch (error) {
//         throw error;
//     }
// };



// verifySkillProviderService.getSkillProvidersWithVerificationDetails = async () => {
//     try {
//         // Query to retrieve skill providers with verification details
//         const selectQuery = `
//             SELECT sp.*, vsp.*
//             FROM skill_providers sp
//             JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
//             WHERE vsp.providerId IS NOT NULL
//         `;

//         // Execute the query to fetch skill providers and their verification details
//         const skillProvidersWithVerificationDetails = await query(selectQuery);

//         // Check if any skill providers are found
//         if (skillProvidersWithVerificationDetails.length === 0) {
//             const error = new Error('No skill providers found with verification details.');
//             error.code = 'NO_SKILL_PROVIDERS_ERROR';
//             throw error;
//         }

//         // Return the skill providers with their verification details
//         return skillProvidersWithVerificationDetails;

//     } catch (error) {
//         throw error;
//     }
// };


verifySkillProviderService.getSkillProvidersWithVerificationDetails = async () => {
    try {
        // Query to retrieve skill providers with verification details
        const selectQuery = `
            SELECT sp.*, vsp.*
            FROM skill_providers sp
            JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
            WHERE vsp.providerId IS NOT NULL AND vsp.isVerified = 'unverified'
        `;

        // Execute the query to fetch skill providers and their verification details
        const skillProvidersWithVerificationDetails = await query(selectQuery);

        // Check if any skill providers are found
        if (skillProvidersWithVerificationDetails.length === 0) {
            const error = new Error('No skill providers found with verification details.');
            error.code = 'NO_SKILL_PROVIDERS_ERROR';
            throw error;
        }

        // Return the skill providers with their verification details
        return skillProvidersWithVerificationDetails;

    } catch (error) {
        throw error;
    }
};


verifySkillProviderService.getAllVerifiedSkillProvidersWithDetails = async () => {
    try {
        // Query to retrieve skill providers with verification details
        const selectQuery = `
            SELECT sp.*, vsp.*
            FROM skill_providers sp
            JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
            WHERE vsp.providerId IS NOT NULL AND vsp.isVerified = 'accept'
        `;

        // Execute the query to fetch skill providers and their verification details
        const skillProvidersWithVerificationDetails = await query(selectQuery);

        // Check if any skill providers are found
        if (skillProvidersWithVerificationDetails.length === 0) {
            const error = new Error('No skill providers found with verification details.');
            error.code = 'NO_SKILL_PROVIDERS_ERROR';
            throw error;
        }

        // Return the skill providers with their verification details
        return skillProvidersWithVerificationDetails;

    } catch (error) {
        throw error;
    }
};




module.exports = verifySkillProviderService;




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

// // Create VerifySkillProviders table if it doesn't exist
// async function createVerifySkillProvidersTable() {
//     const createVerifySkillProvidersTableQuery = `
//         CREATE TABLE IF NOT EXISTS verify_skill_providers (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             bio TEXT,
//             profileUrl VARCHAR(255),
//             socialPlatform VARCHAR(255),
//             socialPlatformUrl VARCHAR(255),
//             cacImagePath VARCHAR(255),
//             providerId INT,
//             followers INT,
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY (providerId) REFERENCES skill_providers(id) ON DELETE CASCADE
//         );
//     `;
//     try {
//         await query(createVerifySkillProvidersTableQuery);
//         console.log('VerifySkillProviders table created successfully');
//     } catch (error) {
//         console.error('Error creating VerifySkillProviders table:', error);
//         throw error;
//     }
// }

// createVerifySkillProvidersTable(); // Immediately create the table on module load

// const verifySkillProviderService = {};

// verifySkillProviderService.createVerifySkillProvider = async (verifySkillProviderData) => {
//     try {
//         const { bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, providerId, followers } = verifySkillProviderData;

//         // Insert verifySkillProvider data into the verify_skill_providers table
//         const insertQuery = `
//             INSERT INTO verify_skill_providers (bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, providerId, followers)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//         `;
//         const result = await query(insertQuery, [bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, providerId, followers]);

//         return { id: result.insertId, ...verifySkillProviderData };
//     } catch (error) {
//         throw error;
//     }
// };

// verifySkillProviderService.getVerifySkillProviderById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM verify_skill_providers WHERE id = ?';
//         const verifySkillProviders = await query(selectQuery, [id]);
//         return verifySkillProviders[0];
//     } catch (error) {
//         throw error;
//     }
// };

// verifySkillProviderService.getAllVerifySkillProviders = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM verify_skill_providers';
//         const verifySkillProviders = await query(selectAllQuery);
//         return verifySkillProviders;
//     } catch (error) {
//         throw error;
//     }
// };

// verifySkillProviderService.updateVerifySkillProvider = async (id, verifySkillProviderData) => {
//     try {
//         const { bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, providerId, followers } = verifySkillProviderData;

//         // Prepare update query based on changed fields
//         const updateFields = Object.entries(verifySkillProviderData).filter(([key, value]) => key !== 'id' && value !== undefined);
//         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
//         const updateParams = updateFields.map(([key, value]) => value);

//         // Add verifySkillProviderId at the end of updateParams
//         updateParams.push(id);

//         // Update verifySkillProvider data in the database
//         const updateQuery = `
//             UPDATE verify_skill_providers 
//             SET ${updateValues}
//             WHERE id=?
//         `;
//         await query(updateQuery, updateParams);

//         // Return updated verifySkillProvider data
//         return { id, ...verifySkillProviderData };
//     } catch (error) {
//         throw error;
//     }
// };

// verifySkillProviderService.deleteVerifySkillProvider = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM verify_skill_providers WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };



// verifySkillProviderService.getVerifySkillProviderDetailsById = async (id) => {
//     try {
//         const selectQuery = `
//             SELECT sp.*, vsp.*
//             FROM skill_providers sp
//             INNER JOIN verify_skill_providers vsp ON sp.id = vsp.providerId
//             WHERE sp.id = ?
//         `;
//         const skillProviderDetails = await query(selectQuery, [id]);
//         return skillProviderDetails[0];
//     } catch (error) {
//         throw error;
//     }
// };



// // verifySkillProviderService.updateSkillProviderDetails = async (id, skillProviderData, verifySkillProviderData) => {
// //     try {
// //         // Start a transaction
// //         await query('START TRANSACTION');

// //         // Update skill provider details
// //         const { firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath } = skillProviderData;
// //         const skillProviderUpdateQuery = `
// //             UPDATE skill_providers 
// //             SET firstName=?, lastName=?, email=?, phone=?, secondPhone=?, stateOfResidence=?, city=?, street=?, serviceType=?, subCategory=?, openingHour=?, referralCode=?, imagePath=?
// //             WHERE id=?
// //         `;
// //         await query(skillProviderUpdateQuery, [firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath, id]);

// //         // Update verify skill provider details
// //         const { bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, followers } = verifySkillProviderData;
// //         const verifySkillProviderUpdateQuery = `
// //             UPDATE verify_skill_providers 
// //             SET bio=?, profileUrl=?, socialPlatform=?, socialPlatformUrl=?, cacImagePath=?, followers=?
// //             WHERE providerId=?
// //         `;
// //         await query(verifySkillProviderUpdateQuery, [bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, followers, id]);

// //         // Commit the transaction
// //         await query('COMMIT');

// //         // Return updated skill provider details
// //         const updatedSkillProvider = await getSkillProviderById(id);
// //         return updatedSkillProvider;
// //     } catch (error) {
// //         // Rollback the transaction if an error occurs
// //         await query('ROLLBACK');
// //         throw error;
// //     }
// // };



// // Function to update both skill provider and verify skill provider details
// verifySkillProviderService.updateSkillProviderDetails = async (id, skillProviderData, verifySkillProviderData) => {
//     try {
//         // Start a transaction
//         await query('START TRANSACTION');

//         // Update skill provider details
//         const { firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath } = skillProviderData;
//         const skillProviderUpdateQuery = `
//             UPDATE skill_providers 
//             SET firstName=?, lastName=?, email=?, phone=?, secondPhone=?, stateOfResidence=?, city=?, street=?, serviceType=?, subCategory=?, openingHour=?, referralCode=?, imagePath=?
//             WHERE id=?
//         `;
//         await query(skillProviderUpdateQuery, [firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath, id]);

//         // Update verify skill provider details
//         const { bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, followers } = verifySkillProviderData;
//         const verifySkillProviderUpdateQuery = `
//             UPDATE verify_skill_providers 
//             SET bio=?, profileUrl=?, socialPlatform=?, socialPlatformUrl=?, cacImagePath=?, followers=?
//             WHERE providerId=?
//         `;
//         await query(verifySkillProviderUpdateQuery, [bio, profileUrl, socialPlatform, socialPlatformUrl, cacImagePath, followers, id]);

//         // Commit the transaction
//         await query('COMMIT');

//         // Return updated skill provider details
//         const updatedSkillProvider = await verifySkillProviderService.getVerifySkillProviderDetailsById(id);
//         return updatedSkillProvider;
//     } catch (error) {
//         // Rollback the transaction if an error occurs
//         await query('ROLLBACK');
//         throw error;
//     }
// };


// module.exports = verifySkillProviderService;
