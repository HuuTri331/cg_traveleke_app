'use client';

import React, { useState } from 'react';

type TabContentProps = {
  links: string[];
};

type TabName =
  | 'Các chặng bay hàng đầu'
  | 'Các khách sạn hàng đầu'
  | 'Hoạt động Tham quan và Giải trí';

const tabLinks: Record<TabName, string[]> = {
  'Các chặng bay hàng đầu': [
    'Vé máy bay đi Đà Nẵng',
    'Vé máy bay đi Phú Quốc',
    'Vé máy bay đi Nha Trang',
    'Vé máy bay đi Hà Nội',
    'Vé máy bay đi Đà Lạt',
    'Vé máy bay đi Hải Phòng',
    'Vé máy bay đi Singapore',
    'Vé máy bay Đà Nẵng - Hà Nội',
    'Vé máy bay Sài Gòn - Đà Nẵng',
    'Vé máy bay Hà Nội - Sài Gòn',
  ],

  'Các khách sạn hàng đầu': [
    'Khách sạn ở Đà Nẵng',
    'Khách sạn ở Phú Quốc',
    'Khách sạn ở Nha Trang',
    'Khách sạn ở Hà Nội',
    'Khách sạn ở Đà Lạt',
    'Khách sạn ở Hải Phòng',
    'Khách sạn ở Singapore',
  ],

  'Hoạt động Tham quan và Giải trí': [
    'Tour khám phá Đà Nẵng',
    'Tour khám phá Phú Quốc',
    'Tour khám phá Nha Trang',
    'Tour khám phá Hà Nội',
    'Tour khám phá Đà Lạt',
    'Tour khám phá Hải Phòng',
    'Tour khám phá Singapore',
  ],
};

const features = [
  {
    title: 'Đáp ứng mọi nhu cầu của bạn',
    description:
      'Từ chuyến bay, lưu trú, đến điểm tham quan...',
  },
  {
    title: 'Tùy chọn đặt chỗ linh hoạt',
    description:
      'Kế hoạch thay đổi đột ngột? Đừng lo! Đổi lịch dễ dàng.',
  },
  {
    title: 'Thanh toán an toàn và thuận tiện',
    description:
      'Tận hưởng nhiều cách thanh toán an toàn...',
  },
];

function TabContent({ links }: TabContentProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-blue-700 md:grid-cols-4">
      {links.map((link, index) => (
        <a
          key={index}
          href="#"
          className="transition-colors hover:text-blue-500"
        >
          {link}
        </a>
      ))}
    </div>
  );
}

export default function TravelokeLayout() {
  const [activeTab, setActiveTab] = useState<TabName>(
    'Các chặng bay hàng đầu',
  );

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Lý do nên đặt chỗ */}
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        Lý do nên đặt chỗ với Traveloke?
      </h2>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-lg bg-white p-4 shadow transition-shadow duration-200 hover:shadow-lg"
          >
            <h3 className="font-semibold text-blue-600">
              {feature.title}
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Khám phá */}
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        Bạn muốn khám phá điều gì?
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-300 text-gray-500">
        {(Object.keys(tabLinks) as TabName[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'hover:text-blue-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Nội dung tab */}
      <TabContent links={tabLinks[activeTab]} />
    </section>
  );
}