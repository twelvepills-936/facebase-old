import Channel, { IChannel } from "../models/channelModel.js";
import { Types } from "mongoose";

export const createChannel = async (
  channelData: Partial<IChannel>
): Promise<IChannel> => {
  const newChannel = new Channel(channelData);
  return await newChannel.save();
};

export const getAllChannels = async (): Promise<IChannel[]> => {
  return await Channel.find();
};

export const getChannelById = async (id: string): Promise<IChannel | null> => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Channel ID");
  return await Channel.findById(id);
};

export const updateChannel = async (
  id: string,
  updateData: Partial<IChannel>
): Promise<IChannel | null> => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Channel ID");
  return await Channel.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteChannel = async (id: string): Promise<IChannel | null> => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid Channel ID");
  return await Channel.findByIdAndDelete(id);
};
