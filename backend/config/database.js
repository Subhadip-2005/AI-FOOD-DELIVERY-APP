const mongose = require("mongoose");
const connectDatabase = () => {
  
 mongose.connect(process.env.DB_URI).then((con)=>{
    console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
 })
}
module.exports = connectDatabase;