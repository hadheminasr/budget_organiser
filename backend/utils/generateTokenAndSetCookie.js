import jwt from "jsonwebtoken";
export const generateTokenAndSetCookie = (res, _userId) => {
    const token =jwt.sign({userId:_userId},process.env.JWT_SECRET,{
        expiresIn:"7d",
    })

res.cookie("token", token, {
  httpOnly: true,
  secure: false,        // ✅ local (http)
  sameSite: "lax",      // ✅ important
  maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7 jours
});

return token ;
};
