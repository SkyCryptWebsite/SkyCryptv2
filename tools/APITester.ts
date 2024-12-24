async function sendPostRequest() {
  const uuid = "4855c53ee4fb4100997600a92fc50984";
  const emoji = "🔥";

  const url = `http://localhost:5173/api/emoji`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid, emoji })
    });

    const responseData = await response.json();
    console.log("Response:", responseData);
  } catch (error) {
    console.error("Error:", error);
  }
}

sendPostRequest();
