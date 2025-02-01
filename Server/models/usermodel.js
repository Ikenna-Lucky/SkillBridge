import mongoose from "mongoose"; // Mongoose is an Obj data modelling which helps us to interact with the DB using Javascript Obj instead of using  working directly with the native MongoDB driver

//Creation of Schema- Basically the structure and what you want to store in your db.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true },
  //Not required because it will be added to any new user
  verifyOtp: { type: String, default: "" },
  verifyOtpExpiredAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpiredAt: { type: Number, default: 0 },
});

//Using userSchema , we create the userModel
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
