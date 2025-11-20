import { Request, Response } from "express";
import ChannelModel from "../models/channelModel.js";
import ProfileModel from "../models/profileModel.js";

export const createChannel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      type,
      interests,
      location,
      language,
      ownerId,
      url,
      platform,
    } = req.body;

    const newChannel = new ChannelModel({
      name,
      type,
      interests,
      location,
      language,
      ownerId,
      url,
      platform,
    });

    const savedChannel = await newChannel.save();

    const profile = await ProfileModel.findOne({ telegram_id: ownerId });
    if (!profile) {
      return res.status(404).json({ message: "Профиль владельца не найден" });
    }

    if (savedChannel._id) {
      profile.channels.push(savedChannel._id as any);
      await profile.save();
    }

    res.status(201).json(savedChannel);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании канала", error });
  }
};

export const getChannels = async (req: Request, res: Response) => {
  try {
    const channels = await ChannelModel.find();
    res.status(200).json(channels);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении каналов", error });
  }
};

export const updateChannel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedChannel = await ChannelModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedChannel) {
      return res.status(404).json({ message: "Канал не найден" });
    }

    res.status(200).json(updatedChannel);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении канала", error });
  }
};

export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedChannel = await ChannelModel.findByIdAndDelete(id);

    if (!deletedChannel) {
      return res.status(404).json({ message: "Канал не найден" });
    }

    res.status(200).json({ message: "Канал удален" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении канала", error });
  }
};
