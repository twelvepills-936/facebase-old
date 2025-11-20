import Profile, { IProfile } from "../models/profileModel.js";

export const createProfile = async (
  profileData: Partial<IProfile>
): Promise<IProfile> => {
  const profile = new Profile(profileData);
  return await profile.save();
};

export const getProfileById = async (id: string): Promise<IProfile | null> => {
  return await Profile.findById(id).populate("channels");
};

export const getProfiles = async (): Promise<IProfile[] | null> => {
  return await Profile.find({}).populate("channels");
};

export const updateProfile = async (
  id: string,
  profileData: Partial<IProfile>
): Promise<IProfile | null> => {
  return await Profile.findByIdAndUpdate(id, profileData, { new: true });
};

export const deleteProfile = async (id: string): Promise<IProfile | null> => {
  return await Profile.findByIdAndDelete(id);
};
