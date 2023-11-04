import express from "express";

import { createCar, getAllCars, getCarById } from "../controllers/car.controller.js";

const carRouter = express.Router();
carRouter.route('/cars')
.get(getAllCars)
.post(createCar)

carRouter.route('/cars/:id')
.get(getCarById)


export default carRouter;