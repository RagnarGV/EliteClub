const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/api/schedule", async (req, res) => {
  const schedule = await prisma.schedule.findMany({
    include: { games: true },
  });
  res.json(schedule);
});

app.post("/api/users", async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.create({
      phone: phone,
    });
    res.status(201).json({ message: "User saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving user", error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
