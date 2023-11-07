import express from "express";
import { createOrder, deleteOrder, getAllOrders, getOrderById, updateOrderStatus } from "../controllers/order.controller.js";
const orderRouter = express.Router();

orderRouter.route('/orders')
    .get(getAllOrders)
    .post(createOrder)

orderRouter.route('/orders/:id')
    .get(getOrderById)
    .delete(deleteOrder)
    .patch(updateOrderStatus)


export default orderRouter;