import axios, { AxiosResponse } from "axios";
import chalk from "chalk";
import UserAgent from 'user-agents';
import WebSocket from "ws";
import { Generator } from "../utils/generator";
import { logMessage } from "../utils/logger";
import { ProxyManager } from "./proxy";
const userAgent = new UserAgent();
const BROWSERS = ["chrome", "firefox", "edge", "opera", "brave"];

export class optimAi {
  private proxyManager: ProxyManager;
  private proxy: string | null;
  private account: any;
  private axiosConfig: any;
  private ws: WebSocket | null = null;
  private currentNum: number;
  private token: string | null = null;
  private total: number;
  private wsToken: string | null;
  private generator: Generator;

  constructor(account: any, proxy: string | null = null, currentNum: number, total: number) {
    this.account = account;
    this.proxy = proxy;
    this.currentNum = currentNum;
    this.total = total;
    this.wsToken = null;
    this.proxyManager = new ProxyManager();
    this.generator = new Generator();
    this.axiosConfig = {
      ...(this.proxy && { httpsAgent: this.proxyManager.getProxyAgent(this.proxy, this.currentNum, this.total) }),
      headers: {
        "User-Agent": userAgent.toString(),
        origin: "https://node.optimai.network",
        Referer: "https://node.optimai.network"
      }
    };
  }

  async makeRequest(method: string, url: string, config: any = {}, retries: number = 3): Promise<AxiosResponse | null> {
    for (let i = 0; i < retries; i++) {
      try {

        const response = await axios({
          method,
          url,
          ...this.axiosConfig,
          ...config,
        });
        return response;
      } catch (error: any) {
        if (i === retries - 1) {
          logMessage(this.currentNum, this.total, `Request failed: ${(error as any).message}`, "error");
          return null;
        }
        logMessage(this.currentNum, this.total, `Retrying... (${i + 1}/${retries})`, "error");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    return null;
  }

  async getdetailNetwork() {
    try {
      const response = await this.makeRequest("GET", "http://ip-api.com/json/");
      return response?.data;
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error get detail network`, "error");
    }
  }

  async getAccessToken() {
    logMessage(this.currentNum, this.total, "Getting access token...", "info");
    const payload = {
      refresh_token: this.account.refreshToken,
    }
    try {
      const response = await this.makeRequest("POST", "https://api.optimai.network/auth/refresh", { data: payload });
      if (response?.status === 200) {
        logMessage(this.currentNum, this.total, "Access token retrieved successfully", "success");
        this.token = response.data.access_token;
        return response.data.access_token;
      }
      return null
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error: ${error.message}`, "error");
      return null;
    }
  }

  async registerNode(timezone: string, xclient: string, browserName: string) {
    logMessage(this.currentNum, this.total, "Registering node...", "info");
    const headers = {
      Authorization: `Bearer ${this.token}`,
      "X-Client-Authentication": xclient,
    };
    const payload = {
      cpu_cores: 1,
      memory_gb: 0,
      screen_width_px: 375,
      screen_height_px: 600,
      color_depth: 30,
      scale_factor: 1,
      browser_name: browserName,
      device_type: "extension",
      language: "en-US",
      timezone: timezone,
    };

    try {
      const response = await this.makeRequest("POST", "https://api.optimai.network/devices/register", { headers, data: payload });
      if (response?.status === 200) {
        logMessage(this.currentNum, this.total, "Node registered successfully", "success");
        return response.data.ws_auth_token;
      }
      return null;
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error: ${error.message}`, "error");
      return null;
    }
  }


  async connectWebSocket(wsToken: string) {
    logMessage(this.currentNum, this.total, "Connecting to WebSocket...", "info");
    const url = `wss://ws.optimai.network/?token=${wsToken}`;
    const wsOptions = this.proxy ? { agent: this.proxyManager.getProxyAgent(this.proxy, this.currentNum, this.total) } : undefined;
    this.ws = new WebSocket(url, wsOptions);
    this.wsToken = wsToken;
    this.ws.onopen = () => {
      logMessage(this.currentNum, this.total, `Node connected for ${this.currentNum}`, "success");
    };

    this.ws.onmessage = (message) => {
      logMessage(this.currentNum, this.total, `Message received: ${message.data}`, "info");
    };

    this.ws.onerror = (error) => {
      logMessage(this.currentNum, this.total, `WebSocket error for account ${this.currentNum}: ${error.message}`, "error");
      this.reconnectWebSocket();
    };


    this.ws.onclose = () => {
      logMessage(this.currentNum, this.total, `WebSocket connection closed for account ${this.currentNum}`, "info");
      this.reconnectWebSocket();
    };
  }

  private reconnectWebSocket(): void {
    setTimeout(() => {
      if (this.wsToken) {
        logMessage(this.currentNum, this.total, "Reconnecting WebSocket...", "info");
        this.connectWebSocket(this.wsToken);
      }
    }, 5000);
  }

  async getStatsAccount() {
    logMessage(this.currentNum, this.total, "Getting account stats...", "process");
    if (!this.token) {
      await this.getAccessToken();
    }

    const headers = {
      Authorization: `Bearer ${this.token}`
    };

    try {
      const response = await this.makeRequest("GET", 'https://api.optimai.network/dashboard/stats', { headers: headers });
      if (response?.status === 200) {
        console.log(chalk.white("-".repeat(85)));
        logMessage(this.currentNum, this.total, `Stats Account : `, "info");
        logMessage(this.currentNum, this.total, `Total Points : ${response.data.stats.total_rewards}`, "info");
        logMessage(this.currentNum, this.total, `Total Uptime : ${response.data.stats.total_uptime}`, "info");
        console.log(chalk.white("-".repeat(85)));
      }
      return null;
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error: ${error.message}`, "error");
      return null;
    }
  }

  async startStatsInterval() {
    const fetchStats = async () => {
      await this.getStatsAccount();
      setTimeout(fetchStats, 60000);
    };

    fetchStats();
  }


  async checkinDaily() {
    logMessage(this.currentNum, this.total, "Checking in daily...", "info");
    const headers = {
      Authorization: `Bearer ${this.token}`
    }

    try {
      const response = await this.makeRequest("POST", 'https://api.optimai.network/daily-tasks/check-in', { headers: headers });
      if (response?.status === 200) {
        logMessage(this.currentNum, this.total, "Checked in successfully", "success");
      }
      return null;
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error: ${error.message}`, "error");
      return null;
    }
  }

  async processRegisterNode() {
    try {
      await this.getAccessToken();
      const detailNetwork = await this.getdetailNetwork();
      const browser = BROWSERS[Math.floor(Math.random() * BROWSERS.length)];
      const xclient = this.generator.generateXClientAuthentication(detailNetwork.timezone, browser);
      const wsToken = await this.registerNode(detailNetwork.timezone, xclient, browser);
      return wsToken;
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error: ${error.message}`, "error");
      return null;
    }
  }

}
