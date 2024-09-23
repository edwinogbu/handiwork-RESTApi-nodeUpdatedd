const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Import the 'path' module

const authRoutes = require('./routes/authRoutes');
const verifySkillProviderRoutes = require('./routes/verifySkillProviderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const skillProviderRoutes = require('./routes/skilledProviderRoutes');
const skillProviderTypesRoutes = require('./routes/skillProviderTypesRoutes');
const nigerianStatesRoutes = require('./routes/nigerianStatesRoutes');
// const conversationRoutes = require('./routes/conversationRoutes');
const chattingRoutes = require('./routes/chattingRoutes');
const skillTypeRoutes = require('./routes/skillTypeRoutes');
const customerReviewsRoutes = require('./routes/customerReviewsRoutes');
const skillProviderReviewRoutes = require('./routes/skillProviderReviewRoutes');
const walletAndTransactionsRoutes = require('./routes/walletAndTransactionsRoutes');
const paystackRoutes = require('./routes/paystackRoutes'); // Import the Paystack routes


const certificateRoutes = require('./routes/certificateRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');





const mysql = require('mysql');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register Swagger UI for each route
app.use('/api-docs/auth', swaggerUi.serve, swaggerUi.setup(authRoutes.swaggerDocument));
app.use('/api-docs/verify-providers', swaggerUi.serve, swaggerUi.setup(verifySkillProviderRoutes.swaggerDocument));
app.use('/api-docs/customers', swaggerUi.serve, swaggerUi.setup(customerRoutes.swaggerDocument));
app.use('/api-docs/skill-providers', swaggerUi.serve, swaggerUi.setup(skillProviderRoutes.swaggerDocument));
app.use('/api-docs/skills-subcategory', swaggerUi.serve, swaggerUi.setup(skillProviderTypesRoutes.swaggerDocument));
app.use('/api-docs/nigerian-states', swaggerUi.serve, swaggerUi.setup(nigerianStatesRoutes.swaggerDocument));
// app.use('/api-docs/chat', swaggerUi.serve, swaggerUi.setup(conversationRoutes.swaggerDocument));
app.use('/api-docs/chatting', swaggerUi.serve, swaggerUi.setup(chattingRoutes.swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/skill-providers', skillProviderRoutes);
app.use('/api/verify-providers', verifySkillProviderRoutes);
app.use('/api/skills-subcategory', skillProviderTypesRoutes);
app.use('/api/nigerian-states/states', nigerianStatesRoutes);
// app.use('/api/chat', conversationRoutes);
app.use('/api/chatting', chattingRoutes);
app.use('/api/skillType', skillTypeRoutes);
app.use('/api/customer-reviews', customerReviewsRoutes);
app.use('/api/skill-provider-reviews', skillProviderReviewRoutes);
app.use('/api/wallet', walletAndTransactionsRoutes);
app.use('/api/paystack', paystackRoutes);

// Use subscription routes
app.use('/api/subscription', subscriptionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(500).json({
        success: false,
        message: err.message
    });
})


// Use the certificate routes
app.use('/api', certificateRoutes);


app.use('/api-docs/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Start server
// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the API server');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');

// const authRoutes = require('./routes/authRoutes');
// const verifySkillProviderRoutes = require('./routes/verifySkillProviderRoutes');
// const customerRoutes = require('./routes/customerRoutes');
// const skillProviderRoutes = require('./routes/skilledProviderRoutes');
// const skillProviderTypesRoutes = require('./routes/skillProviderTypesRoutes');
// const nigerianStatesRoutes = require('./routes/nigerianStatesRoutes');
// // const conversationRoutes = require('./routes/conversationRoutes');
// const chattingRoutes = require('./routes/chattingRoutes');

// const mysql = require('mysql');
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger-output.json');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Database connection
// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });

// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to database:', err);
//         return;
//     }
//     console.log('Connected to database');
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/customers', customerRoutes);
// app.use('/api/skill-providers', skillProviderRoutes);
// app.use('/api/verify-providers', verifySkillProviderRoutes);
// app.use('/api/skills-subcategory', skillProviderTypesRoutes);
// app.use('/api/nigerian-states', nigerianStatesRoutes);
// // app.use('/api/chat', conversationRoutes);
// app.use('/api/chatting', chattingRoutes);


// // Default route
// app.get('/', (req, res) => {
//     res.send('Welcome to the API server');
// });

// app.use('/api-docs/api/auth', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// // Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const path = require('path');

// const authRoutes = require('./routes/authRoutes');
// const verifySkillProviderRoutes = require('./routes/verifySkillProviderRoutes');
// const customerRoutes = require('./routes/customerRoutes');
// const skillProviderRoutes = require('./routes/skilledProviderRoutes');
// const skillProviderTypesRoutes = require('./routes/skillProviderTypesRoutes');
// const nigerianStatesRoutes = require('./routes/nigerianStatesRoutes');

// const mysql = require('mysql');
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger-output.json');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Serve static files from the 'uploads' directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Database connection
// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });

// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to database:', err);
//         return;
//     }
//     console.log('Connected to database');
// });

// // Register Swagger UI for each route
// app.use('/api-docs/auth', swaggerUi.serve, swaggerUi.setup(authRoutes.swaggerDocument));
// app.use('/api-docs/verify-providers', swaggerUi.serve, swaggerUi.setup(verifySkillProviderRoutes.swaggerDocument));
// app.use('/api-docs/customers', swaggerUi.serve, swaggerUi.setup(customerRoutes.swaggerDocument));
// app.use('/api-docs/skill-providers', swaggerUi.serve, swaggerUi.setup(skillProviderRoutes.swaggerDocument));
// app.use('/api-docs/skills', swaggerUi.serve, swaggerUi.setup(skillProviderTypesRoutes.swaggerDocument));
// app.use('/api-docs/nigerian-states', swaggerUi.serve, swaggerUi.setup(nigerianStatesRoutes.swaggerDocument));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/customers', customerRoutes);
// app.use('/api/skill-providers', skillProviderRoutes);
// app.use('/api/verify-providers', verifySkillProviderRoutes);
// app.use('/api/skills', skillProviderTypesRoutes);
// app.use('/api/nigerian-states', nigerianStatesRoutes);

// // Default route
// app.get('/', (req, res) => {
//     res.send('Welcome to the API server.... Your One and Only Engr Eddy on Board');
// });

// // Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
