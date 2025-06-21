
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Calendar, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { databaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

interface PickupTrackerProps {
  submissionId?: string;
  farmerName?: string;
  cropResidueType?: string;
  quantityKg?: number;
  pickupStatus?: string;
  pickupDate?: string;
  contactNumber?: string;
}

const PickupTracker: React.FC<PickupTrackerProps> = (props) => {
  const navigate = useNavigate();
  const { submissionId: urlSubmissionId } = useParams<{ submissionId: string }>();
  const { toast } = useToast();
  
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Use props if provided, otherwise use URL params
  const submissionId = props.submissionId || urlSubmissionId;

  useEffect(() => {
    if (submissionId && !props.submissionId) {
      // Fetch data from database if we're using URL params
      loadSubmissionData();
    } else if (props.submissionId) {
      // Use provided props
      setSubmissionData({
        id: props.submissionId,
        farmer_name: props.farmerName,
        waste_type: props.cropResidueType,
        calculated_waste_tons: (props.quantityKg || 0) / 1000,
        pickup_status: props.pickupStatus,
        pickup_scheduled_date: props.pickupDate,
        mobile_number: props.contactNumber
      });
      setLoading(false);
    }
  }, [submissionId, props]);

  const loadSubmissionData = async () => {
    if (!submissionId) return;
    
    try {
      const data = await databaseService.getFarmerSubmission(submissionId);
      setSubmissionData(data);
    } catch (error) {
      console.error('Error loading submission data:', error);
      toast({
        title: "Error",
        description: "Failed to load pickup tracking information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'In Transit':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Transit':
        return 'bg-orange-100 text-orange-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pickup tracking...</p>
        </div>
      </div>
    );
  }

  if (!submissionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Pickup Tracker</h1>
          </div>
          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardContent className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Tracking Information Not Found</h3>
              <p className="text-gray-500">
                Unable to find pickup tracking information for this submission.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Pickup Tracker</h1>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-green-800 flex items-center">
              <Truck className="h-6 w-6 mr-2" />
              Waste Collection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Submission Details */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <strong>Submission ID:</strong> {submissionData.id?.slice(0, 8)}...
              </div>
              <div>
                <strong>Farmer:</strong> {submissionData.farmer_name}
              </div>
              <div>
                <strong>Waste Type:</strong> {submissionData.waste_type}
              </div>
              <div>
                <strong>Quantity:</strong> {((submissionData.calculated_waste_tons || 0) * 1000).toFixed(0)} kg
              </div>
              <div>
                <strong>Contact:</strong> {submissionData.mobile_number}
              </div>
              <div className="flex items-center">
                <strong className="mr-2">Status:</strong>
                <Badge className={getStatusColor(submissionData.pickup_status || 'Pending')}>
                  {getStatusIcon(submissionData.pickup_status || 'Pending')}
                  <span className="ml-1">{submissionData.pickup_status || 'Pending'}</span>
                </Badge>
              </div>
            </div>

            {/* Pickup Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Pickup Timeline</h3>
              
              <div className="space-y-3">
                <div className={`flex items-center p-3 rounded-lg ${submissionData.pickup_status === 'Pending' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
                  <Clock className={`h-5 w-5 mr-3 ${submissionData.pickup_status === 'Pending' ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">Request Submitted</div>
                    <div className="text-sm text-gray-600">Your waste collection request has been received</div>
                  </div>
                </div>

                <div className={`flex items-center p-3 rounded-lg ${submissionData.pickup_status === 'Scheduled' ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'}`}>
                  <Calendar className={`h-5 w-5 mr-3 ${submissionData.pickup_status === 'Scheduled' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">Pickup Scheduled</div>
                    <div className="text-sm text-gray-600">
                      {submissionData.pickup_scheduled_date ? `Scheduled for ${new Date(submissionData.pickup_scheduled_date).toLocaleDateString()}` : 'Pickup will be scheduled soon'}
                    </div>
                  </div>
                </div>

                <div className={`flex items-center p-3 rounded-lg ${submissionData.pickup_status === 'In Transit' ? 'bg-orange-50 border-l-4 border-orange-400' : 'bg-gray-50'}`}>
                  <Truck className={`h-5 w-5 mr-3 ${submissionData.pickup_status === 'In Transit' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">Collection In Progress</div>
                    <div className="text-sm text-gray-600">Our team is on the way to collect your waste</div>
                  </div>
                </div>

                <div className={`flex items-center p-3 rounded-lg ${submissionData.pickup_status === 'Completed' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-gray-50'}`}>
                  <CheckCircle className={`h-5 w-5 mr-3 ${submissionData.pickup_status === 'Completed' ? 'text-green-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">Collection Completed</div>
                    <div className="text-sm text-gray-600">Waste has been successfully collected and processed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
              <p className="text-blue-700 text-sm">
                Contact our support team at <strong>+91 9876543210</strong> or email <strong>support@agrowaste.com</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PickupTracker;
