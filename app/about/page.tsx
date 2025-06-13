import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Truck, Shield, Star, Clock } from 'lucide-react';

const stats = [
  { icon: Clock, label: 'Years in Business', value: '15+' },
  { icon: Users, label: 'Happy Customers', value: '10,000+' },
  { icon: Star, label: 'Products Available', value: '480+' },
  { icon: Truck, label: 'Orders Shipped', value: '25,000+' }
];

const values = [
  {
    icon: Award,
    title: 'Quality First',
    description: 'We only carry products from trusted brands that we would use ourselves on the ice.'
  },
  {
    icon: Users,
    title: 'Expert Knowledge',
    description: 'Our team consists of passionate ice fishing enthusiasts with decades of combined experience.'
  },
  {
    icon: Shield,
    title: 'Customer Satisfaction',
    description: 'We stand behind every product we sell with excellent customer service and support.'
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Get your gear quickly with our fast, reliable shipping options nationwide.'
  }
];

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-blue-900 text-white py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800" />
          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">About Clancy's Outdoors</h1>
              <p className="text-xl text-blue-100">
                Since 2008, we've been Minnesota's premier destination for ice fishing equipment, 
                serving passionate anglers with quality gear and expert advice.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <Icon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Clancy's Outdoors was founded in 2008 by lifelong ice fishing enthusiast Mike Clancy. 
                    What started as a small local shop in northern Minnesota has grown into one of the most 
                    trusted names in ice fishing equipment.
                  </p>
                  <p>
                    Mike's passion for ice fishing began as a child, spending countless hours on the frozen 
                    lakes with his father. This early love for the sport evolved into a deep understanding 
                    of what serious ice anglers need to be successful.
                  </p>
                  <p>
                    Today, Clancy's Outdoors serves customers nationwide, offering carefully curated selection 
                    of the best ice fishing gear available. We test every product ourselves and only carry 
                    items that meet our high standards for quality and performance.
                  </p>
                </div>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
                  alt="Ice fishing on a frozen lake"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These core values guide everything we do at Clancy's Outdoors
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <Card key={value.title} className="text-center p-6 border-0 shadow-lg">
                    <CardContent className="p-0">
                      <Icon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Passionate ice fishing experts dedicated to helping you succeed on the ice
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Mike Clancy', role: 'Founder & CEO', experience: '35+ years ice fishing' },
                { name: 'Sarah Johnson', role: 'Product Specialist', experience: '20+ years experience' },
                { name: 'Tom Anderson', role: 'Customer Service', experience: 'Professional guide' }
              ].map((member) => (
                <Card key={member.name} className="text-center border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-orange-600 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.experience}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Ice Fishing Adventure?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Browse our complete selection of ice fishing gear and get ready for your best season yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
                Shop All Products
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 