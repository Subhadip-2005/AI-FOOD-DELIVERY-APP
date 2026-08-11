import {createSlice} from "@reduxjs/toolkit"

const initialState ={
    loading: false,
    error:null,
    order:null,
    orders:[],
    restaurantOrders:[],
    restaurantOrdersLoading:false,
    restaurantOrdersError:null,
    restaurantName:null,
    updatingOrderId:null,
    updateError:null
}

const orderSlice = createSlice({
    name:"order",
    initialState,
    reducers:{
        ////common
        clearErrors:(state)=>{
            state.error= null
        },
        //create order
        createOrderRequest:(state)=>{
            state.loading=true;
        },
        createOrderSuccess:(state,action)=>{
            state.loading= false,
            state.order= action.payload
        },
        createOrderFail:(state,action)=>{
             state.loading= false,
            state.error= action.payload
        },
        //payment
        paymentRequest:(state)=>{
            state.loading=true;
        },
        paymentSuccess:(state)=>{
            state.loading= false   
        },
        paymentFail:(state,action)=>{
             state.loading= false,
            state.error= action.payload
        },

        //My orders
        myOrdersRequest:(state)=>{
            state.loading=true;
        },
        myOrdersSuccess:(state,action)=>{
            state.loading= false,
            state.orders= action.payload
        },
        myOrdersFail:(state,action)=>{
             state.loading= false,
            state.error= action.payload
        },

        // Order details
        orderDetailsRequest:(state)=>{
            state.loading=true;
        },
        orderDetailsSuccess:(state,action)=>{
            state.loading= false,
            state.order= action.payload
        },
        orderDetailsFail:(state,action)=>{
             state.loading= false,
            state.error= action.payload
        },

        // Restaurant owner: incoming orders
        restaurantOrdersRequest:(state)=>{
            state.restaurantOrdersLoading=true;
            state.restaurantOrdersError=null;
        },
        restaurantOrdersSuccess:(state,action)=>{
            state.restaurantOrdersLoading= false;
            state.restaurantOrders= action.payload.orders;
            state.restaurantName= action.payload.restaurant?.name;
        },
        restaurantOrdersFail:(state,action)=>{
            state.restaurantOrdersLoading= false;
            state.restaurantOrdersError= action.payload;
        },

        // Restaurant owner: update order status
        updateOrderStatusRequest:(state)=>{
            state.updateError=null;
        },
        updateOrderStatusSuccess:(state,action)=>{
            const updated = action.payload;
            state.restaurantOrders = state.restaurantOrders.map((o) =>
                o._id === updated._id ? updated : o
            );
        },
        updateOrderStatusFail:(state,action)=>{
            state.updateError= action.payload;
        },

    }
})

export const {
    clearErrors,
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
} = orderSlice.actions

export default orderSlice.reducer