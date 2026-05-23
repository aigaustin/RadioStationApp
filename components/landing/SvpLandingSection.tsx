'use client';

import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Users, ShoppingBag, Trophy, Gamepad2, Ticket, Share2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS_DATA = [
  { id: 'media', label: 'Media & entertainment', icon: Users },
  { id: 'ecommerce', label: 'E-commerce shopping', icon: ShoppingBag },
  { id: 'sports', label: 'Sports events', icon: Trophy },
];

const CONTENT_DATA: Record<string, any> = {
  media: {
    videoSrc: 'https://images.unsplash.com/photo-1516280440502-6c2e39ea4eb1?q=80&w=1200&auto=format&fit=crop', // Placeholder image instead of video
    title: 'Youth Concert 2023',
    viewers: '224.6k',
    features: [
      {
        title: 'Co-host',
        description: 'Supports the mutual connection between the anchors to improve the fun',
      },
      {
        title: 'Broadcasting in 1 second',
        description: 'Provides fast broadcasting capabilities, and completes video streaming within seconds',
      },
      {
        title: 'Time-shifting',
        description: 'Play back live streamed content at a convenient time and re-live the best moments',
      },
    ],
    chips: [
      { label: 'Game', icon: Gamepad2 },
      { label: 'Social media', icon: Share2 },
      { label: 'Entertainment Interaction', icon: MessageCircle },
    ],
  },
  ecommerce: {
    videoSrc: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
    title: 'Live Shop',
    viewers: '10,884',
    features: [
      {
        title: 'Ultra-low latency',
        description: 'Eliminate sync issues between video stream and IM messages with StreamoPlus MediaLive\'s sub-second latency',
      },
      {
        title: 'Smart subtitles',
        description: 'Translate audio into local language subtitles in real-time. Support for Chinese, Japanese, Korean and English',
      },
      {
        title: 'Recording',
        description: 'Integration with BytePlus VOD allows for post live editing and retransmission on-demand',
      },
    ],
    chips: [
      { label: 'E-commerce', icon: ShoppingBag },
      { label: 'Event', icon: Ticket },
    ],
  },
  sports: {
    videoSrc: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    title: 'Gaming Room',
    viewers: '10,000,000',
    features: [
      {
        title: 'High quality and high concurrency',
        description: 'Support tens of millions of concurrent viewers during live events',
      },
      {
        title: 'Low-bitrate HD',
        description: 'The picture quality remains the same and the bit rate is reduced by 30%~50%, which saves costs without loss',
      },
    ],
    chips: [
      { label: 'Sports', icon: Trophy },
      { label: 'Gaming', icon: Gamepad2 },
      { label: 'Event', icon: Ticket },
    ],
  },
};

export function SvpLandingSection() {
  const [activeTab, setActiveTab] = useState('ecommerce');

  const content = CONTENT_DATA[activeTab];

  return (
    <section className="py-24 bg-white text-[#111] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-12">User experience made better across industries</h2>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-12">
          <Tabs.List className="flex border-b border-gray-200">
            {TABS_DATA.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex items-center gap-2 px-8 py-4 font-medium text-lg transition-all border-b-2 -mb-[2px] ${
                    isActive
                      ? 'border-[#1A73E8] text-[#1A73E8]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Left side: Video Card Mockup */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-gray-900 group">
                  <img
                    src={content.videoSrc}
                    alt={content.title}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                      • Live
                    </div>
                    <div className="bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {content.viewers}
                    </div>
                  </div>
                  {/* Title Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm">
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center font-bold text-xs">
                      {content.title.charAt(0)}
                    </div>
                    {content.title}
                  </div>
                  
                  {/* Fake UI Overlay (e.g. chat / shopping) */}
                  {activeTab === 'ecommerce' && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] max-w-sm bg-white rounded-xl p-3 shadow-xl flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <div className="w-12 h-16 bg-yellow-100 rounded-md"></div>
                          <div>
                            <p className="font-bold text-sm">Yellow Tank Top</p>
                            <p className="text-red-500 font-bold text-lg">$24.99</p>
                          </div>
                        </div>
                      </div>
                      <button className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-black transition-colors">
                        Buy
                      </button>
                    </div>
                  )}

                  {activeTab === 'sports' && (
                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-black/60 backdrop-blur-md p-4 flex flex-col justify-end gap-2 text-white text-sm">
                      <div className="space-y-3 mb-4">
                        <p><span className="opacity-60">yujiiieee:</span> Happy partner 🅿️</p>
                        <p><span className="opacity-60">yujiiieee:</span> 54 kills in such a short time is kinda insane</p>
                        <p><span className="opacity-60">onxlyt:</span> lol</p>
                      </div>
                      <div className="bg-white/20 rounded-full px-4 py-2 text-xs flex justify-between items-center">
                        <span className="opacity-60">Send a message</span>
                        <Share2 className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side: Features */}
                <div className="flex flex-col gap-10 py-4">
                  <div className="flex flex-col gap-8">
                    {content.features.map((feature: any, idx: number) => (
                      <div key={idx} className={idx === 0 ? "border-l-2 border-[#1A73E8] pl-4 -ml-[18px]" : ""}>
                        <h3 className="text-xl font-bold text-[#1A73E8] mb-2">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed text-[15px]">{feature.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4 pt-8 border-t border-gray-100">
                    {content.chips.map((chip: any, idx: number) => {
                      const ChipIcon = chip.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md text-sm text-gray-600 font-medium">
                          <ChipIcon className="w-4 h-4" />
                          {chip.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Tabs.Root>
      </div>
    </section>
  );
}
