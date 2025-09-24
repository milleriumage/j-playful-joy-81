import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 overflow-hidden relative">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-bounce text-2xl" style={{ animationDelay: '0s' }}>
        💬
      </div>
      <div className="absolute top-32 right-16 animate-bounce text-xl" style={{ animationDelay: '0.5s' }}>
        😍
      </div>
      <div className="absolute bottom-40 left-16 animate-bounce text-xl" style={{ animationDelay: '1s' }}>
        💜
      </div>
      <div className="absolute bottom-32 right-20 animate-bounce text-2xl" style={{ animationDelay: '1.5s' }}>
        💜
      </div>
      <div className="absolute top-1/2 left-6 animate-bounce" style={{ animationDelay: '2s' }}>
        <div className="bg-purple-500 rounded-full p-2">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-screen relative">
          
          {/* Top Section - Sign up form */}
          <div className="w-full max-w-md mb-12">
            <Card className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border-0">
              <CardContent className="p-8">
                <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
                  Sign up
                </h1>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-600 text-lg font-medium mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 rounded-2xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-600 text-lg font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 rounded-2xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-lg bg-gray-50 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl text-lg transition-all duration-300 hover:scale-105">
                    Create account
                  </Button>
                  
                  <p className="text-center text-gray-600 text-lg">
                    <button className="text-gray-800 hover:underline font-medium">
                      Log in
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content area with phone mockup */}
          <div className="flex items-center justify-center gap-12 w-full max-w-6xl">
            
            {/* Left side - Description */}
            <div className="flex-1 text-white space-y-6 max-w-lg">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Built to help you reach your goals faster — with advanced tools, premium designs, and powerful insights all in{' '}
                <span className="text-yellow-300">one simple link</span>
              </h2>
            </div>

            {/* Right side - Phone mockup */}
            <div className="relative flex-shrink-0">
              <div className="w-80 h-[640px] bg-white rounded-[3rem] p-2 shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-500">
                <div className="w-full h-full bg-gray-50 rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone content */}
                  <div className="pt-12 px-4 h-full">
                    {/* Profile section */}
                    <div className="bg-white rounded-3xl p-6 mb-4 shadow-lg">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 overflow-hidden">
                          <img 
                            src="/lovable-uploads/5f4a638e-a185-4469-a163-5fabde7e7398.png" 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-2">
                          Online
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                          Unlock with Premium $6.99
                        </div>
                      </div>
                    </div>

                    {/* Video preview */}
                    <div className="bg-gray-800 rounded-2xl aspect-video mb-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-50"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-white text-sm font-medium">4 min ago</div>
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                          <span>O.L.A mode is</span>
                          <Heart className="w-4 h-4 text-red-400" />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-orange-500">👑</span>
                        <span className="text-gray-700">donatedpremiumfreegame</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-500">❤️</span>
                        <span className="text-gray-700">frequence</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-500">💎</span>
                        <span className="text-gray-700">freinainstance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xl px-12 py-6 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 animate-pulse">
              Try 7 Days Free
            </Button>
          </div>

          {/* Back button */}
          <div className="mt-8">
            <Button asChild variant="outline" className="text-white border-white/40 hover:bg-white/10 rounded-2xl">
              <Link to="/">
                ← Back to App
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}