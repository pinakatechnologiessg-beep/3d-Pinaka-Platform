import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $regex: /^pending$/i } });
    
    const salesResult = await Order.aggregate([
      { $match: { status: { $in: ["Delivered", "Completed"] } } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);
    
    const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;
    
    // Fetch recent orders mapping
    const recentOrdersDb = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentOrders = recentOrdersDb.map(ord => ({
      id: ord.orderId,
      customer: ord.customerName,
      status: ord.status,
      // Prefixing with $ and fixing 2 decimals for aesthetic
      amount: `$${Number(ord.amount).toFixed(2)}`
    }));

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalSales,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
