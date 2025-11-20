import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Facebase API",
      version: "1.0.0",
      description:
        "API documentation for Facebase - Platform for influencer marketing and brand collaborations",
      contact: {
        name: "Facebase Team",
        email: "support@facebase.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Development server",
      },
      {
        url: "https://api.facebase.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Telegram initData in base64 format. In production, userId is automatically extracted from this token. Format: 'Bearer <base64_encoded_initData>'",
        },
      },
      schemas: {
        Profile: {
          type: "object",
          required: ["name", "telegram_id"],
          properties: {
            _id: {
              type: "string",
              description: "Profile ID",
              example: "507f1f77bcf86cd799439011",
            },
            name: {
              type: "string",
              description: "User full name",
              example: "John Doe",
            },
            telegram_id: {
              type: "string",
              description: "Telegram user ID",
              example: "123456789",
            },
            avatar: {
              type: "string",
              description: "Avatar URL",
              example: "https://example.com/avatar.jpg",
            },
            location: {
              type: "string",
              description: "User location",
              example: "New York",
            },
            role: {
              type: "string",
              description: "User role",
              example: "influencer",
            },
            description: {
              type: "string",
              description: "User bio/description",
              example: "Content creator and influencer",
            },
            username: {
              type: "string",
              description: "Telegram username",
              example: "johndoe",
            },
            verified: {
              type: "boolean",
              description: "Verification status",
              default: false,
            },
            channels: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of channel IDs",
            },
            saved_projects: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of saved project IDs",
            },
            referrals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  profile: {
                    type: "string",
                  },
                  referral_stats: {
                    type: "object",
                    properties: {
                      completed_tasks_count: {
                        type: "number",
                        default: 0,
                      },
                      earnings: {
                        type: "number",
                        default: 0,
                      },
                    },
                  },
                },
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Channel: {
          type: "object",
          required: ["name", "type", "url", "platform", "interests", "ownerId"],
          properties: {
            _id: {
              type: "string",
              description: "Channel ID",
            },
            name: {
              type: "string",
              description: "Channel name",
              example: "My Tech Channel",
            },
            type: {
              type: "string",
              description: "Channel type",
              example: "tech",
            },
            url: {
              type: "string",
              description: "Channel URL",
              example: "https://t.me/mytechch",
            },
            platform: {
              type: "string",
              description: "Platform name",
              enum: ["Telegram", "Instagram", "YouTube", "X", "VK", "TikTok"],
              example: "Telegram",
            },
            interests: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Channel interests/topics",
              example: ["technology", "gadgets"],
            },
            location: {
              type: "string",
              description: "Channel location",
              example: "International",
            },
            language: {
              type: "string",
              description: "Channel language",
              example: "English",
            },
            ownerId: {
              type: "string",
              description: "Profile ID of the channel owner",
              example: "123456789",
            },
          },
        },
        Project: {
          type: "object",
          required: [
            "title",
            "description",
            "location",
            "theme",
            "platform",
            "reward",
            "deadline",
          ],
          properties: {
            _id: {
              type: "string",
              description: "Project ID",
            },
            title: {
              type: "string",
              description: "Project title",
              example: "Product Launch Campaign",
            },
            description: {
              type: "string",
              description: "Project description",
              example: "Promote our new product to tech audience",
            },
            location: {
              type: "string",
              enum: [
                "international",
                "moscow",
                "sankt_peterburg",
                "ekaterinburg",
                "novosibirsk",
                "kazan",
                "krasnoyarsk",
                "nizhny_novgorod",
                "chelyabinsk",
                "ufa",
                "samara",
                "rostov_na_donu",
                "krasnodar",
                "omsk",
                "voronezh",
                "perm",
                "volgograd",
              ],
              example: "international",
            },
            theme: {
              type: "string",
              enum: [
                "automobiles",
                "gadgets",
                "food_drinks",
                "health_medical",
                "games",
                "cafes_restaurants",
                "real_estate",
                "education",
                "clothing_accessories",
                "travel",
                "home_goods",
                "finance",
              ],
              example: "gadgets",
            },
            image: {
              type: "string",
              description: "Project image URL",
            },
            briefing: {
              type: "string",
              description: "Project briefing",
            },
            platform: {
              type: "string",
              enum: ["Telegram", "Instagram", "YouTube", "X", "VK", "TikTok"],
              example: "Telegram",
            },
            subscribers: {
              type: "number",
              description: "Minimum required subscribers",
              example: 1000,
            },
            reward: {
              type: "number",
              description: "Reward amount",
              example: 5000,
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "Project deadline",
            },
            rules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                  },
                },
              },
              description: "Project rules",
            },
            promoted: {
              type: "boolean",
              default: false,
              description: "Is project promoted",
            },
            proposals: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of proposal IDs",
            },
            status: {
              type: "string",
              enum: ["active", "completed", "cancelled"],
              default: "active",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Proposal: {
          type: "object",
          required: ["channelId", "initiatorId", "projectId"],
          properties: {
            _id: {
              type: "string",
              description: "Proposal ID",
            },
            status: {
              type: "object",
              properties: {
                value: {
                  type: "string",
                  enum: [
                    "waiting_approval",
                    "waiting_channel_approval",
                    "waiting_attachments_approval",
                    "approved",
                    "rejected",
                    "channel_approved",
                    "channel_rejected",
                    "attachments_rejected",
                    "attachments_approved",
                  ],
                  default: "waiting_channel_approval",
                },
                details: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
            },
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            submitAt: {
              type: "string",
              format: "date-time",
            },
            initiatorId: {
              type: "string",
              description: "Profile ID of the proposal initiator",
            },
            projectId: {
              type: "string",
              description: "Project ID",
            },
            erid: {
              type: "string",
              description: "ERID identifier",
            },
            attachments: {
              type: "object",
              properties: {
                text: {
                  type: "string",
                },
                files: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                      url: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            deadline: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Wallet: {
          type: "object",
          required: ["user"],
          properties: {
            _id: {
              type: "string",
              description: "Wallet ID",
            },
            user: {
              type: "string",
              description: "Profile ID",
            },
            balance: {
              type: "number",
              default: 0,
              description: "Current balance",
            },
            total_earned: {
              type: "number",
              default: 0,
              description: "Total earned amount",
            },
            balance_available: {
              type: "number",
              default: 0,
              description: "Available balance for withdrawal",
            },
            transactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: {
                    type: "string",
                    format: "date-time",
                  },
                  type: {
                    type: "string",
                    enum: ["withdrawal", "referral", "deposit", "receive"],
                  },
                  amount: {
                    type: "number",
                  },
                  status: {
                    type: "string",
                    enum: ["pending", "approved", "rejected", "completed"],
                  },
                  description: {
                    type: "string",
                  },
                  details: {
                    type: "string",
                  },
                },
              },
            },
            withdrawMethods: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["crypto_wallet", "bank_account"],
                  },
                  details: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        Brand: {
          type: "object",
          required: ["title", "description", "location", "theme", "platform"],
          properties: {
            _id: {
              type: "string",
              description: "Brand ID",
              example: "673abc123def456...",
            },
            title: {
              type: "string",
              description: "Brand title",
              example: "Nike Running Campaign",
            },
            description: {
              type: "string",
              description: "Brand description",
              example: "Premium sportswear brand",
            },
            location: {
              type: "string",
              enum: [
                "international",
                "moscow",
                "sankt_peterburg",
                "ekaterinburg",
                "novosibirsk",
                "kazan",
                "krasnoyarsk",
                "nizhny_novgorod",
                "chelyabinsk",
                "ufa",
                "samara",
                "rostov_na_donu",
                "krasnodar",
                "omsk",
                "voronezh",
                "perm",
                "volgograd",
              ],
              example: "moscow",
            },
            theme: {
              type: "string",
              enum: [
                "automobiles",
                "gadgets",
                "food_drinks",
                "health_medical",
                "games",
                "cafes_restaurants",
                "real_estate",
                "education",
                "clothing_accessories",
                "travel",
                "home_goods",
                "finance",
              ],
              example: "clothing_accessories",
            },
            image: {
              type: "string",
              description: "Brand logo/image URL",
              example: "https://storage.com/nike-logo.png",
            },
            platform: {
              type: "string",
              enum: ["Telegram", "Instagram", "YouTube", "X", "VK", "TikTok"],
              example: "Telegram",
            },
            promoted: {
              type: "boolean",
              default: false,
              description: "Is brand promoted",
            },
            status: {
              type: "string",
              enum: ["active", "inactive"],
              default: "active",
            },
            is_saved: {
              type: "boolean",
              description: "Is brand saved by current user",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Task: {
          type: "object",
          required: ["brand", "title", "description", "reward", "deadline"],
          properties: {
            _id: {
              type: "string",
              description: "Task ID",
              example: "673xyz456abc789...",
            },
            brand: {
              type: "string",
              description: "Brand ID reference",
              example: "673abc123def456...",
            },
            title: {
              type: "string",
              description: "Task title",
              example: "Post about our new sneakers",
            },
            description: {
              type: "string",
              description: "Task description",
              example: "Create and publish a post about Nike Air Max",
            },
            briefing: {
              type: "string",
              description: "Detailed briefing (supports Markdown)",
              example: "# Instructions\n\nPost should include...",
            },
            subscribers: {
              type: "number",
              description: "Minimum required subscribers",
              example: 5000,
            },
            reward: {
              type: "number",
              description: "Reward amount",
              example: 500,
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "Task deadline",
            },
            rules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                    example: "Channel must be relevant to sports",
                  },
                },
              },
            },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: {
                    type: "integer",
                    example: 1,
                  },
                  title: {
                    type: "string",
                    example: "Connect your channel",
                  },
                  description: {
                    type: "string",
                    example: "Select channel to post on",
                  },
                  type: {
                    type: "string",
                    enum: ["form", "file_upload", "link", "report"],
                    example: "form",
                  },
                  required: {
                    type: "boolean",
                    default: true,
                  },
                  fields: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                        },
                        type: {
                          type: "string",
                        },
                        label: {
                          type: "string",
                        },
                        required: {
                          type: "boolean",
                        },
                      },
                    },
                  },
                },
              },
            },
            status: {
              type: "string",
              enum: ["active", "completed", "cancelled"],
              default: "active",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        TaskSubmission: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Submission ID",
            },
            task: {
              type: "string",
              description: "Task ID reference",
            },
            profile: {
              type: "string",
              description: "Profile ID reference",
            },
            status: {
              type: "string",
              enum: ["in_progress", "pending_review", "completed", "rejected"],
              example: "in_progress",
            },
            steps_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: {
                    type: "integer",
                  },
                  status: {
                    type: "string",
                    enum: ["pending", "completed", "rejected"],
                  },
                  data: {
                    type: "object",
                    description: "Step-specific data",
                  },
                  submitted_at: {
                    type: "string",
                    format: "date-time",
                  },
                  reviewed_at: {
                    type: "string",
                    format: "date-time",
                  },
                  rejection_reason: {
                    type: "string",
                  },
                },
              },
            },
            started_at: {
              type: "string",
              format: "date-time",
            },
            completed_at: {
              type: "string",
              format: "date-time",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
            message: {
              type: "string",
              description: "Detailed error message",
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      {
        name: "General",
        description: "General endpoints for user registration and info",
      },
      {
        name: "Brands",
        description: "Brand management endpoints (NEW ARCHITECTURE)",
      },
      {
        name: "Tasks",
        description: "Task management endpoints (NEW ARCHITECTURE)",
      },
      {
        name: "Profiles",
        description: "Profile management endpoints",
      },
      {
        name: "Channels",
        description: "Channel management endpoints",
      },
      {
        name: "Projects",
        description: "Project management endpoints (LEGACY)",
      },
      {
        name: "Proposals",
        description: "Proposal management endpoints (LEGACY)",
      },
      {
        name: "Wallet",
        description: "Wallet and transaction management endpoints",
      },
      {
        name: "Upload",
        description: "File upload endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;


