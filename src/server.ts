import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';

// import routes
import customerRouter from "./routes/customer.routes.js";
import carRouter from "./routes/car.routes.js";
import roleRouter from "./routes/role.routes.js";

const app = express();
const port: string | number = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/", customerRouter, carRouter, roleRouter);
app.use("/", async (_req: Request, res: Response) => {
    res.send("Server.js is running🎉")
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});