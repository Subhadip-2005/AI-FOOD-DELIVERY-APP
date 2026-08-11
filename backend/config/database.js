// const mongose = require("mongoose");
// const connectDatabase = () => {
  
//  mongose.connect(process.env.DB_URI).then((con)=>{
//     console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
//     console.log("DB_URI being used:", JSON.stringify(process.env.DB_URI));
//  })
// }
// module.exports = connectDatabase;
const mongose = require("mongoose");
const connectDatabase = () => {

  console.log("DB_URI being used:", JSON.stringify(process.env.DB_URI));

  mongose.connect(process.env.DB_URI).then((con)=>{
    console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
  }).catch((err) => {
    console.log("Mongoose connect() error:", err.message);
  });
}
module.exports = connectDatabase;