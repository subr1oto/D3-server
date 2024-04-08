// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect database
// Connect to the MongoDB database using Mongoose

// const connectToDatabase = async () => {
//   await mongoose.connect(
//     "mongodb+srv://wardan_spices_db:Swi@tzer4@cluster0.khgiwqs.mongodb.net/"
//   );
//   console.log("database connected");
// };
mongoose
  .connect(
    "mongodb+srv://wardan_spices_db:wardan_spices_db@cluster0.khgiwqs.mongodb.net/sample_mflix"
  )
  .then(() => {
    console.log("Databse conected");
  })
  .catch((err) => {
    console.log("Error in connecting", err);
  });

// connectToDatabase();
// define schemas
const { Schema } = mongoose;

const userSchema = new Schema({
  id: Number,
  firstName: String,
  lastName: String,
  maidenName: String,
  age: Number,
  gender: String,
  email: String,
  phone: String,
  username: String,
  password: String,
  birthDate: String,
  image: String,
  bloodGroup: String,
  height: Number,
  weight: Number,
  eyeColor: String,
  hair: {
    color: String,
    type: String,
  },
  domain: String,
  ip: String,
  address: {
    address: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    postalCode: String,
    state: String,
  },
  macAddress: String,
  university: String,
  bank: {
    cardExpire: String,
    cardNumber: String,
    cardType: String,
    currency: String,
    iban: String,
  },
  company: {
    address: {
      address: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      postalCode: String,
      state: String,
    },
    department: String,
    name: String,
    title: String,
  },
  ein: String,
  ssn: String,
  userAgent: String,
  crypto: {
    coin: String,
    wallet: String,
    network: String,
  },
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/users", async (req, res) => {
  // Pagination, Sorting, and Global Filtering
  let query = User.find();
  let totalCountQuery = User.find(); // For total count calculation
  let globalFilterApplied = false;

  // Global Filtering
  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i");
    query = query.or([
      { firstName: { $regex: regex } },
      { email: { $regex: regex } },
      {
        age: isNaN(parseInt(req.query.search))
          ? ""
          : parseInt(req.query.search),
      },
    ]);
    totalCountQuery = totalCountQuery.or([
      { firstName: { $regex: regex } },
      { email: { $regex: regex } },
      {
        age: isNaN(parseInt(req.query.search))
          ? ""
          : parseInt(req.query.search),
      },
    ]);
    globalFilterApplied = true;
  }

  // Sorting
  const sortOptions = {};
  if (req.query.sort) {
    const sortFields = req.query.sort.split(",");
    sortFields.forEach((field) => {
      const [sortField, sortOrder] = field.split(":");
      sortOptions[sortField] = sortOrder;
    });
    query = query.sort(sortOptions);
  }

  // Pagination
  const totalCount = await totalCountQuery.countDocuments();
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  query = query.skip(startIndex).limit(limit);

  // Execute the query
  const users = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < totalCount) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // Send response
  res.status(200).json({
    count: users.length,
    totalCount: globalFilterApplied ? users.length : totalCount,
    pagination,
    data: users,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
