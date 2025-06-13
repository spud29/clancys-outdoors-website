import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, MessageCircle, Truck } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: ['(555) 123-4567', 'Mon-Fri: 8AM-6PM CST'],
    action: 'Call Now'
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['support@clancysoutdoors.com', 'We respond within 24 hours'],
    action: 'Send Email'
  },
  {
    icon: MapPin,
    title: 'Address',
    details: ['1234 Lake Street', 'Brainerd, MN 56401'],
    action: 'Get Directions'
  },
  {
    icon: Clock,
    title: 'Store Hours',
    details: ['Mon-Fri: 8AM-6PM', 'Sat: 9AM-5PM', 'Sun: 10AM-4PM'],
    action: 'Visit Store'
  }
];

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-blue-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Have questions about ice fishing gear? Need help with an order? 
              Our team of experts is here to help you succeed on the ice.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <Card key={info.title} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <Icon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {info.details.map((detail, index) => (
                      <p key={index} className="text-gray-600 mb-2">{detail}</p>
                    ))}
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white w-full">
                      {info.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-orange-600" />
                  Send Us a Message
                </CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select a topic</option>
                      <option value="product-question">Product Question</option>
                      <option value="order-status">Order Status</option>
                      <option value="return-exchange">Return/Exchange</option>
                      <option value="warranty">Warranty Claim</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="How can we help you today?"
                    />
                  </div>
                  
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ & Additional Info */}
            <div className="space-y-8">
              {/* Quick Help */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Order Status</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        Track your order using your order number and email address.
                      </p>
                      <Button variant="outline" size="sm">Track Order</Button>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Returns & Exchanges</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        30-day return policy on all unused items in original packaging.
                      </p>
                      <Button variant="outline" size="sm">Start Return</Button>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Product Support</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        Need help with product setup or warranty claims?
                      </p>
                      <Button variant="outline" size="sm">Get Support</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Truck className="h-5 w-5 text-orange-600" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Free Shipping:</span>
                      <span className="font-semibold">Orders $99+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standard Shipping:</span>
                      <span className="font-semibold">3-5 Business Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Express Shipping:</span>
                      <span className="font-semibold">1-2 Business Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Cutoff:</span>
                      <span className="font-semibold">2PM CST</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Visit Our Store</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Interactive Map Placeholder</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Clancy's Outdoors</h4>
                      <p className="text-gray-600">
                        1234 Lake Street<br />
                        Brainerd, MN 56401<br />
                        United States
                      </p>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 