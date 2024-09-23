const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'HANDIWORK',
        description: 'The Handiwork API, developed by Edwin, equips Page Innovations developers with essential tools for crafting apps: techniques, materials, project ideas, pattern generation, community features, marketplace integration, customization, and analytics.'
    },
    host: 'https://handiworks.cosmossound.com.ng', // Update the host to match your domain
};

const outputFile = './swagger-output.json';
const routes = [
    './routes/authRoutes.js',
    './routes/verifySkillProviderRoutes.js',
    './routes/customerRoutes.js',
    './routes/skilledProviderRoutes.js',
    './routes/skillProviderTypesRoutes.js',
    './routes/nigerianStatesRoutes.js',
    './routes/conversationRoutes.js', // Add conversationRoutes.js
    './routes/chattingRoutes.js' // Add chattingRoutes.js
    // Add more routes as needed
];

swaggerAutogen(outputFile, routes, doc);


// const swaggerAutogen = require('swagger-autogen')();

// const doc = {
//     info: {
//         title: 'HANDIWORK',
//         description: 'The Handiwork API, developed by Edwin, equips Page Innovations developers with essential tools for crafting apps: techniques, materials, project ideas, pattern generation, community features, marketplace integration, customization, and analytics.'
//     },
//     host: 'localhost:5000'
// };

// const outputFile = './swagger-output.json';
// const routes = ['./routes/authRoutes.js'];

// /* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
// root file where the route starts, such as index.js, app.js, routes.js, etc ... */

// swaggerAutogen(outputFile, routes, doc);