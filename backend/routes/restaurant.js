const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getAllRestaurants,
  createRestaurant,
  getRestaurant,
  deleteRestaurant,
  assignOwner,
} = require("../controllers/restaurantController");

const { protect } = require("../controllers/authController");
const { authorizeRoles } = require("../middlewares/authorizeRoles");

const menuRoutes = require("./menu");

router
  .route("/")
  .get(getAllRestaurants)
  .post(protect, authorizeRoles("admin"), createRestaurant);

router
  .route("/:storeId")
  .get(getRestaurant)
  .delete(protect, authorizeRoles("admin"), deleteRestaurant);

router
  .route("/:storeId/owner")
  .put(protect, authorizeRoles("admin"), assignOwner);

router.use("/:storeId/menus", menuRoutes);

module.exports = router;
