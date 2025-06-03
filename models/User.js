import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
    profilePicture: {
        type: String,
        default: "https://example.com/default-profile.png", 
    }
 
},
{
  timestamps: true
}
 );
const User = mongoose.model("User", userSchema);
export default User;