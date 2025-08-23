import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // demo-only; hash in prod
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
