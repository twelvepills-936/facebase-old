import mongoose from "mongoose";
import {
  ITransaction,
  IWallet,
  TransactionStatus,
} from "../models/walletModel.js";

const monitorWalletChanges = () => {
  // Change Streams требуют MongoDB Replica Set
  // В dev режиме отключаем для избежания ошибок
  if (process.env.NODE_ENV !== "production") {
    console.log("⚠️ Wallet Change Stream disabled in development mode");
    return;
  }

  const transactionCollection = mongoose.connection.collection("wallets");

  let changeStream: mongoose.mongo.ChangeStream | null = null;

  const startChangeStream = () => {
    try {
      changeStream = transactionCollection.watch();

      changeStream.on("change", async (change) => {
        switch (change.operationType) {
          case "update":
            const updatedFields = change.updateDescription?.updatedFields || {};
            const documentId = change.documentKey._id;

            if (updatedFields?.balance) {
              const wallet = await mongoose
                .model("Wallet")
                .findById(documentId);

              if (wallet) {
                wallet.total_earned += updatedFields.balance - wallet.balance;

                await wallet.save();
              }
            }

            const transactionKey = Object.keys(updatedFields).find((key) =>
              key.match(/^transactions\.\d+\.status$/)
            );

            if (transactionKey) {
              const match = transactionKey.match(
                /^transactions\.(\d+)\.status$/
              );

              if (match) {
                const transactionIndex = parseInt(match[1], 10);
                const newStatus = updatedFields[transactionKey];

                const wallet = await mongoose
                  .model("Wallet")
                  .findById(documentId);

                if (wallet && wallet.transactions[transactionIndex]) {
                  const transaction = wallet.transactions[transactionIndex];

                  await handleTransactionStatusChange(
                    wallet,
                    transaction,
                    newStatus
                  );

                  await wallet.save();
                }
              }
            }

            break;

          case "insert":
            console.log("Вставлен новый документ:", change.fullDocument);
            break;

          case "delete":
            console.log("Удален документ с ID:", change.documentKey._id);
            break;

          default:
            console.log("Другое событие:", change.operationType);
        }
      });

      changeStream.on("error", (error) => {
        console.error("Ошибка Change Stream:", error);
        restartChangeStream();
      });

      changeStream.on("close", () => {
        console.warn("Change Stream закрыт. Перезапуск...");
        restartChangeStream();
      });
    } catch (error) {
      console.error("Ошибка при запуске Change Stream:", error);
      setTimeout(restartChangeStream, 5000);
    }
  };

  const restartChangeStream = () => {
    if (changeStream) {
      changeStream.close();
    }
    startChangeStream();
  };

  startChangeStream();
};

const handleTransactionStatusChange = async (
  wallet: IWallet,
  transaction: ITransaction,
  newStatus: TransactionStatus
) => {
  switch (newStatus) {
    case "rejected":
      if (transaction.type === "withdrawal") {
        wallet.balance += transaction.amount;
        wallet.balance_available += transaction.amount;
      }
      break;

    case "approved":
      if (transaction.type === "withdrawal") {
        // wallet.balance -= transaction.amount;
      }
      break;

    case "completed":
      if (transaction.type === "deposit" || transaction.type === "receive") {
        wallet.balance += transaction.amount;
        wallet.total_earned += transaction.amount;
      }
      break;

    default:
      console.log(`Unhandled transaction status: ${newStatus}`);
  }

  transaction.status = newStatus;
};

export default monitorWalletChanges;
