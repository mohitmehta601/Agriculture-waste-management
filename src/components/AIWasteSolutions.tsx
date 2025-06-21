
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, TrendingUp, Leaf, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface AIWasteSolutionsProps {
  wasteType: string;
  quantity: number;
  location: string;
  cropType: string;
}

const AIWasteSolutions: React.FC<AIWasteSolutionsProps> = ({
  wasteType,
  quantity,
  location,
  cropType
}) => {
  const [solutions, setSolutions] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSolutions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-waste-solutions', {
        body: { wasteType, quantity, location, cropType }
      });

      if (error) {
        throw error;
      }

      setSolutions(data);
      toast({
        title: "AI Solutions Generated!",
        description: `Found ${data.solutions.length} innovative solutions for your waste.`,
      });
    } catch (error) {
      console.error('Error generating AI solutions:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI solutions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-blue-800">
            <Sparkles className="h-6 w-6 mr-2 animate-pulse" />
            AI-Powered Waste Solutions
          </CardTitle>
          <p className="text-gray-600">
            Get intelligent recommendations for your {wasteType} waste valorization
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="font-semibold text-green-600">{wasteType}</div>
              <div className="text-sm text-gray-500">Waste Type</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="font-semibold text-blue-600">{quantity} kg</div>
              <div className="text-sm text-gray-500">Quantity</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="font-semibold text-purple-600">{cropType}</div>
              <div className="text-sm text-gray-500">Crop Type</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="font-semibold text-orange-600">{location}</div>
              <div className="text-sm text-gray-500">Location</div>
            </div>
          </div>
          
          <Button 
            onClick={generateSolutions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating AI Solutions...
              </>
            ) : (
              <>
                <Lightbulb className="h-5 w-5 mr-2" />
                Generate AI Solutions
              </>
            )}
          </Button>
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
        </div>
      )}
    </div>
  );
};

export default AIWasteSolutions;
