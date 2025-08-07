export const apiClient = {
  async checkIndex(videoId: string): Promise<boolean> {
    const response = await fetch(`/api/search?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error("Failed to check index");
    }
    const data = await response.json();
    return data.exists;
  },

  async indexVideo(url: string, videoId: string): Promise<void> {
    const response = await fetch("/api/index", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, videoId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to index video");
    }
  },

  async searchVideo(videoId: string, query: string): Promise<any> {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId, query }),
    });

    if (!response.ok) {
      throw new Error("Failed to search video");
    }

    return response.json();
  },
};
