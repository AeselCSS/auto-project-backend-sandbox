import express from "express";
import { assignTasksToWorkflow, createWorkflow, createManyWorkflows, deleteWorkflow, deleteAllWorkflows, deleteTasksFromWorkflow, getWorkflowTasks, getAllWorkflows, getWorkflowById, updateWorkflow } from "../controllers/workflow.controller.js";
const workflowRouter = express.Router();

workflowRouter.route('/workflows')
    .get(getAllWorkflows)
    .post(createWorkflow)

workflowRouter.route('/workflows/many')
    .post(createManyWorkflows)
    .delete(deleteAllWorkflows)

workflowRouter.route('/workflows/:id')
    .get(getWorkflowById)
    .post(assignTasksToWorkflow)
    .put(updateWorkflow)
    .delete(deleteWorkflow)

workflowRouter.route('/workflows/:id/tasks')
    .get(getWorkflowTasks)
    .delete(deleteTasksFromWorkflow)

export default workflowRouter;