import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const getProductImage = (productName: string) => {
    const imageMap: { [key: string]: string } = {
      "Rice Husk": "/Rice Husk.jpg",
      "Wheat Straw": "/Wheat Straw.jpg",
      "Sugarcane Bagasse": "/Sugarcane Bagasse.jpg",
      "Coconut Fiber": "/Coconut Fiber.jpg",
      "Peanut Shell": "/Peanut Shell.jpg",
      "Corn Stalks": "/Corn Stalks.jpg",
    };
    return imageMap[productName] || "/Cotton Waste.jpg";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/marketplace")}
            className="mr-4 p-2 hover:scale-110 transition-transform duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-xl animate-scale-in">
            <CardContent className="py-16 text-center">
              <div className="animate-pulse mb-6">
                <Package className="h-20 w-20 text-gray-400 mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Add some agricultural waste products to get started on your
                sustainable journey
              </p>
              <Button
                onClick={() => navigate("/marketplace")}
                className="bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items - Takes up 2 columns on large screens */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-xl animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl text-green-800 flex items-center">
                    <Package className="h-6 w-6 mr-2" />
                    Cart Items ({getTotalItems()} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 animate-fade-in hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <img
                          src={getProductImage(item.name)}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
                        />

                        <div className="flex-1 w-full sm:w-auto">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {item.name}
                          </h3>
                          <p className="text-sm text-green-600 font-medium">
                            ₹{item.price.toFixed(2)} per kg
                          </p>
                          <p className="text-sm text-gray-500">
                            Stock: {item.stock} kg available
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="hover:scale-110 transition-transform duration-200"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 text-center font-semibold"
                            min="1"
                            max={item.stock}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="hover:scale-110 transition-transform duration-200 disabled:hover:scale-100"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right w-full sm:w-auto">
                          <p className="font-bold text-lg text-gray-800">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} kg
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-110 transition-all duration-200 w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-2 sm:hidden">Remove</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Takes up 1 column on large screens */}
            <div className="lg:col-span-1">
              <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl sticky top-8 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl text-blue-800">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-lg">
                        ₹{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">
                          ₹{getTotalPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/marketplace")}
                        className="w-full hover:scale-105 transition-all duration-200"
                      >
                        Continue Shopping
                      </Button>
                      <Button
                        onClick={() => navigate("/checkout")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
