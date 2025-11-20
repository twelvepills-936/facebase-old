import React from "react";
import { Box, Button, H1, H4, Text } from "@adminjs/design-system";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const models = [
    { name: "Бренды", path: "/admin/resources/Brand" },
    { name: "Таски", path: "/admin/resources/Task" },
    { name: "Заявки", path: "/admin/resources/TaskSubmission" },
    { name: "Профили", path: "/admin/resources/Profile" },
    { name: "Предложения", path: "/admin/resources/Proposal" },
    { name: "Каналы", path: "/admin/resources/Channel" },
    { name: "Кошельки", path: "/admin/resources/Wallet" },
    { name: "Администраторы", path: "/admin/resources/Admin" },
    { name: "Файлы", path: "/admin/resources/File" },
  ];

  return (
    <Box variant="grey" p="xl">
      <H1 mb="lg">Добро пожаловать в панель администратора FaceBase</H1>
      <Text mb="xl">
        Здесь вы можете управлять всеми аспектами вашего приложения.
      </Text>

      <Box
        display="grid"
        gridGap="lg"
        gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr 1fr"]}
      >
        {models.map((model) => (
          <Box
            key={model.path}
            variant="white"
            p="xl"
            onClick={() => navigate(model.path)}
            style={{ cursor: "pointer" }}
          >
            <H4 mb="lg">{model.name}</H4>
            <Button
              variant="primary"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate(model.path);
              }}
            >
              Управление
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Dashboard;
