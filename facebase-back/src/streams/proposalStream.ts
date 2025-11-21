import mongoose from "mongoose";
import ProposalModel from "../models/proposalModel.js";
import ProfileModel from "../models/profileModel.js";
import ProjectModel from "../models/projectModel.js";
import WalletModel from "../models/walletModel.js";
import { sendTelegramNotification } from "../telegramBot/index.js";
import { telegramWebAppLink } from "../constants/index.js";

const REFERRAL_PERCENT = 7;

const monitorProposalChanges = () => {
  // Change Streams требуют MongoDB Replica Set
  // В dev режиме отключаем для избежания ошибок
  if (process.env.NODE_ENV !== "production") {
    console.log("⚠️ Proposal Change Stream disabled in development mode");
    return;
  }

  const proposalCollection = mongoose.connection.collection("proposals");

  let changeStream: mongoose.mongo.ChangeStream | null = null;

  const startChangeStream = () => {
    try {
      changeStream = proposalCollection.watch();

      changeStream.on("change", async (change) => {
        switch (change.operationType) {
          case "update":
            const updatedFields = change.updateDescription?.updatedFields || {};
            const documentId = change.documentKey._id;

            if (updatedFields["status.value"] === "approved") {
              try {
                const currentProposal = await ProposalModel.findById(
                  documentId
                );

                if (!currentProposal) {
                  console.error(`Proposal with ID ${documentId} not found`);
                  return;
                }

                const projectByProposal = await ProjectModel.findById(
                  currentProposal.projectId
                );

                if (!projectByProposal) {
                  console.error(
                    `Project with ID ${currentProposal.projectId} not found`
                  );
                  return;
                }

                const proposalInitiator = await ProfileModel.findById(
                  currentProposal.initiatorId
                );

                if (!proposalInitiator) {
                  console.error(
                    `Initiator with ID ${currentProposal.initiatorId} not found`
                  );
                  return;
                }

                const proposalInitiatorWallet = await WalletModel.findOne({
                  user: currentProposal.initiatorId,
                });

                if (!proposalInitiatorWallet) {
                  console.error(`Initiator wallet not found`);
                  return;
                }

                const webAppProjectLink =
                  process.env.TELEGRAM_APP_LINK +
                  "?startapp=" +
                  btoa(`projectId|${projectByProposal._id}`);

                sendTelegramNotification(
                  proposalInitiator.telegram_id,
                  `Задание для проекта ${projectByProposal.title} прошло проверку и было одобрено!`,
                  [
                    {
                      text: "Посмотреть в приложении",
                      url: webAppProjectLink,
                    },
                  ]
                );

                proposalInitiatorWallet.balance += projectByProposal.reward;
                proposalInitiatorWallet.balance_available +=
                  projectByProposal.reward;
                proposalInitiatorWallet.total_earned +=
                  projectByProposal.reward;

                proposalInitiatorWallet.transactions.push({
                  date: new Date(),
                  type: "receive",
                  amount: projectByProposal.reward,
                  status: "completed",
                  description: `Payment for advertising assignment for ${projectByProposal.title}`,
                });

                await proposalInitiatorWallet.save();

                const referrerOfInitiator = await ProfileModel.findOne({
                  "referrals.profile": proposalInitiator._id,
                });

                if (!referrerOfInitiator) {
                  console.log(
                    `No referrer found for user ${proposalInitiator._id}`
                  );
                  return;
                }

                const referralBonus =
                  (projectByProposal.reward * REFERRAL_PERCENT) / 100;

                const referralIndex = referrerOfInitiator.referrals.findIndex(
                  (referral) =>
                    referral.profile.toString() ===
                    currentProposal.initiatorId.toString()
                );

                if (referralIndex !== -1) {
                  console.log(referrerOfInitiator.referrals[referralIndex]);

                  referrerOfInitiator.referrals[
                    referralIndex
                  ].referral_stats.completed_tasks_count += 1;

                  referrerOfInitiator.referrals[
                    referralIndex
                  ].referral_stats.earnings += referralBonus;

                  await referrerOfInitiator.save();

                  console.log(
                    `Updated referral earnings for referrer ${referrerOfInitiator._id} and referral ${proposalInitiator._id}`
                  );
                } else {
                  console.error(
                    `Referral with ID ${proposalInitiator._id} not found in referrer ${referrerOfInitiator._id}`
                  );
                }

                const referrerWallet = await WalletModel.findOne({
                  user: referrerOfInitiator._id,
                });

                if (!referrerWallet) {
                  console.error(
                    `Wallet for referrer with ID ${referrerOfInitiator._id} not found`
                  );
                  return;
                }

                const currentReferralName = proposalInitiator.username
                  ? `@${proposalInitiator.username}`
                  : proposalInitiator.name;

                referrerWallet.transactions.push({
                  date: new Date(),
                  type: "referral",
                  amount: referralBonus,
                  status: "completed",
                  description: `Referral bonus for ${currentReferralName} participation in ${projectByProposal.title}`,
                });

                referrerWallet.balance += referralBonus;
                referrerWallet.balance_available += referralBonus;
                referrerWallet.total_earned += referralBonus;

                await referrerWallet.save();

                console.log(
                  `Referral bonus of ${referralBonus} credited to referrer ${referrerOfInitiator._id} for proposal ${documentId}`
                );
              } catch (error) {
                console.error(
                  "Ошибка при обработке изменения статуса на approved:",
                  error
                );
              }
            }

            if (updatedFields["status.value"] === "rejected") {
              try {
                const currentProposal = await ProposalModel.findById(
                  documentId
                );

                if (!currentProposal) {
                  console.error(`Proposal with ID ${documentId} not found`);
                  return;
                }

                const projectByProposal = await ProjectModel.findById(
                  currentProposal.projectId
                );

                if (!projectByProposal) {
                  console.error(
                    `Project with ID ${currentProposal.projectId} not found`
                  );
                  return;
                }

                const proposalInitiator = await ProfileModel.findById(
                  currentProposal.initiatorId
                );

                if (!proposalInitiator) {
                  console.error(
                    `Initiator with ID ${currentProposal.initiatorId} not found`
                  );
                  return;
                }

                const webAppProjectLink =
                  telegramWebAppLink +
                  "?startapp=" +
                  btoa(`projectId|${projectByProposal._id}`);

                sendTelegramNotification(
                  proposalInitiator.telegram_id,
                  `Задание для проекта ${projectByProposal.title} не прошло проверку. Зайдите в приложение, чтобы узнать причину. `,
                  [
                    {
                      text: "Посмотреть в приложении",
                      url: webAppProjectLink,
                    },
                  ]
                );
              } catch (error) {
                console.error(
                  "Ошибка при обработке изменения статуса на rejected:",
                  error
                );
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

export default monitorProposalChanges;
