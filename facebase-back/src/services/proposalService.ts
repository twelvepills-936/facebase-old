import ProposalModel, { IProposal } from "../models/proposalModel.js";
import ProfileModel from "../models/profileModel.js";

export const createProposal = async (data: IProposal) => {
  const proposal = new ProposalModel(data);
  const savedProposal = await proposal.save();

  return savedProposal;
};

export const getProposalById = async (proposalId: string) => {
  return await ProposalModel.findById(proposalId)
    .populate("channelId")
    .populate("initiatorId")
    .populate("projectId");
};

export const updateProposal = async (
  proposalId: string,
  data: Partial<IProposal>
) => {
  return await ProposalModel.findByIdAndUpdate(proposalId, data, { new: true });
};

export const deleteProposal = async (proposalId: string) => {
  const deletedProposal = await ProposalModel.findByIdAndDelete(proposalId);

  return deletedProposal;
};

export const getProposalByProjectId = async (
  projectId: string,
  userId: string
) => {
  const initiator = await ProfileModel.findOne({ telegram_id: userId });

  if (!initiator) {
    return null;
  }

  return await ProposalModel.findOne({
    projectId,
    initiatorId: initiator._id,
  });
};

export const getSubmittedProposals = async (userId: string) => {
  const initiator = await ProfileModel.findOne({ telegram_id: userId });

  if (!initiator) {
    return null;
  }

  return await ProposalModel.find({ initiatorId: initiator._id }).populate(
    "projectId",
    "_id title image"
  );
};
