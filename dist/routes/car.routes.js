import express from "express";
import { createCar } from "../controllers/car.controller.js";
const carRouter = express.Router();
carRouter.route('/cars')
    .get()
    .post(createCar);
export default carRouter;
