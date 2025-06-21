import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Leaf, TrendingUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { databaseService, MarketplaceProduct } from '@/services/database';
import QuantityDialog from './QuantityDialog';

const Marketplace = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);

  useEffect(() => {
    loadMarketplaceProducts();
  }, []);

  const loadMarketplaceProducts = async () => {
    try {
      const marketplaceProducts = await databaseService.getMarketplaceProducts();
      setProducts(marketplaceProducts);
    } catch (error) {
      console.error('Error loading marketplace products:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartClick = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setIsQuantityDialogOpen(true);
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (!selectedProduct) return;

    const cartItem = {
      id: selectedProduct.id || '',
      name: selectedProduct.crop_residue_type,
      price: selectedProduct.price_per_kg,
      stock: selectedProduct.total_stock_kg,
      image: selectedProduct.image_url || '/placeholder-crop.jpg',
      cropType: selectedProduct.crop_residue_type
    };

    addToCart(cartItem, quantity);
    
    toast({
      title: "Added to Cart",
      description: `${quantity} kg of ${selectedProduct.crop_residue_type} has been added to your cart.`,
    });
    
    setSelectedProduct(null);
  };

  const getAvailabilityBadge = (stock: number) => {
    if (stock > 1000) {
      return <Badge className="bg-green-100 text-green-800 animate-pulse">High Stock</Badge>;
    } else if (stock > 100) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Stock</Badge>;
    } else if (stock > 0) {
      return <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center mb-4 sm:mb-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4 p-2 hover:scale-110 transition-transform duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Agricultural Waste Marketplace
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Sustainable crop residues for industrial use</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/cart')} 
            className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-200 shadow-lg w-full sm:w-auto"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart
          </Button>
        </div>

        {/* Marketplace Stats */}
        <Card className="bg-white/90 backdrop-blur-sm border-green-200 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center space-x-3 hover:scale-105 transition-transform duration-200">
                <Leaf className="h-8 w-8 text-green-600 animate-pulse" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {products.reduce((sum, p) => sum + p.total_stock_kg, 0).toFixed(0)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total kg Available</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 hover:scale-105 transition-transform duration-200">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{products.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Product Types</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 hover:scale-105 transition-transform duration-200">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    ₹{products.reduce((sum, p) => sum + (p.total_stock_kg * p.price_per_kg), 0).toFixed(0)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Market Value</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <Card 
              key={product.id} 
              className="bg-white/90 backdrop-blur-sm border-green-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden relative">
                  <img 
                    src={getProductImage(product.crop_residue_type)}
                    alt={product.crop_residue_type}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-crop.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg sm:text-xl text-gray-800 group-hover:text-green-600 transition-colors duration-200">
                    {product.crop_residue_type}
                  </CardTitle>
                  {getAvailabilityBadge(product.total_stock_kg)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Price per kg:</span>
                    <span className="font-semibold text-green-600">₹{product.price_per_kg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Available:</span>
                    <span className="font-semibold">{product.total_stock_kg.toFixed(0)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Total Value:</span>
                    <span className="font-semibold text-blue-600">
                      ₹{(product.total_stock_kg * product.price_per_kg).toFixed(0)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => handleAddToCartClick(product)}
                    disabled={product.total_stock_kg <= 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.total_stock_kg > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-yellow-200 shadow-xl animate-fade-in">
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Available</h3>
              <p className="text-gray-500">
                Products will appear here when farmers list their agricultural waste for sale.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quantity Dialog */}
      <QuantityDialog
        isOpen={isQuantityDialogOpen}
        onClose={() => setIsQuantityDialogOpen(false)}
        onConfirm={handleQuantityConfirm}
        productName={selectedProduct?.crop_residue_type || ''}
        maxQuantity={selectedProduct?.total_stock_kg || 0}
        pricePerKg={selectedProduct?.price_per_kg || 0}
      />
    </div>
  );
};

export default Marketplace;
