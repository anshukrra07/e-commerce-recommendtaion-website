import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

const recalculateProductMetrics = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Reset all product metrics to 0
    console.log('\n📊 Resetting all product metrics to 0...');
    await Product.updateMany({}, { sold: 0, revenue: 0 });
    console.log('✅ Reset complete');

    // Get all paid orders
    console.log('\n🔍 Fetching all paid orders...');
    const paidOrders = await Order.find({ 'payment.status': 'paid' });
    console.log(`✅ Found ${paidOrders.length} paid orders`);

    // Calculate metrics from orders
    console.log('\n💰 Recalculating product metrics from orders...');
    const productMetrics = {};

    for (const order of paidOrders) {
      for (const item of order.items) {
        const productId = item.productId.toString();
        
        if (!productMetrics[productId]) {
          productMetrics[productId] = {
            sold: 0,
            revenue: 0
          };
        }
        
        productMetrics[productId].sold += item.qty;
        productMetrics[productId].revenue += item.price * item.qty;
      }
    }

    // Update each product with calculated metrics
    console.log('\n🔄 Updating products...');
    let updatedCount = 0;
    
    for (const [productId, metrics] of Object.entries(productMetrics)) {
      const result = await Product.findByIdAndUpdate(
        productId,
        {
          sold: metrics.sold,
          revenue: metrics.revenue
        },
        { new: true }
      );
      
      if (result) {
        console.log(`  ✅ ${result.name}: ${metrics.sold} sold, ₹${metrics.revenue} revenue`);
        updatedCount++;
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} products`);
    console.log('\n📊 Summary:');
    console.log(`   Total Orders Processed: ${paidOrders.length}`);
    console.log(`   Products Updated: ${updatedCount}`);
    console.log(`   Total Revenue: ₹${Object.values(productMetrics).reduce((sum, m) => sum + m.revenue, 0)}`);
    console.log(`   Total Units Sold: ${Object.values(productMetrics).reduce((sum, m) => sum + m.sold, 0)}`);

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

recalculateProductMetrics();
