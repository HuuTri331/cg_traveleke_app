'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  MapPin,
  ArrowUpRight,
  BedDouble,
  Maximize2,
  Users,
  ShieldCheck,
  Clock,
  Eye,
} from 'lucide-react';
import {
  IconReceptionistBell,
  IconPrimeLocation,
  IconCustomerCare,
  IconExpressCheckIn,
  IconHotelSecurity,
  IconHotelPlusPerks,
  IconRoyalBed,
  IconPanoramaBalcony,
  IconMarbleJacuzzi,
  IconSmartRoomControl,
  IconMinibarChampagne,
  IconSoundproofLuxury,
} from './GoldenLuxuryIcons';

const BACKEND_DOMAIN = 'http://localhost:3001';

export interface HotelStrengthItem {
  id: string;
  badge: string;
  shortTitle: string;
  fullTitle: string;
  subtitle: string;
  rating: string;
  metricValue: string;
  metricLabel: string;
  description: string;
  plusPoints: string[];
  mainPhoto: string;
  galleryPhotos: {
    url: string;
    caption: string;
    tag: string;
  }[];
  icon: React.ComponentType<{ className?: string }>;
}

export interface RoomHighlightCardItem {
  num: string;
  id: string;
  title: string;
  shortDesc: string;
  detailHeadline: string;
  detailDesc: string;
  specs: { label: string; value: string }[];
  inRoomHighlights: string[];
  showcaseImage: string;
  secondaryImage: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const HOTEL_STRENGTHS_GALLERY: HotelStrengthItem[] = [
  {
    id: 'receptionist',
    badge: 'ĐIỂM MẠNH 01 • LỄ TÂN & ĐÓN TIẾP',
    shortTitle: 'Lễ tân tận tâm',
    fullTitle: 'Phục Vụ Của Nhân Viên Lễ Tân Chuyên Nghiệp & Nồng Hậu 24/7',
    subtitle: 'Nụ cười hiếu khách chuẩn 5 sao ngay từ khoảnh khắc đầu tiên đặt chân tới sảnh',
    rating: '4.98 / 5.0',
    metricValue: '< 60 giây',
    metricLabel: 'Thời gian phản hồi tại quầy Lễ tân',
    description:
      'Đội ngũ lễ tân và đại sứ sảnh (Lobby Ambassador) được đào tạo theo chuẩn mực khách sạn 5 sao quốc tế, thông thạo đa ngôn ngữ, luôn chủ động cúi chào, dâng trà thảo mộc chào mừng và khăn lạnh ngay khi quý khách vừa bước xuống xe.',
    plusPoints: [
      'Đón tiếp nồng hậu 24/7 với trà chào mừng (Welcome Tea) & khăn lạnh ướp hương sả chanh',
      'Đội ngũ lễ tân thông thạo Tiếng Việt, Anh, Nhật, Hàn, Trung hỗ trợ tận tình',
      'Bellman chủ động mở cửa xe và vận chuyển hành lý lên tận phòng nghỉ',
      'Tư vấn lịch trình tham quan, đặt bàn nhà hàng & phương tiện di chuyển miễn phí',
    ],
    mainPhoto:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85',
    galleryPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85',
        caption: 'Nhân viên lễ tân đón tiếp nồng hậu & trao thẻ phòng VIP',
        tag: 'Lễ tân 24/7',
      },
      {
        url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=85',
        caption: 'Đại sảnh (Grand Lobby) sang trọng ngập tràn ánh sáng tự nhiên',
        tag: 'Grand Lobby',
      },
      {
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=85',
        caption: 'Dịch vụ Bellman & Concierge chăm sóc hành lý tận cửa phòng',
        tag: 'Concierge',
      },
    ],
    icon: IconReceptionistBell,
  },
  {
    id: 'location',
    badge: 'ĐIỂM MẠNH 02 • VỊ TRÍ KIM CƯƠNG',
    shortTitle: 'Vị trí đắc địa',
    fullTitle: 'Vị Trí Đắc Địa Ngay Trung Tâm & Bờ Biển Đẹp Nhất Thành Phố',
    subtitle: 'Tọa độ vàng kết nối hoàn hảo giữa thiên nhiên biển xanh và nhịp sống giải trí',
    rating: '4.96 / 5.0',
    metricValue: '2 Phút',
    metricLabel: 'Đi bộ ra bãi biển & quảng trường trung tâm',
    description:
      'Sở hữu vị trí đắc địa bậc nhất với mặt tiền hướng thẳng ra vịnh biển xanh ngọc bích và lưng tựa trục đại lộ trung tâm sầm uất. Du khách dễ dàng tản bộ ra bãi biển riêng hoặc di chuyển tới các danh thắng, khu ẩm thực chỉ trong vài phút.',
    plusPoints: [
      'Tọa lạc ngay trục đường ven biển đẹp nhất & trung tâm văn hóa - ẩm thực',
      '100% tầm nhìn thoáng đãng không bị che chắn, ôm trọn bình minh và hoàng hôn',
      'Chỉ 15–20 phút di chuyển thẳng từ Sân bay Quốc tế qua đại lộ ven biển',
      'Bãi đỗ xe ngầm rộng rãi miễn phí có trạm sạc xe điện thông minh 24/7',
    ],
    mainPhoto:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85',
    galleryPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=85',
        caption: 'Toàn cảnh vị trí khách sạn sát bờ biển nhìn từ trên cao',
        tag: 'Sát biển 50m',
      },
      {
        url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=85',
        caption: 'Lối đi bộ riêng dẫn thẳng ra bãi cát trắng mịn và hồ bơi vô cực',
        tag: 'Bãi biển riêng',
      },
      {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=85',
        caption: 'Tầm nhìn toàn cảnh đại lộ trung tâm lung linh ánh đèn về đêm',
        tag: 'Trung tâm phố',
      },
    ],
    icon: IconPrimeLocation,
  },
  {
    id: 'customer-care',
    badge: 'ĐIỂM MẠNH 03 • CHĂM SÓC KHÁCH HÀNG',
    shortTitle: 'Chăm sóc khách hàng',
    fullTitle: 'Dịch Vụ Chăm Sóc Khách Hàng & Quản Gia Tận Tâm 1-1 Suốt Kỳ Nghỉ',
    subtitle: 'Cá nhân hóa từng chi tiết nhỏ nhất để mỗi vị khách đều là một thượng khách',
    rating: '4.99 / 5.0',
    metricValue: '24/7 VIP',
    metricLabel: 'Quản gia & CSKH đồng hành trực tiếp',
    description:
      'Không chỉ dừng lại ở dịch vụ lưu trú, bộ phận Guest Relations & Quản gia (Personal Butler) luôn theo sát và chăm sóc từng nhu cầu nhỏ nhất: từ việc chuẩn bị loại gối ngủ yêu thích, thực đơn ăn kiêng riêng cho tới trang trí phòng kỷ niệm bất ngờ.',
    plusPoints: [
      'Kênh hỗ trợ CSKH 1-1 qua điện thoại nội bộ & Zalo/WhatsApp phản hồi tức thì 24/7',
      'Miễn phí setup hoa tươi, nến & bánh kem cho khách có sinh nhật hoặc kỷ niệm ngày cưới',
      'Dịch vụ Turndown Service mỗi tối: dọn giường êm, đặt sô-cô-la & trà hoa cúc chúc ngủ ngon',
      'Chăm sóc đặc biệt cho gia đình có trẻ nhỏ (nôi em bé, xe đẩy, thực đơn dinh dưỡng)',
    ],
    mainPhoto:
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1400&q=85',
    galleryPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=85',
        caption: 'Phục vụ trà chiều và trái cây tươi tận không gian nghỉ dưỡng riêng',
        tag: 'Butler 1-1',
      },
      {
        url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=85',
        caption: 'Chuẩn bị không gian phòng kỷ niệm lãng mạn theo yêu cầu riêng',
        tag: 'Cá nhân hóa',
      },
      {
        url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=85',
        caption: 'Dịch vụ Turndown chỉnh trang phòng ngủ êm ái mỗi buổi tối',
        tag: 'Turndown 5 Sao',
      },
    ],
    icon: IconCustomerCare,
  },
  {
    id: 'checkin-checkout',
    badge: 'ĐIỂM MẠNH 04 • HỖ TRỢ CHECK-IN / CHECK-OUT',
    shortTitle: 'Hỗ trợ Check-in/out',
    fullTitle: 'Dịch Vụ Hỗ Trợ Check-in & Check-out Siêu Tốc, Linh Hoạt Không Chờ Đợi',
    subtitle: 'Quy trình nhận - trả phòng thông minh trong 90 giây cùng chính sách giờ giấc ưu việt',
    rating: '4.95 / 5.0',
    metricValue: '90 Giây',
    metricLabel: 'Hoàn tất thủ tục Express Check-in / Out',
    description:
      'Loại bỏ hoàn toàn sự mệt mỏi khi phải xếp hàng chờ đợi sau chuyến bay dài. Khách sạn triển khai quầy Express Check-in riêng biệt, hỗ trợ nhận phòng trực tiếp tại ghế sofa VIP Lounge và chính sách nhận sớm / trả muộn linh hoạt.',
    plusPoints: [
      'Thủ tục Express Check-in chỉ 90 giây bằng mã QR đặt phòng Traveleke',
      'Hỗ trợ Early Check-in (nhận phòng sớm) & Late Check-out (trả phòng muộn) linh hoạt',
      'Check-out 1 chạm (One-Touch Express Check-out): trả thẻ từ và di chuyển ngay không cần chờ kiểm phòng',
      'Miễn phí gửi hành lý có bảo vệ & sử dụng phòng tắm tráng, Lounge chờ sau khi đã Check-out',
    ],
    mainPhoto:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=85',
    galleryPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=85',
        caption: 'Sảnh VIP Lounge êm ái nơi du khách ngồi thưởng trà trong lúc nhận thẻ phòng',
        tag: 'VIP Check-in',
      },
      {
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85',
        caption: 'Phòng nghỉ luôn được khử khuẩn tia UV và sẵn sàng đón khách sớm',
        tag: 'Sẵn sàng 100%',
      },
      {
        url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=85',
        caption: 'Hỗ trợ giữ hành lý và xe đưa đón sân bay ngay sau khi Check-out',
        tag: 'Late Check-out',
      },
    ],
    icon: IconExpressCheckIn,
  },
  {
    id: 'security-privacy',
    badge: 'ĐIỂM MẠNH 05 • AN NINH & RIÊNG TƯ',
    shortTitle: 'An ninh & Riêng tư',
    fullTitle: 'Hệ Thống An Ninh Đa Lớp 24/24 & Không Gian Nghỉ Dưỡng Riêng Tư Tuyệt Đối',
    subtitle: 'Sự an tâm trọn vẹn cho gia đình, doanh nhân và các kỳ nghỉ dưỡng cao cấp',
    rating: '4.99 / 5.0',
    metricValue: '100%',
    metricLabel: 'Kiểm soát thẻ từ phân tầng thang máy',
    description:
      'Mỗi tầng lưu trú chỉ có thể tiếp cận bằng thẻ từ phòng đã mã hóa riêng. Đội ngũ an ninh chuyên nghiệp trực 24/24 cùng hệ thống báo cháy, y tế nội khu tiêu chuẩn quốc tế đảm bảo kỳ nghỉ của quý khách an toàn tuyệt đối.',
    plusPoints: [
      'Thang máy tốc độ cao kiểm soát thẻ từ phân tầng — chỉ khách lưu trú mới lên được tầng phòng',
      'Đội ngũ an ninh tuần tra 24/24 và nhân viên cứu hộ túc trực tại hồ bơi & bãi biển',
      'Khóa cửa từ thông minh 2 lớp chốt trong kết hợp két sắt điện tử sinh trắc học tại phòng',
      'Bảo mật 100% danh tính và thông tin lưu trú của khách hàng VIP',
    ],
    mainPhoto:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=85',
    galleryPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=85',
        caption: 'Khuôn viên khách sạn khép kín, an ninh tuần tra 24/24 chuyên nghiệp',
        tag: 'An ninh 24/7',
      },
      {
        url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=85',
        caption: 'Hành lang và không gian phòng nghỉ yên tĩnh, riêng tư tuyệt đối',
        tag: 'Riêng tư 5 sao',
      },
      {
        url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=900&q=85',
        caption: 'Đội ngũ cứu hộ và y tế túc trực thường xuyên tại khu vực bể bơi',
        tag: 'An toàn tuyệt đối',
      },
    ],
    icon: IconHotelSecurity,
  },
  {
    id: 'hotel-plus-perks',
    badge: 'ĐIỂM MẠNH 06 • ĐIỂM CỘNG ĐẶC QUYỀN',
    shortTitle: 'Điểm cộng đặc quyền',
    fullTitle: 'Chuỗi Điểm Cộng Giá Trị Gia Tăng Miễn Phí Mà Khách Sạn Đem Lại',
    subtitle: 'Hàng loạt tiện ích miễn phí đi kèm giúp nâng tầm giá trị vượt xa chi phí đặt phòng',
    rating: '4.97 / 5.0',
    metricValue: '12+ Đặc quyền',
    metricLabel: 'Tiện ích miễn phí bao gồm trong giá phòng',
    description:
      'Khi đặt phòng tại hệ thống khách sạn chuẩn 5 sao trên Traveleke, du khách được tận hưởng trọn gói hàng loạt đặc quyền giá trị cao hoàn toàn miễn phí — từ buffet sáng quốc tế hơn 80 món đến hồ bơi vô cực, phòng GYM Technogym và xông hơi đá muối.',
    plusPoints: [
      'Miễn phí Buffet sáng quốc tế thượng hạng & Trà chiều thư giãn tại sảnh Lounge',
      'Miễn phí sử dụng Bể bơi vô cực nước ấm, Phòng GYM Technogym & Khu xông hơi Sauna',
      'Ưu tiên nâng hạng phòng miễn phí (Complimentary Room Upgrade) khi còn phòng trống',
      'Miễn phí xe đạp dạo phố biển, Khu vui chơi trẻ em (Kids Club) & Wifi 6 tốc độ cao',
    ],
    mainPhoto:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85',
    galleryPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85',
        caption: 'Miễn phí sử dụng khu vực thư giãn Jacuzzi, Sauna & Hồ bơi vô cực',
        tag: 'Miễn phí 100%',
      },
      {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
        caption: 'Buffet sáng hơn 80 món Á - Âu đã bao gồm trong hạng phòng nghỉ',
        tag: 'Buffet Sáng 5 Sao',
      },
      {
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85',
        caption: 'Phòng tập GYM Technogym mở cửa 24/7 dành riêng cho khách lưu trú',
        tag: 'GYM 24/7',
      },
    ],
    icon: IconHotelPlusPerks,
  },
];
export const ROOM_QUALITY_HIGHLIGHTS: RoomHighlightCardItem[] = [
  {
    num: '01',
    id: 'royal-bedding',
    title: 'Giường Ngủ Hoàng Gia',
    shortDesc:
      'Đệm lò xo túi độc lập chuẩn 5 sao, ga lụa cotton Ai Cập 600 sợi và menu gối thảo dược nâng niu giấc ngủ sâu.',
    detailHeadline: 'Giấc Ngủ Thượng Lưu Trên Đệm Lò Xo Túi Độc Lập & Lụa Cotton Ai Cập 600 Sợi',
    detailDesc:
      'Điểm nhấn trung tâm của mỗi căn phòng là chiếc giường King-size bề thế sử dụng đệm lò xo túi độc lập ортопед chuẩn khách sạn 5 sao quốc tế, phủ lớp Topper lông vũ mềm mại và bộ chăn ga dệt từ 100% sợi cotton Ai Cập thoáng khí tuyệt đối.',
    specs: [
      { label: 'Mật độ sợi vải', value: '600 Thread Count' },
      { label: 'Kích thước giường', value: 'Super King 2.2m × 2.0m' },
      { label: 'Menu gối ngủ', value: '5 Loại (Lông vũ, Trà xanh, Kiều mạch...)' },
    ],
    inRoomHighlights: [
      'Đệm lò xo túi độc lập chống rung lắc hoàn toàn khi người nằm cạnh xoay trở',
      'Menu 5 loại gối ngủ cá nhân hóa theo độ cao cổ vai gáy của từng vị khách',
      'Đèn đọc sách đầu giường ánh sáng ấm 2700K chống mỏi mắt & cổng sạc nhanh USB-C',
      'Dịch vụ xịt tinh dầu oải hương (Lavender Sleep Mist) miễn phí mỗi buổi tối',
    ],
    showcaseImage:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=85',
    icon: IconRoyalBed,
  },
  {
    num: '02',
    id: 'panorama-balcony',
    title: 'Ban Công Panorama',
    shortDesc:
      'Cửa kính kịch trần mở ra ban công riêng ngập tràn nắng gió, ôm trọn bình minh trên biển và toàn cảnh thành phố.',
    detailHeadline: 'Tầm Nhìn Panorama 180° Không Giới Hạn Từ Ban Công Riêng Tư Trong Phòng',
    detailDesc:
      'Mỗi phòng nghỉ đều sở hữu hệ cửa kính Full-height từ sàn tới trần kết nối trực tiếp ra ban công riêng rộng rãi, nơi bố trí bàn trà đôi và ghế tắm nắng để quý khách thưởng thức cà phê sáng trước biển xanh mênh mông.',
    specs: [
      { label: 'Góc nhìn', value: '180° Ocean / City Panorama' },
      { label: 'Diện tích ban công', value: '8m² – 18m² riêng biệt' },
      { label: 'Kính chắn', value: 'Kính cường lực Low-E chống tia UV 99%' },
    ],
    inRoomHighlights: [
      'Cửa kính kịch trần mở rộng tối đa đưa ánh sáng tự nhiên và gió biển vào từng góc phòng',
      'Bộ sofa mây đan thủ công & bàn trà chiều riêng ngay ngoài ban công',
      'Lan can kính cường lực trong suốt giúp tầm nhìn không bị chia cắt khi nằm trên giường',
      'Rèm voan lụa 2 lớp đóng mở tự động bằng điều khiển từ xa ngay đầu giường',
    ],
    showcaseImage:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=85',
    icon: IconPanoramaBalcony,
  },
  {
    num: '03',
    id: 'marble-bathroom',
    title: 'Phòng Tắm Cẩm Thạch',
    shortDesc:
      'Bồn tắm ngâm Jacuzzi đá Marble tự nhiên, vòi sen mưa nhiệt đới và bộ mỹ phẩm thảo mộc hữu cơ chuẩn spa.',
    detailHeadline: 'Ốc Đảo Thư Giãn Với Bồn Ngâm Jacuzzi Hướng Biển & Đá Cẩm Thạch Ý',
    detailDesc:
      'Phòng tắm được thiết kế như một phòng Spa thu nhỏ ốp đá cẩm thạch trắng vân mây tự nhiên, trang bị bồn tắm nằm độc lập đặt cạnh khung cửa kính lớn cùng buồng tắm đứng vòi sen mưa nhiệt đới áp lực cao.',
    specs: [
      { label: 'Bồn tắm', value: 'Freestanding Jacuzzi / Soaking Tub' },
      { label: 'Mỹ phẩm tắm', value: 'Organic Botanical 100% Thiên nhiên' },
      { label: 'Tiện nghi', value: 'Gương LED chống mờ & Sấy tóc Ion âm' },
    ],
    inRoomHighlights: [
      'Bồn tắm ngâm Jacuzzi sục khí thư giãn cơ bắp kèm muối tắm thảo dược miễn phí',
      'Hệ thống vòi sen mưa nhiệt đới (Rain Shower) giữ nhiệt độ nước ổn định tức thì',
      'Khăn tắm bông sợi tre siêu mềm được ủ ấm và áo choàng tắm lụa Waffle cao cấp',
      'Vách kính thông minh chuyển đổi chế độ trong suốt / mờ đục chỉ bằng 1 công tắc',
    ],
    showcaseImage:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=900&q=85',
    icon: IconMarbleJacuzzi,
  },
  {
    num: '04',
    id: 'smart-room-tech',
    title: 'Công Nghệ Smart Room',
    shortDesc:
      'Điều khiển kịch bản ánh sáng, rèm cửa tự động, nhiệt độ điều hòa và Smart TV 4K 65 inch chỉ bằng một chạm.',
    detailHeadline: 'Hệ Sinh Thái Phòng Thông Minh 1 Chạm & Giải Trí Chuẩn Rạp Chiếu Phim Tại Phòng',
    detailDesc:
      'Toàn bộ tiện nghi điện tử trong phòng được đồng bộ hóa qua bảng điều khiển cảm ứng thông minh đặt ngay đầu giường. Quý khách có thể chuyển đổi kịch bản ánh sáng (Relax, Reading, Romance, Sleep) hoặc đóng mở rèm cửa chỉ với một thao tác chạm.',
    specs: [
      { label: 'Màn hình giải trí', value: 'Smart OLED TV 4K 65" xoay 180°' },
      { label: 'Âm thanh', value: 'Loa Bluetooth Bose / Marshall trong phòng' },
      { label: 'Kết nối', value: 'Wifi 6 Riêng biệt từng phòng (300 Mbps)' },
    ],
    inRoomHighlights: [
      'Bảng điều khiển Master Switch đầu giường tắt/bật toàn bộ đèn và rèm tự động',
      'Smart TV 4K 65 inch tích hợp sẵn Netflix, YouTube Premium & trình chiếu AirPlay/Chromecast',
      'Điều hòa trung tâm Inverter vận hành siêu êm (< 18dB) duy trì độ ẩm cân bằng cho da',
      'Két sắt điện tử thông minh vừa vặn Laptop 16 inch kèm ổ cắm sạc đa năng quốc tế',
    ],
    showcaseImage:
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1400&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=85',
    icon: IconSmartRoomControl,
  },
  {
    num: '05',
    id: 'minibar-lounge',
    title: 'Minibar & Trà Thượng Hạng',
    shortDesc:
      'Quầy Minibar đầy ắp rượu vang tuyển chọn, máy pha cà phê viên nén Nespresso và trà hoa tươi mỗi ngày.',
    detailHeadline: 'Góc Thưởng Thức Đồ Uống Tinh Tế Ngay Trong Phòng Với Máy Pha Espresso & Tủ Rượu Vang',
    detailDesc:
      'Mỗi phòng nghỉ đều được trang bị quầy Private Bar sang trọng với máy pha cà phê viên nén Nespresso, ấm đun siêu tốc kiểm soát nhiệt độ, bộ ấm tách sứ xương cao cấp cùng khay trà thảo mộc, hạt dinh dưỡng và rượu vang nhập khẩu.',
    specs: [
      { label: 'Cà phê tại phòng', value: 'Máy pha viên nén Nespresso miễn phí' },
      { label: 'Trà & Nước suối', value: 'Trà Ô Long, Hoa Cúc & 4 chai nước/ngày' },
      { label: 'Tủ lạnh Minibar', value: 'Tủ làm mát không tiếng ồn 0dB' },
    ],
    inRoomHighlights: [
      'Miễn phí 100% viên nén cà phê Espresso, trà thảo mộc cao cấp và nước khoáng đóng chai mỗi ngày',
      'Tủ rượu vang mini bảo quản ở nhiệt độ tiêu chuẩn 14°C kèm bộ ly pha lê Riedel',
      'Giỏ trái cây nhiệt đới tươi ngon và bánh Macaron chào mừng ngày đầu nhận phòng',
      'Dịch vụ gọi đồ ăn đêm In-Room Dining 24/7 phục vụ tận bàn ăn riêng trong phòng',
    ],
    showcaseImage:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=900&q=85',
    icon: IconMinibarChampagne,
  },
  {
    num: '06',
    id: 'soundproof-air',
    title: 'Cách Âm & Khí Tươi 5 Sao',
    shortDesc:
      'Hệ kính hộp 3 lớp cách âm tuyệt đối kết hợp công nghệ cấp khí tươi lọc bụi mịn HEPA giúp giấc ngủ trong lành.',
    detailHeadline: 'Không Gian Tĩnh Lặng Tuyệt Đối & Bầu Không Khí Tinh Khiết Chuẩn Resort Sinh Thái',
    detailDesc:
      'Chất lượng phòng nghỉ đỉnh cao nằm ở những giá trị vô hình: tường cách âm đa lớp, cửa gỗ chống cháy có gioăng giảm chấn và hệ thống kính hộp 3 lớp hút chân không giúp tách biệt hoàn toàn tiếng ồn bên ngoài.',
    specs: [
      { label: 'Chuẩn cách âm', value: 'STC 55+ (Triệt tiêu 98% tiếng ồn)' },
      { label: 'Lọc không khí', value: 'Màng lọc HEPA H13 + Ion âm tự nhiên' },
      { label: 'Vật liệu nội thất', value: 'Gỗ Óc Chó (Walnut) & Đá tự nhiên' },
    ],
    inRoomHighlights: [
      'Hệ kính hộp 3 lớp cách âm – cách nhiệt tuyệt đối ngay cả với phòng hướng phố trung tâm',
      'Hệ thống cấp khí tươi liên tục giúp phòng luôn thoáng đãng, không có mùi kín',
      'Sàn gỗ tự nhiên ấm áp cho bàn chân và thảm dệt thủ công kháng khuẩn chống dị ứng',
      'Bàn làm việc Ergonomic rộng rãi hướng sáng tự nhiên dành cho khách công tác kết hợp nghỉ dưỡng',
    ],
    showcaseImage:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85',
    icon: IconSoundproofLuxury,
  },
];
function resolveUploadImage(rawPath: string | undefined, fallback: string): string {
  if (!rawPath) return fallback;
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) return rawPath;
  const clean = rawPath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${BACKEND_DOMAIN}/${clean}`;
}

export default function HotelStrengthsAndRoomHighlights() {
  const [activeStrengthIdx, setActiveStrengthIdx] = useState<number>(0);
  const [activeSubPhotoIdx, setActiveSubPhotoIdx] = useState<number>(0);

  const [activeRoomCardIdx, setActiveRoomCardIdx] = useState<number>(0);
  const [showAllSixRoomCards, setShowAllSixRoomCards] = useState<boolean>(false);
  const [roomCarouselOffset, setRoomCarouselOffset] = useState<number>(0);

  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [liveHotels, setLiveHotels] = useState<any[]>([]);

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [roomsRes, hotelsRes]: any = await Promise.allSettled([
          apiClient.get('/rooms'),
          apiClient.get('/hotels/search'),
        ]);

        if (roomsRes.status === 'fulfilled') {
          const rPayload = roomsRes.value?.data ?? roomsRes.value;
          const rList = Array.isArray(rPayload)
            ? rPayload
            : Array.isArray(rPayload?.data)
            ? rPayload.data
            : [];
          setLiveRooms(rList.slice(0, 6));
        }

        if (hotelsRes.status === 'fulfilled') {
          const hPayload = hotelsRes.value?.data ?? hotelsRes.value;
          const hList = Array.isArray(hPayload)
            ? hPayload
            : Array.isArray(hPayload?.data)
            ? hPayload.data
            : [];
          setLiveHotels(hList.slice(0, 6));
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu phòng & khách sạn:', err);
      }
    };

    fetchBackendData();
  }, []);

  const currentStrength =
    HOTEL_STRENGTHS_GALLERY[activeStrengthIdx] || HOTEL_STRENGTHS_GALLERY[0];
  const currentRoomHighlight =
    ROOM_QUALITY_HIGHLIGHTS[activeRoomCardIdx] || ROOM_QUALITY_HIGHLIGHTS[0];

  const displayedStrengthPhoto =
    activeSubPhotoIdx === 0
      ? currentStrength.mainPhoto
      : currentStrength.galleryPhotos[activeSubPhotoIdx - 1]?.url || currentStrength.mainPhoto;

  const visibleRoomCards = showAllSixRoomCards
    ? ROOM_QUALITY_HIGHLIGHTS
    : ROOM_QUALITY_HIGHLIGHTS.slice(roomCarouselOffset, roomCarouselOffset + 4);

  const handleSelectStrength = (idx: number) => {
    setActiveStrengthIdx(idx);
    setActiveSubPhotoIdx(0);
  };

  return (
    <section className="w-full bg-[#EBE5D5] -mt-10 pt-18 pb-16 sm:pb-24 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(255,255,255,0.65) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(232,167,0,0.12) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* TOP 6-CARD HOTEL STRENGTHS STRIP (IMAGE 1 LAYOUT) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {HOTEL_STRENGTHS_GALLERY.map((item, idx) => {
            const IconComponent = item.icon;
            const isSelected = activeStrengthIdx === idx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectStrength(idx)}
                className={`group relative rounded-xl bg-white py-6 sm:py-7 px-3 sm:px-4 flex flex-col items-center justify-center text-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                  isSelected
                    ? 'shadow-xl ring-2 ring-[#1E4752] -translate-y-1.5'
                    : 'shadow-xs hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <span
                  className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#E8A700] scale-125'
                      : 'bg-transparent group-hover:bg-[#1E4752]/25'
                  }`}
                />
                <div className="mb-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110">
                  <IconComponent className="w-13 h-13 sm:w-14 sm:h-14" />
                </div>
                <span className="text-[15px] sm:text-[17px] font-bold text-[#111827] tracking-tight group-hover:text-[#1E4752] transition-colors">
                  {item.shortTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Gallery Controls */}
        <div className="mt-8 sm:mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E4752] text-[#E8A700] text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Gallery Điểm Cộng Khách Sạn
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#1E4752]">
                {currentStrength.badge}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleSelectStrength(
                    (activeStrengthIdx - 1 + HOTEL_STRENGTHS_GALLERY.length) %
                      HOTEL_STRENGTHS_GALLERY.length
                  )
                }
                aria-label="Điểm mạnh trước"
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-[#1E4752] text-[#1E4752] hover:text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSelectStrength(
                    (activeStrengthIdx + 1) % HOTEL_STRENGTHS_GALLERY.length
                  )
                }
                aria-label="Điểm mạnh tiếp theo"
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-[#1E4752] text-[#1E4752] hover:text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 6-Slice Expanding Kinetic Accordion Strip (Desktop) */}
          <div className="hidden lg:flex h-[430px] xl:h-[470px] gap-4 mb-8">
            {HOTEL_STRENGTHS_GALLERY.map((item, idx) => {
              const isExpanded = activeStrengthIdx === idx;
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectStrength(idx)}
                  onMouseEnter={() => handleSelectStrength(idx)}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isExpanded
                      ? 'flex-[3.8] shadow-2xl ring-2 ring-[#E8A700]/70'
                      : 'flex-1 opacity-85 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.mainPhoto}
                    alt={item.fullTitle}
                    className={`w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isExpanded ? 'scale-100' : 'scale-110'
                    }`}
                  />
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      isExpanded
                        ? 'bg-gradient-to-t from-[#0B1F26]/90 via-[#0B1F26]/35 to-transparent'
                        : 'bg-gradient-to-t from-[#0B1F26]/85 via-[#0B1F26]/45 to-[#0B1F26]/20'
                    }`}
                  />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-white/95 text-[#1E4752] text-xs font-black flex items-center justify-center shadow-md">
                      0{idx + 1}
                    </span>
                    {isExpanded && (
                      <span className="px-3 py-1 rounded-full bg-[#E8A700] text-[#111827] text-xs font-extrabold shadow-md">
                        ★ {item.rating} • {item.metricValue}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                    {isExpanded ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#E8A700]">
                          {item.badge}
                        </p>
                        <h3 className="text-lg sm:text-xl font-extrabold leading-snug">
                          {item.fullTitle}
                        </h3>
                        <p className="text-xs text-white/85 line-clamp-2 max-w-2xl">
                          {item.subtitle}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold tracking-tight line-clamp-1">
                          {item.shortTitle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-[#1E4752]/10 p-6 sm:p-10 lg:p-12 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left 7 Cols: Interactive Main Photo + 3 Sub-Gallery Thumbnails */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative h-[320px] sm:h-[420px] lg:h-[460px] rounded-2xl overflow-hidden bg-gray-100 shadow-md group">
                  <img
                    src={displayedStrengthPhoto}
                    alt={currentStrength.fullTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-[#1E4752]/95 text-[#E8A700] text-xs font-extrabold">
                      {currentStrength.metricValue}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-[#111827] text-xs font-bold">
                      {currentStrength.metricLabel}
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#E8A700]">
                        {activeSubPhotoIdx === 0
                          ? currentStrength.shortTitle
                          : currentStrength.galleryPhotos[activeSubPhotoIdx - 1]?.tag}
                      </p>
                      <p className="text-base sm:text-lg font-bold mt-0.5">
                        {activeSubPhotoIdx === 0
                          ? currentStrength.subtitle
                          : currentStrength.galleryPhotos[activeSubPhotoIdx - 1]?.caption}
                      </p>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-black/50 text-xs font-bold text-[#E8A700]">
                      ★ {currentStrength.rating}
                    </span>
                  </div>
                </div>

                {/* 4 Gallery Thumbnails */}
                <div className="grid grid-cols-4 gap-3.5 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveSubPhotoIdx(0)}
                    className={`relative h-22 sm:h-28 rounded-xl overflow-hidden cursor-pointer transition-all ${
                      activeSubPhotoIdx === 0
                        ? 'ring-2 ring-[#1E4752] scale-[1.02] shadow-md'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={currentStrength.mainPhoto}
                      alt="Ảnh chính"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 rounded bg-black/65 text-[11px] font-bold text-white truncate">
                      Tổng quan
                    </span>
                  </button>

                  {currentStrength.galleryPhotos.map((photo, pIdx) => {
                    const thumbIndex = pIdx + 1;
                    const isThumbActive = activeSubPhotoIdx === thumbIndex;
                    return (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setActiveSubPhotoIdx(thumbIndex)}
                        className={`relative h-22 sm:h-28 rounded-xl overflow-hidden cursor-pointer transition-all ${
                          isThumbActive
                            ? 'ring-2 ring-[#1E4752] scale-[1.02] shadow-md'
                            : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 rounded bg-black/65 text-[11px] font-bold text-white truncate">
                          {photo.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 5 Cols: Editorial Story & 4 Hotel Plus Points */}
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1E4752]">
                    {currentStrength.badge}
                  </span>
                  <h3 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-[#111827] leading-snug">
                    {currentStrength.fullTitle}
                  </h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {currentStrength.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#1E4752]">
                    Điểm cộng khách sạn mang lại cho du khách:
                  </p>
                  {currentStrength.plusPoints.map((pt, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#EBE5D5]/45 border border-[#1E4752]/8"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#1E4752] text-[#E8A700] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span className="text-xs sm:text-[13px] font-semibold text-[#111827] leading-snug">
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        {/* =====================================================================
            PART 2: EXACT IMAGE 2 LAYOUT ADAPTED FOR HOTEL ROOMS
            ("Tận tâm chuyên nghiệp / CHẤT LƯỢNG PHÒNG NGHỈ ĐẲNG CẤP VÀ ĐIỂM NHẤN")
            ===================================================================== */}
        <div className="mt-20 sm:mt-24">
          {/* Centered Header matching Image 2 Layout with Our Room Quality Content */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <p className="text-sm sm:text-base font-medium text-[#1E4752] tracking-wide mb-2">
              Không gian lưu trú chuẩn mực & tiện nghi vượt trội
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#111827] uppercase tracking-wide leading-tight">
              ĐIỂM MẠNH CHẤT LƯỢNG PHÒNG & ĐIỂM NHẤN TRONG PHÒNG
            </h2>
          </div>

          {/* Carousel / View Mode Controls */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs sm:text-sm font-medium text-[#1E4752]/80">
              Chọn từng thẻ điểm nhấn phòng ({activeRoomCardIdx + 1}/06) để xem chi tiết cấu trúc & phòng thực tế
            </p>
            <div className="flex items-center gap-2">
              {!showAllSixRoomCards && (
                <>
                  <button
                    type="button"
                    onClick={() => setRoomCarouselOffset((prev) => Math.max(0, prev - 1))}
                    disabled={roomCarouselOffset === 0}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-[#1E4752] disabled:opacity-40 text-[#1E4752] hover:text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    aria-label="Trượt sang trái"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomCarouselOffset((prev) => Math.min(2, prev + 1))}
                    disabled={roomCarouselOffset >= 2}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-[#1E4752] disabled:opacity-40 text-[#1E4752] hover:text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    aria-label="Trượt sang phải"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setShowAllSixRoomCards((prev) => !prev)}
                className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-[#1E4752] text-[#1E4752] hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {showAllSixRoomCards ? 'Xem 4 thẻ chuẩn mẫu' : ' Mở rộng cả 06 điểm nhấn'}
              </button>
            </div>
          </div>

          {/* Tall Numbered Cards Grid (Exact Reference Image 2 Anatomy) */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              showAllSixRoomCards ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
            } gap-6 lg:gap-7`}
          >
            {visibleRoomCards.map((card) => {
              const globalIdx = ROOM_QUALITY_HIGHLIGHTS.findIndex((c) => c.id === card.id);
              const isCardActive = activeRoomCardIdx === globalIdx;
              const IconComp = card.icon;

              return (
                <div
                  key={card.id}
                  onClick={() => setActiveRoomCardIdx(globalIdx)}
                  className={`group relative rounded-2xl p-8 sm:p-10 min-h-[360px] flex flex-col justify-between cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isCardActive
                      ? 'bg-white shadow-2xl ring-2 ring-[#1E4752] -translate-y-2'
                      : 'bg-[#F4F3F1] hover:bg-white shadow-xs hover:shadow-xl hover:-translate-y-1.5'
                  }`}
                >
                  <div>
                    {/* Top-left number matching Image 2 (01, 02, 03, 04...) */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-base sm:text-[17px] font-normal tracking-wide transition-colors ${
                          isCardActive ? 'text-[#1E4752] font-bold' : 'text-gray-500'
                        }`}
                      >
                        {card.num}
                      </span>
                      {isCardActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E8A700]/20 text-[#1E4752] text-[10px] font-extrabold uppercase tracking-wider">
                          Đang xem điểm nhấn
                        </span>
                      )}
                    </div>

                    {/* Bold Black Title matching Image 2 */}
                    <h3 className="mt-6 text-xl sm:text-[23px] font-bold text-[#111827] tracking-tight leading-snug group-hover:text-[#1E4752] transition-colors">
                      {card.title}
                    </h3>

                    {/* 3-line Muted Grey Description matching Image 2 */}
                    <p className="mt-4 text-sm sm:text-[15px] text-gray-500 leading-relaxed font-normal">
                      {card.shortDesc}
                    </p>
                  </div>

                  {/* Bottom-left Custom Dual-Tone SVG Icon matching Image 2 */}
                  <div className="mt-8 pt-2 flex items-end justify-between">
                    <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:translate-x-1">
                      <IconComp className="w-13 h-13 sm:w-14 sm:h-14" />
                    </div>
                    <span
                      className={`text-xs font-bold inline-flex items-center gap-1 transition-opacity ${
                        isCardActive
                          ? 'text-[#1E4752] opacity-100'
                          : 'text-gray-400 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      Chi tiết phòng <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl bg-white/95 border border-[#1E4752]/10 p-6 sm:p-10 lg:p-12 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left 7 Cols: Large Unobstructed Room Highlight Imagery + Full Spec Strip */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative h-[340px] sm:h-[430px] lg:h-[470px] rounded-2xl overflow-hidden shadow-md group">
                  <img
                    src={currentRoomHighlight.showcaseImage}
                    alt={currentRoomHighlight.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 rounded-full bg-[#1E4752] text-[#E8A700] text-xs font-extrabold uppercase tracking-wider shadow-md">
                      Điểm nhấn phòng {currentRoomHighlight.num} • {currentRoomHighlight.title}
                    </span>
                  </div>
                </div>

                {/* 3 Full-Width Spec Cards Below Photo (No Image Occlusion or Text Truncation) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {currentRoomHighlight.specs.map((spec, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#1E4752]/10 text-[#111827]"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {spec.label}
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold text-[#1E4752] mt-1 leading-snug">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 5 Cols: Room Quality Breakdown & In-Room Highlights */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1E4752]">
                    TIÊU CHUẨN CHẤT LƯỢNG TRONG PHÒNG NGHỈ
                  </span>
                  <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#111827] leading-snug">
                    {currentRoomHighlight.detailHeadline}
                  </h3>
                  <p className="mt-3.5 text-sm sm:text-base text-gray-600 leading-relaxed">
                    {currentRoomHighlight.detailDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {currentRoomHighlight.inRoomHighlights.map((hl, hIdx) => (
                    <div
                      key={hIdx}
                      className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#EBE5D5]/45 border border-[#1E4752]/8"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#1E4752] text-[#E8A700] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span className="text-xs sm:text-[13.5px] font-semibold text-[#111827] leading-snug">
                        {hl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Backend Rooms Strip */}
            {liveRooms.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-[#1E4752]" />
                    <h4 className="text-sm sm:text-base font-extrabold text-[#111827] uppercase tracking-wider">
                      Hạng Phòng Thực Tế Sở Hữu Điểm Nhấn &ldquo;{currentRoomHighlight.title}&rdquo;
                    </h4>
                  </div>
                  <Link
                    href="/hotels_home"
                    className="text-xs sm:text-sm font-extrabold text-[#1E4752] hover:text-[#E8A700] inline-flex items-center gap-1 transition-colors"
                  >
                    Khám phá tất cả hạng phòng <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                  {liveRooms.slice(0, 4).map((room: any, rIdx: number) => {
                    const rawImg =
                      room?.images?.[0]?.imageUrl ||
                      room?.images?.[0]?.url ||
                      room?.imageUrl ||
                      room?.thumbnail;
                    const imgSrc = resolveUploadImage(
                      rawImg,
                      currentRoomHighlight.showcaseImage
                    );
                    const price = Number(room?.price || room?.basePrice || 1850000);
                    const hotelId = room?.hotel?.id || room?.hotelId || 1;

                    return (
                      <Link
                        key={room?.id || rIdx}
                        href={`/hotels_home/${hotelId}`}
                        className="group flex flex-col rounded-2xl bg-[#F8F7F4] hover:bg-white border border-gray-200/80 hover:border-[#1E4752]/40 overflow-hidden shadow-2xs hover:shadow-md transition-all"
                      >
                        <div className="relative h-52 sm:h-56 overflow-hidden bg-gray-100">
                          <img
                            src={imgSrc}
                            alt={room?.name || 'Luxury Suite'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                currentRoomHighlight.showcaseImage;
                            }}
                          />
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#1E4752]/90 text-[#E8A700] text-[11px] font-bold">
                            Chuẩn 5 Sao
                          </span>
                        </div>
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="text-base font-extrabold text-[#111827] group-hover:text-[#1E4752] line-clamp-1">
                              {room?.name || `Grand Luxury Suite ${rIdx + 1}`}
                            </h5>
                            <p className="mt-1.5 text-xs text-gray-500">
                              {room?.hotel?.name || 'Hệ thống Khách sạn Đối tác Traveleke'} • Tối đa{' '}
                              {room?.maxOccupancy || room?.capacity || 2} khách
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#1E4752]">
                              {price.toLocaleString('vi-VN')} ₫
                              <span className="text-[10px] font-normal text-gray-500">/đêm</span>
                            </span>
                            <span className="text-[11px] font-bold text-[#1E4752] group-hover:translate-x-0.5 transition-transform">
                              Xem phòng →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
