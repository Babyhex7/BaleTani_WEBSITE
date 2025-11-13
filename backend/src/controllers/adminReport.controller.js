const { 
  Order, 
  OrderItem, 
  Product,
  ProductImage, 
  Procurement, 
  ProcurementItem,
  StockMovement,
  Customer,
  sequelize 
} = require("../models");
const { Op } = require("sequelize");

/**
 * Admin Report Controller
 * Menyediakan berbagai laporan untuk analisis bisnis
 */

// ==================== SALES REPORT ====================

/**
 * Get Sales Report
 * Filter: startDate, endDate, groupBy (daily/monthly)
 * Returns: Sales summary, chart data, top products, order details
 */
const getSalesReport = async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      groupBy = 'daily', // daily or monthly
      limit = 10 
    } = req.query;

    // Default date range: last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }
    start.setHours(0, 0, 0, 0);

    const dateFilter = {
      created_at: {
        [Op.between]: [start, end]
      }
    };

    // 1. Sales Summary
    const salesSummary = await Order.findAll({
      where: {
        ...dateFilter,
        payment_status: 'paid'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('total_amount')), 'averageOrderValue']
      ],
      raw: true
    });

    // 2. Chart Data (grouped by date)
    const dateFormat = groupBy === 'monthly' 
      ? '%Y-%m' 
      : '%Y-%m-%d';

    const chartData = await Order.findAll({
      where: {
        ...dateFilter,
        payment_status: 'paid'
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'date'],
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'ASC']],
      raw: true
    });

    // 3. Top Selling Products
    const topProducts = await OrderItem.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            ...dateFilter,
            payment_status: 'paid'
          },
          attributes: []
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.literal('DISTINCT order_id')), 'orderCount']
      ],
      group: ['product_id', 'product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: parseInt(limit),
      raw: false
    });

    // 4. Order Details Table
    const orderDetails = await Order.findAll({
      where: {
        ...dateFilter,
        payment_status: 'paid'
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'full_name', 'phone_number']
        }
      ],
      attributes: [
        'id',
        'order_number',
        'created_at',
        'total_amount',
        'payment_method',
        'order_status'
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    // 5. Sales by Payment Method
    const paymentMethodBreakdown = await Order.findAll({
      where: {
        ...dateFilter,
        payment_status: 'paid'
      },
      attributes: [
        'payment_method',
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
      ],
      group: ['payment_method'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        dateRange: { start, end },
        summary: {
          totalOrders: parseInt(salesSummary[0]?.totalOrders || 0),
          totalRevenue: parseFloat(salesSummary[0]?.totalRevenue || 0),
          averageOrderValue: parseFloat(salesSummary[0]?.averageOrderValue || 0)
        },
        chartData: chartData.map(item => ({
          date: item.date,
          orderCount: parseInt(item.orderCount),
          revenue: parseFloat(item.revenue)
        })),
        topProducts: await Promise.all(topProducts.map(async (item) => {
          const firstImage = await ProductImage.findOne({
            where: { product_id: item.product_id },
            attributes: ['image_url'],
            order: [['created_at', 'ASC']]
          });
          return {
            productId: item.product_id,
            productName: item.product.name,
            imageUrl: firstImage?.image_url || null,
            totalQuantity: parseInt(item.dataValues.totalQuantity),
            totalRevenue: parseFloat(item.dataValues.totalRevenue),
            orderCount: parseInt(item.dataValues.orderCount)
          };
        })),
        paymentMethodBreakdown: paymentMethodBreakdown.map(item => ({
          method: item.payment_method,
          count: parseInt(item.count),
          total: parseFloat(item.total)
        })),
        orderDetails: orderDetails.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          date: order.created_at,
          customerName: order.customer?.full_name || 'Guest',
          customerPhone: order.customer?.phone_number || '-',
          totalAmount: parseFloat(order.total_amount),
          paymentMethod: order.payment_method,
          status: order.order_status
        }))
      }
    });
  } catch (error) {
    console.error("Error getting sales report:", error);
    next(error);
  }
};

// ==================== PROCUREMENT REPORT ====================

/**
 * Get Procurement Report
 * Filter: startDate, endDate, supplier, status
 * Returns: Procurement summary, monthly trends, supplier breakdown
 */
const getProcurementReport = async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      supplier,
      status = 'approved' // Default only show approved
    } = req.query;

    // Default date range: last 90 days
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 90);
    }
    start.setHours(0, 0, 0, 0);

    const whereClause = {
      procurement_date: {
        [Op.between]: [start, end]
      }
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (supplier) {
      whereClause.supplier_name = {
        [Op.like]: `%${supplier}%`
      };
    }

    // 1. Procurement Summary
    const procurementSummary = await Procurement.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Procurement.id')), 'totalProcurements'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalAmount']
      ],
      raw: true
    });

    // 2. Monthly Trends
    const monthlyTrends = await Procurement.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('procurement_date'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('Procurement.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('procurement_date'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('procurement_date'), '%Y-%m'), 'ASC']],
      raw: true
    });

    // 3. Supplier Breakdown
    const supplierBreakdown = await Procurement.findAll({
      where: whereClause,
      attributes: [
        'supplier_name',
        [sequelize.fn('COUNT', sequelize.col('Procurement.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
      ],
      group: ['supplier_name'],
      order: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'DESC']],
      raw: true
    });

    // 4. Top Procured Products
    const topProcuredProducts = await ProcurementItem.findAll({
      include: [
        {
          model: Procurement,
          as: 'procurement',
          where: whereClause,
          attributes: []
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalCost']
      ],
      group: ['product_id', 'product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 10,
      raw: false
    });

    // 5. Recent Procurements
    const recentProcurements = await Procurement.findAll({
      where: whereClause,
      attributes: [
        'id',
        'procurement_number',
        'procurement_date',
        'supplier_name',
        'total_amount',
        'status',
        'procurement_type'
      ],
      order: [['procurement_date', 'DESC']],
      limit: 50
    });

    res.status(200).json({
      success: true,
      data: {
        dateRange: { start, end },
        summary: {
          totalProcurements: parseInt(procurementSummary[0]?.totalProcurements || 0),
          totalAmount: parseFloat(procurementSummary[0]?.totalAmount || 0)
        },
        monthlyTrends: monthlyTrends.map(item => ({
          month: item.month,
          count: parseInt(item.count),
          total: parseFloat(item.total)
        })),
        supplierBreakdown: supplierBreakdown.map(item => ({
          supplier: item.supplier_name || 'Unknown',
          count: parseInt(item.count),
          total: parseFloat(item.total)
        })),
        topProducts: await Promise.all(topProcuredProducts.map(async (item) => {
          const firstImage = await ProductImage.findOne({
            where: { product_id: item.product_id },
            attributes: ['image_url'],
            order: [['created_at', 'ASC']]
          });
          return {
            productId: item.product_id,
            productName: item.product.name,
            imageUrl: firstImage?.image_url || null,
            totalQuantity: parseFloat(item.dataValues.totalQuantity),
            totalCost: parseFloat(item.dataValues.totalCost)
          };
        })),
        recentProcurements: recentProcurements.map(proc => ({
          id: proc.id,
          procurementNumber: proc.procurement_number,
          date: proc.procurement_date,
          supplier: proc.supplier_name || '-',
          totalAmount: parseFloat(proc.total_amount),
          status: proc.status,
          type: proc.procurement_type
        }))
      }
    });
  } catch (error) {
    console.error("Error getting procurement report:", error);
    next(error);
  }
};

// ==================== STOCK MOVEMENT REPORT ====================

/**
 * Get Stock Movement Report
 * Filter: startDate, endDate, productId, movementType
 * Returns: Stock movements from stock_movements_reporting table
 */
const getStockMovementReport = async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      productId,
      movementType, // in, out, adjustment
      limit = 100 
    } = req.query;

    // Default date range: last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }
    start.setHours(0, 0, 0, 0);

    const whereClause = {
      created_at: {
        [Op.between]: [start, end]
      }
    };

    if (productId) {
      whereClause.product_id = productId;
    }

    if (movementType) {
      whereClause.movement_type = movementType;
    }

    // 1. Stock Movement Summary
    const movementSummary = await StockMovement.findAll({
      where: whereClause,
      attributes: [
        'movement_type',
        [sequelize.fn('COUNT', sequelize.col('StockMovement.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity_change')), 'totalQuantity']
      ],
      group: ['movement_type'],
      raw: true
    });

    // 2. Stock Movement Details
    const movements = await StockMovement.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'quantity_info']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    // 3. Product-wise Summary (if no specific product filter)
    let productSummary = null;
    if (!productId) {
      productSummary = await StockMovement.findAll({
        where: whereClause,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name']
          }
        ],
        attributes: [
          'product_id',
          [sequelize.fn('SUM', 
            sequelize.literal("CASE WHEN movement_type = 'procurement_in' THEN quantity_change ELSE 0 END")
          ), 'totalIn'],
          [sequelize.fn('SUM', 
            sequelize.literal("CASE WHEN movement_type = 'sale_out' OR movement_type = 'expired' THEN quantity_change ELSE 0 END")
          ), 'totalOut'],
          [sequelize.fn('COUNT', sequelize.col('StockMovement.id')), 'movementCount']
        ],
        group: ['product_id', 'product.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('StockMovement.id')), 'DESC']],
        limit: 20,
        raw: false
      });
    }

    res.status(200).json({
      success: true,
      data: {
        dateRange: { start, end },
        summary: movementSummary.map(item => ({
          type: item.movement_type,
          count: parseInt(item.count),
          totalQuantity: parseFloat(item.totalQuantity)
        })),
        movements: await Promise.all(movements.map(async (mov) => {
          const firstImage = await ProductImage.findOne({
            where: { product_id: mov.product_id },
            attributes: ['image_url'],
            order: [['created_at', 'ASC']]
          });
          return {
            id: mov.id,
            date: mov.created_at,
            productId: mov.product_id,
            productName: mov.product?.name || 'Unknown',
            imageUrl: firstImage?.image_url || null,
            unit: mov.product?.quantity_info || 'unit',
            movementType: mov.movement_type,
            quantity: parseFloat(mov.quantity_change),
            stockBefore: parseFloat(mov.stock_before),
            stockAfter: parseFloat(mov.stock_after),
            referenceType: mov.reference_type,
            referenceId: mov.reference_id,
            notes: mov.notes
          };
        })),
        productSummary: productSummary ? await Promise.all(productSummary.map(async (item) => {
          const firstImage = await ProductImage.findOne({
            where: { product_id: item.product_id },
            attributes: ['image_url'],
            order: [['created_at', 'ASC']]
          });
          return {
            productId: item.product_id,
            productName: item.product.name,
            imageUrl: firstImage?.image_url || null,
            totalIn: parseFloat(item.dataValues.totalIn),
            totalOut: parseFloat(item.dataValues.totalOut),
            netChange: parseFloat(item.dataValues.totalIn) - parseFloat(item.dataValues.totalOut),
            movementCount: parseInt(item.dataValues.movementCount)
          };
        })) : null
      }
    });
  } catch (error) {
    console.error("Error getting stock movement report:", error);
    next(error);
  }
};

// ==================== FINANCE REPORT ====================

/**
 * Get Finance Report
 * Comparison between procurement (buying) vs sales (selling)
 * Calculate gross profit per month
 */
const getFinanceReport = async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate 
    } = req.query;

    // Default date range: last 12 months
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setMonth(start.getMonth() - 12);
    }
    start.setHours(0, 0, 0, 0);

    // 1. Sales Data (Revenue from paid orders)
    const salesData = await Order.findAll({
      where: {
        created_at: {
          [Op.between]: [start, end]
        },
        payment_status: 'paid'
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
      raw: true
    });

    // 2. Procurement Data (Cost from approved procurements)
    const procurementData = await Procurement.findAll({
      where: {
        procurement_date: {
          [Op.between]: [start, end]
        },
        status: 'approved'
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('procurement_date'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('Procurement.id')), 'procurementCount'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'cost']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('procurement_date'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('procurement_date'), '%Y-%m'), 'ASC']],
      raw: true
    });

    // 3. Combine data by month
    const monthlyData = {};
    
    salesData.forEach(item => {
      if (!monthlyData[item.month]) {
        monthlyData[item.month] = {
          month: item.month,
          revenue: 0,
          cost: 0,
          orderCount: 0,
          procurementCount: 0
        };
      }
      monthlyData[item.month].revenue = parseFloat(item.revenue);
      monthlyData[item.month].orderCount = parseInt(item.orderCount);
    });

    procurementData.forEach(item => {
      if (!monthlyData[item.month]) {
        monthlyData[item.month] = {
          month: item.month,
          revenue: 0,
          cost: 0,
          orderCount: 0,
          procurementCount: 0
        };
      }
      monthlyData[item.month].cost = parseFloat(item.cost);
      monthlyData[item.month].procurementCount = parseInt(item.procurementCount);
    });

    // 4. Calculate profit for each month
    const financeData = Object.values(monthlyData).map(item => ({
      month: item.month,
      revenue: item.revenue,
      cost: item.cost,
      grossProfit: item.revenue - item.cost,
      profitMargin: item.revenue > 0 ? ((item.revenue - item.cost) / item.revenue * 100).toFixed(2) : 0,
      orderCount: item.orderCount,
      procurementCount: item.procurementCount
    }));

    // 5. Overall Summary
    const totalRevenue = financeData.reduce((sum, item) => sum + item.revenue, 0);
    const totalCost = financeData.reduce((sum, item) => sum + item.cost, 0);
    const totalProfit = totalRevenue - totalCost;

    res.status(200).json({
      success: true,
      data: {
        dateRange: { start, end },
        summary: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalCost: parseFloat(totalCost.toFixed(2)),
          totalProfit: parseFloat(totalProfit.toFixed(2)),
          profitMargin: totalRevenue > 0 ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0
        },
        monthlyData: financeData.sort((a, b) => a.month.localeCompare(b.month))
      }
    });
  } catch (error) {
    console.error("Error getting finance report:", error);
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getProcurementReport,
  getStockMovementReport,
  getFinanceReport
};
