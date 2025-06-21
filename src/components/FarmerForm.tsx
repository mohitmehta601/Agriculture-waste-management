
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Upload, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FarmerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    farmerName: '',
    mobileNumber: '',
    landArea: '',
    landUnit: 'Acre',
    cropYield: '',
    yieldUnit: 'Ton',
    cropGrown: '',
    location: '',
    wasteType: '',
    harvestDate: '',
    imageFile: null as File | null
  });

  const [locationCoords, setLocationCoords] = useState({ lat: 0, lon: 0 });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const crops = [
    'Rice', 'Sugarcane', 'Wheat', 'Coconut Fiber', 
    'Peanut Shell', 'Corn stalks', 'Cotton waste'
  ];

  const convertToAcres = (value: number, unit: string): number => {
    switch (unit) {
      case 'Bigha': return value * 0.619;
      case 'Hectare': return value * 2.471;
      case 'Acre': return value;
      default: return 0;
    }
  };

  const normalizeYieldToKgPerAcre = (yieldValue: number, yieldUnit: string, landValue: number, landUnit: string): number => {
    let yieldInKg = yieldValue;
    switch (yieldUnit) {
      case 'Ton': yieldInKg *= 1000; break;
      case 'Quintal': yieldInKg *= 100; break;
      case 'Kg': break;
    }

    const totalAcres = convertToAcres(landValue, landUnit);
    const totalYieldKg = yieldInKg * landValue;
    return totalYieldKg / totalAcres;
  };

  const calculateWaste = (landAreaAcres: number, cropYieldPerAcre: number, cropGrown: string): number => {
    const RPR_VALUES = {
      'Rice': 1.5,
      'Wheat': 1.3,
      'Sugarcane': 0.3,
      'Coconut Fiber': 0.35,
      'Peanut Shell': 0.25,
      'Corn stalks': 1.2,
      'Cotton waste': 0.15
    };
    return landAreaAcres * (cropYieldPerAcre / 1000) * RPR_VALUES[cropGrown as keyof typeof RPR_VALUES];
  };

  const calculateMarketValue = (wasteKg: number, cropGrown: string): number => {
    const BYPRODUCT_PRICES = {
      'Rice': 5.35,
      'Wheat': 8.5,
      'Sugarcane': 2.0,
      'Coconut Fiber': 179,
      'Peanut Shell': 7.5,
      'Corn stalks': 6.5,
      'Cotton waste': 10.5
    };
    return wasteKg * BYPRODUCT_PRICES[cropGrown as keyof typeof BYPRODUCT_PRICES];
  };

  const calculateCarbonFootprint = (wasteKg: number, cropGrown: string): number => {
    const EMISSION_FACTORS = {
      'Rice': 1.351,
      'Wheat': 1.351,
      'Sugarcane': 1.420,
      'Coconut Fiber': 1.560,
      'Peanut Shell': 1.500,
      'Corn stalks': 1.350,
      'Cotton waste': 1.450
    };
    return wasteKg * EMISSION_FACTORS[cropGrown as keyof typeof EMISSION_FACTORS];
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocationCoords({ lat, lon });
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            if (data.address) {
              const address = data.address;
              const village = address.village || address.suburb || address.town || '';
              const district = address.county || address.state_district || '';
              const state = address.state || '';
              const formattedAddress = `${village}, ${district}, ${state}`.replace(/, , /g, ', ').replace(/^, /, '').replace(/, $/, '');
              
              setFormData(prev => ({ ...prev, location: formattedAddress }));
              toast({
                title: "Location Retrieved",
                description: "Your location has been successfully retrieved.",
              });
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setFormData(prev => ({ ...prev, location: `Lat: ${lat}, Lon: ${lon}` }));
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location Error",
            description: "Could not get your location. Please ensure location services are enabled.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.farmerName || !formData.mobileNumber || !formData.landArea || 
        !formData.cropYield || !formData.cropGrown || !formData.wasteType || !formData.harvestDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Calculate values
    const landAreaAcres = convertToAcres(parseFloat(formData.landArea), formData.landUnit);
    const cropYieldPerAcre = normalizeYieldToKgPerAcre(
      parseFloat(formData.cropYield), 
      formData.yieldUnit, 
      parseFloat(formData.landArea), 
      formData.landUnit
    );
    const wasteTons = calculateWaste(landAreaAcres, cropYieldPerAcre, formData.cropGrown);
    const wasteKg = wasteTons * 1000;
    const marketValue = calculateMarketValue(wasteKg, formData.cropGrown);
    const carbonFootprint = calculateCarbonFootprint(wasteKg, formData.cropGrown);

    // Store in localStorage for now (replace with Supabase later)
    const submissionData = {
      ...formData,
      locationCoords,
      calculations: {
        landAreaAcres,
        cropYieldPerAcre,
        wasteTons,
        wasteKg,
        marketValue,
        carbonFootprint
      },
      submittedAt: new Date().toISOString()
    };

    localStorage.setItem('farmerSubmission', JSON.stringify(submissionData));
    
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/submission-summary');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Submit Crop Waste Data</h1>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-green-800">Farmer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="farmerName">Farmer Name *</Label>
                  <Input
                    id="farmerName"
                    value={formData.farmerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, farmerName: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
              </div>

              {/* Land Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Area of Land *</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.landArea}
                      onChange={(e) => setFormData(prev => ({ ...prev, landArea: e.target.value }))}
                      placeholder="Enter area"
                      required
                    />
                    <Select value={formData.landUnit} onValueChange={(value) => setFormData(prev => ({ ...prev, landUnit: value }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Acre">Acre</SelectItem>
                        <SelectItem value="Hectare">Hectare</SelectItem>
                        <SelectItem value="Bigha">Bigha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Crop Yield *</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cropYield}
                      onChange={(e) => setFormData(prev => ({ ...prev, cropYield: e.target.value }))}
                      placeholder="Enter yield"
                      required
                    />
                    <Select value={formData.yieldUnit} onValueChange={(value) => setFormData(prev => ({ ...prev, yieldUnit: value }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ton">Ton</SelectItem>
                        <SelectItem value="Quintal">Quintal</SelectItem>
                        <SelectItem value="Kg">Kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Per {formData.landUnit}</p>
                </div>
              </div>

              {/* Crop Selection */}
              <div>
                <Label>Crop Grown *</Label>
                <RadioGroup 
                  value={formData.cropGrown} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cropGrown: value }))}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
                >
                  {crops.map((crop) => (
                    <div key={crop} className="flex items-center space-x-2">
                      <RadioGroupItem value={crop} id={crop} />
                      <Label htmlFor={crop} className="text-sm">{crop}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Crop Field Location</Label>
                <div className="flex space-x-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Location will appear here"
                    readOnly
                  />
                  <Button type="button" onClick={getCurrentLocation} variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Location
                  </Button>
                </div>
              </div>

              {/* Waste Type and Harvest Date */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Waste Type *</Label>
                  <RadioGroup 
                    value={formData.wasteType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, wasteType: value }))}
                    className="flex space-x-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Wet" id="wet" />
                      <Label htmlFor="wet">Wet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Dry" id="dry" />
                      <Label htmlFor="dry">Dry</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="harvestDate">Harvest Date *</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, harvestDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="imageUpload">Upload Crop/Waste Image</Label>
                <div className="mt-2">
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-4"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-xs h-48 object-cover rounded-lg border-2 border-green-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Calculator className="h-5 w-5 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5 mr-2" />
                      Calculate Waste Value
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerForm;
