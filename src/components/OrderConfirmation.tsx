
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, TrendingUp, Truck, Award, Home } from 'lucide-react';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('currentOrder');
    if (data) {
      setOrderData(JSON.parse(data));
    } else {
      navigate('/marketplace');
    }
  }, [navigate]);

  if (!orderData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600">Thank you for your purchase, {orderData.buyerName}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl text-green-800 flex items-center">
                <Truck className="h-6 w-6 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{orderData.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold">{orderData.companyName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-semibold">{orderData.address}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{orderData.totalAmount.toFixed(2)}</p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Items Ordered:</h3>
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between py-1">
                      <span>{item.name} ({item.quantity} kg)</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ESG Score */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-800 flex items-center">
                <Award className="h-6 w-6 mr-2" />
                ESG Impact Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="bg-blue-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {orderData.esgScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">ESG Score</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Carbon Reduction</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {orderData.carbonReduction.toFixed(0)} kg CO₂e
                    </p>
                    <p className="text-sm text-green-700">
                      Equivalent carbon footprint reduction achieved
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-700 mb-2">
                      <strong>{orderData.companyName}</strong> has contributed to sustainable agriculture 
                      and reduced environmental impact through this purchase.
                    </p>
                    <p className="text-sm text-gray-600">
                      This ESG score reflects your company's commitment to environmental responsibility.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Tracking */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 mt-8">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-800">Order Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-semibold">Order Confirmed</p>
                  <p className="text-sm text-gray-600">Your order has been received and confirmed</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-semibold">Processing</p>
                  <p className="text-sm text-gray-600">Your order is being prepared for shipment</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-500">In Transit</p>
                  <p className="text-sm text-gray-400">Your order will be shipped soon</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-500">Delivered</p>
                  <p className="text-sm text-gray-400">Expected delivery: 5-7 business days</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <p className="text-blue-800 font-semibold">📞 Contact Information</p>
                <p className="text-sm text-blue-700">
                  Our team will contact you at {orderData.mobileNumber} for delivery coordination.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button 
            onClick={() => navigate('/marketplace')}
            variant="outline"
            className="bg-white/80"
          >
            Continue Shopping
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
