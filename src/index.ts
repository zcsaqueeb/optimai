import chalk from "chalk";
import fs from "fs";
import { optimAi } from "./main/optimAi";
import { ProxyManager } from "./main/proxy";
import { logMessage } from "./utils/logger";

const proxyManager = new ProxyManager();

async function main(): Promise<void> {
  console.log(
    chalk.cyan(`
░█▀█░█▀█░▀█▀░▀█▀░█▄█░█▀█░▀█▀
░█░█░█▀▀░░█░░░█░░█░█░█▀█░░█░
░▀▀▀░▀░░░░▀░░▀▀▀░▀░▀░▀░▀░▀▀▀
        By : El Puqus Airdrop
        github.com/ahlulmukh
      Use it at your own risk
  `)
  );

  try {
    const accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
    const proxiesLoaded = proxyManager.loadProxies();
    if (!proxiesLoaded) {
      logMessage(null, null, "Failed to load proxies, using default IP", "warning");
    }

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      try {
        console.log(chalk.white("-".repeat(85)));
        if (account.nodeToken.length === 0) {
          const currentProxy = await proxyManager.getRandomProxy(i + 1, accounts.length);
          const ex = new optimAi(account, currentProxy, i + 1, accounts.length);
          const wsTokens = await ex.processRegisterNode();
          if (wsTokens) {
            account.nodeToken.push(wsTokens);
          }
        }

        for (let j = 0; j < account.nodeToken.length; j++) {
          const wsToken = account.nodeToken[j];
          const currentProxy = await proxyManager.getRandomProxy(i * account.nodeToken.length + j, accounts.length * account.nodeToken.length);
          const ex = new optimAi(account, currentProxy, i + 1, accounts.length);
          await ex.startStatsInterval();
          ex.connectWebSocket(wsToken);
        }
      } catch (error: any) {
        logMessage(null, null, `Failed to process account: ${error.message}`, "error");
      }
    }

    fs.writeFileSync("accounts.json", JSON.stringify(accounts, null, 4), "utf8");
  } catch (error: any) {
    logMessage(null, null, `Error: ${(error as any).message}`, "error");
  }
}

main().catch((err) => {
  console.error(chalk.red("Error occurred:"), err);
  process.exit(1);
});