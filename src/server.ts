import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';

// import routes
import customerRouter from "./routes/customer.routes.js";
import carRouter from "./routes/car.routes.js";
import taskRouter from "./routes/task.routes.js";
import workflowRouter from "./routes/workflow.routes.js";
import orderRouter from "./routes/order.routes.js";
import taskInstanceRouter from "./routes/taskInstance.routes.js";
import workflowInstanceRouter from "./routes/workflowInstance.routes.js";

const app = express();
const port: string | number = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/", customerRouter, carRouter, taskRouter, workflowRouter, orderRouter, taskInstanceRouter, workflowInstanceRouter );
app.use("/", async (_req: Request, res: Response) => {
    res.send("Server.js is running🎉")
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});