import { Request, Response } from "express";
import ProfileModel from "../models/profileModel.js";
import WalletModel from "../models/walletModel.js";
import { parseAuthToken } from "../utils/parseAuthToken.js";

export const checkUserRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Authorization header missing or invalid" });

      return;
    }

    const {
      user: decodedUser,
      startParam,
      initDataRaw,
    } = parseAuthToken(authHeader);

    const existedProfile = await ProfileModel.findOne({
      telegram_id: decodedUser.id,
    });

    if (existedProfile) {
      res.status(400).json({ message: "Profile already registered" });

      return;
    }

    const newProfile = new ProfileModel({
      name: decodedUser.first_name,
      telegram_id: decodedUser.id,
      avatar: decodedUser.photo_url,
      location: decodedUser.language_code,
      role: "",
      desciption: "",
      channels: [],
      telegramInitData: initDataRaw,
      username: decodedUser.username,
      referalls: [],
    });

    const savedProfile = await newProfile.save();

    const newWallet = new WalletModel({
      user: savedProfile._id,
      balance: 0,
      transactions: [],
      withdrawMethods: [],
    });
    await newWallet.save();

    if (startParam) {
      const referrerProfile = await ProfileModel.findOne({
        telegram_id: startParam,
      });

      if (referrerProfile) {
        referrerProfile.referrals.push({
          profile: savedProfile._id as string,
          referral_stats: {
            completed_tasks_count: 0,
            earnings: 0,
          },
        });

        await referrerProfile.save();

        console.log(
          `User ${savedProfile._id} added as a referral to ${referrerProfile._id}`
        );
      } else {
        console.log(
          `Referrer profile with telegram_id ${startParam} not found.`
        );
      }
    }

    res.status(200).json({ message: "Profile successfully registered!" });
  } catch (err) {
    res.status(500).json({ message: JSON.stringify(err) });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Authorization header missing or invalid" });

      return;
    }

    const initDataRaw = authHeader.split(" ")[1];

    const decodedInitDataRaw = atob(initDataRaw as string);

    const initDataParams = new URLSearchParams(decodedInitDataRaw as string);
    const encodedUser = initDataParams.get("user");

    const decodedUser = JSON.parse(decodeURIComponent(encodedUser as string));

    const existedProfile = await ProfileModel.findOne({
      telegram_id: decodedUser.id,
    })
      .populate("channels")
      .populate("referrals.profile")
      .populate("saved_projects");

    if (!existedProfile) {
      res.status(400).json({ message: "Profile already registered" });

      return;
    }

    res.status(200).json({
      ...existedProfile.toObject(),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
