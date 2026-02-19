import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Blog } from "../models/blog.model.js";
import { Order } from "../models/order.model.js"; // Assuming you have an Order model

const getDashboardStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalProducts, totalBlogs, totalOrders, recentUsers, recentProducts, recentBlogs, recentOrders] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Blog.countDocuments(),
        Order.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5).select("-password -refreshToken").lean(),
        Product.find().sort({ createdAt: -1 }).limit(5).lean(),
        Blog.find().sort({ createdAt: -1 }).limit(5).lean(),
        Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalUsers,
                totalProducts,
                totalBlogs,
                totalOrders,
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
