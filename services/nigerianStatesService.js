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

// Function to create NigerianStates table if it doesn't exist
async function createNigerianStatesTable() {
    const createNigerianStatesTableQuery = `
        CREATE TABLE IF NOT EXISTS nigerian_states (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            capital VARCHAR(255) NOT NULL,
            state_code VARCHAR(10) NOT NULL,
            creation_date DATE NOT NULL,
            latitude VARCHAR(20) NOT NULL,
            longitude VARCHAR(20) NOT NULL,
            total_area INT,
            population INT,
            postal_code INT,
            religions JSON,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    try {
        await query(createNigerianStatesTableQuery);
        console.log('NigerianStates table created successfully');
    } catch (error) {
        console.error('Error creating NigerianStates table:', error);
        throw error;
    }
}

// Function to create Towns table if it doesn't exist
async function createTownsTable() {
    const createTownsTableQuery = `
        CREATE TABLE IF NOT EXISTS towns (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            population INT,
            postal_code VARCHAR(20),
            total_area DECIMAL(10, 2),
            creation_date DATE,
            state_id INT,
            FOREIGN KEY (state_id) REFERENCES nigerian_states(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `;
    try {
        await query(createTownsTableQuery);
        console.log('Towns table created successfully');
    } catch (error) {
        console.error('Error creating Towns table:', error);
        throw error;
    }
}

createNigerianStatesTable(); // Immediately create the NigerianStates table on module load
createTownsTable(); // Immediately create the Towns table on module load

const nigerianStatesService = {};

// Function to create a new Nigerian state
nigerianStatesService.createNigerianState = async (stateData) => {
    try {
        const {
            name,
            capital,
            state_code,
            creation_date,
            latitude,
            longitude,
            total_area,
            population,
            postal_code,
            religions
        } = stateData;

        // Insert state data into the NigerianStates table
        const insertQuery = `
            INSERT INTO nigerian_states (name, capital, state_code, creation_date, latitude, longitude, total_area, population, postal_code, religions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await query(insertQuery, [
            name,
            capital,
            state_code,
            creation_date,
            latitude,
            longitude,
            total_area,
            population,
            postal_code,
            JSON.stringify(religions)
        ]);

        return { id: result.insertId, ...stateData };
    } catch (error) {
        throw error;
    }
};

// Function to get Nigerian state by ID
nigerianStatesService.getNigerianStateById = async (id) => {
    try {
        const selectQuery = 'SELECT * FROM nigerian_states WHERE id = ?';
        const state = await query(selectQuery, [id]);
        return state[0];
    } catch (error) {
        throw error;
    }
};

// Function to get all Nigerian states
nigerianStatesService.getAllNigerianStates = async () => {
    try {
        const selectAllQuery = 'SELECT * FROM nigerian_states';
        const states = await query(selectAllQuery);
        return states;
    } catch (error) {
        throw error;
    }
};

// Function to update Nigerian state by ID
nigerianStatesService.updateNigerianState = async (id, stateData) => {
    try {
        const {
            name,
            capital,
            state_code,
            creation_date,
            latitude,
            longitude,
            total_area,
            population,
            postal_code,
            religions
        } = stateData;

        // Prepare update query based on changed fields
        const updateFields = Object.entries(stateData).filter(([key, value]) => key !== 'id' && value !== undefined);
        const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
        const updateParams = updateFields.map(([key, value]) => value);

        // Add stateId at the end of updateParams
        updateParams.push(id);

        // Update state data in the database
        const updateQuery = `
            UPDATE nigerian_states 
            SET ${updateValues}
            WHERE id=?
        `;
        await query(updateQuery, [...updateParams]);

        // Return updated state data
        return { id, ...stateData };
    } catch (error) {
        throw error;
    }
};

// Function to delete Nigerian state by ID
nigerianStatesService.deleteNigerianState = async (id) => {
    try {
        const deleteQuery = 'DELETE FROM nigerian_states WHERE id = ?';
        await query(deleteQuery, [id]);
        return { id };
    } catch (error) {
        throw error;
    }
};


// Function to get cities in a specific Nigerian state by state code
nigerianStatesService.getCitiesByStateCode = async (stateCode) => {
    try {
        const selectCitiesQuery = `
            SELECT towns.*
            FROM towns
            INNER JOIN nigerian_states ON towns.state_id = nigerian_states.id
            WHERE nigerian_states.state_code = ?
        `;
        const cities = await query(selectCitiesQuery, [stateCode]);
        
        // Format the cities data as required
        const formattedCities = cities.map(city => ({
            name: city.name,
            location: {
                latitude: city.latitude || null,
                longitude: city.longitude || null
            },
            population: city.population || null,
            postal_code: city.postal_code || null,
            total_area: city.total_area || null,
            creation_date: city.creation_date || null
        }));
        
        return formattedCities;
    } catch (error) {
        throw error;
    }
};



// Function to create a new town
nigerianStatesService.createTown = async (townData) => {
    try {
        const {
            name,
            latitude,
            longitude,
            population,
            postal_code,
            total_area,
            creation_date,
            state_id
        } = townData;

        // Insert town data into the towns table
        const insertQuery = `
            INSERT INTO towns (name, latitude, longitude, population, postal_code, total_area, creation_date, state_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await query(insertQuery, [
            name,
            latitude,
            longitude,
            population,
            postal_code,
            total_area,
            creation_date,
            state_id
        ]);

        return { id: result.insertId, ...townData };
    } catch (error) {
        throw error;
    }
};

// Function to get all towns by state code
nigerianStatesService.getAllTownsByStateCode = async (stateCode) => {
    try {
        const selectTownsQuery = 'SELECT * FROM towns WHERE state_code = ?';
        const towns = await query(selectTownsQuery, [stateCode]);
        return towns;
    } catch (error) {
        throw error;
    }
};


// Function to get towns by state code
nigerianStatesService.getTownsByStateCode = async (stateCode) => {
    try {
        const selectTownsQuery = `
        SELECT towns.*
        FROM towns
        INNER JOIN nigerian_states ON towns.state_id = nigerian_states.id
        WHERE nigerian_states.state_code = ?
            )
        `;
        const towns = await query(selectTownsQuery, [stateCode]);
        
        // Check if towns array is empty
        if (towns.length === 0) {
            return null;
        }
        
        // Format the towns data as required
        const formattedTowns = towns.map(town => ({
            name: town.name,
            location: {
                latitude: town.latitude || null,
                longitude: town.longitude || null
            },
            population: town.population || null,
            postal_code: town.postal_code || null,
            total_area: town.total_area || null,
            creation_date: town.creation_date || null
        }));
        
        return formattedTowns;
    } catch (error) {
        throw error;
    }


    // try {
    //     const selectCitiesQuery = `
    //         SELECT towns.*
    //         FROM towns
    //         INNER JOIN nigerian_states ON towns.state_id = nigerian_states.id
    //         WHERE nigerian_states.state_code = ?
    //     `;
    //     const towns = await query(selectCitiesQuery, [stateCode]);
        
    //     // Format the cities data as required
    //     const formattedTowns = towns.map(city => ({
    //         name: city.name,
    //         location: {
    //             latitude: city.latitude || null,
    //             longitude: city.longitude || null
    //         },
    //         population: city.population || null,
    //         postal_code: city.postal_code || null,
    //         total_area: city.total_area || null,
    //         creation_date: city.creation_date || null
    //     }));
        
    //     return formattedTowns;
    // } catch (error) {
    //     throw error;
    // }
};



module.exports = nigerianStatesService;




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


// // Function to create NigerianStates table if it doesn't exist
// async function createNigerianStatesTable() {
//     const createNigerianStatesTableQuery = `
//         CREATE TABLE IF NOT EXISTS nigerian_states (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             name VARCHAR(255) NOT NULL,
//             capital VARCHAR(255) NOT NULL,
//             state_code VARCHAR(10) NOT NULL,
//             creation_date VARCHAR(10) NOT NULL,
//             latitude VARCHAR(20) NOT NULL,
//             longitude VARCHAR(20) NOT NULL,
//             total_area INT,
//             population INT,
//             postal_code INT,
//             religions JSON,
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         )
//     `;
//     try {
//         await query(createNigerianStatesTableQuery);
//         console.log('NigerianStates table created successfully');
//     } catch (error) {
//         console.error('Error creating NigerianStates table:', error);
//         throw error;
//     }
// }

// createNigerianStatesTable(); // Immediately create the table on module load

// const nigerianStatesService = {};

// // Function to create a new Nigerian state
// nigerianStatesService.createNigerianState = async (stateData) => {
//     try {
//         const {
//             name,
//             capital,
//             state_code,
//             creation_date,
//             latitude,
//             longitude,
//             total_area,
//             population,
//             postal_code,
//             religions
//         } = stateData;

//         // Insert state data into the NigerianStates table
//         const insertQuery = `
//             INSERT INTO nigerian_states (name, capital, state_code, creation_date, latitude, longitude, total_area, population, postal_code, religions)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const result = await query(insertQuery, [
//             name,
//             capital,
//             state_code,
//             creation_date,
//             latitude,
//             longitude,
//             total_area,
//             population,
//             postal_code,
//             JSON.stringify(religions)
//         ]);

//         return { id: result.insertId, ...stateData };
//     } catch (error) {
//         throw error;
//     }
// };


// // // Function to get Nigerian state by ID
// // nigerianStatesService.getNigerianStateById = async (id) => {
// //     try {
// //         const selectQuery = 'SELECT * FROM nigerian_states WHERE id = ?';
// //         const state = await query(selectQuery, [id]);
// //         return state[0];
// //     } catch (error) {
// //         throw error;
// //     }
// // };

// // // Function to get all Nigerian states
// // nigerianStatesService.getAllNigerianStates = async () => {
// //     try {
// //         const selectAllQuery = 'SELECT * FROM nigerian_states';
// //         const nigerianStates = await query(selectAllQuery);

// //         // Check if customers array is empty
// //         if (nigerianStates.length === 0) {
// //             return { message: "nigerian states table is empty" };
// //         }

// //         return nigerianStates;
// //     } catch (error) {
// //         throw error;
// //     }
// // };


// // // Function to update Nigerian state by ID
// // nigerianStatesService.updateNigerianState = async (id, stateData) => {
// //     try {
// //         const {
// //             name,
// //             capital,
// //             state_code,
// //             creation_date,
// //             latitude,
// //             longitude,
// //             total_area,
// //             population,
// //             postal_code,
// //             religions
// //         } = stateData;

// //         // Prepare update query based on changed fields
// //         const updateFields = Object.entries(stateData).filter(([key, value]) => key !== 'id' && value !== undefined);
// //         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
// //         const updateParams = updateFields.map(([key, value]) => value);

// //         // Add stateId at the end of updateParams
// //         updateParams.push(id);

// //         // Update state data in the database
// //         const updateQuery = `
// //             UPDATE nigerian_states 
// //             SET ${updateValues}
// //             WHERE id=?
// //         `;
// //         await query(updateQuery, [...updateParams]);

// //         // Return updated state data
// //         return { id, ...stateData };
// //     } catch (error) {
// //         throw error;
// //     }
// // };

// // // Function to delete Nigerian state by ID
// // nigerianStatesService.deleteNigerianState = async (id) => {
// //     try {
// //         const deleteQuery = 'DELETE FROM nigerian_states WHERE id = ?';
// //         await query(deleteQuery, [id]);
// //         return { id };
// //     } catch (error) {
// //         throw error;
// //     }
// // };


// // Function to get Nigerian state by ID
// nigerianStatesService.getNigerianStateById = async (id) => {
//     try {
//         const selectQuery = 'SELECT * FROM nigerian_states WHERE id = ?';
//         const state = await query(selectQuery, [id]);
//         return state[0];
//     } catch (error) {
//         throw error;
//     }
// };


// // Function to get all Nigerian states
// // nigerianStatesService.getAllNigerianStates = async () => {
// //     try {
// //         const selectAllQuery = 'SELECT * FROM nigerian_states';
// //         const states = await query(selectAllQuery);
// //         return states;
// //     } catch (error) {
// //         throw error;
// //     }
// // };


// nigerianStatesService.getAllNigerianStates = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM nigerian_states';
//         const states = await query(selectAllQuery);
//         return states;
//     } catch (error) {
//         throw error;
//     }
// };


// // Function to get all Nigerian states
// // nigerianStatesService.getAllNigerianStates = async () => {
// //     try {
// //         const selectAllQuery = `
// //             SELECT 
// //                 name,
// //                 capital,
// //                 state_code,
// //                 creation_date,
// //                 location_latitude AS "location.latitude",
// //                 location_longitude AS "location.longitude",
// //                 total_area,
// //                 population,
// //                 postal_code,
// //                 ARRAY[]::varchar[] AS religions
// //             FROM NigerianStates;
// //         `;
// //         const states = await query(selectAllQuery);
// //         return states;
// //     } catch (error) {
// //         throw error;
// //     }
// // };



// // Function to update Nigerian state by ID
// nigerianStatesService.updateNigerianState = async (id, stateData) => {
//     try {
//         const {
//             name,
//             capital,
//             state_code,
//             creation_date,
//             latitude,
//             longitude,
//             total_area,
//             population,
//             postal_code,
//             religions
//         } = stateData;

//         // Prepare update query based on changed fields
//         const updateFields = Object.entries(stateData).filter(([key, value]) => key !== 'id' && value !== undefined);
//         const updateValues = updateFields.map(([key, value]) => `${key}=?`).join(', ');
//         const updateParams = updateFields.map(([key, value]) => value);

//         // Add stateId at the end of updateParams
//         updateParams.push(id);

//         // Update state data in the database
//         const updateQuery = `
//             UPDATE nigerian_states 
//             SET ${updateValues}
//             WHERE id=?
//         `;
//         await query(updateQuery, [...updateParams]);

//         // Return updated state data
//         return { id, ...stateData };
//     } catch (error) {
//         throw error;
//     }
// };

// // Function to delete Nigerian state by ID
// nigerianStatesService.deleteNigerianState = async (id) => {
//     try {
//         const deleteQuery = 'DELETE FROM nigerian_states WHERE id = ?';
//         await query(deleteQuery, [id]);
//         return { id };
//     } catch (error) {
//         throw error;
//     }
// };


// // Function to get cities in a specific Nigerian state by state code
// nigerianStatesService.getCitiesByStateCode = async (stateCode) => {
//     try {
//         const selectCitiesQuery = 'SELECT * FROM nigerian_states WHERE state_code = ?';
//         const cities = await query(selectCitiesQuery, [stateCode]);
        
//         // Format the cities data as required
//         const formattedCities = cities.map(city => ({
//             name: city.name,
//             location: {
//                 latitude: city.latitude || null,
//                 longitude: city.longitude || null
//             },
//             population: city.population || null,
//             postal_code: city.postal_code || null,
//             total_area: city.total_area || null,
//             creation_date: city.creation_date || null
//         }));
        
//         return formattedCities;
//     } catch (error) {
//         throw error;
//     }
// };


// module.exports = nigerianStatesService;
