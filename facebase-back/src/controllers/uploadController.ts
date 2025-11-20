import { Request, Response } from "express";

export const uploadFile = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Файл не был загружен",
      });
    }

    const file = req.file as any;

    return res.status(200).json({
      success: true,
      message: "Файл успешно загружен",
      file: {
        url: file.location,
        mimetype: file.mimetype,
        size: file.size,
        originalName: file.originalname,
      },
    });
  } catch (error) {
    console.error("Ошибка загрузки файла:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка сервера при загрузке файла",
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
    });
  }
};
