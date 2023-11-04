import express from "express";
import { createTask, createManyTasks, deleteTask, deleteAllTasks, getAllTasks, getTaskById, updateTask } from "../controllers/task.controller.js";
const taskRouter = express.Router();

taskRouter.route('/tasks')
    .get(getAllTasks)
    .post(createTask)

taskRouter.route('/tasks/many')
    .post(createManyTasks)
    .delete(deleteAllTasks)

taskRouter.route('/tasks/:id')
    .get(getTaskById)
    .put(updateTask)
    .delete(deleteTask)

export default taskRouter;