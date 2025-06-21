
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wasteType, quantity, location, cropType } = await req.json();
    
    console.log('AI request for waste solutions:', {
      wasteType,
      quantity,
      location,
      cropType
    });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `As an agricultural waste management expert, provide innovative solutions for converting ${wasteType} waste from ${cropType} crops into valuable products. 

Details:
- Waste Type: ${wasteType}
- Quantity: ${quantity} kg
- Location: ${location}
- Crop: ${cropType}

Please provide solutions in the following JSON format:
{
  "solutions": [
    {
      "title": "Solution Name",
      "description": "Brief description of the solution",
      "benefits": ["benefit1", "benefit2", "benefit3"],
      "implementation": "Step-by-step implementation guide",
      "potential_revenue": "Revenue estimate in INR",
      "sustainability_score": 85
    }
  ],
  "environmental_impact": "Description of environmental benefits",
  "recommended_action": "Primary recommendation for this farmer"
}

Focus on practical, cost-effective solutions suitable for Indian agricultural conditions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in agricultural waste management and sustainable farming practices in India. Provide practical, actionable solutions that farmers can implement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI response received:', aiResponse);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response
      parsedResponse = {
        solutions: [
          {
            title: "Composting Solution",
            description: `Convert your ${wasteType} waste from ${cropType} into organic compost`,
            benefits: [
              "Reduces waste disposal costs",
              "Creates revenue stream from compost sales",
              "Improves soil fertility",
              "Reduces dependency on chemical fertilizers"
            ],
            implementation: "Set up composting area, mix waste with organic matter, maintain for 3-4 months with regular turning",
            potential_revenue: `₹${Math.round(quantity * 0.5)}-${Math.round(quantity * 1.5)} per batch`,
            sustainability_score: 80
          },
          {
            title: "Biogas Generation",
            description: "Use organic waste to produce biogas for cooking and heating",
            benefits: [
              "Clean renewable energy",
              "Reduces cooking fuel costs",
              "Produces organic slurry fertilizer",
              "Lower carbon footprint"
            ],
            implementation: "Install biogas plant, feed daily with organic waste, maintain anaerobic conditions",
            potential_revenue: `₹${Math.round(quantity * 0.3)}-${Math.round(quantity * 0.8)} annual savings`,
            sustainability_score: 90
          }
        ],
        environmental_impact: `Converting ${quantity} kg of ${wasteType} waste can reduce carbon emissions by approximately ${Math.round(quantity * 0.5)} kg CO₂e while creating useful products.`,
        recommended_action: `Start with composting as it requires minimal investment and has proven market demand in ${location}.`
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-waste-solutions function:', error);
    
    // Return fallback solutions instead of error
    const fallbackSolutions = {
      solutions: [
        {
          title: "Organic Composting",
          description: "Transform agricultural waste into nutrient-rich organic compost for sale to local farmers and gardeners.",
          benefits: [
            "Zero waste disposal costs",
            "Additional income from compost sales",
            "Improves local soil health",
            "Reduces chemical fertilizer dependency"
          ],
          implementation: "Create composting beds, layer waste with organic matter, maintain moisture and temperature, turn regularly for 3-6 months.",
          potential_revenue: "₹3,000-8,000 per ton of finished compost",
          sustainability_score: 85
        },
        {
          title: "Biomass Fuel Production",
          description: "Process dry agricultural waste into biomass briquettes or pellets for clean fuel production.",
          benefits: [
            "High energy content fuel source",
            "Reduces dependence on fossil fuels",
            "Good market demand",
            "Environment-friendly alternative"
          ],
          implementation: "Dry waste thoroughly, compress into briquettes using manual or mechanical press, package for sale.",
          potential_revenue: "₹4,000-10,000 per ton of briquettes",
          sustainability_score: 80
        }
      ],
      environmental_impact: "Converting agricultural waste into useful products helps reduce carbon emissions, prevents open burning, and creates a circular economy in rural areas.",
      recommended_action: "Begin with composting as it requires minimal investment and has established local markets."
    };
    
    return new Response(JSON.stringify(fallbackSolutions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
