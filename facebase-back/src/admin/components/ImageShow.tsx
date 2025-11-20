import React from "react";
import { Box, Label, MessageBox } from "@adminjs/design-system";

type ImageShowProps = {
  record: {
    params: Record<string, any>;
  };
};

const ImageShow: React.FC<ImageShowProps> = (props) => {
  const { record } = props;

  const image = record?.params?.image;

  if (!image) {
    return <MessageBox variant="info">Изображение не загружено</MessageBox>;
  }

  return (
    <Box>
      <Label>Image</Label>
      <Box mt="default">
        {/* <img
          src={image}
          alt="Изображение проекта"
          style={{ maxWidth: "100%", maxHeight: "300px" }}
        /> */}
        <p style={{ marginTop: "16px", wordBreak: "break-all" }}>
          <a href={image} target="_blank" rel="noopener noreferrer">
            {image}
          </a>
        </p>
      </Box>
    </Box>
  );
};

export default ImageShow;
