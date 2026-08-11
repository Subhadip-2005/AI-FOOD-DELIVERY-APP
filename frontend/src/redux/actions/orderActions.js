import api from "../../utils/api"

import {
    createOrderRequest,
    createOrderSuccess,
    createOrderFail,
    paymentRequest,
    paymentSuccess,
    paymentFail,
    myOrdersRequest,
    myOrdersSuccess,
    myOrdersFail,
    orderDetailsRequest,
    orderDetailsSuccess,
    orderDetailsFail,
    restaurantOrdersRequest,
    restaurantOrdersSuccess,
    restaurantOrdersFail,
    updateOrderStatusRequest,
    updateOrderStatusSuccess,
    updateOrderStatusFail
} from "../slices/orderSlice"

//create order
export const createOrder = (session_id) => async(dispatch) =>{
    try{

        dispatch(createOrderRequest());
        const {data} = await api.post("/v1/eats/orders/new",{session_id},
            {
                headers:{
                    "Content-Type": "application/json"
                }
            }
        )

        dispatch(createOrderSuccess(data))

    }catch(error)
    {
       dispatch(createOrderFail(error.response?.data?.message))
    }
}


//payment
export const payment = (items,restaurant) => async(dispatch) =>{
    try{

        dispatch(paymentRequest());
        const {data} = await api.post("/v1/payment/process",{items, restaurant},
            {
                headers:{
                    "Content-Type": "application/json"
                }
            }
        )

        if(data.url){
            window.location.assign(data.url)
        }

        dispatch(paymentSuccess())

    }catch(error)
    {
       dispatch(paymentFail(error.response?.data?.message))
    }
}

//my orders
export const myOrders = () => async(dispatch) =>{
    try{

        dispatch(myOrdersRequest());
        const {data} = await api.get("/v1/eats/orders/me/myOrders")

        dispatch(myOrdersSuccess(data.orders))

    }catch(error)
    {
       dispatch(myOrdersFail(error.response?.data?.message))
    }
}

//orderDetails
export const getOrderDetails = (id) => async(dispatch) =>{
    try{

        dispatch(orderDetailsRequest());
        const {data} = await api.get(`/v1/eats/orders/${id}`)

        dispatch(orderDetailsSuccess(data.order))

    }catch(error)
    {
       dispatch(orderDetailsFail(error.response?.data?.message))
    }
}

//restaurant owner: get incoming orders for their restaurant
export const getRestaurantOrders = () => async(dispatch) =>{
    try{

        dispatch(restaurantOrdersRequest());
        const {data} = await api.get("/v1/eats/orders/restaurant/incoming")

        dispatch(restaurantOrdersSuccess(data))

    }catch(error)
    {
       dispatch(restaurantOrdersFail(error.response?.data?.message))
    }
}

//restaurant owner: update an order's status
export const updateOrderStatus = (id, status) => async(dispatch) =>{
    try{

        dispatch(updateOrderStatusRequest());
        const {data} = await api.put(`/v1/eats/orders/${id}/status`, { status },
            {
                headers:{
                    "Content-Type": "application/json"
                }
            }
        )

        dispatch(updateOrderStatusSuccess(data.order))
        return data.order

    }catch(error)
    {
       dispatch(updateOrderStatusFail(error.response?.data?.message))
       throw error
    }
}

