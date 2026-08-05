import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route: Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", doctor: "Dr. Rafael Bastazini", app: "VetCare OS" });
  });

  // API Route: AI Assistant for Dr. Rafael Bastazini
  app.post("/api/gemini/vet-assistant", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "Chave de API GEMINI_API_KEY não configurada no servidor.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const { prompt, type, patientData, serviceData } = req.body;

      let systemInstruction = `Você é o assistente inteligente de inteligência artificial do Dr. Rafael Bastazini, médico veterinário de excelência.
Forneça respostas profissionais, precisas, empáticas e bem estruturadas em português do Brasil.`;

      if (type === "pricing_analysis") {
        systemInstruction += ` Seu objetivo é analisar os custos de um atendimento clínico (insumos, tempo do doutor, exames, medicamentos) e sugerir o preço ideal com margem de lucro justa e competitiva.`;
      } else if (type === "clinical_summary") {
        systemInstruction += ` Seu objetivo é sintetizar prontuários médicos (SOAP), estruturar hipóteses diagnósticas e sugerir recomendações para o tutor de forma clara.`;
      } else if (type === "medication_info") {
        systemInstruction += ` Seu objetivo é orientar sobre dosagens usuais em mg/kg, intervalo de administração e precauções para pets.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt || `Analise os dados fornecidos: ${JSON.stringify({ patientData, serviceData })}`,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      return res.json({ result: response.text });
    } catch (err: any) {
      console.error("Erro no Gemini Vet Assistant:", err);
      return res.status(500).json({ error: err.message || "Erro interno ao processar a solicitação com IA." });
    }
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Servidor do Dr. Rafael Bastazini rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
