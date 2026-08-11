const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const Restaurant = require("../models/restaurant");


exports.getAllRestaurants = catchAsyncErrors(async (req, res, next) => {
    const apiFeatures = new APIFeatures(Restaurant.find(), req.query).search().sort()
    const restaurant = await apiFeatures.query;
    res.status(200).json({
        status: "success",
        count: restaurant.length,
        restaurant: restaurant
    });
});

exports.getRestaurant = catchAsyncErrors(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.storeId);
    if(!restaurant){
        return next(new ErrorHandler("Restaurant not found", 404));
    }
    res.status(200).json({
        status: "success",
        restaurant: restaurant
    });
});


exports.createRestaurant = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json({
    status: "success",
    data: restaurant,
  });
});

exports.deleteRestaurant = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.storeId);

  if (!restaurant)
    return next(new ErrorHandler("No document found with that ID", 404));

  res.status(200).json({
  status: "success",
  message: "Restaurant deleted successfully",
});
});

// Assign (or change) which restaurant-owner account manages this restaurant — ADMIN only
// =>  PUT /api/v1/eats/stores/:storeId/owner
exports.assignOwner = catchAsyncErrors(async (req, res, next) => {
  const User = require("../models/user");
  const { ownerId } = req.body;

  if (!ownerId) {
    return next(new ErrorHandler("Please provide an ownerId", 400));
  }

  const owner = await User.findById(ownerId);
  if (!owner) {
    return next(new ErrorHandler("No user found with that ID", 404));
  }
  if (owner.role !== "restaurant-owner") {
    return next(
      new ErrorHandler(
        "That user does not have the restaurant-owner role.",
        400
      )
    );
  }

  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.storeId,
    { owner: ownerId },
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    return next(new ErrorHandler("No restaurant found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    restaurant,
  });
});
