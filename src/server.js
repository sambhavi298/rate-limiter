const express = require("express");
const checkRoute = require("./routes/check");

const app = express();
app.use(express.json());

app.use("/check", checkRoute);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Rate Limiter running on port ${PORT}`);
});
