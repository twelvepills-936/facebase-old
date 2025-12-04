import ProposalModel, { IProposal } from "../models/proposalModel.js";
import ProfileModel from "../models/profileModel.js";
import ProjectModel from "../models/projectModel.js";
import ChannelModel from "../models/channelModel.js";
import vkOrdService from "./vkOrdService.js";

export const createProposal = async (data: IProposal) => {
  // Создаем предложение
  const proposal = new ProposalModel(data);
  const savedProposal = await proposal.save();

  // Если erid не передан, пытаемся получить его автоматически через ВК Ордер
  if (!savedProposal.erid) {
    try {
      // Получаем данные проекта и канала для создания креатива
      const project = await ProjectModel.findById(data.projectId);
      const channel = await ChannelModel.findById(data.channelId);

      if (project && channel) {
        const erid = await vkOrdService.createCreativeAndGetErid({
          title: `${project.title} - ${channel.name}`,
          description: project.description || project.briefing || "",
          channelUrl: (channel as any).url || "",
          projectId: String(project._id),
          proposalId: String(savedProposal._id),
        });

        if (erid) {
          savedProposal.erid = erid;
          await savedProposal.save();
          console.log(`✅ ERID автоматически получен и сохранен для предложения ${savedProposal._id}: ${erid}`);
        } else {
          console.log(`⚠️ Не удалось автоматически получить ERID для предложения ${savedProposal._id}`);
        }
      } else {
        console.log(`⚠️ Не удалось получить данные проекта или канала для автоматического получения ERID (proposal: ${savedProposal._id})`);
      }
    } catch (error: any) {
      console.error(`❌ Ошибка при автоматическом получении ERID для предложения ${savedProposal._id}:`, error.message);
      // Продолжаем без erid - предложение уже создано
    }
  }

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
