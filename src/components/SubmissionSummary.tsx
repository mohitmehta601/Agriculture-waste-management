import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Leaf, ShoppingCart, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { databaseService, FarmerSubmission } from '@/services/database';
import PickupTracker from './PickupTracker';

const SubmissionSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [showPickupTracker, setShowPickupTracker] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>('');

  useEffect(() => {
    const data = localStorage.getItem('farmerSubmission');
    if (data) {
      setSubmissionData(JSON.parse(data));
    } else {
      navigate('/farmer-form');
    }
  }, [navigate]);

  const handleSellWaste = async () => {
    if (!submissionData) return;

    try {
      // Prepare data for database
      const dbSubmission: FarmerSubmission = {
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
      setSubmissionId(id);

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

      setShowPickupTracker(true);

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

  const handleGreenSolution = () => {
    navigate('/ai-solutions', { state: { submissionData } });
  };

  if (!submissionData) {
    return <div>Loading...</div>;
  }

  // Show pickup tracker if user chose to sell
  if (showPickupTracker && submissionId) {
    return (
      <PickupTracker
        submissionId={submissionId}
        farmerName={submissionData.farmerName}
        cropResidueType={getByproductName(submissionData.cropGrown)}
        quantityKg={Math.round(submissionData.calculations.wasteKg)}
        pickupStatus="Scheduled"
        pickupDate={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        contactNumber={submissionData.mobileNumber}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/farmer-form')}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Submission Summary</h1>
        </div>

        {/* Farmer Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-800">Farmer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <strong>Name:</strong> {submissionData.farmerName}
              </div>
              <div>
                <strong>Mobile:</strong> {submissionData.mobileNumber}
              </div>
              <div>
                <strong>Land Area:</strong> {submissionData.landArea} {submissionData.landUnit}
              </div>
              <div>
                <strong>Crop Yield:</strong> {submissionData.cropYield} {submissionData.yieldUnit} per {submissionData.landUnit}
              </div>
              <div>
                <strong>Crop Grown:</strong> {submissionData.cropGrown}
              </div>
              <div>
                <strong>Waste Type:</strong> {submissionData.wasteType}
              </div>
              <div className="md:col-span-2">
                <strong>Location:</strong> {submissionData.location}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculated Values */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">Waste Valorization Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {submissionData.calculations.wasteTons.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Tons of Waste Generated</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ₹{submissionData.calculations.marketValue.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Estimated Market Value</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {submissionData.calculations.carbonFootprint.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">kg CO₂e Carbon Footprint</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Choices */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-800">Choose Your Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <Button 
                onClick={handleSellWaste}
                className="h-32 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center space-y-2"
              >
                <ShoppingCart className="h-8 w-8" />
                <span className="text-lg font-semibold">Sell Waste</span>
                <span className="text-sm opacity-90">List in marketplace</span>
              </Button>
              
              <Button 
                onClick={handleGreenSolution}
                className="h-32 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center space-y-2"
              >
                <Lightbulb className="h-8 w-8" />
                <span className="text-lg font-semibold">AI Green Solutions</span>
                <span className="text-sm opacity-90">Get smart recommendations</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmissionSummary;
