const Order = require("../models/order");
const FoodItem = require("../models/foodItem");
const Cart = require("../models/cartModel");
const { ObjectId } = require("mongodb");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const dotenv = require("dotenv");

//setting up config file
dotenv.config({ path: "./config/config.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a new order   =>  /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  // console.log("id", req.body);
  const { session_id } = req.body;

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["customer"],
  });
  console.log(session);
  const cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: "items.foodItem",
      select: "name price images",
    })
    .populate({
      path: "restaurant",
      select: "name",
    });
  console.log(cart);

  const shippingAddress =
  session.shipping_details?.address || session.customer_details?.address;

let deliveryInfo = {
  address: shippingAddress
    ? `${shippingAddress.line1 || ""} ${shippingAddress.line2 || ""}`.trim()
    : "",
  city: shippingAddress?.city,
  phoneNo: session.customer_details?.phone,
  postalCode: shippingAddress?.postal_code,
  country: shippingAddress?.country,
};

  // let deliveryInfo = {
  //   address:
  //     session.shipping_details.address.line1 +
  //     " " +
  //     session.shipping_details.address.line1,
  //   city: session.shipping_details.address.city,
  //   phoneNo: session.customer_details.phone,
  //   postalCode: session.shipping_details.address.postal_code,
  //   country: session.shipping_details.address.country,
  // };
  let orderItems = cart.items.map((item) => ({
    name: item.foodItem.name,
    quantity: item.quantity,
    image: item.foodItem.images[0].url,
    price: item.foodItem.price,
    fooditem: item.foodItem._id,
  }));

  let paymentInfo = {
    id: session.payment_intent,
    status: session.payment_status,
  };

  const order = await Order.create({
    orderItems,
    deliveryInfo,
    paymentInfo,
    deliveryCharge: +session.shipping_cost.amount_subtotal / 100,
    itemsPrice: +session.amount_subtotal / 100,
    finalTotal: +session.amount_total / 100,
    user: req.user.id,
    restaurant: cart.restaurant._id,
    paidAt: Date.now(),
  });
  console.log(order);

  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(200).json({
    success: true,
    order,
  });
});

// Get single order   =>   /api/v1/orders/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("restaurant")
    .exec();

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get logged in user orders   =>   /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  // Get the user ID from req.user
  const userId = new ObjectId(req.user.id);
  // Find orders for the specific user using the retrieved user ID
  const orders = await Order.find({ user: userId })
    .populate("user", "name email")
    .populate("restaurant")
    .exec();

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get all orders - ADMIN  =>   /api/v1/admin/orders/
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.finalTotal;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// Get orders for the logged-in restaurant owner's restaurant
// =>  GET /api/v1/eats/orders/restaurant/incoming
exports.getRestaurantOrders = catchAsyncErrors(async (req, res, next) => {
  const Restaurant = require("../models/restaurant");

  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    return next(
      new ErrorHandler("No restaurant is linked to this account yet.", 404)
    );
  }

  const orders = await Order.find({ restaurant: restaurant._id })
    .populate("user", "name email phoneNumber")
    .sort({ createdAt: -1 })
    .exec();

  res.status(200).json({
    success: true,
    restaurant: { _id: restaurant._id, name: restaurant.name },
    count: orders.length,
    orders,
  });
});

// Allowed order status values, in the order they normally progress
const ORDER_STATUS_FLOW = [
  "Processing",
  "Accepted",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

// Update order status (restaurant owner only, and only for their own restaurant's orders)
// =>  PUT /api/v1/eats/orders/:id/status
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const Restaurant = require("../models/restaurant");
  const { status } = req.body;

  if (!status || (!ORDER_STATUS_FLOW.includes(status) && status !== "Cancelled")) {
    return next(
      new ErrorHandler(
        `Invalid status. Must be one of: ${ORDER_STATUS_FLOW.join(", ")}, or Cancelled`,
        400
      )
    );
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  // Confirm this order belongs to a restaurant owned by the requesting user
  const restaurant = await Restaurant.findOne({
    _id: order.restaurant,
    owner: req.user._id,
  });
  if (!restaurant) {
    return next(
      new ErrorHandler("You are not authorized to update this order.", 403)
    );
  }

  order.orderStatus = status;
  if (status === "Delivered") {
    order.deliveredAt = Date.now();
  }
  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});
