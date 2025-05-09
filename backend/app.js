const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); 
const app = express();
// const BASE_URL = 'https://2718-175-101-32-83.ngrok-free.app';
const BASE_URL = 'https://bbea-2401-4900-1c26-3294-80dd-2292-5715-96dd.ngrok-free.app';
app.use(express.json());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: "himakiranmudambi@gmail.com", 
    pass: "aqbakenckktziiws", 
  },
});

// MongoDB connection
const mongoUrl = "mongodb+srv://himakiranmudambi:Admin@cluster0.j0nrst0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoUrl)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err.message));

require('./userDetails');
const User = mongoose.model("UserInfo");

app.get("/", (req, res) => {
  res.send({ status: "started" });
});

// Register route with verification token
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(201).send({ data: "User Already Exists!" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user with verification token and isVerified flag
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      isVerified: false,
    });

    // Send verification email
    // const verificationUrl = `http://192.168.1.12:5000/verify/${verificationToken}`;
    const verificationUrl = `${BASE_URL}/verify/${verificationToken}`;
    const mailOptions = {
      from: "himakiranmudambi@gmail.com",
      to: email,
      subject: "Verify Your Email",
      html: `<h4>Please verify your email for our E-Commerce Application</h4>
             <p>Click <a href="${verificationUrl}">here</a> to verify your email</p>`,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(201).send({ 
      status: "ok", 
      data: "User Created. Please check your email to verify your account" 
    });
  } catch (error) {
    res.status(500).send({ status: "error", data: error.message });
  }
});

// Verify email route
app.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send({ status: "error", data: "Invalid or expired token" });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.status(200).send({ 
      status: "ok", 
      data: "Email verified successfully" 
    });
  } catch (error) {
    res.status(500).send({ status: "error", data: error.message });
  }
});

// Login route (modified to check verification status)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ status: "error", data: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ status: "error", data: "User does not exist" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).send({ status: "error", data: "Please verify your email first" });
    }

    // Compare passwords
    if (user.password !== password) {
      return res.status(400).send({ status: "error", data: "Incorrect password" });
    }

    res.status(200).send({
      status: "ok",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).send({ status: "error", data: error.message });
  }
});

// Get user details for profile
app.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await User.findById(id).select("name email isVerified"); // Select specific fields to return

    if (!user) {
      return res.status(404).send({ status: "error", data: "User not found" });
    }

    res.status(200).send({
      status: "ok",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).send({ status: "error", data: error.message });
  }
});

app.listen(5000, '0.0.0.0', () => {
  console.log("Node.js server is started on port 5000");
});





























// const express = require("express");
// const mongoose = require("mongoose");
// const app = express();
// app.use(express.json());

// const mongoUrl = "mongodb+srv://himakiranmudambi:Admin@cluster0.j0nrst0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// mongoose.connect(mongoUrl)
//   .then(() => {
//     console.log("Database connected");
//   })
//   .catch((err) => {
//     console.error("Database connection failed:", err.message);
//   });

// require('./userDetails');
// const User = mongoose.model("UserInfo");

// app.get("/", (req, res) => {
//   res.send({ status: "started" });
// });


// app.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   const oldUser = await User.findOne({ email: email });

//   if (oldUser) {
//     return res.status(201).send({ data: "User Already Exists!" });
//   }

//   try {
//     await User.create({
//       name,
//       email,
//       password,
//     });
//     res.status(201).send({ status: "ok", data: "User Created" });
//   } catch (error) {
//     res.status(500).send({ status: "error", data: error.message });
//   }
// });

// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;
  
//     if (!email || !password) {
//       return res.status(400).send({ status: "error", data: "Email and password are required" });
//     }
  
//     try {
//       const user = await User.findOne({ email: email });
//       if (!user) {
//         return res.status(400).send({ status: "error", data: "User does not exist" });
//       }
  
//       // Compare plain text passwords
//       if (user.password !== password) {
//         return res.status(400).send({ status: "error", data: "Incorrect password" });
//       }
  
//       res.status(200).send({
//         status: "ok",
//         data: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//         },
//       });
//     } catch (error) {
//       res.status(500).send({ status: "error", data: error.message });
//     }
//   });

// app.listen(5000, () => {
//   console.log("Node.js server is started on port 5000");
// });

