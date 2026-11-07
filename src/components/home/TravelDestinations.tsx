'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronRight,
  Play,
  Sparkles,
  Star,
  X,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/services/api/client';
import {
  IconReceptionistBell,
  IconPrimeLocation,
  IconCustomerCare,
  IconExpressCheckIn,
  IconRoyalBed,
  IconPanoramaBalcony,
} from './GoldenLuxuryIcons';
import {
  GoldenServicesShowcase,
  LUXURY_SERVICE_PRESENTATIONS,
  type LuxuryServicePresentation,
} from './GoldenServicesShowcase';

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
).replace(/\/api\/?$/, '');

function resolveBackendImage(url?: string | null, fallback?: string): string {
  if (!url) return fallback || '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

interface BackendHotel {
  id: string;
  name: string;
  description: string;
  address: string;
  starRating: number;
  coverImageUrl: string;
  minPricePerNight?: number;
}

interface BackendRoom {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  pricePerNight: string | number;
  roomSize?: number;
  bedType?: string;
  rating?: string | number;
  coverImageUrl: string;
}

const HIGHLIGHT_CHECKMARKS = [
  'Lễ tân đón tiếp nồng hậu 24/7',
  'Vị trí đắc địa trung tâm & sát biển',
  'Hỗ trợ Check-in / Check-out linh hoạt',
  'Phòng nghỉ chuẩn mực đúng ảnh thực tế',
];

const DETAILED_LUXURY_SERVICES = [
  {
    id: 'reception-checkin',
    mappedShowcaseId: 'reception-checkin',
    title: 'Phục Vụ Lễ Tân & Check-in',
    description:
      'Đội ngũ lễ tân chuyên nghiệp đón tiếp 24/7, hỗ trợ thủ tục nhận – trả phòng nhanh gọn và giữ hành lý miễn phí.',
    extendedInfo:
      'Tại mọi khách sạn đối tác trên hệ thống Traveleke, quý khách luôn được chào đón bằng sự hiếu khách nồng hậu ngay từ sảnh chính. Thủ tục nhận phòng được rút gọn tối đa chỉ trong 90 giây, hỗ trợ linh hoạt nhận phòng sớm (Early Check-in) và trả phòng muộn (Late Check-out).',
    highlights: [
      'Quầy lễ tân ưu tiên dành riêng cho khách đặt qua Traveleke',
      'Hỗ trợ nhận phòng sớm & trả phòng muộn theo tình trạng phòng',
      'Tư vấn lịch trình tham quan bản địa & hỗ trợ hành lý tận phòng',
    ],
    Icon: IconReceptionistBell,
  },
  {
    id: 'location-care',
    mappedShowcaseId: 'customer-care',
    title: 'Vị Trí Đắc Địa & CSKH 1-1',
    description:
      'Khách sạn tọa lạc tại trung tâm dễ di chuyển, kết hợp dịch vụ chăm sóc khách hàng tận tâm xuyên suốt kỳ nghỉ.',
    extendedInfo:
      'Các cơ sở lưu trú trên Traveleke được tuyển chọn tại những tọa độ vàng thuận tiện di chuyển ra biển, phố cổ và khu ẩm thực. Đồng thời, đội ngũ Chăm sóc khách hàng luôn đồng hành 1-1 để xử lý tức thì mọi yêu cầu nâng hạng phòng, kê thêm giường phụ hay trang trí phòng kỷ niệm.',
    highlights: [
      'Tọa lạc tại trục đường trung tâm hoặc sát bờ biển đẹp nhất',
      'Chăm sóc khách hàng 1-1 trực tiếp qua Hotline & tại khách sạn',
      'Bảo lãnh giữ phòng tức thì & thanh toán VNPay an toàn tuyệt đối',
    ],
    Icon: IconCustomerCare,
  },
  {
    id: 'room-quality-highlight',
    mappedShowcaseId: 'royal-bedroom',
    title: 'Chất Lượng Phòng & Điểm Nhấn',
    description:
      'Không gian phòng ngủ cách âm yên tĩnh, giường nệm êm ái chuẩn 5 sao và ban công tầm nhìn khoáng đạt.',
    extendedInfo:
      'Mỗi hạng phòng đều được kiểm định khắt khe về diện tích, chất lượng đệm lò xo túi độc lập, hệ cửa kính cách âm 3 lớp mở ra ban công đón nắng gió tự nhiên và phòng tắm đá cẩm thạch tích hợp bồn ngâm thư giãn.',
    highlights: [
      'Cam kết 100% chất lượng phòng và tầm nhìn đúng hình ảnh công bố',
      'Giường ngủ 5 sao, điều hòa lọc khí tươi & phòng tắm bồn ngâm',
      'Bàn trà ban công, Minibar & vệ sinh khử khuẩn phòng mỗi ngày',
    ],
    Icon: IconRoyalBed,
  },
];

const DEFAULT_COLLAGE = {
  topLeft:
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=700&q=85',
  centerCircle:
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=85',
  bottomRight:
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=700&q=85',
};


export default function TravelDestinations() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const [hotels, setHotels] = useState<BackendHotel[]>([]);
  const [rooms, setRooms] = useState<BackendRoom[]>([]);
  const [selectedHotelIndex, setSelectedHotelIndex] = useState<number>(-1);
  const [activeServiceId, setActiveServiceId] = useState<string>('reception-checkin');

  const [activeModalService, setActiveModalService] = useState<{
    title: string;
    subtitle: string;
    description: string;
    highlights: string[];
  } | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadBackendShowcase() {
      try {
        const [hotelsRes, roomsRes] = await Promise.allSettled([
          apiClient.get('/hotels/search'),
          apiClient.get('/rooms'),
        ]);
        if (!isMounted) return;
        if (hotelsRes.status === 'fulfilled' && Array.isArray(hotelsRes.value.data?.data)) {
          setHotels(hotelsRes.value.data.data);
        }
        if (roomsRes.status === 'fulfilled' && Array.isArray(roomsRes.value.data?.data)) {
          setRooms(roomsRes.value.data.data);
        }
      } catch {
        // Keep fallback
      }
    }
    void loadBackendShowcase();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeHotel =
    selectedHotelIndex >= 0 && selectedHotelIndex < hotels.length
      ? hotels[selectedHotelIndex]
      : null;

  const matchingRooms = activeHotel
    ? rooms.filter((r) => String(r.hotelId) === String(activeHotel.id))
    : rooms;

  const topLeftImage = activeHotel
    ? resolveBackendImage(
        matchingRooms[0]?.coverImageUrl || rooms[0]?.coverImageUrl,
        DEFAULT_COLLAGE.topLeft
      )
    : DEFAULT_COLLAGE.topLeft;

  const centerCircleImage = activeHotel
    ? resolveBackendImage(activeHotel.coverImageUrl, DEFAULT_COLLAGE.centerCircle)
    : DEFAULT_COLLAGE.centerCircle;

  const bottomRightImage = activeHotel
    ? resolveBackendImage(
        matchingRooms[1]?.coverImageUrl || rooms[2]?.coverImageUrl,
        DEFAULT_COLLAGE.bottomRight
      )
    : DEFAULT_COLLAGE.bottomRight;

  return (
    <div ref={sectionRef} className="w-full overflow-hidden bg-white">
      {/* 1. WELCOME SHOWCASE SECTION */}
      <section className="max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div
            className={`lg:col-span-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="relative mx-auto h-[430px] sm:h-[530px] lg:h-[580px] w-full max-w-[680px]">
              <div className="group absolute top-0 left-0 z-10 h-[170px] w-[170px] sm:h-[230px] sm:w-[230px] lg:h-[255px] lg:w-[255px] rounded-2xl overflow-hidden shadow-[0_14px_35px_rgba(30,71,82,0.16)] border-4 border-white bg-[#1E4752]/5">
                <img
                  src={topLeftImage}
                  alt="Ban công nghỉ dưỡng sang trọng"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_COLLAGE.topLeft;
                  }}
                />
              </div>

              <div className="group absolute top-1/2 left-1/2 z-20 h-[285px] w-[285px] sm:h-[390px] sm:w-[390px] lg:h-[430px] lg:w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-[0_25px_65px_rgba(30,71,82,0.22)] border-[8px] border-white bg-[#1E4752]/5">
                <img
                  src={centerCircleImage}
                  alt="Trải nghiệm nghỉ dưỡng đẳng cấp"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_COLLAGE.centerCircle;
                  }}
                />
              </div>

              <button
                type="button"
                aria-label="Xem bộ sưu tập không gian nghỉ dưỡng"
                onClick={() =>
                  setActiveModalService({
                    title: activeHotel
                      ? `Không Gian & Điểm Cộng Tại ${activeHotel.name}`
                      : 'Hệ Sinh Thái Khách Sạn & Phòng Nghỉ Tuyển Chọn Traveleke',
                    subtitle: 'Lễ tân tận tâm 24/7 • Vị trí đắc địa • Hỗ trợ Check-in/Check-out linh hoạt',
                    description: activeHotel
                      ? `${activeHotel.description} Địa chỉ: ${activeHotel.address}.`
                      : 'Traveleke kết nối bạn với mạng lưới khách sạn và khu nghỉ dưỡng uy tín trên toàn quốc, nổi bật với thái độ phục vụ chuyên nghiệp của nhân viên lễ tân, vị trí trung tâm thuận lợi, dịch vụ chăm sóc khách hàng 1-1 và chất lượng phòng thực tế đúng 100% như cam kết.',
                    highlights: HIGHLIGHT_CHECKMARKS,
                  })
                }
                className="lux-press group absolute top-[11%] right-[15%] sm:top-[10%] sm:right-[16%] z-30 flex h-16 w-16 sm:h-[78px] sm:w-[78px] items-center justify-center rounded-xl bg-[#1E4752] text-white shadow-[0_16px_36px_rgba(30,71,82,0.35)] hover:bg-[#E8A700] hover:text-[#1E4752] transition-all duration-300 cursor-pointer"
              >
                <span className="absolute inset-0 rounded-xl border-2 border-[#1E4752]/40 animate-ping opacity-30 pointer-events-none" />
                <Play className="h-6 w-6 fill-current ml-0.5 transition-transform duration-300 group-hover:scale-110" />
              </button>

              <div className="group absolute bottom-0 right-0 z-30 h-[170px] w-[170px] sm:h-[230px] sm:w-[230px] lg:h-[255px] lg:w-[255px] rounded-2xl overflow-hidden shadow-[0_14px_35px_rgba(30,71,82,0.18)] border-4 border-white bg-[#1E4752]/5">
                <img
                  src={bottomRightImage}
                  alt="Hồ bơi nghỉ dưỡng ngoài trời"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_COLLAGE.bottomRight;
                  }}
                />
              </div>
            </div>

            {hotels.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedHotelIndex(-1)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedHotelIndex === -1
                      ? 'bg-[#1E4752] text-white shadow-xs'
                      : 'bg-[#EBE5D5]/60 text-[#1E4752] hover:bg-[#EBE5D5]'
                  }`}
                >
                  Hệ thống Traveleke
                </button>
                {hotels.slice(0, 3).map((hotel, idx) => (
                  <button
                    key={hotel.id}
                    type="button"
                    onClick={() => setSelectedHotelIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedHotelIndex === idx
                        ? 'bg-[#1E4752] text-white shadow-xs'
                        : 'bg-[#EBE5D5]/60 text-[#1E4752] hover:bg-[#EBE5D5]'
                    }`}
                  >
                    <Star className="w-3 h-3 text-[#E8A700] fill-[#E8A700]" />
                    <span>{hotel.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className={`lg:col-span-6 space-y-6 transition-all duration-700 delay-150 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="space-y-2.5">
              <p className="text-base sm:text-[17px] font-medium text-[#1E4752]">
                Bảo chứng chất lượng lưu trú trên toàn quốc
              </p>
              <h2 className="text-2xl sm:text-[34px] lg:text-[38px] font-bold uppercase text-[#111827] leading-[1.24] tracking-tight">
                {activeHotel
                  ? `ĐIỂM MẠNH LƯU TRÚ & PHỤC VỤ TẠI ${activeHotel.name.toUpperCase()}`
                  : 'HỆ THỐNG KHÁCH SẠN TUYỂN CHỌN VỚI DỊCH VỤ LỄ TÂN & CSKH TẬN TÂM'}
              </h2>
            </div>

            <p className="text-sm sm:text-[15px] text-gray-500 leading-relaxed font-normal">
              {activeHotel ? (
                <>
                  Khám phá <strong className="text-[#1E4752] font-semibold">{activeHotel.name}</strong> ({activeHotel.address}) — {activeHotel.description} Khách sạn ghi điểm với đội ngũ lễ tân đón tiếp nồng hậu, hỗ trợ thủ tục Check-in / Check-out nhanh chóng cùng hệ thống phòng nghỉ đạt chuẩn kiểm định của Traveleke.
                </>
              ) : (
                'Mỗi khách sạn đối tác trên Traveleke đều được chọn lọc kỹ lưỡng dựa trên những điểm cộng thiết thực nhất cho chuyến đi của bạn: vị trí trung tâm dễ dàng di chuyển, sự phục vụ chuyên nghiệp và hiếu khách của đội ngũ lễ tân, quy trình hỗ trợ Check-in/Check-out linh hoạt cùng chất lượng phòng nghỉ đúng thực tế 100%.'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pt-2">
              {HIGHLIGHT_CHECKMARKS.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#1E4752] shrink-0 stroke-[2.5]" />
                  <span className="text-base sm:text-[17px] font-medium text-[#111827]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <Link
                href={activeHotel ? `/hotels_home/${activeHotel.id}` : '/hotels_home'}
                className="lux-press inline-flex items-center gap-2.5 rounded-lg bg-[#1E4752] hover:bg-[#16363f] text-white px-7 py-3.5 text-sm sm:text-[15px] font-medium shadow-[0_10px_24px_rgba(30,71,82,0.2)] hover:shadow-[0_14px_30px_rgba(30,71,82,0.3)] transition-all group"
              >
                <span>Khám phá</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOTEL PLUS POINTS & ROOM QUALITY PILLARS SECTION */}
      <section className="border-t border-[#EBE5D5] bg-white py-16 sm:py-24">
        <div className="max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div
              className={`lg:col-span-5 space-y-5 transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <div className="space-y-2.5">
                <p className="text-base sm:text-[17px] font-medium text-[#1E4752]">
                  Điểm cộng từ dịch vụ đến không gian phòng
                </p>
                <h2 className="text-2xl sm:text-[34px] lg:text-[38px] font-bold uppercase text-[#111827] leading-[1.24] tracking-tight">
                  VÌ SAO DU KHÁCH TIN CHỌN KHÁCH SẠN & PHÒNG NGHỈ TRÊN TRAVELEKE
                </h2>
              </div>

              <p className="text-sm sm:text-[15px] text-gray-500 leading-relaxed font-normal">
                Chúng tôi tập trung vào những giá trị cốt lõi quyết định sự hài lòng của du khách: từ nụ cười đón tiếp của lễ tân, thủ tục nhận – trả phòng không chờ đợi, dịch vụ chăm sóc khách hàng 24/7 cho đến chất lượng cách âm, giường nệm và tầm nhìn của từng căn phòng.
              </p>

              <div className="pt-3">
                <Link
                  href="/room_home"
                  className="lux-press inline-flex items-center gap-2.5 rounded-lg bg-[#1E4752] hover:bg-[#16363f] text-white px-7 py-3.5 text-sm sm:text-[15px] font-medium shadow-[0_10px_24px_rgba(30,71,82,0.2)] hover:shadow-[0_14px_30px_rgba(30,71,82,0.3)] transition-all group"
                >
                  <span>Xem bộ sưu tập phòng</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-9 pt-2">
              {DETAILED_LUXURY_SERVICES.map((service, idx) => {
                const ServiceIcon = service.Icon;
                return (
                  <div
                    key={service.id}
                    style={{ transitionDelay: `${200 + idx * 110}ms` }}
                    className={`group flex flex-col items-start rounded-2xl p-4 -m-4 hover:bg-[#EBE5D5]/25 transition-all duration-500 ${
                      isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                    }`}
                  >
                    <div className="transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">
                      <ServiceIcon className="w-16 h-16" />
                    </div>

                    <h3 className="mt-6 text-xl sm:text-[22px] font-semibold text-[#111827] group-hover:text-[#1E4752] transition-colors">
                      {service.title}
                    </h3>

                    <p className="mt-3.5 text-sm sm:text-[15px] text-gray-500 leading-relaxed">
                      {service.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveServiceId(service.mappedShowcaseId);
                        const found = LUXURY_SERVICE_PRESENTATIONS.find(
                          (s) => s.id === service.mappedShowcaseId
                        );
                        setActiveModalService({
                          title: found ? found.editorialTitle : service.title,
                          subtitle: found
                            ? `${found.editorialBadge} • ${found.openingHours} • ${found.location}`
                            : 'Tiêu chuẩn chất lượng khách sạn & phòng nghỉ trên Traveleke',
                          description: found
                            ? `${found.storyParagraphs[0]} ${found.storyParagraphs[1]}`
                            : service.extendedInfo,
                          highlights: found ? found.highlights : service.highlights,
                        });
                      }}
                      className="mt-6 inline-flex items-center gap-1 text-sm sm:text-[15px] font-semibold text-[#111827] hover:text-[#1E4752] transition-colors cursor-pointer group/btn"
                    >
                      <span>Chi tiết</span>
                      <ChevronRight className="w-4 h-4 text-[#1E4752] transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. CHECKERBOARD "DỊCH VỤ" SHOWCASE & DEDICATED PER-SERVICE PRESENTATION */}
      <GoldenServicesShowcase
        activeServiceId={activeServiceId}
        onSelectService={(id) => setActiveServiceId(id)}
        onOpenModalForService={(srv: LuxuryServicePresentation) =>
          setActiveModalService({
            title: srv.editorialTitle,
            subtitle: `${srv.editorialBadge} • ${srv.openingHours} • ${srv.location}`,
            description: `${srv.storyParagraphs[0]} ${srv.storyParagraphs[1]}`,
            highlights: srv.highlights,
          })
        }
      />

      {activeModalService && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1E4752]/60 backdrop-blur-xs p-4"
          onClick={() => setActiveModalService(null)}
        >
          <div
            className="lux-scale-in relative w-full max-w-5xl rounded-3xl bg-white border border-[#1E4752]/15 p-6 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#1E4752]/10 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBE5D5] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#1E4752]">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8A700]" />
                  <span>Trải Nghiệm Thượng Lưu</span>
                </span>
                <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#1E4752]">
                  {activeModalService.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#1E4752]/70">
                  {activeModalService.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalService(null)}
                className="rounded-full p-2 text-[#1E4752]/70 hover:bg-[#1E4752]/10 hover:text-[#1E4752] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-6">
              <p className="text-sm sm:text-base text-[#1E4752]/85 leading-relaxed">
                {activeModalService.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-[#EBE5D5]/45 p-4 border border-[#1E4752]/10">
                {activeModalService.highlights.map((hl) => (
                  <div key={hl} className="flex items-center gap-2.5 text-sm font-semibold text-[#1E4752]">
                    <Check className="w-4 h-4 text-[#E8A700] shrink-0 stroke-[2.5]" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>

              {rooms.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1E4752]">
                      Hạng Phòng & Khách Sạn Nổi Bật Từ Hệ Thống (Live API)
                    </h4>
                    <Link
                      href="/hotels_home"
                      className="text-xs font-bold text-[#1E4752] hover:text-[#E8A700] flex items-center gap-1"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {rooms.slice(0, 3).map((room) => (
                      <Link
                        key={room.id}
                        href={`/hotels_home/${room.hotelId}`}
                        onClick={() => setActiveModalService(null)}
                        className="group rounded-2xl border border-[#1E4752]/12 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-[#E8A700] transition-all flex flex-col"
                      >
                        <div className="h-48 w-full overflow-hidden bg-[#1E4752]/5">
                          <img
                            src={resolveBackendImage(room.coverImageUrl, DEFAULT_COLLAGE.topLeft)}
                            alt={room.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="text-xs font-extrabold text-[#1E4752] line-clamp-1">{room.name}</h5>
                            <p className="mt-1 text-[11px] text-[#1E4752]/65 line-clamp-2">{room.description}</p>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-[#1E4752]/8 flex items-center justify-between">
                            <span className="tabular-nums text-xs font-extrabold text-[#1E4752]">
                              {Number(room.pricePerNight).toLocaleString('vi-VN')} ₫/đêm
                            </span>
                            <span className="text-[11px] font-bold text-[#E8A700]">Đặt ngay →</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalService(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#1E4752]/20 text-sm font-bold text-[#1E4752] hover:bg-[#1E4752]/5 transition cursor-pointer"
                >
                  Đóng
                </button>
                <Link
                  href="/hotels_home"
                  onClick={() => setActiveModalService(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#1E4752] text-white text-sm font-bold hover:bg-[#16363f] transition inline-flex items-center gap-2"
                >
                  <span>Khám phá khách sạn ngay</span>
                  <ChevronRight className="w-4 h-4 text-[#E8A700]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}