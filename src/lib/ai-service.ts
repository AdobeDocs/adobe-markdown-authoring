import * as vscode from "vscode";
import axios from "axios";

/**
 * Interface for AI service configuration
 */
interface AiServiceConfig {
  endpoint: string;
  apiKey: string;
  enabled: boolean;
}

/**
 * Get the AI service configuration from VS Code settings
 */
export function getAiServiceConfig(): AiServiceConfig {
  const config = vscode.workspace.getConfiguration(
    "adobeMarkdownAuthoring.aiService"
  );
  return {
    endpoint: config.get<string>("endpoint", ""),
    apiKey: config.get<string>("apiKey", ""),
    enabled: config.get<boolean>("enabled", false),
  };
}

/**
 * Call the AI service to generate alt text for an image
 * @param imageUrl The URL of the image to generate alt text for
 * @returns A promise that resolves to the generated alt text
 */
export async function generateAltText(imageUrl: string): Promise<string> {
  const config = getAiServiceConfig();

  if (!config.enabled || !config.endpoint || !config.apiKey) {
    throw new Error("AI service is not properly configured");
  }

  try {
    // For Adobe Sensei Content & Commerce AI
    // The endpoint should be the Adobe Experience Platform API endpoint

    // Handle local file URLs
    let imageContent;
    if (imageUrl.startsWith("file://")) {
      const fs = require("fs");
      const path = require("path");
      const filePath = imageUrl.replace("file://", "");

      try {
        // Read the file as binary data
        const imageBuffer = fs.readFileSync(filePath);
        // Convert to base64
        const base64Image = imageBuffer.toString("base64");
        imageContent = base64Image;
      } catch (err) {
        console.error("Error reading local image:", err);
        throw new Error(`Failed to read local image: ${err.message}`);
      }
    } else {
      // For remote images, we need to fetch and convert to base64
      try {
        const imageResponse = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(imageResponse.data, "binary");
        imageContent = buffer.toString("base64");
      } catch (err) {
        console.error("Error fetching remote image:", err);
        throw new Error(`Failed to fetch remote image: ${err.message}`);
      }
    }

    // Make API call to Adobe Sensei Content & Commerce AI
    // This is a simplified example - actual implementation may vary based on Adobe's API specifications
    const response = await axios.post(
      config.endpoint,
      {
        // Adobe API specific payload structure
        contentAnalyzerRequests: [
          {
            enableTextExtraction: true,
            analyzeImage: true,
            features: ["IMAGE_PROPERTIES", "CONTENT_TAGS", "OBJECT_DETECTION"],
            data: {
              image: imageContent,
            },
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          // Additional headers may be required for Adobe API authentication
          Authorization: `Bearer ${config.apiKey}`,
        },
      }
    );

    if (response.status === 200 && response.data) {
      // Extract relevant information from Adobe API response
      // This will need to be adjusted based on the actual response structure
      const results = response.data.contentAnalyzerResponses[0];

      // Generate alt text from the analysis results
      let altText = "";

      // Use content tags if available
      if (results.tags && results.tags.length > 0) {
        const topTags = results.tags
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5)
          .map((tag) => tag.name);

        altText = `Image of ${topTags.join(", ")}`;
      }

      // Add object detection information if available
      if (results.objects && results.objects.length > 0) {
        const mainObjects = results.objects
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 3)
          .map((obj) => obj.name);

        if (altText) {
          altText += ` featuring ${mainObjects.join(", ")}`;
        } else {
          altText = `Image featuring ${mainObjects.join(", ")}`;
        }
      }

      // If no meaningful information was extracted, provide a generic message
      if (!altText) {
        altText = "Image content";
      }

      return altText;
    } else {
      throw new Error("Failed to generate alt text from Adobe API");
    }
  } catch (error) {
    console.error("Error calling Adobe API:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate alt text: ${errorMessage}`);
  }
}

/**
 * Check if the AI service is properly configured
 * @returns True if the AI service is properly configured, false otherwise
 */
export function isAiServiceConfigured(): boolean {
  const config = getAiServiceConfig();
  return config.enabled && !!config.endpoint && !!config.apiKey;
}
