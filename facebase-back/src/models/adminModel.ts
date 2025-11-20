import mongoose from "mongoose";
import bcrypt from "bcryptjs";

interface IAdmin {
  email: string;
  password: string;
  role: "admin" | "superadmin";
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IAdminModel extends mongoose.Model<IAdmin> {}

const adminSchema = new mongoose.Schema<IAdmin, IAdminModel>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model<IAdmin, IAdminModel>("Admin", adminSchema);

export default Admin;
