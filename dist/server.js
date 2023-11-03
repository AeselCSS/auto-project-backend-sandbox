import express from 'express';
import cors from 'cors';
import customerRouter from "./routes/customer.routes.js";
import carRouter from "./routes/car.routes.js";
import roleRouter from "./routes/role.routes.js";
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/", customerRouter, carRouter, roleRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
