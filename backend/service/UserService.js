import { User } from "../models/User.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendWelcomeEmail, sendVerificationEmail } from "../mailtrap/emails.js";
import bcryptjs from "bcryptjs";
export const UserService ={
    async getUser(userId) {
        const user = await User.findById(userId).select("-password");
        if (!user) throw new Error("User not found");
        return user;
      },
    async getAllUsers(activeBol) {
        const filter = { isActive: activeBol };
        const users = await User.find().select("-password");
        const nbUsers = await User.countDocuments();
        const active = await User.countDocuments({ filter});

    return { users, nbUsers, active }; 
  },
    /*async getAllUsers(active) {
  const users = await User.find().select("-password");
  const nbUsers = users.length;

  // ✅ accepte "true"/"false" OU true/false
  let activeBool = undefined;

  if (active === undefined) {
    activeBool = undefined;
  } else if (typeof active === "string") {
    activeBool = active === "true";
  } else {
    activeBool = Boolean(active);
  }

  let Active = [];

  if (activeBool === undefined) {
    Active = users; // pas de filtre => tout
  } else {
    Active = users.filter((u) => u.isActive === activeBool); // ✅ boolean vs boolean
  }

  return {
    users,
    nbUsers,
    Active,
    ActiveCount: Active.length,
  };
},*/

    async updateUser(id, updates) {
      const user = await User.findByIdAndUpdate(id,{$set: updates},{new:true}).select("-password");
      if (!user) throw new Error ("User not found") ;
      return user;

    },
    
    async deleteUser(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new Error("User not found");
        return true;
    },
    async addUser(data, res) {
      const { nom, prenom, email, password } = data;  
    
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("Email already in use");
      }
      const hashedPassword = await bcryptjs.hash(password, 10);
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const newUser = await User.create({
      email,
      password: hashedPassword,
      nom,
      prenom,
      role: "user",
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
      const code = await generateUniqueShareCode(Account);
      generateTokenAndSetCookie(res, newUser._id);
      await sendWelcomeEmail(newUser.email, nom);
      await sendVerificationEmail(newUser.email, verificationToken);
      const safeUser = await User.findById(newUser._id).select("-password");
      return safeUser;
    },
};
