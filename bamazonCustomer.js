var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
});

display();

function display() {
    connection.query("SELECT * FROM products", function (err, res) {
        var table = new Table({
            head: ["ID", "Product Name", "Department", "Price", "Stock Qty"],
            colWidths: [6, 45, 16, 11, 11]
        });
    
        // table is an Array, so you can `push`, `unshift`, `splice`
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity],
            );
        }
        console.log(table.toString());
        start()
    });
};


function start() {
    inquirer.prompt([
        {
            type: "input",
            name: "itemID",
            message: "What is the ID of the item you would like to purchase? [Quit with Q]",
            validate: function(inputID) {
                if (inputID.toLowerCase() === "q") {
                    process.exit();
                }
                else if (!isNaN(inputID)) {
                    return true;
                }
                console.log("Please enter a valid ID.");
                return false;
            }
        },
        {
            type: "input",
            name: "quantity",
            message: "How many would you like? [Quit with Q]",
            validate: function(inputQ) {
                if (inputQ.toLowerCase() === "q") {
                    process.exit();
                }
                else if (!isNaN(inputQ)) {
                    return true;
                }
                console.log("Please enter a valid quantity.");
                return false;
            }
        }
    ]).then(function (answer) {

        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
     
            var chosenItem ="";
              for (var i = 0; i < res.length; i++) {
                if (res[i].item_id === parseInt(answer.itemID)) {
                  chosenItem = res[i];
                }
              }
              
              if (chosenItem.stock_quantity >= parseInt(answer.quantity)) {
                connection.query(
                  "UPDATE products SET ? WHERE ?",
                  [
                    {
                      stock_quantity: chosenItem.stock_quantity-=answer.quantity
                    },
                    {
                      item_id: chosenItem.item_id
                    }
                  ],
                  function(error) {
                    if (error) throw err;
                    var totalCost = answer.quantity * chosenItem.price;
                    console.log("Thank you. Successfully purchased "+ answer.quantity + " " + chosenItem.product_name + ".");
                    console.log("Your total cost is $"+ totalCost + ".");
                    display();
                  }
                );
              }
              else {
                console.log("Sorry. Insufficient quantity! Please select another item or change your quantity.");
                start();
              }
            });
    });

}


