// modules
const _ = require('dotenv').config(); 
const path = require('path');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const exphbs = require('express-handlebars');
const express = require('express');

const mongoConnector = require('./src/models/db.js');
const router = require('./src/routes/router.js');
const { loadCollections, loadProducts, processCsvData, loadVouchers  } = require('./src/routes/loader.js');

const app = express();


async function connectToDB (){
    try {
        mongoConnector();
        console.log(`Now connected to DB`);

    } catch (err){
        console.log(`Connection to DB failed`)
        console.log(err);
    }

}
const productsJson = "src/models/data/Orders.csv";

async function initializeLoad(){
    await loadCollections();
    await loadProducts();
    await processCsvData(productsJson);
    await loadVouchers();
}

function initializeHandlebars() {
    const { allowProtoMethodsByDefault, allowProtoPropertiesByDefault } = require('@handlebars/allow-prototype-access');
    // const exphbs = require('express-handlebars');
    app.engine("hbs", exphbs.engine({
        extname: "hbs",
        defaultLayout: false,
        helpers: {
            stockStatus: function(stock) {
                if (stock == 0) {
                    return "no";
                } else if (stock <= 3) {
                    return "low";
                } else {
                    return "high";
                }
            },
            formatDate: function(date) {
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return new Date(date).toLocaleDateString(undefined, options);
            },
            json: function(context) {
                return JSON.stringify(context);
            }
        },
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }
    }));
    app.set("view engine", "hbs");
    app.set("views", "./src/views");
}





function initializeStaticFolders() {
    app.use(express.static(path.join(__dirname, 'public')));

}

async function main() {
    initializeStaticFolders();
    initializeHandlebars();

    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use(router);
    // use routing file

    app.listen(process.env.SERVER_PORT, connectToDB());

    await initializeLoad();
    
}

main()