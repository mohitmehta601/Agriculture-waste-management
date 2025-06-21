
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../components/Home';
import FarmerForm from '../components/FarmerForm';
import SubmissionSummary from '../components/SubmissionSummary';
import AIWasteSolutionsPage from '../components/AIWasteSolutionsPage';
import Marketplace from '../components/Marketplace';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';
import OrderConfirmation from '../components/OrderConfirmation';
import PickupTracker from '../components/PickupTracker';
import { CartProvider } from '../context/CartContext';

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/farmer-form" element={<FarmerForm />} />
          <Route path="/submission-summary" element={<SubmissionSummary />} />
          <Route path="/ai-solutions" element={<AIWasteSolutionsPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/pickup-tracker/:submissionId" element={<PickupTracker />} />
        </Routes>
      </div>
    </CartProvider>
  );
};

export default Index;
