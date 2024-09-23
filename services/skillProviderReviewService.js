const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    connectionLimit: process.env.CONNECTION_LIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

function query(sql, args) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }
            connection.query(sql, args, (err, rows) => {
                connection.release();
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    });
}

const createSkillProviderReviewTableQuery = `
    CREATE TABLE IF NOT EXISTS skill_provider_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        skillProviderId INT NOT NULL,
        customerId INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (skillProviderId) REFERENCES skill_providers(id) ON DELETE CASCADE,
        FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
    )
`;

async function createSkillProviderReviewsTable() {
    try {
        await query(createSkillProviderReviewTableQuery);
        console.log('Skill Provider Reviews Table created successfully');
    } catch (error) {
        console.error('Error creating Skill Provider Reviews table:', error);
    }
}


(async () => {
    await createSkillProviderReviewsTable();
})();



const skillProviderReviewService = {};

skillProviderReviewService.createSkillProviderReview = async (reviewData) => {
    try {
        const { skillProviderId, customerId, rating, comment } = reviewData;
        const insertReviewQuery = `
            INSERT INTO skill_provider_reviews (skillProviderId, customerId, rating, comment)
            VALUES (?, ?, ?, ?)
        `;
        const reviewResult = await query(insertReviewQuery, [skillProviderId, customerId, rating, comment]);
        if (!reviewResult.insertId) throw new Error('Failed to insert skill provider review');
        return { id: reviewResult.insertId, ...reviewData };
    } catch (error) {
        throw error;
    }
};

skillProviderReviewService.getSkillProviderReviewsBySkillProviderId = async (skillProviderId) => {
    try {
        const selectQuery = 'SELECT * FROM skill_provider_reviews WHERE skillProviderId = ?';
        const reviews = await query(selectQuery, [skillProviderId]);
        return reviews;
    } catch (error) {
        throw error;
    }
};

skillProviderReviewService.updateSkillProviderReview = async (reviewId, updatedReviewData) => {
    try {
        const { rating, comment } = updatedReviewData;
        const updateReviewQuery = `
            UPDATE skill_provider_reviews
            SET rating = ?, comment = ?
            WHERE id = ?
        `;
        await query(updateReviewQuery, [rating, comment, reviewId]);
        return { id: reviewId, ...updatedReviewData };
    } catch (error) {
        throw error;
    }
};

skillProviderReviewService.deleteSkillProviderReview = async (reviewId) => {
    try {
        const deleteReviewQuery = 'DELETE FROM skill_provider_reviews WHERE id = ?';
        await query(deleteReviewQuery, [reviewId]);
        return { message: 'Skill provider review deleted successfully' };
    } catch (error) {
        throw error;
    }
};



// Function to get skill provider details and their reviews for a skill provider
skillProviderReviewService.getSkillProviderDetailsAndReviews = async (skillProviderId) => {
    try {
        const queryText = `
            SELECT sp.id AS skillProviderId, sp.firstName AS skillProviderFirstName, sp.lastName AS skillProviderLastName, sp.email AS skillProviderEmail, 
                   sp.phone AS skillProviderPhone, sp.secondPhone AS skillProviderSecondPhone, sp.stateOfResidence, sp.city, sp.street, sp.address, 
                   sp.serviceType, sp.about, sp.skills, sp.subCategory, sp.openingHour, sp.referralCode, sp.imagePath, sp.isVerified, sp.latitude, sp.longitude,
                   sr.id AS reviewId, sr.customerId, c.firstName AS customerFirstName, c.lastName AS customerLastName, c.email AS customerEmail,
                   c.phone AS customerPhone, c.address AS customerAddress, sr.rating, sr.comment, sr.createdAt AS reviewCreatedAt
            FROM skill_providers sp
            LEFT JOIN skill_provider_reviews sr ON sp.id = sr.skillProviderId
            LEFT JOIN customers c ON sr.customerId = c.id
            WHERE sp.id = ?
        `;
        const rows = await query(queryText, [skillProviderId]);

        if (rows.length === 0) {
            throw new Error('Skill Provider not found');
        }

        const skillProvider = {
            id: rows[0].skillProviderId,
            firstName: rows[0].skillProviderFirstName,
            lastName: rows[0].skillProviderLastName,
            email: rows[0].skillProviderEmail,
            phone: rows[0].skillProviderPhone,
            secondPhone: rows[0].skillProviderSecondPhone,
            stateOfResidence: rows[0].stateOfResidence,
            city: rows[0].city,
            street: rows[0].street,
            address: rows[0].address,
            serviceType: rows[0].serviceType,
            about: rows[0].about,
            skills: rows[0].skills,
            subCategory: rows[0].subCategory,
            openingHour: rows[0].openingHour,
            referralCode: rows[0].referralCode,
            imagePath: rows[0].imagePath,
            isVerified: rows[0].isVerified,
            latitude: rows[0].latitude,
            longitude: rows[0].longitude,
            reviews: rows
                .filter(row => row.reviewId)  // Filter out rows without reviews
                .map(row => ({
                    id: row.reviewId,
                    customerId: row.customerId,
                    customerName: `${row.customerFirstName} ${row.customerLastName}`,
                    customerEmail: row.customerEmail,
                    customerPhone: row.customerPhone,
                    customerAddress: row.customerAddress,
                    rating: row.rating,
                    comment: row.comment,
                    createdAt: row.reviewCreatedAt
                }))
        };

        return skillProvider;
    } catch (error) {
        throw error;
    }
};

skillProviderReviewService.calculateAverageRating = async (skillProviderId) => {
    try {
        const avgRatingQuery = `
            SELECT AVG(rating) as averageRating
            FROM skill_provider_reviews
            WHERE skillProviderId = ?
        `;
        const result = await query(avgRatingQuery, [skillProviderId]);
        if (result.length === 0 || result[0].averageRating === null) {
            return { skillProviderId, averageRating: 0 };
        }
        return { skillProviderId, averageRating: result[0].averageRating };
    } catch (error) {
        throw error;
    }
};

skillProviderReviewService.calculateAverageRating = async (skillProviderId) => {
    try {
        const avgRatingQuery = `
            SELECT AVG(rating) as averageRating
            FROM skill_provider_reviews
            WHERE skillProviderId = ?
        `;
        const result = await query(avgRatingQuery, [skillProviderId]);
        if (result.length === 0 || result[0].averageRating === null) {
            return { skillProviderId, averageRating: 0 };
        }
        // Round to one decimal place
        const roundedAverageRating = parseFloat(result[0].averageRating).toFixed(1);
        return { skillProviderId, averageRating: roundedAverageRating };
    } catch (error) {
        throw error;
    }
};



module.exports = skillProviderReviewService;
