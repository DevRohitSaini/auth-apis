import User from "../model/user.js";
import bcrypt from "bcryptjs";
import "dotenv/config";
import generateTokens from "../utils/jwt-token.js";

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    //1. validate user fields

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // validate strong password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Choose a strong password with at least 8 characters, including lowercase, uppercase, a number, and a symbol.",
      });
    }

    //2. Check whether the email already exists

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    //3.  Hash the password

    const saltRounds = Number(process.env.SOLTROUNDS);
    if (!Number.isInteger(saltRounds) || saltRounds < 4 || saltRounds > 31) {
      throw new Error("SOLTROUNDS must be an integer between 4 and 31");
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    //4.  Create the user

    const userDate = {
      fullName: fullName,
      email: email,
      passwordHash: passwordHash,
    };

    const newUser = await User.create(userDate);

    //5. Get JWt token
    const tokens = await generateTokens(newUser._id, newUser.email);

    //6. Return safe user data only

    const safeUser = newUser.toObject();
    delete safeUser.passwordHash;
    delete safeUser.createdAt;
    delete safeUser.updatedAt;
    delete safeUser.__v;

    return res.status(201).json({
      message: "Registration successful",
      accessToken: tokens.accessToken,
      user: safeUser,
    });
  } catch (error) {
    if (error.code == 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate user data
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    //find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "invalid email or password" });
    }

    //validate password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "invalid email or password" });
    }

    //generate jwt token
    const tokens = await generateTokens(user._id, user.email);

    //Send token and safe user details
    const safeUser = user.toObject();
    delete safeUser.passwordHash;
    delete safeUser.createdAt;
    delete safeUser.updatedAt;
    delete safeUser.__v;

    return res.status(200).json({
      message: "Login successful",
      accessToken: tokens.accessToken,
      user: safeUser,
    });
  } catch (error) {
    console.log("Login Error: ", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
