
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, TrendingUp, Leaf, Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { databaseService } from '@/services/database';

interface Solution {
  title: string;
  description: string;
  benefits: string[];
  implementation: string;
  potential_revenue: string;
  sustainability_score: number;
}

interface AIResponse {
  solutions: Solution[];
  environmental_impact: string;
  recommended_action: string;
}

const AIWasteSolutionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [solutions, setSolutions] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);

  useEffect(() => {
    // Get submission data from location state or localStorage
    const data = location.state?.submissionData || JSON.parse(localStorage.getItem('farmerSubmission') || '{}');
    if (data && data.wasteType) {
      setSubmissionData(data);
      generateSolutions(data);
    } else {
      navigate('/submission-summary');
    }
  }, [location, navigate]);

  const generateSolutions = async (data: any) => {
    setLoading(true);
    try {
      console.log('Generating AI solutions for:', data);
      
      const { data: response, error } = await supabase.functions.invoke('ai-waste-solutions', {
        body: { 
          wasteType: data.wasteType,
          quantity: Math.round(data.calculations?.wasteKg || 0),
          location: data.location,
          cropType: data.cropGrown
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('AI solutions response:', response);
      setSolutions(response);
      
      toast({
        title: "AI Solutions Generated!",
        description: `Found ${response.solutions.length} innovative solutions for your waste.`,
      });
    } catch (error) {
      console.error('Error generating AI solutions:', error);
      
      // Fallback with mock data if API fails
      const fallbackSolutions = {
        solutions: [
          {
            title: "Composting for Organic Fertilizer",
            description: "Convert your agricultural waste into high-quality organic compost that can be sold to local farmers and gardeners.",
            benefits: [
              "Reduces waste disposal costs",
              "Creates additional revenue stream",
              "Improves soil health",
              "Reduces chemical fertilizer dependency"
            ],
            implementation: "Set up composting bins, mix waste with organic matter, maintain proper moisture and temperature for 3-6 months.",
            potential_revenue: "₹5,000-15,000 per ton of compost produced",
            sustainability_score: 85
          },
          {
            title: "Biogas Production",
            description: "Use organic waste to generate biogas for cooking and heating, reducing dependency on traditional fuels.",
            benefits: [
              "Clean renewable energy source",
              "Reduces greenhouse gas emissions",
              "Lower energy costs",
              "Produces organic slurry as fertilizer"
            ],
            implementation: "Install biogas plant, feed organic waste daily, maintain anaerobic conditions, harvest gas for use.",
            potential_revenue: "₹8,000-20,000 annual savings on fuel costs",
            sustainability_score: 90
          }
        ],
        environmental_impact: `Converting ${data.wasteType} waste into useful products can reduce carbon emissions by approximately ${Math.round(data.calculations?.carbonFootprint || 100)} kg CO₂e and create sustainable income opportunities.`,
        recommended_action: "Start with composting as it requires minimal investment and has proven market demand in your region."
      };
      
      setSolutions(fallbackSolutions);
      
      toast({
        title: "AI Solutions Generated",
        description: "Generated solutions using local recommendations due to API limitations.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSellWaste = async () => {
    if (!submissionData) return;

    try {
      // Prepare data for database
      const dbSubmission = {
        farmer_name: submissionData.farmerName,
        mobile_number: submissionData.mobileNumber,
        land_area_acres: parseFloat(submissionData.landArea),
        crop_grown: submissionData.cropGrown,
        crop_yield_per_acre: parseFloat(submissionData.cropYield),
        crop_field_address: submissionData.location,
        waste_type: submissionData.wasteType,
        harvest_date: new Date().toISOString().split('T')[0],
        calculated_waste_tons: submissionData.calculations.wasteTons,
        estimated_market_value_inr: submissionData.calculations.marketValue,
        carbon_footprint_kg_co2e: submissionData.calculations.carbonFootprint,
        chosen_action: 'Sell'
      };

      // Submit to database
      const id = await databaseService.submitFarmerData(dbSubmission);

      // Add to marketplace
      const cropResidueType = getByproductName(submissionData.cropGrown);
      const quantityKg = Math.round(submissionData.calculations.wasteKg);
      
      await databaseService.addWasteToMarketplace(cropResidueType, quantityKg);

      // Schedule pickup for next day
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await databaseService.schedulePickup(id, tomorrow.toISOString().split('T')[0]);

      toast({
        title: "Waste Collection Request Placed!",
        description: "Our team will contact you shortly to arrange pickup.",
      });

      navigate('/pickup-tracker/' + id, {
        state: {
          submissionId: id,
          farmerName: submissionData.farmerName,
          cropResidueType: cropResidueType,
          quantityKg: quantityKg,
          pickupStatus: 'Scheduled',
          pickupDate: tomorrow.toISOString().split('T')[0],
          contactNumber: submissionData.mobileNumber
        }
      });

    } catch (error) {
      console.error('Error processing sell request:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getByproductName = (cropGrown: string): string => {
    const mapping = {
      'Rice': 'Rice Husk',
      'Wheat': 'Wheat Straw',
      'Sugarcane': 'Sugarcane Bagasse',
      'Coconut Fiber': 'Coconut Fiber',
      'Peanut Shell': 'Peanut Shell',
      'Corn stalks': 'Corn Stalks',
      'Cotton waste': 'Cotton Waste'
    };
    return mapping[cropGrown as keyof typeof mapping] || cropGrown;
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  if (!submissionData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/submission-summary')}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">AI Waste Solutions</h1>
        </div>

        {/* AI Solution Generator Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-blue-800">
              <Sparkles className="h-6 w-6 mr-2 animate-pulse" />
              AI-Powered Waste Solutions
            </CardTitle>
            <p className="text-gray-600">
              Intelligent recommendations for your {submissionData.wasteType} waste valorization
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="font-semibold text-green-600">{submissionData.wasteType}</div>
                <div className="text-sm text-gray-500">Waste Type</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="font-semibold text-blue-600">{Math.round(submissionData.calculations?.wasteKg || 0)} kg</div>
                <div className="text-sm text-gray-500">Quantity</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="font-semibold text-purple-600">{submissionData.cropGrown}</div>
                <div className="text-sm text-gray-500">Crop Type</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="font-semibold text-orange-600">{submissionData.location}</div>
                <div className="text-sm text-gray-500">Location</div>
              </div>
            </div>
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 mr-3 animate-spin text-blue-600" />
                <span className="text-lg text-gray-600">Generating AI Solutions...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {solutions && (
          <div className="space-y-6 animate-fade-in">
            {/* Environmental Impact Summary */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <Leaf className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-green-800">Environmental Impact</h3>
                </div>
                <p className="text-gray-700 mb-4">{solutions.environmental_impact}</p>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="font-medium text-blue-800">Recommended Action</div>
                  <p className="text-blue-700 mt-1">{solutions.recommended_action}</p>
                </div>
              </CardContent>
            </Card>

            {/* Solutions Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {solutions.solutions.map((solution, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-gray-800">{solution.title}</CardTitle>
                      <Badge className={getSustainabilityColor(solution.sustainability_score)}>
                        {solution.sustainability_score}% Sustainable
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{solution.description}</p>
                    
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Benefits
                      </h4>
                      <ul className="space-y-1">
                        {solution.benefits.map((benefit, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-800 mb-1">Implementation</div>
                      <p className="text-sm text-gray-600">{solution.implementation}</p>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800 mb-1">Revenue Potential</div>
                      <p className="text-sm text-green-700">{solution.potential_revenue}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sell Waste Option */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-xl text-green-800">Ready to Monetize Your Waste?</CardTitle>
                <p className="text-gray-600">
                  List your waste in our marketplace and connect with buyers who can turn it into valuable products.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ₹{submissionData.calculations?.marketValue?.toFixed(0) || '0'}
                    </div>
                    <div className="text-sm text-gray-600">Estimated Market Value</div>
                  </div>
                  <Button 
                    onClick={handleSellWaste}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Sell Your Waste
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWasteSolutionsPage;
