const express = require("express");
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders,
  getRestaurantOrders,
  updateOrderStatus,
} 
= require("../controllers/orderController");

const authController = require("../controllers/authController");
const { authorizeRoles } = require("../middlewares/authorizeRoles");

router.route("/new").post(authController.protect, newOrder);

// Restaurant-owner routes (must come before "/:id" so it isn't swallowed by that param route)
router
  .route("/restaurant/incoming")
  .get(
    authController.protect,
    authorizeRoles("restaurant-owner"),
    getRestaurantOrders
  );
router
  .route("/:id/status")
  .put(
    authController.protect,
    authorizeRoles("restaurant-owner"),
    updateOrderStatus
  );

router.route("/:id").get(authController.protect, getSingleOrder);
router.route("/me/myOrders").get(authController.protect, myOrders);

module.exports = router;
