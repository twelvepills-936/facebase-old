import AdminJS, {
  OverridableComponent,
  ActionRequest,
  ActionResponse,
} from "adminjs";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { ComponentLoader } from "adminjs";
import Project from "../models/projectModel.js";
import Profile from "../models/profileModel.js";
import Proposal from "../models/proposalModel.js";
import Channel from "../models/channelModel.js";
import Wallet from "../models/walletModel.js";
import Admin from "../models/adminModel.js";
import File from "../models/fileModel.js";
import Brand from "../models/brandModel.js";
import Task from "../models/taskModel.js";
import TaskSubmission from "../models/taskSubmissionModel.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Регистрируем адаптер для Mongoose
AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

// Создаем загрузчик компонентов
const componentLoader = new ComponentLoader();

// Регистрируем компоненты
const Components = {
  Dashboard: componentLoader.add(
    "Dashboard",
    __dirname + "/components/Dashboard.tsx"
  ),
  ImageUpload: componentLoader.add(
    "ImageUpload",
    __dirname + "/components/ImageUpload.tsx"
  ),
  ImageShow: componentLoader.add(
    "ImageShow",
    __dirname + "/components/ImageShow.tsx"
  ),
};

// Функция аутентификации
const authenticate = async (email: string, password: string) => {
  const admin = await Admin.findOne({ email });

  if (admin && (await admin.comparePassword(password))) {
    return {
      email: admin.email,
      role: admin.role,
    };
  }
  return null;
};

// Конфигурация для загрузки файлов
const fileOptions = {
  properties: {
    file: {
      isVisible: {
        list: true,
        filter: true,
        show: true,
        edit: true,
      },
    },
  },
  actions: {
    new: {
      before: async (request: any) => {
        if (request.payload.file) {
          const file = request.payload.file;
          const fileRecord = await File.create({
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
          });
          request.payload.file = fileRecord._id;
        }
        return request;
      },
    },
  },
};

// Проектные настройки
const projectOptions = {
  listProperties: ["_id", "title", "createdAt", "updatedAt"],
  properties: {
    image: {
      isVisible: {
        list: false,
        filter: false,
        show: true,
        edit: true,
      },
      components: {
        show: Components.ImageShow,
        edit: Components.ImageUpload,
      },
    },
    briefing: {
      type: "textarea",
      props: {
        rows: 10,
        placeholder: "Введите брифинг в формате Markdown...",
      },
      description: "Поддерживается Markdown-разметка",
    },
  },
  actions: {
    edit: {
      before: async (request: ActionRequest) => {
        return request;
      },
      after: async (response: ActionResponse) => {
        console.log(
          "Проект сохранен с URL изображения:",
          response.record.params.image
        );
        return response;
      },
    },
    new: {
      before: async (request: ActionRequest) => {
        return request;
      },
      after: async (response: ActionResponse) => {
        console.log(
          "Новый проект создан с URL изображения:",
          response.record.params.image
        );
        return response;
      },
    },
  },
};

// Настройки для Brand
const brandOptions = {
  listProperties: ["_id", "title", "platform", "location", "theme", "status", "promoted"],
  properties: {
    title: {
      isTitle: true,
    },
    description: {
      type: "textarea",
      props: {
        rows: 5,
      },
    },
    image: {
      components: {
        show: Components.ImageShow,
        edit: Components.ImageUpload,
      },
    },
  },
  actions: {
    show: {
      after: async (response: ActionResponse) => {
        // Добавляем ссылку на таски бренда
        return response;
      },
    },
  },
};

// Настройки для Task
const taskOptions = {
  listProperties: ["_id", "title", "brand", "reward", "deadline", "status"],
  properties: {
    brand: {
      reference: "Brand",
    },
    title: {
      isTitle: true,
    },
    description: {
      type: "textarea",
      props: {
        rows: 5,
      },
    },
    briefing: {
      type: "textarea",
      props: {
        rows: 10,
        placeholder: "Введите брифинг в формате Markdown...",
      },
      description: "Поддерживается Markdown-разметка",
    },
    steps: {
      type: "mixed",
    },
    rules: {
      type: "mixed",
    },
  },
};

// Настройки для TaskSubmission
const taskSubmissionOptions = {
  listProperties: ["_id", "task", "profile", "status", "started_at", "completed_at"],
  properties: {
    task: {
      reference: "Task",
    },
    profile: {
      reference: "Profile",
    },
    status: {
      availableValues: [
        { value: "in_progress", label: "In Progress" },
        { value: "pending_review", label: "Pending Review" },
        { value: "completed", label: "Completed" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    steps_data: {
      type: "mixed",
    },
  },
  actions: {
    edit: {
      isAccessible: ({ currentAdmin }: any) => {
        return currentAdmin && currentAdmin.role === "superadmin";
      },
    },
  },
};

// Создаем экземпляр AdminJS
const adminOptions = {
  resources: [
    {
      resource: Brand,
      options: brandOptions,
    },
    {
      resource: Task,
      options: taskOptions,
    },
    {
      resource: TaskSubmission,
      options: taskSubmissionOptions,
    },
    {
      resource: Project,
      options: projectOptions,
    },
    Profile,
    Proposal,
    Channel,
    Wallet,
    Admin,
    {
      resource: File,
      options: fileOptions,
    },
  ],
  navigation: {
    Brand: { name: "Brands & Tasks", icon: "Store" },
    Task: { name: "Brands & Tasks", icon: "Tasks" },
    TaskSubmission: { name: "Brands & Tasks", icon: "CheckCircle" },
    Project: { name: "Legacy", icon: "Folder" },
    Proposal: { name: "Legacy", icon: "FileText" },
    Profile: { name: "Users", icon: "User" },
    Channel: { name: "Users", icon: "Tv" },
    Wallet: { name: "Users", icon: "Wallet" },
    File: { name: "Media", icon: "Image" },
    Admin: { name: "System", icon: "Settings" },
  },
  rootPath: "/admin",
  auth: {
    authenticate,
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || "some-secret-password",
    cookieName: "adminjs",
  },
  branding: {
    companyName: "FaceBase Admin",
    logo: "/admin/logo.png",
    withMadeWithLove: false,
  },
  assets: {
    styles: ["/admin/custom.css"],
  },
  dashboard: {
    component: Components.Dashboard,
  },
  componentLoader,
};

const admin = new AdminJS(adminOptions);

export { admin, authenticate };
