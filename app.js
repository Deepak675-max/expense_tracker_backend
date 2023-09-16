require('dotenv').config();
const express = require('express');

const httpErrors = require("http-errors");

const cors = require("cors");

const expesneRoutes = require("./routes/expense.route");
const authRoutes = require("./routes/user.route");
const User = require('./models/user.model');
const Expense = require('./models/expense.model');

const sequelize = require('./helper/common/init_mysql');
const verifyUser = require('./middlewares/auth.middlewares');

const expenseTrackerBackendApp = express();

expenseTrackerBackendApp.use(express.json());

expenseTrackerBackendApp.use(cors());

expenseTrackerBackendApp.use("/api/expense", verifyUser, expesneRoutes);
expenseTrackerBackendApp.use("/api/auth", authRoutes);


expenseTrackerBackendApp.use(async (req, _res, next) => {
    console.log(req, _res);
    next(httpErrors.NotFound(`Route not Found for [${req.method}] ${req.url}`));
});

// Common Error Handler
expenseTrackerBackendApp.use((error, req, res, next) => {
    const responseStatus = error.status || 500;
    const responseMessage =
        error.message || `Cannot resolve request [${req.method}] ${req.url}`;
    if (res.headersSent === false) {
        res.status(responseStatus);
        res.send({
            error: {
                status: responseStatus,
                message: responseMessage,
            },
        });
    }
    next();
});


User.hasMany(Expense);

const port = 3000;

sequelize.sync({ alter: true })
    .then(() => {
        expenseTrackerBackendApp.listen(port, () => {
            console.log(`server is listening on the port of ${port}`);
        })
    })
    .catch(error => {
        console.log(error);
        process.exit(0);
    })



