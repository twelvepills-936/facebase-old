import axios, { AxiosInstance } from "axios";

interface VKOrdCreativeData {
  title: string;
  description?: string;
  channelUrl?: string;
  projectId: string;
  proposalId: string;
}

interface VKOrdCreateCreativeResponse {
  erid?: string;
  creative_id?: string;
  status?: string;
  error?: string;
}

class VKOrdService {
  private apiClient: AxiosInstance;
  private apiKey: string;
  private apiUrl: string;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.USE_VK_ORD === "true";
    this.apiKey = process.env.VK_ORD_API_KEY || "";
    this.apiUrl = process.env.VK_ORD_API_URL || "https://api.vk.com/ord/v1";

    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.apiKey ? `Bearer ${this.apiKey}` : "",
      },
    });
  }

  /**
   * Создает креатив в ВК Ордер и получает erid
   * @param creativeData Данные креатива
   * @returns erid или null в случае ошибки
   */
  async createCreativeAndGetErid(
    creativeData: VKOrdCreativeData
  ): Promise<string | null> {
    if (!this.enabled) {
      console.log("⚠️ VK Ord integration is disabled (USE_VK_ORD != 'true')");
      return null;
    }

    if (!this.apiKey) {
      console.error("❌ VK Ord API key is not configured");
      return null;
    }

    try {
      console.log("📤 Creating creative in VK Ord...", {
        title: creativeData.title,
        projectId: creativeData.projectId,
        proposalId: creativeData.proposalId,
      });

      // Формируем данные для создания креатива
      const payload = {
        title: creativeData.title,
        description: creativeData.description || "",
        url: creativeData.channelUrl || "",
        metadata: {
          project_id: creativeData.projectId,
          proposal_id: creativeData.proposalId,
        },
      };

      const response = await this.apiClient.post<VKOrdCreateCreativeResponse>(
        "/creatives",
        payload
      );

      if (response.data.erid) {
        console.log("✅ ERID получен от ВК Ордер:", response.data.erid);
        return response.data.erid;
      }

      if (response.data.creative_id) {
        // Если erid не пришел сразу, получаем его через creative_id
        const erid = await this.getEridByCreativeId(response.data.creative_id);
        if (erid) {
          console.log("✅ ERID получен через creative_id:", erid);
          return erid;
        }
      }

      console.warn("⚠️ ERID не получен от ВК Ордер:", response.data);
      return null;
    } catch (error: any) {
      console.error("❌ Ошибка при создании креатива в ВК Ордер:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return null;
    }
  }

  /**
   * Получает erid по creative_id
   */
  private async getEridByCreativeId(
    creativeId: string
  ): Promise<string | null> {
    try {
      const response = await this.apiClient.get<{ erid?: string }>(
        `/creatives/${creativeId}`
      );

      return response.data.erid || null;
    } catch (error: any) {
      console.error(
        `❌ Ошибка при получении ERID для creative_id ${creativeId}:`,
        error.message
      );
      return null;
    }
  }

  /**
   * Получает статус креатива по erid
   */
  async getCreativeStatus(erid: string): Promise<any> {
    if (!this.enabled || !this.apiKey) {
      return null;
    }

    try {
      const response = await this.apiClient.get(`/creatives/erid/${erid}`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Ошибка при получении статуса креатива ${erid}:`, error.message);
      return null;
    }
  }

  /**
   * Проверяет доступность сервиса ВК Ордер
   */
  async healthCheck(): Promise<boolean> {
    if (!this.enabled || !this.apiKey) {
      return false;
    }

    try {
      await this.apiClient.get("/health");
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Экспортируем singleton instance
const vkOrdService = new VKOrdService();
export default vkOrdService;

