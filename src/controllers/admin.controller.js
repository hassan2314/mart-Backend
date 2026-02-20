import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Blog } from "../models/blog.model.js";
import { Order } from "../models/order.model.js"; // Assuming you have an Order model

const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalProducts,
        totalBlogs,
        totalOrders,
        revenueResult,
        ordersByStatusResult,
        recentUsers,
        recentProducts,
        recentBlogs,
        recentOrders,
    ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Blog.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.aggregate([
            { $match: { status: { $nin: ["cancelled"] } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        User.find().sort({ createdAt: -1 }).limit(5).select("-password -refreshToken").lean(),
        Product.find().sort({ createdAt: -1 }).limit(5).lean(),
        Blog.find().sort({ createdAt: -1 }).limit(5).lean(),
        Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const totalRevenue = revenueResult[0]?.total ?? 0;
    const ordersByStatus = {
        pending: 0,
        paid: 0,
        shipped: 0,
        delivered: 0,
    };
    ordersByStatusResult.forEach(({ _id, count }) => {
        if (ordersByStatus.hasOwnProperty(_id)) ordersByStatus[_id] = count;
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalUsers,
                totalProducts,
                totalBlogs,
                totalOrders,
                totalRevenue,
                ordersByStatus,
                recentUsers,
                recentProducts,
                recentBlogs,
                recentOrders,
            },
            "Admin dashboard stats fetched successfully"
        )
    );
});

export {
    getDashboardStats
};
