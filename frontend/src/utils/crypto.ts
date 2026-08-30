// Encrypt room password using Web Crypto API to match Go backend AES-GCM decryption
export async function encryptPasswordForUrl(plaintext: string): Promise<string> {
  if (!plaintext) return "";
  try {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode("QueueCastRoomSecretKey32BytesLong!");
    const key = await window.crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(plaintext)
    );

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    const hex = Array.from(combined)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return "enc:" + hex;
  } catch (err) {
    console.error("Encryption error:", err);
    return "";
  }
}
