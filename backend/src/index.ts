import "dotenv/config";
import { env } from "./lib/env"; // validates all env vars at startup — crashes fast if misconfigured
import app from "./app";

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
