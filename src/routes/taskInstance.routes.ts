import express from "express";
import { updateTaskInstance, getAllTaskInstancesInWorkflowInstance } from "../controllers/taskInstance.controller.js";
const taskInstanceRouter = express.Router();

taskInstanceRouter.route('/taskInstances/:id')
    .get(getAllTaskInstancesInWorkflowInstance)
    .patch(updateTaskInstance)


export default taskInstanceRouter;