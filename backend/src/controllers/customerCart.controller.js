/**
 * CUSTOMER CART CONTROLLER
 * Handle cart operations for customers
 */

const {
  Cart,
  CartItem,
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

    // Find or create cart for customer
    let cart = await Cart.findOne({
      where: { customer_id: customerId },
      include: [
        {
          model: CartItem,
          as: "items",
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
                  // where clause cleaned,
                  required: false,
                  order: [["display_order", "ASC"]],
                },
                {
                  model: ProductDiscount,
                  as: "productDiscounts",
                  required: false,
                  // where clause cleaned,
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
                        start_date: { [Op.lte]: new Date() },
                        end_date: { [Op.gte]: new Date() },
                      },
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ customer_id: customerId });
      cart.items = [];
    }

    // Calculate totals and discounts
    const itemsWithCalculations = cart.items.map((item) => {
      const product = item.product;
      let finalPrice = parseFloat(product.price);
      let discount = null;

      // Check if product has active discount
      if (product.productDiscounts && product.productDiscounts.length > 0) {
        const productDiscount = product.productDiscounts[0];
        if (productDiscount.discount) {
          const discountData = productDiscount.discount;

          if (discountData.discount_type === "percentage") {
            const discountAmount =
              (finalPrice * parseFloat(discountData.value)) / 100;
            finalPrice = finalPrice - discountAmount;
          } else if (discountData.discount_type === "fixed_amount") {
            finalPrice = finalPrice - parseFloat(discountData.value);
          }

          discount = {
            id: discountData.id,
            name: discountData.discount_name,
            type: discountData.discount_type,
            value: parseFloat(discountData.value),
            finalPrice: finalPrice,
          };
        }
      }

      const subtotal = finalPrice * item.quantity;

      return {
        id: item.id,
        product_id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        finalPrice: finalPrice,
        stock: product.stock,
        quantity: item.quantity,
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
        cart_id: cart.id,
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
  try {
    const customerId = req.customer.id;
    const { product_id, quantity } = req.body;

    // Validate input
    if (!product_id || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Product ID and valid quantity are required",
      });
    }

    // Check if product exists and has enough stock
    const product = await Product.findOne({
      where: { id: product_id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock. Available: ${product.stock}`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({
      where: { customer_id: customerId },
    });

    if (!cart) {
      cart = await Cart.create({ customer_id: customerId });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id: product_id,
      },
    });

    if (cartItem) {
      // Update quantity
      const newQuantity = cartItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Maximum stock: ${product.stock}`,
        });
      }

      cartItem.quantity = newQuantity;
      await cartItem.save();

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: cartItem,
      });
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: product_id,
        quantity: quantity,
      });

      return res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        data: cartItem,
      });
    }
  } catch (error) {
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
    const cartItem = await CartItem.findOne({
      where: { id: id },
      include: [
        {
          model: Cart,
          as: "cart",
          where: { customer_id: customerId },
        },
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
      data: cartItem,
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
    const cartItem = await CartItem.findOne({
      where: { id: id },
      include: [
        {
          model: Cart,
          as: "cart",
          where: { customer_id: customerId },
        },
      ],
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

    // Find cart
    const cart = await Cart.findOne({
      where: { customer_id: customerId },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Delete all cart items
    await CartItem.destroy({
      where: { cart_id: cart.id },
    });

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
