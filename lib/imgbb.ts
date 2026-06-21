/**
 * Upload image to imgbb and return the URL
 * @param imageFile - The image file to upload
 * @returns The uploaded image URL
 */
export async function uploadImageToImgbb(imageFile: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error("IMGBB_API_KEY is not configured. Please add it to your environment variables.");
  }

  // Convert file to base64
  const base64Data = await fileToBase64(imageFile);

  // Upload to imgbb - API accepts form-urlencoded with key and image (base64)
  const formData = new URLSearchParams();
  formData.append("key", apiKey);
  formData.append("image", base64Data);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
    throw new Error(errorData.error?.message || "Failed to upload image to imgbb");
  }

  const data = await response.json();
  
  if (!data.success || !data.data?.url) {
    throw new Error(data.error?.message || "Invalid response from imgbb API");
  }

  return data.data.url;
}

/**
 * Convert a file to base64 string (Node.js compatible)
 */
async function fileToBase64(file: File): Promise<string> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);
    // Convert Buffer to base64 string
    const base64 = buffer.toString("base64");
    // Return in data URL format (imgbb API expects just the base64 part)
    return base64;
  } catch (error) {
    throw new Error(`Failed to convert file to base64: ${error}`);
  }
}

