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
    // Make API call to the configured AI service
    const response = await axios.post(
      config.endpoint,
      { imageUrl },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
      }
    );

    if (response.status === 200 && response.data && response.data.altText) {
      return response.data.altText;
    } else {
      throw new Error("Failed to generate alt text");
    }
  } catch (error) {
    console.error("Error calling AI service:", error);
    throw new Error(`Failed to generate alt text: ${error.message}`);
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
