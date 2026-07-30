import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // API Proxy Route
  app.all("/api/*", async (req: any, res: any) => {
    try {
      const subPath = req.params[0] || req.path.replace(/^\/api\//, '');
      const queryString = new URLSearchParams(req.query as any).toString();
      const targetUrl = `https://snos.teledominternational.net/${subPath}${queryString ? `?${queryString}` : ""}`;

      console.log(`[API PROXY] Forwarding ${req.method} request to: ${targetUrl}`);

      const headers: Record<string, string> = {
        "Accept": "application/json",
      };

      if (req.headers["content-type"]) {
        headers["content-type"] = req.headers["content-type"] as string;
      }

      const fetchOptions: any = {
        method: req.method,
        headers,
      };

      if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
        fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, fetchOptions);
      const dataText = await response.text();

      // Set status and headers
      res.status(response.status);
      const targetContentType = response.headers.get("content-type");
      if (targetContentType) {
        res.setHeader("Content-Type", targetContentType);
      }

      res.send(dataText);
    } catch (error: any) {
      console.error("[API PROXY ERROR]:", error);
      res.status(502).json({
        success: false,
        message: "Proxy error connecting to the SNOS central gateway server.",
        error: error.message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
