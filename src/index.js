import { app } from "./app.js";
import { connectDb } from "./db/index.js";

connectDb()
  .then(() => {
    try {
      app.listen(process.env.PORT, () => {
        console.log("Server successfully connected on ", process.env.PORT);
      });
    } catch (error) {
      console.log("Server connection failed");
    }
  })
  .catch((err) => {
    console.log("Mongodb connection failed", err);
  });
