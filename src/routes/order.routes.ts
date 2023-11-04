import express from "express";
import { createOrder, deleteOrder, getAllOrders, getOrderById, updateOrderWorkflows, getOrderWorkflowTaskStatuses } from "../controllers/order.controller.js";
const orderRouter = express.Router();

orderRouter.route('/orders')
    .get(getAllOrders)
    .post(createOrder)

orderRouter.route('/orders/:id')
    .get(getOrderById)
    .put(updateOrderWorkflows)
    .delete(deleteOrder)

orderRouter.route('/orders/:id/statuses')
    .get(getOrderWorkflowTaskStatuses)
export default orderRouter;