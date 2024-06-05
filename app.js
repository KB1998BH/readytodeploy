const path = require('path');
const fs = require('fs');

const express = require('express');
var cors = require('cors')

const sequelize = require('./util/database');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');
const helmet = require('helmet')
const morgan = require('morgan');



const userRoutes = require('./routes/user')
const purchaseRoutes = require('./routes/purchase')
const resetPasswordRoutes = require('./routes/resetpassword')

const app = express();
const dotenv = require('dotenv');
const { Stream } = require('stream');

// get config vars
dotenv.config();

const accessLogStream = fs.createWriteStream(
path.join(__dirname, 'access.log'),
{flags:'a'}
);

app.use(cors());

// app.use(bodyParser.urlencoded());  ////this is for handling forms
app.use(express.json());  //this is for handling jsons

app.use('/user', userRoutes)


app.use('/purchase', purchaseRoutes)

app.use('/password', resetPasswordRoutes);

app.use(helmet());
app.use(morgan('combined', {stream:accessLogStream}))


User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(5510);
    })
    .catch(err => {
        console.log(err);
    })