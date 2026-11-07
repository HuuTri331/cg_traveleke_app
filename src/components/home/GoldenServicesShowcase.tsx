'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  Sparkles,
  Check,
  ChevronRight,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export interface ServicePackageItem {
  name: string;
  durationOrUnit: string;
  price: string;
  detail: string;
}

export interface LuxuryServicePresentation {
  id: string;
  shortLabel: string;
  checkerboardTitle: string;
  checkerboardDescription: string;
  mainImage: string;
  gallery: [string, string, string];
  editorialBadge: string;
  editorialTitle: string;
  editorialSubtitle: string;
  openingHours: string;
  location: string;
  dressCodeOrPolicy: string;
  hotline: string;
  storyParagraphs: [string, string];
  highlights: string[];
  packagesTitle: string;
  packages: ServicePackageItem[];
}

export const LUXURY_SERVICE_PRESENTATIONS: LuxuryServicePresentation[] = [
  {
    id: 'reception-checkin',
    shortLabel: 'Lễ Tân & Check-in',
    checkerboardTitle: 'Phục Vụ Lễ Tân & Hỗ Trợ Check-in / Check-out',
    checkerboardDescription:
      'Điểm cộng lớn nhất của hệ thống khách sạn trên Traveleke chính là thái độ phục vụ hiếu khách, chuyên nghiệp của đội ngũ lễ tân 24/7 cùng quy trình hỗ trợ nhận phòng – trả phòng nhanh gọn chỉ trong 90 giây.',
    mainImage:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
    ],
    editorialBadge: 'Điểm Mạnh Khách Sạn • Phục Vụ Lễ Tân & Thủ Tục Nhanh Gọn',
    editorialTitle: 'PHỤC VỤ LỄ TÂN NỒNG HẬU & HỖ TRỢ CHECK-IN / CHECK-OUT LINH HOẠT',
    editorialSubtitle:
      'Đón tiếp bằng nụ cười thân thiện ngay từ sảnh chính, xác nhận mã đặt phòng tức thì và hỗ trợ tối đa nhận phòng sớm hoặc trả phòng muộn.',
    openingHours: 'Quầy lễ tân trực 24/24 mỗi ngày',
    location: 'Sảnh Đón Tiếp Chính Tại Khách Sạn Đối Tác',
    dressCodeOrPolicy: 'Xác nhận mã đặt phòng điện tử trong 90 giây',
    hotline: '1900 6868 (Hỗ trợ Check-in & Giữ phòng 24/7)',
    storyParagraphs: [
      'Tại các khách sạn đối tác được tuyển chọn trên Traveleke, trải nghiệm của du khách bắt đầu ngay từ khoảnh khắc bước chân vào sảnh lễ tân. Đội ngũ nhân viên lễ tân được đào tạo bài bản, luôn chủ động hỗ trợ hành lý, mời khăn lạnh – trà chào mừng và giải đáp cặn kẽ mọi thông tin về điểm đến.',
      'Nhờ kết nối đồng bộ thời gian thực (Realtime Booking) với hệ thống Traveleke, quý khách không cần chờ đợi lâu để đối chiếu giấy tờ. Khách sạn luôn ưu tiên hỗ trợ nhận phòng sớm (Early Check-in), trả phòng muộn (Late Check-out) theo tình trạng phòng trống và giữ hành lý miễn phí trọn ngày.',
    ],
    highlights: [
      'Thủ tục nhận phòng (Check-in) & trả phòng (Check-out) siêu tốc chỉ từ 90 giây',
      'Đội ngũ lễ tân đa ngôn ngữ, thân thiện, hỗ trợ xách và bảo quản hành lý tận phòng',
      'Linh hoạt hỗ trợ nhận phòng sớm & trả phòng muộn cho khách đặt qua Traveleke',
      'Miễn phí nước uống Welcome Drink, khăn lạnh thảo mộc và bản đồ du lịch địa phương',
    ],
    packagesTitle: 'Các Điểm Cộng Dịch Vụ Lễ Tân & Thủ Tục Lưu Trú',
    packages: [
      {
        name: 'Quầy Lễ Tân Ưu Tiên & Nhận Phòng Nhanh (Express Check-in)',
        durationOrUnit: 'Áp dụng cho mọi mã đặt phòng Traveleke',
        price: 'Miễn phí 100%',
        detail: 'Quét mã QR xác nhận giữ chỗ tức thì, không cần đặt cọc giấy tờ phức tạp tại quầy.',
      },
      {
        name: 'Hỗ Trợ Nhận Phòng Sớm & Trả Phòng Muộn Linh Hoạt',
        durationOrUnit: 'Theo tình trạng phòng thực tế tại khách sạn',
        price: 'Ưu tiên hỗ trợ miễn phí',
        detail: 'Lễ tân chủ động sắp xếp phòng sớm cho khách đáp chuyến bay sáng hoặc xe đêm.',
      },
      {
        name: 'Dịch Vụ Giữ Hành Lý An Toàn Trước & Sau Khi Trả Phòng',
        durationOrUnit: 'Phục vụ 24/7 tại sảnh chính',
        price: 'Miễn phí cho khách lưu trú',
        detail: 'Có thẻ niêm phong hành lý riêng để quý khách thoải mái dạo phố trước giờ ra sân bay.',
      },
      {
        name: 'Bàn Tư Vấn Lịch Trình, Đặt Xe & Vé Tham Quan Bản Địa',
        durationOrUnit: 'Hỗ trợ trực tiếp tại quầy Concierge',
        price: 'Tư vấn miễn phí 24/7',
        detail: 'Gợi ý quán ăn ngon chuẩn vị bản địa, hỗ trợ gọi taxi/xe điện giá niêm yết minh bạch.',
      },
    ],
  },
  {
    id: 'prime-location',
    shortLabel: 'Vị Trí Đắc Địa',
    checkerboardTitle: 'Vị Trí Trung Tâm Đắc Địa & Dễ Di Chuyển',
    checkerboardDescription:
      'Tất cả khách sạn trên hệ thống đều sở hữu tọa độ vàng ngay trung tâm thành phố, sát bờ biển hoặc gần các khu phố cổ – chợ đêm sầm uất, giúp du khách tiết kiệm tối đa thời gian và chi phí di chuyển.',
    mainImage:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
    ],
    editorialBadge: 'Điểm Mạnh Khách Sạn • Tọa Độ Vàng & Kết Nối Giao Thông',
    editorialTitle: 'VỊ TRÍ TRUNG TÂM ĐẮC ĐỊA & KẾT NỐI THUẬN TIỆN ĐẾN MỌI ĐIỂM ĐẾN',
    editorialSubtitle:
      'Chỉ vài bước chân ra bãi biển, phố đi bộ và khu ẩm thực đêm, đi kèm bãi đỗ xe rộng rãi và lộ trình di chuyển thuận lợi từ sân bay.',
    openingHours: 'Khu vực an ninh & sầm uất 24/7',
    location: 'Trục đường trung tâm & mặt biển tại các thành phố du lịch',
    dressCodeOrPolicy: 'Có bãi đỗ ô tô riêng & sảnh đón xe tận cửa',
    hotline: '1900 6868 (Hỗ trợ chỉ đường & đặt xe đưa đón)',
    storyParagraphs: [
      'Vị trí lưu trú quyết định hơn 50% sự thoải mái của một chuyến du lịch. Vì vậy, Traveleke ưu tiên tuyển chọn những khách sạn nằm trên các trục đường lớn dễ tìm, mặt tiền thông thoáng nơi ô tô 4–45 chỗ có thể dừng đỗ ngay trước sảnh mà không phải đi bộ vào ngõ hẹp.',
      'Từ khách sạn, du khách chỉ mất từ 3 đến 5 phút đi bộ để hòa mình vào làn nước biển trong xanh, dạo phố đi bộ, thưởng thức đặc sản địa phương hay mua sắm tại trung tâm thương mại. Xung quanh khách sạn luôn đầy đủ tiện ích từ cửa hàng tiện lợi 24h, hiệu thuốc cho đến quán cà phê đẹp.',
    ],
    highlights: [
      'Cách bãi biển, quảng trường trung tâm hoặc phố đi bộ chỉ từ 200m – 500m',
      'Đường lớn mặt tiền rộng rãi, xe taxi và xe du lịch đón trả khách ngay sảnh',
      'Khu vực an ninh văn minh, gần chuỗi nhà hàng đặc sản, quán cà phê và chợ đêm',
      'Có hầm/bãi đỗ xe ô tô và xe máy miễn phí có bảo vệ trông coi 24/24',
    ],
    packagesTitle: 'Lợi Thế Vị Trí & Tiện Ích Kết Nối Xung Quanh Khách Sạn',
    packages: [
      {
        name: 'Tọa Độ Vàng Cách Bãi Biển & Phố Đi Bộ Chỉ 3–5 Phút Đi Bộ',
        durationOrUnit: 'Thuận tiện dạo bộ sáng sớm & tối muộn',
        price: 'Tiết kiệm chi phí di chuyển',
        detail: 'Thuận lợi cho gia đình có người lớn tuổi và trẻ nhỏ không phải di chuyển xa.',
      },
      {
        name: 'Bãi Đỗ Xe Ô Tô & Xe Máy Riêng Biệt Ngay Tại Khách Sạn',
        durationOrUnit: 'Bảo vệ trực 24/24 kèm camera giám sát',
        price: 'Miễn phí cho khách đặt phòng',
        detail: 'Đáp ứng tốt cho khách đi xe tự lái gia đình hoặc đoàn du lịch nhiều xe.',
      },
      {
        name: 'Kết Nối Nhanh Chóng Đến Sân Bay, Ga Tàu & Bến Du Thuyền',
        durationOrUnit: 'Thời gian di chuyển chỉ 10 – 20 phút',
        price: 'Hỗ trợ đặt xe đưa đón tận nơi',
        detail: 'Lễ tân hỗ trợ canh giờ xuất phát chuẩn xác để quý khách không bao giờ trễ chuyến.',
      },
      {
        name: 'Bản Đồ Ẩm Thực & Điểm Check-in Quanh Khách Sạn Bán Kính 1km',
        durationOrUnit: 'Cập nhật mới nhất bởi đội ngũ bản địa',
        price: 'Tặng kèm khi Check-in',
        detail: 'Tổng hợp các quán ăn bản địa lâu đời, giá hợp lý ngay gần khách sạn.',
      },
    ],
  },
  {
    id: 'customer-care',
    shortLabel: 'Chăm Sóc KH 24/7',
    checkerboardTitle: 'Chăm Sóc Khách Hàng Tận Tâm 1-1 Xuyên Suốt Kỳ Nghỉ',
    checkerboardDescription:
      'Không chỉ dừng lại ở việc đặt phòng thành công, đội ngũ Chăm sóc khách hàng của Traveleke và khách sạn đối tác luôn đồng hành 1-1 để lắng nghe, xử lý tức thì mọi yêu cầu phát sinh trong suốt thời gian lưu trú.',
    mainImage:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80',
    ],
    editorialBadge: 'Điểm Mạnh Khách Sạn • Chăm Sóc Khách Hàng 1-1 & Bảo Chứng Uy Tín',
    editorialTitle: 'DỊCH VỤ CHĂM SÓC KHÁCH HÀNG TẬN TÂM & ĐỒNG HÀNH XUYÊN SUỐT 24/7',
    editorialSubtitle:
      'Cam kết phản hồi trong 60 giây, hỗ trợ đổi lịch lưu trú, nâng hạng phòng và chăm sóc từng nhu cầu nhỏ nhất của gia đình bạn.',
    openingHours: 'Tổng đài & Đội ngũ CSKH trực 24/7',
    location: 'Trực tiếp tại Khách Sạn & Hệ thống CSKH Traveleke',
    dressCodeOrPolicy: 'Cam kết bảo vệ quyền lợi khách hàng 100%',
    hotline: '1900 6868 (Chăm sóc khách hàng chuyên biệt)',
    storyParagraphs: [
      'Điểm khác biệt giúp khách sạn trên hệ thống nhận được hàng ngàn đánh giá 5 sao thực tế chính là sự tận tâm trong khâu chăm sóc khách hàng. Từ lúc bạn vừa hoàn tất đặt phòng, chuyên viên CSKH đã chủ động liên hệ xác nhận giờ đến, ghi chú các yêu cầu đặc biệt như phòng tầng cao, phòng không hút thuốc hay nôi em bé.',
      'Trong suốt kỳ nghỉ, nếu quý khách cần thêm gối, mượn bàn là hơi nước, đặt suất ăn sáng tại phòng hay cần hỗ trợ y tế khẩn cấp, bộ phận CSKH tại khách sạn luôn có mặt tại phòng chỉ sau 3–5 phút gọi điện với thái độ ân cần và chu đáo nhất.',
    ],
    highlights: [
      'Chuyên viên CSKH xác nhận đơn đặt phòng và ghi nhận yêu cầu riêng trước chuyến đi',
      'Hỗ trợ xử lý yêu cầu tại phòng (thêm khăn, gối, dọn phòng, mượn thiết bị) trong 5 phút',
      'Chính sách bảo lãnh giữ phòng 100% — cam kết không tăng giá dịp Lễ, Tết',
      'Hỗ trợ trang trí phòng sinh nhật, kỷ niệm ngày cưới và chuẩn bị quà bất ngờ',
    ],
    packagesTitle: 'Các Cam Kết Chăm Sóc Khách Hàng & Đặc Quyền Hỗ Trợ',
    packages: [
      {
        name: 'Đồng Hành Chăm Sóc Khách Hàng 1-1 Trước, Trong & Sau Lưu Trú',
        durationOrUnit: 'Hỗ trợ qua Hotline, Zalo & Quầy CSKH',
        price: 'Miễn phí 100%',
        detail: 'Theo sát hành trình từ lúc xuất hóa đơn VNPay đến khi quý khách trả phòng an toàn.',
      },
      {
        name: 'Cam Kết Đúng Hạng Phòng & Đúng Hình Ảnh Thực Tế Đã Đặt',
        durationOrUnit: 'Bảo chứng bởi Traveleke Quality Control',
        price: 'Bảo lãnh hoàn tiền / Nâng hạng miễn phí',
        detail: 'Nếu phòng thực tế không đúng mô tả, hỗ trợ nâng lên hạng phòng cao hơn ngay lập tức.',
      },
      {
        name: 'Hỗ Trợ Cá Nhân Hóa Phòng Nghỉ Theo Nhu Cầu Gia Đình',
        durationOrUnit: 'Đăng ký trước khi nhận phòng',
        price: 'Miễn phí chuẩn bị',
        detail: 'Bố trí phòng thông nhau (Connecting Room), nôi trẻ em, ghế tắm bé hoặc phòng gần thang máy.',
      },
      {
        name: 'Dịch Vụ Chuẩn Bị Bất Ngờ Kỷ Niệm Sinh Nhật & Trăng Mật',
        durationOrUnit: 'Theo yêu cầu riêng của khách hàng',
        price: 'Ưu đãi đặc quyền đối tác',
        detail: 'Hỗ trợ gấp thiên nga hoa hồng, thiệp viết tay từ Quản lý khách sạn và bánh ngọt.',
      },
    ],
  },
  {
    id: 'royal-bedroom',
    shortLabel: 'Giường Ngủ & Cách Âm',
    checkerboardTitle: 'Chất Lượng Phòng Ngủ 5 Sao & Cách Âm Tuyệt Đối',
    checkerboardDescription:
      'Mỗi căn phòng đều được trang bị hệ thống cửa kính cách âm 3 lớp, đệm lò xo túi độc lập dày 32cm bọc vải cotton Ai Cập 400 sợi cùng menu gối ngủ tự chọn, mang lại giấc ngủ sâu và yên tĩnh tuyệt đối.',
    mainImage:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80',
    ],
    editorialBadge: 'Điểm Nhấn Trong Phòng • Giường Ngủ 5 Sao & Cách Âm Tiêu Chuẩn',
    editorialTitle: 'CHẤT LƯỢNG GIƯỜNG NGỦ ÊM ÁI & KHÔNG GIAN CÁCH ÂM YÊN TĨNH TUYỆT ĐỐI',
    editorialSubtitle:
      'Tận hưởng giấc ngủ sâu trọn vẹn với đệm lò xo túi độc lập nâng đỡ cột sống, ga trải giường 100% cotton tự nhiên và rèm cản sáng 2 lớp.',
    openingHours: 'Vệ sinh & làm mới phòng 2 lần/ngày',
    location: 'Toàn bộ hạng phòng Deluxe, Premier & Suite',
    dressCodeOrPolicy: 'Khử khuẩn tia UV & thay mới ga gối 100% mỗi lượt khách',
    hotline: 'Phím #0 trên điện thoại phòng hoặc 1900 6868',
    storyParagraphs: [
      'Chất lượng giấc ngủ là thước đo quan trọng nhất của một căn phòng khách sạn tốt. Hệ thống phòng nghỉ trên Traveleke sử dụng đệm lò xo túi độc lập cao cấp không gây rung động khi người nằm cạnh trở mình, kết hợp bộ chăn ga cotton mật độ sợi cao thoáng khí và mềm mịn với làn da.',
      'Toàn bộ hệ cửa sổ và cửa ra vào trong phòng đều sử dụng vật liệu cách âm tiêu chuẩn khách sạn quốc tế, đi kèm hệ thống điều hòa trung tâm vận hành êm ái không tiếng ồn và rèm tự động cản sáng 100%, giúp quý khách nghỉ ngơi sâu bất kể ngày đêm.',
    ],
    highlights: [
      'Giường King / Twin cỡ lớn với đệm lò xo túi độc lập nâng đỡ êm ái chuẩn 5 sao',
      'Menu gối ngủ đa dạng: gối lông vũ mềm, gối cao su non chống mỏi cổ và gối thảo mộc',
      'Hệ thống cửa kính 3 lớp cách âm tuyệt đối kết hợp rèm cản sáng Blackout 100%',
      'Điều hòa trung tâm tích hợp màng lọc khí tươi HEPA khử mùi hoàn toàn trong phòng',
    ],
    packagesTitle: 'Tiêu Chuẩn Chất Lượng Phòng Ngủ & Giấc Ngủ Trong Phòng',
    packages: [
      {
        name: 'Hệ Thống Đệm Lò Xo Túi Độc Lập & Chăn Ga Cotton 400TC',
        durationOrUnit: 'Trang bị tiêu chuẩn tại mọi hạng phòng',
        price: 'Tiêu chuẩn 5 sao',
        detail: 'Thay mới và giặt hấp khử khuẩn ở nhiệt độ cao cho từng lượt khách nhận phòng.',
      },
      {
        name: 'Menu Gối Ngủ Tự Chọn Theo Thói Quen Của Khách Lưu Trú',
        durationOrUnit: 'Yêu cầu trực tiếp qua Lễ tân / Housekeeping',
        price: 'Miễn phí phục vụ tận phòng',
        detail: 'Lựa chọn độ cao và độ mềm của gối phù hợp với người lớn tuổi hoặc trẻ nhỏ.',
      },
      {
        name: 'Dọn Phòng Hàng Ngày & Chỉnh Trang Giường Tối (Turndown)',
        durationOrUnit: 'Thực hiện theo khung giờ khách yêu cầu',
        price: 'Miễn phí 100%',
        detail: 'Thay khăn bông mới, bổ sung nước suối, trà – cà phê và xông tinh dầu dịu nhẹ.',
      },
      {
        name: 'Không Gian Cách Âm Đa Lớp & Chiếu Sáng Ấm Áp Dịu Mắt',
        durationOrUnit: 'Kiểm định độ ồn dưới 28dB',
        price: 'Cam kết chất lượng phòng',
        detail: 'Công tắc điều khiển đèn đầu giường thông minh và ổ cắm sạc nhanh ngay cạnh giường.',
      },
    ],
  },
  {
    id: 'panorama-balcony',
    shortLabel: 'Ban Công & Tầm Nhìn',
    checkerboardTitle: 'Ban Công Riêng Đón Nắng Gió & Tầm Nhìn Khoáng Đạt',
    checkerboardDescription:
      'Điểm nhấn kiến trúc trong mỗi căn phòng là hệ cửa kính tràn viền kịch trần mở ra ban công riêng rộng rãi với bàn trà thư giãn, nơi bạn có thể ngắm trọn vẹn bình minh trên biển hoặc toàn cảnh thành phố lung linh về đêm.',
    mainImage:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80',
    ],
    editorialBadge: 'Điểm Nhấn Trong Phòng • Ban Công Panorama & Đúng Ảnh Thực Tế',
    editorialTitle: 'BAN CÔNG ĐÓN NẮNG GIÓ & CAM KẾT TẦM NHÌN PHÒNG ĐÚNG ẢNH THỰC TẾ 100%',
    editorialSubtitle:
      'Không gian phòng thoáng đãng tràn ngập ánh sáng tự nhiên với ban công riêng tư, ghế lười thư giãn và tầm nhìn không bị che khuất.',
    openingHours: 'Không gian riêng tư 24/24 tại phòng',
    location: 'Các hạng phòng Ocean View, City View & Garden Suite',
    dressCodeOrPolicy: 'Lan can kính cường lực an toàn cao 1.35m',
    hotline: '1900 6868 (Hỗ trợ chọn tầng cao & hướng nhìn)',
    storyParagraphs: [
      'Mỗi căn phòng trên Traveleke đều được chụp ảnh và mô tả trung thực theo đúng hướng nhìn thực tế: từ phòng hướng biển trực diện (Direct Ocean View), phòng hướng hồ bơi – sân vườn xanh mát cho đến phòng tầng cao ngắm toàn cảnh thành phố (Panorama City View).',
      'Ngoài ban công riêng của từng phòng luôn bố trí sẵn bộ bàn trà mây đan hoặc ghế tựa thư giãn cùng cây xanh nhiệt đới. Quý khách có thể vừa nhâm nhi tách cà phê pha máy miễn phí trong phòng, vừa tận hưởng làn gió mát lành ngay tại không gian riêng tư của mình.',
    ],
    highlights: [
      'Cửa kính kịch trần (Floor-to-Ceiling) mở rộng tối đa tầm nhìn và ánh sáng tự nhiên',
      'Ban công riêng tư trang bị sẵn bàn trà, ghế thư giãn và đèn đọc sách buổi tối',
      'Cam kết hướng nhìn của phòng thực tế đúng 100% với hạng phòng khách đã chọn',
      'Hỗ trợ ưu tiên chọn phòng tầng cao, góc nhìn đẹp khi đặt sớm trên Traveleke',
    ],
    packagesTitle: 'Điểm Nhấn Không Gian Ban Công & Tầm Nhìn Từng Hạng Phòng',
    packages: [
      {
        name: 'Ban Công Hướng Biển & Đón Bình Minh (Ocean Panorama Balcony)',
        durationOrUnit: 'Diện tích ban công 6m² – 12m²',
        price: 'Bố trí sẵn bàn trà & 2 ghế nghỉ',
        detail: 'Tầm nhìn trực diện ra mặt biển xanh không bị che chắn, lý tưởng để ngắm bình minh.',
      },
      {
        name: 'Ban Công Tầng Cao Ngắm Toàn Cảnh Thành Phố (Skyline City View)',
        durationOrUnit: 'Từ tầng 12 trở lên',
        price: 'Không gian thoáng đãng & yên tĩnh',
        detail: 'Ngắm trọn ánh đèn thành phố lung linh về đêm qua hệ vách kính cường lực trong suốt.',
      },
      {
        name: 'Khu Bàn Làm Việc & Góc Đọc Sách Cạnh Cửa Sổ Lớn',
        durationOrUnit: 'Tích hợp đèn chống cận & ổ cắm đa năng',
        price: 'Trang bị sẵn trong phòng',
        detail: 'Bàn gỗ rộng rãi kết hợp ghế công thái học êm ái cùng đường truyền Wi-Fi 6 riêng.',
      },
      {
        name: 'Quầy Pha Cà Phê Viên Nén & Trà Thảo Mộc Thưởng Thức Ngoài Ban Công',
        durationOrUnit: 'Bổ sung mới miễn phí mỗi ngày',
        price: 'Miễn phí theo tiêu chuẩn phòng',
        detail: 'Gồm trà sen, cà phê rang xay, nước khoáng đóng chai và ấm đun siêu tốc cao cấp.',
      },
    ],
  },
  {
    id: 'bathroom-amenities',
    shortLabel: 'Phòng Tắm & Tiện Nghi',
    checkerboardTitle: 'Phòng Tắm Đá Cẩm Thạch, Bồn Ngâm & Tiện Nghi Thông Minh',
    checkerboardDescription:
      'Không gian phòng tắm ốp đá tự nhiên sang trọng tách biệt khu khô – ướt, trang bị bồn tắm nằm thư giãn, vòi sen mưa nhiệt đới áp lực cao cùng bộ mỹ phẩm tắm gội thảo mộc hữu cơ và thiết bị giải trí Smart TV 4K trong phòng.',
    mainImage:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
    ],
    editorialBadge: 'Điểm Nhấn Trong Phòng • Phòng Tắm Bồn Ngâm & Tiện Nghi Hiện Đại',
    editorialTitle: 'PHÒNG TẮM BỒN NGÂM ĐÁ CẨM THẠCH, MINIBAR & KHỬ KHUẨN PHÒNG MỖI NGÀY',
    editorialSubtitle:
      'Thư giãn trong bồn tắm nước ấm cùng muối khoáng thơm dịu, áo choàng tắm cotton dày dặn và hệ thống giải trí – an ninh hiện đại.',
    openingHours: 'Nước nóng trung tâm ổn định 24/24',
    location: 'Trang bị đồng bộ bên trong từng phòng nghỉ',
    dressCodeOrPolicy: '100% khăn tắm & cốc uống nước được tiệt trùng nhiệt',
    hotline: 'Phím #0 trên điện thoại phòng (Yêu cầu thêm tiện nghi)',
    storyParagraphs: [
      'Khu vực phòng tắm bên trong các hạng phòng được thiết kế rộng rãi với vách kính ngăn khu tắm đứng và bồn tắm nằm riêng biệt. Hệ thống nước nóng trung tâm cung cấp lưu lượng nước mạnh và ổn định nhiệt độ ngay tức thì, đi kèm gương trang điểm đèn LED cảm ứng chống mờ sương.',
      'Bên cạnh đó, trong phòng được trang bị đầy đủ Smart TV 4K 55–65 inch kết nối sẵn Netflix/YouTube, tủ lạnh Minibar êm ái, két sắt điện tử cá nhân, máy sấy tóc công suất lớn và bàn là hơi nước, đáp ứng trọn vẹn cả kỳ nghỉ gia đình lẫn chuyến công tác dài ngày.',
    ],
    highlights: [
      'Bồn tắm nằm thư giãn & buồng tắm đứng vòi sen mưa nhiệt đới (Rain Shower) riêng biệt',
      'Bộ đồ dùng cá nhân (Amenities) thảo mộc thiên nhiên, áo choàng tắm & khăn bông dày',
      'Smart TV 4K màn hình lớn, Wi-Fi 6 riêng từng phòng, két sắt điện tử và tủ Minibar',
      'Quy trình vệ sinh 12 bước khử khuẩn toàn bộ bề mặt tiếp xúc trước khi khách nhận phòng',
    ],
    packagesTitle: 'Danh Mục Trang Thiết Bị & Tiện Nghi Nổi Bật Trong Phòng',
    packages: [
      {
        name: 'Phòng Tắm Bồn Ngâm & Hệ Thống Vòi Sen Mưa Nhiệt Đới',
        durationOrUnit: 'Nước nóng áp lực cao 24/24',
        price: 'Trang bị tiêu chuẩn',
        detail: 'Đi kèm bộ dầu gội – sữa tắm chiết xuất sả chanh/trà xanh, máy sấy tóc ion và gương LED.',
      },
      {
        name: 'Hệ Thống Giải Trí Smart TV 4K 65 Inch & Âm Thanh Sống Động',
        durationOrUnit: 'Kết nối YouTube, Netflix & Truyền hình HD',
        price: 'Miễn phí sử dụng trong phòng',
        detail: 'Xoay góc linh hoạt về phía giường ngủ hoặc sofa tiếp khách, tốc độ mạng mượt mà.',
      },
      {
        name: 'Quầy Minibar, Ấm Đun Siêu Tốc & Nước Khoáng Miễn Phí Mỗi Ngày',
        durationOrUnit: 'Làm mới hàng ngày bởi Housekeeping',
        price: 'Miễn phí trà, cà phê & nước suối',
        detail: 'Tủ làm mát không gây tiếng ồn, luôn có sẵn đồ uống giải khát và bộ ly thủy tinh tiệt trùng.',
      },
      {
        name: 'Két Sắt Điện Tử, Khóa Thẻ Từ 2 Lớp & Bàn Là Hơi Nước',
        durationOrUnit: 'Trang bị sẵn trong tủ quần áo phòng nghỉ',
        price: 'Miễn phí 100%',
        detail: 'Đảm bảo an toàn tài sản cá nhân và giữ trang phục luôn phẳng phiu suốt chuyến đi.',
      },
    ],
  },
];
export interface GoldenServicesShowcaseProps {
  activeServiceId: string;
  onSelectService: (serviceId: string) => void;
  onOpenModalForService?: (service: LuxuryServicePresentation) => void;
}

export function GoldenServicesShowcase({
  activeServiceId,
  onSelectService,
  onOpenModalForService,
}: GoldenServicesShowcaseProps) {
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState<number>(-1);
  const presentationRef = React.useRef<HTMLDivElement | null>(null);

  const activeService =
    LUXURY_SERVICE_PRESENTATIONS.find((s) => s.id === activeServiceId) ||
    LUXURY_SERVICE_PRESENTATIONS[0];

  const handleInspectService = (service: LuxuryServicePresentation) => {
    onSelectService(service.id);
    setSelectedGalleryIdx(-1);
    presentationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (onOpenModalForService) {
      onOpenModalForService(service);
    }
  };

  const allPhotos = [activeService.mainImage, ...activeService.gallery];
  const currentHeroPhoto =
    selectedGalleryIdx >= 0 && selectedGalleryIdx < allPhotos.length
      ? allPhotos[selectedGalleryIdx]
      : activeService.mainImage;

  return (
    <div className="w-full">
      {/* 1. CHECKERBOARD "DỊCH VỤ" SHOWCASE */}
      <section className="bg-[#F8F8F8] py-16 sm:py-24 border-t border-[#EBE5D5]">
        <div className="max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#1E4752] mb-2">
              HỆ SINH THÁI LƯU TRÚ TRAVELEKE
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-normal uppercase tracking-[0.06em] text-[#1A1A1A]">
              ĐIỂM MẠNH KHÁCH SẠN & CHẤT LƯỢNG PHÒNG
            </h2>
          </div>

          <div className="bg-[#F8F8F8]">
            {LUXURY_SERVICE_PRESENTATIONS.map((service, index) => {
              const isTextLeft = index % 2 === 0;
              return (
                <div
                  key={service.id}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch"
                >
                  <div
                    className={`flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 sm:py-16 bg-[#F8F8F8] ${
                      isTextLeft ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <h3 className="text-2xl sm:text-[28px] font-bold text-[#1C1C1C] tracking-tight">
                      {service.checkerboardTitle}
                    </h3>

                    <p className="mt-4 text-sm sm:text-[15.5px] text-[#3B3B3B] leading-[1.78] font-normal">
                      {service.checkerboardDescription}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {service.packages.slice(0, 2).map((pkg) => (
                        <span
                          key={pkg.name}
                          className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-xs font-medium text-[#1E4752] border border-[#1E4752]/12 shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-[#E8A700]" />
                          <span>{pkg.name}</span>
                        </span>
                      ))}
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleInspectService(service)}
                        className="lux-press inline-flex items-center justify-center bg-[#0A0A0A] hover:bg-[#1E4752] text-white px-7 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer shadow-xs"
                      >
                        Xem thêm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectService(service.id);
                          setSelectedGalleryIdx(-1);
                          presentationRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold text-[#1E4752] hover:text-[#E8A700] transition-colors cursor-pointer"
                      >
                        <span>Nội dung trình bày riêng</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`group relative h-[360px] sm:h-[460px] lg:h-[540px] w-full overflow-hidden bg-[#1E4752]/10 ${
                      isTextLeft ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <img
                      src={service.mainImage}
                      alt={service.checkerboardTitle}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <div className="text-white">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#E8A700]">
                          {service.editorialBadge}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {service.openingHours} • {service.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* 2. DEDICATED SERVICE PRESENTATION SECTION ("NỘI DUNG TRÌNH BÀY RIÊNG VỀ TỪNG LOẠI DỊCH VỤ") */}
      <section
        ref={presentationRef}
        className="bg-white py-16 sm:py-24 border-t border-[#EBE5D5] scroll-mt-20"
      >
        <div className="max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#1E4752]/12">
            <div>
              <p className="text-sm sm:text-base font-semibold text-[#1E4752] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8A700]" />
                <span>Hồ Sơ Chi Tiết Điểm Mạnh Khách Sạn & Chất Lượng Phòng Nghỉ</span>
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl lg:text-[34px] font-bold uppercase text-[#111827] tracking-tight">
                KHÁM PHÁ CHUYÊN SÂU ĐIỂM CỘNG PHỤC VỤ & TIỆN NGHI PHÒNG TRÊN TRAVELEKE
              </h2>
            </div>

            {/* Interactive Service Tabs */}
            <div className="flex flex-wrap gap-2">
              {LUXURY_SERVICE_PRESENTATIONS.map((srv) => {
                const isSelected = srv.id === activeService.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      onSelectService(srv.id);
                      setSelectedGalleryIdx(-1);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E4752] text-white shadow-[0_8px_20px_rgba(30,71,82,0.22)]'
                        : 'bg-[#EBE5D5]/55 text-[#1E4752] hover:bg-[#EBE5D5]'
                    }`}
                  >
                    {srv.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dedicated Editorial Presentation Card */}
          <div className="mt-10 rounded-3xl border border-[#1E4752]/12 bg-[#FAF8F3] p-6 sm:p-10 shadow-[0_18px_50px_rgba(30,71,82,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1E4752]/10">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1E4752] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E8A700]">
                  {activeService.editorialBadge}
                </span>
                <h3 className="mt-3 text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111827]">
                  {activeService.editorialTitle}
                </h3>
                <p className="mt-1.5 text-sm sm:text-base text-gray-600 max-w-3xl">
                  {activeService.editorialSubtitle}
                </p>
              </div>
              <Link
                href="/hotels_home"
                className="lux-press inline-flex items-center gap-2 rounded-lg bg-[#1E4752] hover:bg-[#16363f] text-white px-6 py-3 text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                <span>Đặt dịch vụ & Phòng ngay</span>
                <ArrowRight className="w-4 h-4 text-[#E8A700]" />
              </Link>
            </div>

            {/* 4 Metadata Info Boxes */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-white p-4 border border-[#1E4752]/10 flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#E8A700] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Khung Giờ Phục Vụ
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#1E4752]">
                    {activeService.openingHours}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-[#1E4752]/10 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E8A700] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Vị Trí Tại Khu Nghỉ Dưỡng
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#1E4752]">
                    {activeService.location}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-[#1E4752]/10 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#E8A700] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Tiêu Chuẩn & Quy Định
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#1E4752]">
                    {activeService.dressCodeOrPolicy}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-[#1E4752]/10 flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-[#E8A700] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Tổng Đài Đặt Dịch Vụ
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#1E4752]">
                    {activeService.hotline}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-6 space-y-6">
                <div className="overflow-hidden rounded-2xl border-4 border-white shadow-lg h-[340px] sm:h-[430px] lg:h-[470px] bg-[#1E4752]/10">
                  <img
                    src={currentHeroPhoto}
                    alt={activeService.editorialTitle}
                    className="h-full w-full object-cover transition-all duration-500"
                  />
                </div>

                <div className="grid grid-cols-4 gap-3.5 sm:gap-4">
                  {allPhotos.map((imgUrl, idx) => {
                    const isCurrent =
                      (selectedGalleryIdx === -1 && idx === 0) || selectedGalleryIdx === idx;
                    return (
                      <button
                        key={imgUrl}
                        type="button"
                        onClick={() => setSelectedGalleryIdx(idx)}
                        className={`relative h-20 sm:h-28 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-[#1E4752] ring-2 ring-[#E8A700]'
                            : 'border-white opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${activeService.shortLabel} ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3.5 text-sm sm:text-[15px] text-gray-600 leading-relaxed">
                  <p>{activeService.storyParagraphs[0]}</p>
                  <p>{activeService.storyParagraphs[1]}</p>
                </div>

                <div className="rounded-2xl bg-white p-5 border border-[#1E4752]/10 space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1E4752]">
                    Điểm Nhấn Đặc Quyền Của {activeService.shortLabel}
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {activeService.highlights.map((hl) => (
                      <div key={hl} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-[#111827]">
                        <Check className="w-4 h-4 text-[#1E4752] shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div className="rounded-2xl bg-white p-6 sm:p-7 border border-[#1E4752]/12 shadow-xs space-y-5">
                  <div className="border-b border-[#1E4752]/10 pb-4">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8A700]">
                      Bảng Giá & Gói Dịch Vụ Niêm Yết
                    </span>
                    <h4 className="mt-1 text-lg sm:text-xl font-bold text-[#111827]">
                      {activeService.packagesTitle}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {activeService.packages.map((pkg) => (
                      <div
                        key={pkg.name}
                        className="rounded-xl border border-[#1E4752]/10 bg-[#FAF8F3]/65 p-4 hover:border-[#1E4752]/30 hover:bg-white transition-all"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h5 className="text-sm sm:text-[15px] font-bold text-[#111827]">{pkg.name}</h5>
                            <span className="text-xs font-medium text-gray-500">{pkg.durationOrUnit}</span>
                          </div>
                          <span className="rounded-lg bg-[#1E4752] px-3 py-1 text-xs font-bold text-[#E8A700] shrink-0">
                            {pkg.price}
                          </span>
                        </div>
                        <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">{pkg.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#1E4752] p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#E8A700]">
                      Đặc Quyền Dành Cho Khách Đặt Phòng Trực Tuyến Trên Traveleke
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/90">
                      Cam kết 100% chất lượng {activeService.shortLabel} đúng mô tả và hỗ trợ ưu tiên khi đặt phòng qua Traveleke.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInspectService(activeService)}
                    className="lux-press shrink-0 rounded-lg bg-[#E8A700] hover:bg-[#d49800] text-[#111827] px-5 py-2.5 text-xs sm:text-sm font-extrabold transition cursor-pointer"
                  >
                    Xem Chi Tiết Cam Kết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



