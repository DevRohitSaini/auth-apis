import jwt from "jsonwebtoken";
import "dotenv/config";

const generateTokens = async (userID,email) => {
  const accessToken = jwt.sign(
    { userID: userID, email: email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return {accessToken: accessToken};

};

export default generateTokens;
