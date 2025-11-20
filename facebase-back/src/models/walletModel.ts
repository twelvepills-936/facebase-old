import mongoose, { Schema, Document } from "mongoose";

export type TransactionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

export interface ITransaction {
  date: Date;
  type: "withdrawal" | "referral" | "deposit" | "receive";
  amount: number;
  status: TransactionStatus;
  description?: string;
  details?: string;
}

interface IWithdrawMethod {
  type: "crypto_wallet" | "bank_account";
  details: string;
}

export interface IWallet extends Document {
  user: Schema.Types.ObjectId;
  balance: number;
  total_earned: number;
  balance_available: number;
  transactions: ITransaction[];
  withdrawMethods: IWithdrawMethod[];
}

const TransactionSchema = new Schema<ITransaction>({
  date: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ["withdrawal", "referral", "deposit", "receive"],
    required: true,
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  description: { type: String },
  details: { type: String },
});

const WithdrawMethodSchema = new Schema<IWithdrawMethod>({
  type: {
    type: String,
    enum: ["crypto_wallet", "bank_account"],
    required: true,
  },
  details: { type: String, required: true },
});

const WalletSchema = new Schema<IWallet>({
  user: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
  balance: { type: Number, default: 0 },
  total_earned: { type: Number, default: 0 },
  balance_available: { type: Number, default: 0 },
  transactions: [TransactionSchema],
  withdrawMethods: [WithdrawMethodSchema],
});

export default mongoose.model<IWallet>("Wallet", WalletSchema);
