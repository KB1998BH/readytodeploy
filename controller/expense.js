const Expense = require('../models/expenses');
// const {BlobServiceClient} = require('@azure/storage-blob')
// const {v1: uuidv1} = require('uuid');

const UserServices = require('../services/userservices')
const S3services = require('../services/S3services')


const addexpense = (req, res) => {
    const { expenseamount, description, category } = req.body;
    req.user.createExpense({ expenseamount, description, category }).then(expense => {
        return res.status(201).json({expense, success: true } );
    }).catch(err => {
        return res.status(403).json({success : false, error: err})
    })
}


// const getexpenses = (req, res)=> {
//     req.user.getExpenses().then(expenses => {
//         return res.status(200).json({expenses, success: true})
//     })
//     .catch(err => {
//         return res.status(402).json({ error: err, success: false})
//     })
// }


const getexpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Fetch paginated expenses and total count
        const result = await Expense.findAndCountAll({
            where: { userId },
            limit: limit,
            offset: offset
        });

        const expenses = result.rows;
        const totalItems = result.count;
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            expenses,
            totalItems,
            totalPages,
            currentPage: page,
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, success: false });
    }
};


const deleteexpense = (req, res) => {
    const expenseid = req.params.expenseid;
    Expense.destroy({where: { id: expenseid }}).then(() => {
        return res.status(204).json({ success: true, message: "Deleted Successfuly"})
    }).catch(err => {
        console.log(err);
        return res.status(403).json({ success: true, message: "Failed"})
    })
}

// const downloadExpenses = async(req, res) => {
//     try{
//         if(!req.user.ispremiumuser){
//             return res.status(401).json({success:false, message: 'user is not a premium user'})
//         }
//         const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

//         //create a Blobserviceclient object which will be used to create a container client
//         const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

//         // v.v.v.Imp - Guys create a unique name for the container
//         // Name them your "mailidexpensetracker" as there are other people also using the same storage
        
//         const containerName = 'bhuniakrish1998yahooexpensetracker'; // this needs to be unique name

//         console.log('\nCreating container...');
//         console.log('\t', containerName);

//         //Get a reference to a container 
//         const containerClient = await blobServiceClient.getContainerClient(containerName)

//         //check whether the conatiner exist or not 
//         if(!containerClient.exists()){
//             // create a conatiner if the conatiner doesn't exist 
//             const createContainerResponse = await containerClient.create({access:'conatiner'})

//         }

//         //Create a unique name for the blob 
//         const blobName = 'expense' + uuidv1() + '.txt';

//         //Get  a block blob client 
//         const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//         console.log('\nUploading to Azure storage as blob:\n\t', blobName);

//         // upload data to the blob as a string 
//         const data = JSON.stringify(await req.user.getExpenses());

//         const uploadBlobResponse = await blockBlobClient.upload(data, data.length)
//         console.log("Blob was uploaded successfully.requestId", JSON.stringify(uploadBlobResponse));

//         //we send the fileurl so that the in the frontend we can do a click on this url and download the file
//         const fileurl = `https://demostoragesharpener.blob.core.windows.net/${containerName}/${blobName}`;
//         res.status(201).json({fileurl, success:true})
//     }catch(err){
//         res.status(500).json({error:err, success:false, message:'something went wrong'})
//     }
// }

// function uploadToS3(data, filename){

//     const BUCKET_NAME = 'expensetrackingappkrishnendu';
//     const IAM_USER_KEY = 'AKIA3FLD3FDM5SDDUV24';
//     const IAM_USER_SECRET = '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';

//     let s3bucket = new AWS.S3({
//         accessKeyId: IAM_USER_KEY,
//         secretAccessKey: IAM_USER_SECRET,
//     })

//     s3bucket.createBucket(() => {
//         var params = {
//             Bucket:BUCKET_NAME,
//             Key: filename,
//             Body: data,
//             ACL: 'public-read'
//         }

//         return new Promise((resolve, reject) => {

//             s3bucket.upload(params, (err, s3response) => {
//                 if(err){
//                     console.log('Something went wrong', err);
//                     reject(err);
//                 }else{
//                     //console.log('success', s3response);
//                      resolve(s3response.Location);
//                 }
//             })
//         })
        
//     })
// }


const downloadExpenses = async(req, res) => {
    try{
    const expenses = await UserServices.getExpenses(req);
    console.log(expenses);
    const stringifiedExpenses = JSON.stringify(expenses)

    // itshould defined upon the userid;
    const userId = req.user.id;

    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await S3services.uploadToS3(stringifiedExpenses, filename)
    console.log(fileURL);
    res.status(200).json({fileURL, success:true})
    }catch(err){
        console.log(err);
        res.status(500).json({fileURL: '', success: false, err: err})
    }
}

module.exports = {
    deleteexpense,
    getexpenses,
    addexpense,
    downloadExpenses
}