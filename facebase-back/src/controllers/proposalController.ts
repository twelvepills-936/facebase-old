import { Request, Response } from "express";
import {
  createProposal,
  getProposalById,
  updateProposal,
  deleteProposal,
  getProposalByProjectId,
  getSubmittedProposals,
} from "../services/proposalService.js";
import { parseAuthToken } from "../utils/parseAuthToken.js";
import { getChannelById } from "../services/channelService.js";

export const createProposalController = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const proposal = await createProposal({
      ...data,
      status: {
        value: "waiting_channel_approval",
        details: [
          "Проверяем канал на соответствие требованиям рекламного задания",
        ],
      },
    });
    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании заявки", error });
  }
};

export const getProposalController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proposal = await getProposalById(id);

    if (!proposal) {
      return res.status(404).json({ message: "Заявка не найдена" });
    }

    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении заявки", error });
  }
};

export const updateProposalController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedProposal = await updateProposal(id, data);

    if (!updatedProposal) {
      return res.status(404).json({ message: "Заявка не найдена" });
    }

    res.status(200).json(updatedProposal);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении заявки", error });
  }
};

export const updateProposalChannelController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { channelId } = req.body;

    const channel = await getChannelById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Канал не найден" });
    }

    const updatedProposal = await updateProposal(id, {
      channelId,
      status: {
        value: "waiting_channel_approval",
        details: ["Канал обновлен, ожидает проверки"],
      },
    });

    if (!updatedProposal) {
      return res.status(404).json({ message: "Заявка не найдена" });
    }

    res.status(200).json(updatedProposal);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении заявки", error });
  }
};

export const deleteProposalController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedProposal = await deleteProposal(id);

    if (!deletedProposal) {
      return res.status(404).json({ message: "Заявка не найдена" });
    }

    res.status(200).json({ message: "Заявка удалена" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении заявки", error });
  }
};

/**
 * Загрузка файлов интеграции пользователем (шаг 2)
 * Меняет статус на waiting_attachments_approval
 */
export const uploadAttachmentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const files = req.files as any[];

    // Получаем заявку
    const proposal = await getProposalById(id);
    if (!proposal) {
      return res.status(404).json({ message: "Заявка не найдена" });
    }

    // Проверяем, что статус позволяет загрузку файлов
    if (
      !["channel_approved", "attachments_rejected"].includes(
        proposal.status.value
      )
    ) {
      return res
        .status(400)
        .json({ message: "Нельзя загрузить файлы на этом этапе" });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res
        .status(400)
        .json({ message: "Файлы не предоставлены или имеют неверный формат" });
    }

    const uploadedFiles = files.map((file) => ({
      name: file.originalname,
      url: file.location,
    }));

    const updatedProposal = await updateProposal(id, {
      attachments: {
        text: text || "",
        files: uploadedFiles,
      },
      status: {
        value: "waiting_attachments_approval",
        details: ["Файлы интеграции загружены, ожидают проверки"],
      },
    });

    res.status(200).json(updatedProposal);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки файлов", error });
  }
};

/**
 * Публикация интеграции пользователем (шаг 3)
 * Меняет статус на waiting_approval (или другой, если потребуется)
 */
export const publishProposalController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const proposal = await getProposalById(id);
    if (!proposal) {
      return res.status(404).json({ message: "Заявка не найдена" });
    }

    if (!["attachments_approved", "rejected"].includes(proposal.status.value)) {
      return res
        .status(400)
        .json({ message: "Нельзя отправить на публикацию на этом этапе" });
    }

    const updatedProposal = await updateProposal(id, {
      status: {
        value: "waiting_approval",
        details: ["Ожидает финальной проверки публикации"],
      },
    });
    res.status(200).json(updatedProposal);
  } catch (error) {
    res.status(500).json({ message: "Ошибка публикации", error });
  }
};

/**
 * Отмена шага заявки (cancel step)
 * Действует только на статусах: waiting_channel_approval, waiting_attachments_approval, waiting_approval
 */
export const cancelProposalStepController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const proposal = await getProposalById(id);
    if (!proposal) {
      return res.status(404).json({ message: "Заявка не найдена" });
    }
    const status = proposal.status.value;
    if (status === "waiting_channel_approval") {
      // Полностью удалить заявку
      await deleteProposal(id);
      return res.status(200).json({ message: "Заявка удалена" });
    } else if (status === "waiting_attachments_approval") {
      // Удалить attachments и вернуть статус channel_approved
      const updatedProposal = await updateProposal(id, {
        $unset: { attachments: 1 },
        status: {
          value: "channel_approved",
          details: ["Шаг с файлами отменён, возвращено к channel_approved"],
        },
      } as any);
      return res.status(200).json(updatedProposal);
    } else if (status === "waiting_approval") {
      // Просто поменять статус на attachments_approved
      const updatedProposal = await updateProposal(id, {
        status: {
          value: "attachments_approved",
          details: [
            "Шаг публикации отменён, возвращено к attachments_approved",
          ],
        },
      });
      return res.status(200).json(updatedProposal);
    } else {
      return res
        .status(400)
        .json({ message: "Отмена невозможна на этом этапе" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка отмены шага", error });
  }
};

export const getProposalByProjectIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { user: decodedUser } = parseAuthToken(
      req.headers.authorization as string
    );

    const { projectId } = req.params;
    const proposal = await getProposalByProjectId(projectId, decodedUser.id);

    if (!proposal) {
      return res.status(404).json({ message: "Заявка не найдена" });
    }

    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении заявки", error });
  }
};

export const getSubmittedProposalsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { user: decodedUser } = parseAuthToken(
      req.headers.authorization as string
    );

    const proposals = await getSubmittedProposals(decodedUser.id);

    if (!proposals) {
      return res.status(404).json({ message: "Заявки не найдены" });
    }

    res.status(200).json(proposals);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Ошибка при получении заявок", error });
  }
};
