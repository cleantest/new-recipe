import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 8080;
const MONGO_URI = "mongodb://localhost:27017";
const DATABASE_NAME = "social_network";
const SECRET_KEY = "your_secret_key";
const STUDENT_ID = "M00922271";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// MongoDB Setup
let db;
MongoClient.connect(MONGO_URI)
  .then((client) => {
    db = client.db(DATABASE_NAME);
    console.log(`Connected to database: ${DATABASE_NAME}`);
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));


  app.get(`/${STUDENT_ID}/users/profile`, verifyToken, async (req, res) => {
    try {
      const uploads = await db
        .collection("contents")
        .find({ userId: new ObjectId(req.user.id) })
        .sort({ createdAt: -1 }) // Sort by most recent uploads
        .toArray();
  
      if (!uploads || uploads.length === 0) {
        return res.status(404).json({ message: "No uploads found." });
      }
  
      res.status(200).json(uploads);
    } catch (err) {
      console.error("Error fetching uploads:", err.message);
      res.status(500).json({ message: "Error fetching uploads.", error: err.message });
    }
  });
  

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error("Authorization header is missing.");
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    console.log("Token verified successfully:", decoded);
    next();
  } catch (err) {
    console.error("Invalid or expired token:", err.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

app.get(`/${STUDENT_ID}/users/search`, verifyToken, async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    console.error("Search query parameter is missing or empty.");
    return res.status(400).json({ message: "Search query parameter is required." });
  }

  try {
    const regex = new RegExp(q, "i"); // Case-insensitive search

    // Find all contents where uploadedBy matches the query
    const contents = await db
      .collection("contents")
      .find({ uploadedBy: { $regex: regex } })
      .toArray();

    if (!contents || contents.length === 0) {
      return res.status(404).json({ message: "No users or their uploads found." });
    }

    // Extract unique uploadedBy users and their associated content
    const usersWithUploads = contents.reduce((acc, content) => {
      const existingUser = acc.find((user) => user.uploadedBy === content.uploadedBy);
      if (existingUser) {
        existingUser.uploads.push({
          name: content.name,
          description: content.description,
        });
      } else {
        acc.push({
          uploadedBy: content.uploadedBy,
          uploads: [
            {
              name: content.name,
              description: content.description,
            },
          ],
        });
      }
      return acc;
    }, []);

    res.status(200).json(usersWithUploads);
  } catch (err) {
    console.error("Error searching users via contents:", err.message);
    res.status(500).json({ message: "Error searching users via contents.", error: err.message });
  }
});



// Default Route
app.get(`/${STUDENT_ID}`, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Register User
app.post(`/${STUDENT_ID}/users`, async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({ username, password: hashedPassword, email });

    res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err });
  }
});
   //login user
app.post(`/${STUDENT_ID}/login`, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await db.collection("users").findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    
  const token = jwt.sign({ id: user._id.toString(), username: user.username }, SECRET_KEY, {
     expiresIn: "1h",
});

    res.status(200).json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err });
  }
});



// Post Recipe
app.post(`/${STUDENT_ID}/contents`, verifyToken, async (req, res) => {
  const { name, description, ingredients } = req.body;

  if (!name || !description || !ingredients) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const recipe = {
      name,
      description,
      ingredients,
      uploadedBy: req.user.username,
      userId: new ObjectId(req.user.id),
      createdAt: new Date(),
    };
    await db.collection("contents").insertOne(recipe);
    res.status(201).json({ message: "Recipe shared successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error sharing recipe.", error: err });
  }
});



app.get(`/${STUDENT_ID}/users/:userId`, verifyToken, async (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { username: 1, bio: 1, profileImage: 1 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).json({ message: "Error fetching user profile", error: err.message });
  }
});

app.get(`/${STUDENT_ID}/users/:userId/recipes`, verifyToken, async (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { username: 1 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const recipes = await db.collection("contents").find({ userId: new ObjectId(userId) }).toArray();

    res.status(200).json({
      user: {
        username: user.username,
      },
      recipes,
    });
  } catch (err) {
    console.error("Error fetching user and recipes:", err.message);
    res.status(500).json({ message: "Error fetching user and recipes.", error: err.message });
  }
});



app.get(`/${STUDENT_ID}/users/:userId/recipes`, verifyToken, async (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { username: 1 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const recipes = await db.collection("contents").find({ userId: new ObjectId(userId) }).toArray();

    res.status(200).json({
      user: {
        username: user.username,
      },
      recipes,
    });
  } catch (err) {
    console.error("Error fetching user and recipes:", err.message);
    res.status(500).json({ message: "Error fetching user and recipes.", error: err.message });
  }
});




app.get(`/${STUDENT_ID}/contents/search`, verifyToken, async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: "Search query is required." });
  }

  try {
    const recipes = await db
      .collection("contents")
      .find({
        $or: [
          { name: { $regex: new RegExp(q, "i") } },
          { description: { $regex: new RegExp(q, "i") } },
        ],
      })
      .toArray();

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: "No recipes found matching the query." });
    }

    res.status(200).json(recipes);
  } catch (err) {
    console.error("Error searching recipes:", err.stack);
    res.status(500).json({ message: "Error searching recipes.", error: err.message });
  }
});


// Follow and Unfollow Functionality
app.post(`/${STUDENT_ID}/follow`, verifyToken, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    await db.collection("follows").updateOne(
      { userId: req.user.id },
      { $addToSet: { following: new ObjectId(userId) } },
      { upsert: true }
    );
    res.status(200).json({ message: "Followed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error following user", error: err });
  }
});
 // Get Following List and Count
app.get(`/${STUDENT_ID}/following`, verifyToken, async (req, res) => {
  try {
    const followingData = await db.collection("follows").findOne({ userId: req.user.id });
    const followingList = followingData ? followingData.following : [];
    res.status(200).json({ count: followingList.length, following: followingList });
  } catch (err) {
    res.status(500).json({ message: "Error fetching following data", error: err.message });
  }
});

app.delete(`/${STUDENT_ID}/follow`, verifyToken, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    await db.collection("follows").updateOne(
      { userId: req.user.id },
      { $pull: { following: new ObjectId(userId) } }
    );
    res.status(200).json({ message: "Unfollowed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error unfollowing user", error: err });
  }
});

// Fetch all recipes
app.get(`/${STUDENT_ID}/contents`, verifyToken, async (req, res) => {
  try {
    const contents = await db
      .collection("contents")
      .aggregate([
        {
          $lookup: {
            from: "users", // Reference the users collection
            localField: "userId", // Field in contents
            foreignField: "_id", // Matching field in users
            as: "uploader", // Alias for the joined data
          },
        },
        {
          $unwind: "$uploader", // Extract the first match from the array
        },
        {
          $project: {
            name: 1,
            description: 1,
            userId: "$userId", // Include userId
            uploadedBy: "$uploader.username", // Map username from the joined users collection
            createdAt: 1, // Include creation date
          },
        },
      ])
      .toArray();

    res.status(200).json(contents); // Return recipes
  } catch (err) {
    console.error("Error fetching recipes:", err.message);
    res.status(500).json({ message: "Error fetching recipes.", error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/${STUDENT_ID}`);
});
