"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loadUser } from "@/auth/authSlice";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  MapPin,
  Phone,
  Truck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import MeasurementSlotSelector from "@/components/MeasurementSlotSelector";

const Checkout = () => {
  const { user, loading: userLoading } = useSelector((state) => state.auth);
  const [cart, setCart] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [mobileNumber, setMobileNumber] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [measurementSlot, setMeasurementSlot] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to fetch cart. Please try again.");
      if (error.response && error.response.status === 401) {
        router.push("/signin");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const initializeCheckout = async () => {
      if (!user) {
        try {
          await dispatch(loadUser()).unwrap();
        } catch (error) {
          console.error("Error loading user:", error);
          router.push("/signin");
          return;
        }
      }
      fetchCart();
    };

    initializeCheckout();

    const loadRazorpayScript = async () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    };
    loadRazorpayScript();
  }, [dispatch, router, user, fetchCart]);

  useEffect(() => {
    if (user) {
      setMobileNumber(user.mobileNumber || "");
      if (user.shippingAddress) {
        setShippingAddress(user.shippingAddress);
      }
    }
  }, [user]);

  const handleAddressChange = (e, type) => {
    const { name, value } = e.target;
    if (type === "shipping") {
      setShippingAddress((prev) => ({ ...prev, [name]: value }));
    } else {
      setBillingAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSlotSelect = (slot) => {
    setMeasurementSlot(slot);
  };

  const validateMobileNumber = (number) => /^[6-9]\d{9}$/.test(number);

  const handlePayment = async () => {
    try {
      if (!validateMobileNumber(mobileNumber)) {
        alert(
          "Invalid Indian mobile number. Please enter a 10-digit number starting with 6, 7, 8, or 9."
        );
        return;
      }

      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await api.post("/orders/create-razorpay-order", {
        items: orderItems, // Add this line
        shippingAddress,
        billingAddress: sameAsBilling ? shippingAddress : billingAddress,
        deliveryOption,
        mobileNumber,
        measurementSlot,
      });

      const { orderId, amount, currency, order } = response.data;

      const options = {
        key: "rzp_test_0qKqvkp9NG7OBq",
        amount: amount,
        currency: currency,
        name: "WarSto",
        description: "Purchase Description",
        order_id: orderId,
        handler: handlePaymentSuccess,
        prefill: {
          name: user.name,
          email: user.email,
          contact: mobileNumber,
        },
        notes: {
          shipping_address: JSON.stringify(shippingAddress),
          billing_address: JSON.stringify(
            sameAsBilling ? shippingAddress : billingAddress
          ),
          delivery_option: deliveryOption,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Error initiating payment. Please try again.");
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      setLoading(true);
      const { data } = await api.post(
        "/orders/verify-payment",
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        },
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Payment successful!");
        router.push(`/order-confirmation?orderId=${data.order._id}`);
      } else {
        console.error("Payment verification failed:", data.message);
        toast.error("Payment verification failed. Please contact support.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error(
        "Error verifying payment. Please try again or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryFee = () => {
    return deliveryOption === "express" ? 100 : 0;
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.total + calculateDeliveryFee();
  };

  if (userLoading || loading || !cart) return <div>Loading...</div>;
  if (!user) return null;

  const renderOrderSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {cart.items.map((item) => (
          <div key={item.product._id} className="flex justify-between py-2">
            <div>
              <span className="font-semibold">{item.product.name}</span>
              <br />
              <span className="text-sm text-gray-600">
                Quantity: {item.quantity} | Price per item: ₹{item.price}
              </span>
            </div>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{cart.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>₹{cart.discount}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>₹{calculateDeliveryFee()}</span>
          </div>
          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>₹{calculateTotal()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProductSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle>Products in Your Order</CardTitle>
      </CardHeader>
      <CardContent>
        {cart.items.map((item) => (
          <div key={item.product._id} className="flex items-center mb-4">
            <img
              src={item.product.images[0]?.url || "/placeholder-image.jpg"}
              alt={item.product.name}
              className="w-16 h-16 object-cover mr-4"
            />
            <div>
              <h4 className="font-semibold">{item.product.name}</h4>
              <p className="text-sm text-gray-600">
                {item.product.attributes.color.family} |{" "}
                {item.product.attributes.configuration}
              </p>
              <p className="text-sm">Quantity: {item.quantity}</p>
              <p className="text-sm">Price: ₹{item.price * item.quantity}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderAddressForm = (type, address, handler) => (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "shipping" ? "Shipping" : "Billing"} Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(address).map(([key, value]) => (
          <div key={key}>
            <Label htmlFor={`${type}-${key}`}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Label>
            <Input
              id={`${type}-${key}`}
              type="text"
              name={key}
              value={value}
              onChange={(e) => handler(e, type)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderDeliveryOptions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Options</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard">Standard Delivery (Free)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="express" id="express" />
            <Label htmlFor="express">Express Delivery (₹100)</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );

  const renderReviewOrder = () => (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderProductSummary()}
        {renderOrderSummary()}
        {measurementSlot && (
          <div>
            <h4 className="font-semibold">Measurement Slot</h4>
            <p>{`${measurementSlot.date} - ${measurementSlot.timeRange}`}</p>
          </div>
        )}
        <div>
          <h4 className="font-semibold">Shipping Address</h4>
          <p>{Object.values(shippingAddress).join(", ")}</p>
        </div>
        <div>
          <h4 className="font-semibold">Billing Address</h4>
          <p>
            {Object.values(
              sameAsBilling ? shippingAddress : billingAddress
            ).join(", ")}
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Delivery Option</h4>
          <p>
            {deliveryOption === "express"
              ? "Express Delivery"
              : "Standard Delivery"}
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Mobile Number</h4>
          <p>{mobileNumber}</p>
        </div>
      </CardContent>
    </Card>
  );
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-8">
          {step === 1 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2" /> Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {renderAddressForm(
                    "shipping",
                    shippingAddress,
                    handleAddressChange
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="same-as-billing"
                      checked={sameAsBilling}
                      onCheckedChange={() => setSameAsBilling(!sameAsBilling)}
                    />
                    <Label htmlFor="same-as-billing">
                      Billing address same as shipping
                    </Label>
                  </div>
                  {!sameAsBilling && (
                    <div className="mt-4">
                      <CardTitle className="text-lg mb-4">
                        Billing Address
                      </CardTitle>
                      {renderAddressForm(
                        "billing",
                        billingAddress,
                        handleAddressChange
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Button onClick={() => setStep(2)} className="w-full">
                Continue to Delivery <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2" /> Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryOption}
                    onValueChange={setDeliveryOption}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-grow">
                        <span className="font-semibold">Standard Delivery</span>
                        <p className="text-sm text-gray-500">
                          Free - Delivered in 5-7 business days
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-grow">
                        <span className="font-semibold">Express Delivery</span>
                        <p className="text-sm text-gray-500">
                          ₹100 - Delivered in 2-3 business days
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2" /> Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="mobile-number">Mobile Number</Label>
                  <Input
                    id="mobile-number"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your 10-digit mobile number"
                    className="mt-1"
                  />
                </CardContent>
              </Card>
              <MeasurementSlotSelector onSlotSelect={handleSlotSelect} />
              <div className="flex justify-between mt-6">
                <Button onClick={() => setStep(1)} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Address
                </Button>
                <Button onClick={() => setStep(3)}>
                  Review Order <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              {renderReviewOrder()}
              <div className="flex justify-between mt-6">
                <Button onClick={() => setStep(2)} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Delivery
                </Button>
                <Button onClick={handlePayment} disabled={loading}>
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
        <div className="lg:w-1/3">{renderOrderSummary()}</div>
      </div>
    </div>
  );
};
// asdasdaldflds
export default Checkout;
