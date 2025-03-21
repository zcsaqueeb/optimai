# OptimAI Auto Bot

For Auto Bot Optim AI join https://node.optimai.network/register?ref=254989AF

## Requirements

- NodeJS [Download](https://node.optimai.network/register?ref=B91EEB87).
- Optim AI Account[Optim](https://node.optimai.network/register?ref=B91EEB87)
- Proxy (Optional). Best Proxy [Cherry Proxy](https://center.cherryproxy.com/Login/Register?invite=029ad2d3)

## Notes

Using Better Proxy

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/ahlulmukh/optimai-bot.git
   cd optimai-bot
   ```

2. Instal Packages and build packages:

   ```sh
   npm install
   npm run build
   ```

3. Create a `nano proxy.txt` file in the root directory and add your proxies (one per line) (Optional).

   ```
   http://user:pass@host:port
   http://user:pass@host:port
   http://user:pass@host:port
   ```

4. Make file accounts, `cp accounts.json.example accounts.json` , edit and put your detail akun like this example`, just leave nodeToken, input only refreshToken

   ```json
   [
     {
       "refreshToken": "your_token",
       "nodeToken": []
     },
     {
       "refreshToken": "your_token",
       "nodeToken": []
     },
     {
       "refreshToken": "your_token",
       "nodeToken": []
     },
     {
       "refreshToken": "your_token",
       "nodeToken": []
     }
   ]
   ```

# How To Get Token

<strong>Run code (OptimAI Console - [Ctrl + Shift + I])</strong>

```js
const token = localStorage.getItem("opai_refresh_token");
if (token) {
  const textArea = document.createElement("textarea");
  textArea.value = token;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
  console.log("%cToken copied to clipboard!", "color: green; font-size: 16px;");
} else {
  console.error("Token not found in localStorage!");
}
```

## Usage

1. Run the bot:

```sh
npm run start
```


This tool is for educational purposes only. Use it at your own risk.
