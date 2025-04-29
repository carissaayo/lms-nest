import User from "../models/User.js";

export const isVerified = async (id) => {
  const isUserVerified = await User.findOne({ _id: id, isVerified: true });

  return isUserVerified;
};

export const isAdmin = async (id) => {
  const isUserVerified = await User.findOne({ _id: id, isAdmin: true });
  return isUserVerified;
};
