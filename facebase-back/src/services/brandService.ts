import Brand, { IBrand } from "../models/brandModel.js";
import ProfileModel from "../models/profileModel.js";
import { FilterQuery, SortOrder, Types } from "mongoose";

export const getAllBrands = async (
  filters: FilterQuery<IBrand> = {},
  sortOptions: Record<string, SortOrder> = {},
  userId?: string
): Promise<any[]> => {
  const brands = await Brand.find(filters).sort(sortOptions).lean();

  // Добавляем флаг is_saved для каждого бренда
  if (userId) {
    const profile = await ProfileModel.findOne({ telegram_id: userId });
    if (profile) {
      const savedBrandIds = profile.saved_brands.map((id) => id.toString());
      return brands.map((brand: any) => ({
        ...brand,
        is_saved: savedBrandIds.includes(brand._id.toString()),
      }));
    }
  }

  return brands.map((brand: any) => ({ ...brand, is_saved: false }));
};

export const getBrandById = async (
  id: string,
  userId?: string
): Promise<any> => {
  const brand = await Brand.findById(id).lean();

  if (!brand) {
    return null;
  }

  let is_saved = false;
  if (userId) {
    const profile = await ProfileModel.findOne({ telegram_id: userId });
    if (profile) {
      is_saved = profile.saved_brands.some((savedId) =>
        savedId.equals(new Types.ObjectId(id))
      );
    }
  }

  return { ...brand, is_saved };
};

export const saveBrandToProfile = async (userId: string, brandId: string) => {
  const currentProfile = await ProfileModel.findOne({
    telegram_id: userId,
  });

  if (!currentProfile) {
    throw new Error("Profile not found");
  }

  const existedSavedBrand = currentProfile.saved_brands.some(
    (savedBrandId: any) => savedBrandId.equals(new Types.ObjectId(brandId))
  );

  if (existedSavedBrand) {
    throw new Error("Brand already saved");
  }

  currentProfile.saved_brands.push(brandId as any);

  return await currentProfile.save();
};

export const unsaveBrandFromProfile = async (
  userId: string,
  brandId: string
) => {
  const currentProfile = await ProfileModel.findOne({ telegram_id: userId });

  if (!currentProfile) {
    throw new Error("Profile not found");
  }

  const existedSavedBrand = currentProfile.saved_brands.some(
    (savedBrandId: any) => savedBrandId.equals(new Types.ObjectId(brandId))
  );

  if (!existedSavedBrand) {
    throw new Error("Brand is not in saved list");
  }

  currentProfile.saved_brands = currentProfile.saved_brands.filter(
    (savedBrandId: any) => !savedBrandId.equals(new Types.ObjectId(brandId))
  );

  return await currentProfile.save();
};

