export async function sendWebhook(data) {
  const url = process.env.WEBHOOK_URL; // Aqui es importante cambiarlo o no les funcionara 
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error("Error enviando webhook:", err);
  }
}
