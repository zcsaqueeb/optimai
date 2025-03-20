import { createHmac } from "crypto";

export class Generator {
    private client_secret: string = "D1A167BD1346DDF2357DA5A2F2F2F";

    stableStringify(obj: any) {
        const seen = new Set();
        function sortObjectKeys(obj: any) {
            if (typeof obj === "object" && obj !== null) {
                const sortedObj: any = {};
                Object.keys(obj)
                    .sort()
                    .forEach((key) => {
                        sortedObj[key] = sortObjectKeys(obj[key]);
                    });
                return sortedObj;
            }
            return obj;
        }
        return JSON.stringify(sortObjectKeys(obj));
    }

    generateXClientAuthentication(timezone: string, browserName: string) {
        const payload = {
            client_app_id: "TLG_MINI_APP_V1",
            timestamp: Date.now(),
            device_info: {
                browser_name: browserName,
                color_depth: 30,
                cpu_cores: 1,
                device_type: "extension",
                language: "en-US",
                memory_gb: 0,
                scale_factor: 1,
                screen_height_px: 600,
                screen_width_px: 375,
                timezone: timezone,
            },
        };

        const jsonString = this.stableStringify(payload);

        const signature = createHmac("sha256", this.client_secret)
            .update(jsonString)
            .digest("hex");
        const tokenPayload = { ...payload, signature };
        const base64Token = Buffer.from(JSON.stringify(tokenPayload)).toString(
            "base64"
        );
        return base64Token
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }
}