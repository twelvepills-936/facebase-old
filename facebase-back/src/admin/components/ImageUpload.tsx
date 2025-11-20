import React, { useState, useEffect } from "react";
import {
  Box,
  Label,
  DropZone,
  Button,
  MessageBox,
} from "@adminjs/design-system";
import { useNotice } from "adminjs";
import axios from "axios";

type ImageUploadProps = {
  property: {
    name: string;
    record: {
      id: string;
      params: Record<string, any>;
    };
  };
  onChange: (key: string, value: string) => void;
};
const ADMIN_TOKEN = process.env.ADMIN_TOKEN as string;

const ImageUpload: React.FC<ImageUploadProps> = (props) => {
  const { property, onChange } = props;
  const { record } = property;
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const addNotice = useNotice();

  const currentImage = record?.params?.image;

  useEffect(() => {
    if (currentImage) {
      setUploadedUrl(currentImage);
    }
  }, [currentImage]);

  const onUpload = (files: File[]) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];

      if (!selectedFile.type.match(/image\/.*/)) {
        setError("Только изображения могут быть загружены");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Ошибка при загрузке файла");
      }

      const imageUrl = result.file.url;
      onChange("image", imageUrl);
      setUploadedUrl(imageUrl);

      setTimeout(() => {
        const imageInput = document.querySelector('input[name="image"]');
        if (imageInput && imageInput instanceof HTMLInputElement) {
          imageInput.value = imageUrl;
          const event = new Event("input", { bubbles: true });
          imageInput.dispatchEvent(event);
        }
      }, 100);

      addNotice({
        message: "Изображение успешно загружено",
        type: "success",
      });

      setFile(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Произошла ошибка при загрузке файла";
      setError(errorMessage);
      addNotice({
        message: errorMessage,
        type: "error",
      });
      console.error("Ошибка загрузки:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Label>Изображение проекта</Label>
      <DropZone onChange={onUpload} />

      {file && (
        <Box mt="default">
          <p>Выбран файл: {file.name}</p>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Загрузка..." : "Сохранить и загрузить"}
          </Button>
        </Box>
      )}

      {error && (
        <MessageBox mt="default" variant="danger" style={{ marginTop: "10px" }}>
          {error}
        </MessageBox>
      )}

      {(currentImage || uploadedUrl) && !file && (
        <Box mt="default">
          <img
            src={uploadedUrl || currentImage}
            alt="Текущее изображение"
            style={{ maxWidth: "100%", maxHeight: "200px" }}
          />
          <p style={{ marginTop: "8px", wordBreak: "break-all" }}>
            <a
              href={uploadedUrl || currentImage}
              target="_blank"
              rel="noopener noreferrer"
            >
              {uploadedUrl || currentImage}
            </a>
          </p>

          <input
            type="hidden"
            name="image"
            value={uploadedUrl || currentImage || ""}
          />
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
