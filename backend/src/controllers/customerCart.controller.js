/**
 * CUSTOMER CART CONTROLLER
 * Handle cart operations for customers
 */

const {
  Cart,
  Product,
  ProductImage,
  ProductDiscount,
  Discount,
} = require("../models");
const { Op } = require("sequelize");

/**
 * Get customer's cart with all items
 */
exports.getCart = async (req, res) => {
  try {
    const customerId = req.customer.id;

    // Find all cart items for customer
    const cartItems = await Cart.findAll({
      where: { customer_id: customerId },
      include: [
        {
          model: Product,
          as: "product",
          attributes: [
            "id",
            "name",
            "description",
            "selling_price",
            "total_stock",
            "quantity_info",
          ],
          include: [
            {
              model: ProductImage,
              as: "images",
              attributes: ["image_url", "display_order"],
              required: false,
              separate: true,
              order: [["display_order", "ASC"]],
            },
            {
              model: ProductDiscount,
              as: "productDiscounts",
              required: false,
              include: [
                {
                  model: Discount,
                  as: "discount",
                  attributes: [
                    "id",
                    "discount_name",
                    "discount_type",
                    "value",
                    "start_date",
                    "end_date",
                    "is_active",
                  ],
                  where: {
                    is_active: true,
                    start_date: {
                      [Op.lte]: require("../utils/dateHelper").getWIBDate(),
                    },
                    end_date: {
                      [Op.gte]: require("../utils/dateHelper").getWIBDate(),
                    },
                  },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    // Calculate totals and discounts
    const itemsWithCalculations = cartItems.map((item) => {
      const product = item.product;
      let finalPrice = parseFloat(product.selling_price);
      let discount = null;

      // Check if product has active discount - ALWAYS use pre-calculated discounted_price
      if (product.productDiscounts && product.productDiscounts.length > 0) {
        const productDiscount = product.productDiscounts[0];

        // ALWAYS use discounted_price from ProductDiscount table (set by admin)
        if (productDiscount.discounted_price) {
          finalPrice = parseFloat(productDiscount.discounted_price);

          if (productDiscount.discount) {
            discount = {
              id: productDiscount.discount.id,
              name: productDiscount.discount.discount_name,
              type: productDiscount.discount.discount_type,
              value: parseFloat(productDiscount.discount.value),
              finalPrice: finalPrice,
            };
          }
        }
      }

      // Round to 2 decimal places
      finalPrice = Math.round(finalPrice * 100) / 100;
      const subtotal =
        Math.round(finalPrice * parseFloat(item.quantity) * 100) / 100;

      return {
        id: item.id,
        product_id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.selling_price),
        finalPrice: finalPrice,
        stock: product.total_stock,
        unit: product.quantity_info || "unit", // ✅ Added for consistency
        quantityInfo: product.quantity_info, // ✅ Added for consistency
        quantity: parseFloat(item.quantity),
        subtotal: subtotal,
        image:
          product.images && product.images.length > 0
            ? product.images[0].image_url
            : null,
        discount: discount,
      };
    });

    // Calculate cart totals
    const subtotal = itemsWithCalculations.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const totalItems = itemsWithCalculations.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: {
        items: itemsWithCalculations,
        summary: {
          totalItems: totalItems,
          subtotal: subtotal,
          shippingCost: 0, // Free shipping
          total: subtotal,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

/**
 * Add item to cart
 */
exports.addToCart = async (req, res) => {
  const { sequelize } = require("../config/database");
  const transaction = await sequelize.transaction();

  try {
    const customerId = req.customer.id;
    const { product_id, quantity } = req.body;

    // Validate input
    if (!product_id || !quantity || quantity < 1) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Product ID and valid quantity are required",
      });
    }

    // Validate quantity limit (max 100 per product)
    if (quantity > 100) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Maksimal pembelian 100 item per produk",
      });
    }

    // Check if product exists and has enough stock (with row locking)
    const product = await Product.findOne({
      where: { id: product_id },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.total_stock < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Not enough stock. Available: ${product.total_stock}`,
      });
    }

    // Check if item already exists in cart
    let cartItem = await Cart.findOne({
      where: {
        customer_id: customerId,
        product_id: product_id,
      },
      transaction,
    });

    if (cartItem) {
      // Update quantity
      const newQuantity = parseFloat(cartItem.quantity) + quantity;

      if (product.total_stock < newQuantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Maximum stock: ${product.total_stock}`,
        });
      }

      cartItem.quantity = newQuantity;
      await cartItem.save({ transaction });
      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: {
          id: cartItem.id,
          product_id: cartItem.product_id,
          quantity: parseFloat(cartItem.quantity),
        },
      });
    } else {
      // Create new cart item
      cartItem = await Cart.create(
        {
          customer_id: customerId,
          product_id: product_id,
          quantity: quantity,
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        data: {
          id: cartItem.id,
          product_id: cartItem.product_id,
          quantity: parseFloat(cartItem.quantity),
        },
      });
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

/**
 * Update cart item quantity
 */
exports.updateCartItem = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    // Find cart item
    const cartItem = await Cart.findOne({
      where: {
        id: id,
        customer_id: customerId,
      },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["total_stock", "quantity_info"],
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Check stock
    if (cartItem.product.total_stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock. Available: ${
          cartItem.product.total_stock
        } ${cartItem.product.quantity_info || "unit"}`,
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: {
        id: cartItem.id,
        product_id: cartItem.product_id,
        quantity: parseFloat(cartItem.quantity),
      },
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

/**
 * Remove item from cart
 */
exports.removeFromCart = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { id } = req.params;

    // Find cart item
    const cartItem = await Cart.findOne({
      where: {
        id: id,
        customer_id: customerId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Delete cart item
    await cartItem.destroy();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

/**
 * Clear entire cart
 */
exports.clearCart = async (req, res) => {
  try {
    const customerId = req.customer.id;

    // Delete all cart items for this customer
    const deletedCount = await Cart.destroy({
      where: { customer_id: customerId },
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart is already empty",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};
