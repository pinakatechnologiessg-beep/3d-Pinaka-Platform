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
      customer: `${ord.firstName || ''} ${ord.lastName || ''}`.trim() || 'Guest',
      status: ord.status,
      amount: `₹${Number(ord.totalPrice || 0).toLocaleString('en-IN')}`
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
