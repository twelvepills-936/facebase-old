import { Request, Response } from "express";
import * as profileService from "../services/profileService.js";

export const createProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profile = await profileService.createProfile(req.body);
    res.status(201).json(profile);
  } catch (err) {
    const { message } = err as { message: string };

    res.status(400).json({ message });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profile = await profileService.getProfileById(req.params.id);
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
    } else {
      res.json(profile);
    }
  } catch (err) {
    const { message } = err as { message: string };

    res.status(500).json({ message });
  }
};

export const getProfiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profiles = await profileService.getProfiles();
    if (!profiles) {
      res.status(404).json({ message: "Profiles not found" });
    } else {
      res.json(profiles);
    }
  } catch (err) {
    const { message } = err as { message: string };

    res.status(500).json({ message });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedProfile = await profileService.updateProfile(
      req.params.id,
      req.body
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
    } else {
      res.json(updatedProfile);
    }
  } catch (err) {
    const { message } = err as { message: string };

    res.status(400).json({ message });
  }
};

export const deleteProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedProfile = await profileService.deleteProfile(req.params.id);
    if (!deletedProfile) {
      res.status(404).json({ message: "Profile not found" });
    } else {
      res.json({ message: "Profile deleted successfully" });
    }
  } catch (err) {
    const { message } = err as { message: string };

    res.status(500).json({ message });
  }
};
