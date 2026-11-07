import React from 'react';

export function ShuttleIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="10" y="26" width="42" height="20" rx="5" fill="#1E4752" fillOpacity="0.12" />
      <circle cx="40" cy="15" r="7" fill="#E8A700" fillOpacity="0.25" />
      <path
        d="M40 7C36.134 7 33 10.134 33 14C33 18.8 40 25 40 25C40 25 47 18.8 47 14C47 10.134 43.866 7 40 7Z"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="14" r="2.5" stroke="#1E4752" strokeWidth="2" />
      <path
        d="M31 24H15C11.6863 24 9 26.6863 9 30V45C9 46.6569 10.3431 48 12 48H15"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 24H49C52.3137 24 55 26.6863 55 30V45C55 46.6569 53.6569 48 52 48H49"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="23" y1="48" x2="41" y2="48" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 36H55" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="24" x2="19" y2="36" stroke="#1E4752" strokeWidth="2" />
      <line x1="29" y1="24" x2="29" y2="36" stroke="#1E4752" strokeWidth="2" />
      <line x1="45" y1="24" x2="45" y2="36" stroke="#1E4752" strokeWidth="2" />
      <circle cx="19" cy="48" r="4.5" fill="white" stroke="#1E4752" strokeWidth="2" />
      <circle cx="45" cy="48" r="4.5" fill="white" stroke="#1E4752" strokeWidth="2" />
      <line x1="13" y1="41" x2="17" y2="41" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <line x1="47" y1="41" x2="51" y2="41" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SpaIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="14" y="38" width="36" height="12" rx="6" fill="#1E4752" fillOpacity="0.14" />
      <circle cx="32" cy="19" r="6" fill="#E8A700" fillOpacity="0.22" />
      <circle cx="32" cy="12" r="3" stroke="#1E4752" strokeWidth="2" />
      <circle cx="32" cy="21" r="6.5" stroke="#1E4752" strokeWidth="2" />
      <path d="M29.5 21.5C30.3 22.3 31.2 22.3 32 21.5" stroke="#1E4752" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M33 21.5C33.8 22.3 34.7 22.3 35.5 21.5" stroke="#1E4752" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M19 36C19 30.5 24.5 27.5 32 27.5C39.5 27.5 45 30.5 45 36"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="13" y="36" width="38" height="7" rx="3.5" stroke="#1E4752" strokeWidth="2" />
      <rect x="13" y="43" width="38" height="7" rx="3.5" stroke="#1E4752" strokeWidth="2" />
      <circle cx="20" cy="50" r="3.5" fill="white" stroke="#1E4752" strokeWidth="1.8" />
    </svg>
  );
}

export function WifiRouterIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="14" y="38" width="36" height="12" rx="4" fill="#1E4752" fillOpacity="0.14" />
      <circle cx="29" cy="22" r="7" fill="#E8A700" fillOpacity="0.2" />
      <path d="M20 20C25 15 33 15 38 20" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M23.5 24C26.7 21 31.3 21 34.5 24" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <circle cx="29" cy="27.5" r="1.8" fill="#1E4752" />
      <line x1="45" y1="15" x2="45" y2="37" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <circle cx="45" cy="14" r="1.5" fill="#1E4752" />
      <rect x="13" y="37" width="38" height="13" rx="4" stroke="#1E4752" strokeWidth="2" />
      <circle cx="20" cy="43.5" r="1.6" fill="#1E4752" />
      <circle cx="26" cy="43.5" r="1.6" fill="#1E4752" />
      <circle cx="32" cy="43.5" r="1.6" fill="#1E4752" />
      <line x1="39" y1="43.5" x2="45" y2="43.5" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="50" x2="18" y2="53" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="50" x2="46" y2="53" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function GymTreadmillIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M13 47H51L47 53H15L13 47Z" fill="#1E4752" fillOpacity="0.16" />
      <circle cx="31" cy="14" r="5" fill="#E8A700" fillOpacity="0.25" />
      <circle cx="31" cy="14" r="4" stroke="#1E4752" strokeWidth="2" />
      <path
        d="M23 23L29 21L34 28L28 36L22 39"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 32L37 37L35 45"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33 25L39 27L43 23"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M48 18L52 22L44 46"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="12" y="46" width="40" height="7" rx="3.5" stroke="#1E4752" strokeWidth="2" />
      <circle cx="17" cy="49.5" r="1.5" fill="#1E4752" />
      <circle cx="47" cy="49.5" r="1.5" fill="#1E4752" />
    </svg>
  );
}


export function RestaurantClocheIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M16 34C16 25.1634 23.1634 18 32 18C40.8366 18 48 25.1634 48 34H16Z" fill="#1E4752" fillOpacity="0.14" />
      <circle cx="32" cy="14" r="4" fill="#E8A700" fillOpacity="0.28" />
      <path
        d="M15 34C15 24.6112 22.6112 17 32 17C41.3888 17 49 24.6112 49 34"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="14" r="3" stroke="#1E4752" strokeWidth="2" />
      <rect x="12" y="34" width="40" height="4" rx="2" stroke="#1E4752" strokeWidth="2" />
      <path
        d="M12 43H18V51H12V43Z"
        fill="#1E4752"
        fillOpacity="0.18"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M18 44H32C34.5 44 36 45.5 36 47C36 48.5 34.5 49.5 32 49.5H25"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 50H42C45 50 48 47.5 49 44.5C49.5 43 48 41.5 46 42.5L39 46"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PoolLadderIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M12 40H52V50C52 51.1046 51.1046 52 50 52H14C12.8954 52 12 51.1046 12 50V40Z" fill="#1E4752" fillOpacity="0.14" />
      <circle cx="44" cy="20" r="6" fill="#E8A700" fillOpacity="0.22" />
      <path
        d="M23 41V18C23 14.6863 25.6863 12 29 12C31.5 12 33.5 13.5 34 16"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M38 41V18C38 14.6863 40.6863 12 44 12C46.5 12 48.5 13.5 49 16"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="23" y1="23" x2="38" y2="23" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <line x1="23" y1="30" x2="38" y2="30" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <line x1="23" y1="37" x2="38" y2="37" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 43C15.5 43 16.5 40.5 20 40.5C23.5 40.5 24.5 43 28 43C31.5 43 32.5 40.5 36 40.5C39.5 40.5 40.5 43 44 43C47.5 43 48.5 40.5 52 40.5"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 49C18 49 19 46.5 22 46.5C25 46.5 26 49 29 49C32 49 33 46.5 36 46.5C39 46.5 40 49 43 49C46 49 47 46.5 50 46.5"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HousekeepingSparkleIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M27 36H49L46 50H30L27 36Z" fill="#1E4752" fillOpacity="0.15" />
      <circle cx="21" cy="45" r="7" fill="#E8A700" fillOpacity="0.22" />
      <path
        d="M18 11L19.5 15.5L24 17L19.5 18.5L18 23L16.5 18.5L12 17L16.5 15.5L18 11Z"
        stroke="#1E4752"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M30 10V14M28 12H32" stroke="#1E4752" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 28V32M10 30H14" stroke="#1E4752" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="47" y1="11" x2="21" y2="43" stroke="#1E4752" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M13 48C13 43.5817 16.5817 40 21 40C25.4183 40 29 43.5817 29 48H13Z"
        fill="white"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M32 32C32 29.5 34 28 36 28.5C37 26.5 40 26.5 41.5 28.5C44 28 46 30 45.5 32.5"
        stroke="#1E4752"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="28" y="33" width="21" height="4" rx="1.5" stroke="#1E4752" strokeWidth="2" />
      <path
        d="M30 37L32 50H45L47 37"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="11" y1="52" x2="51" y2="52" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SwimmerWavesIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M12 37H52V47H12V37Z" fill="#1E4752" fillOpacity="0.14" />
      <circle cx="42" cy="27" r="5.5" fill="#E8A700" fillOpacity="0.25" />
      <line x1="14" y1="19" x2="21" y2="19" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="24" x2="19" y2="24" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="29" x2="20" y2="29" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M23 36L32 27L41 18L47 22L40 26"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="43" cy="28" r="4" stroke="#1E4752" strokeWidth="2" />
      <path
        d="M12 38C15.5 38 16.5 35 20 35C23.5 35 24.5 38 28 38C31.5 38 32.5 35 36 35C39.5 35 40.5 38 44 38C47.5 38 48.5 35 52 35"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 45C15.5 45 16.5 42 20 42C23.5 42 24.5 45 28 45C31.5 45 32.5 42 36 42C39.5 42 40.5 45 44 45C47.5 45 48.5 42 52 42"
        stroke="#1E4752"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 10. Lễ tân 24/7 & Đón tiếp nồng hậu */
export function IconReceptionistBell({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M22 36C22 28.5 26.5 24 32 24C37.5 24 42 28.5 42 36H22Z" fill="#E8A700" fillOpacity="0.22" />
      <circle cx="32" cy="15" r="4.5" fill="#E8A700" fillOpacity="0.28" />
      <path d="M16 18L17.5 14L19 18L23 19.5L19 21L17.5 25L16 21L12 19.5L16 18Z" stroke="#1E4752" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="48" cy="18" r="1.5" fill="#1E4752" />
      <path d="M29 20H35" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 20V24" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 38C18 28.6112 24.268 22 32 22C39.732 22 46 28.6112 46 38H18Z" stroke="#1E4752" strokeWidth="2" strokeLinejoin="round" />
      <rect x="14" y="38" width="36" height="5" rx="2.5" stroke="#1E4752" strokeWidth="2" />
      <path d="M10 47H54" stroke="#1E4752" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** 11. Vị trí đắc địa trung tâm & hướng biển */
export function IconPrimeLocation({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="25" r="7" fill="#E8A700" fillOpacity="0.3" />
      <path d="M32 12C23.7157 12 17 18.7157 17 27C17 37.5 32 50 32 50C32 50 47 37.5 47 27C47 18.7157 40.2843 12 32 12Z" stroke="#1E4752" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="26" r="5.5" stroke="#1E4752" strokeWidth="2" />
      <path d="M14 52C18 49 23 48 32 48C41 48 46 49 50 52" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** 12. Dịch vụ Chăm sóc khách hàng tận tâm 24/7 */
export function IconCustomerCare({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M32 23C29.5 19.5 24 19.5 21.5 23C19 26.5 20 31.5 32 39C44 31.5 45 26.5 42.5 23C40 19.5 34.5 19.5 32 23Z" fill="#E8A700" fillOpacity="0.26" stroke="#1E4752" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M16 32V28C16 19.1634 23.1634 12 32 12C40.8366 12 48 19.1634 48 28V32" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <rect x="12" y="29" width="6" height="11" rx="3" stroke="#1E4752" strokeWidth="2" />
      <rect x="46" y="29" width="6" height="11" rx="3" stroke="#1E4752" strokeWidth="2" />
      <path d="M48 40V43C48 46.866 44.866 50 41 50H34" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <rect x="28" y="47" width="7" height="5" rx="2.5" stroke="#1E4752" strokeWidth="1.8" />
    </svg>
  );
}

/** 13. Hỗ trợ Check-in / Check-out nhanh linh hoạt */
export function IconExpressCheckIn({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="18" width="28" height="34" rx="4" stroke="#1E4752" strokeWidth="2" />
      <rect x="19" y="24" width="8" height="7" rx="1.5" fill="#E8A700" fillOpacity="0.35" stroke="#1E4752" strokeWidth="1.7" />
      <path d="M19 37H35" stroke="#1E4752" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 42H29" stroke="#1E4752" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="44" cy="40" r="10" fill="#FFFFFF" stroke="#1E4752" strokeWidth="2" />
      <circle cx="44" cy="40" r="7" fill="#E8A700" fillOpacity="0.22" />
      <path d="M44 36V40.5L47 42.5" stroke="#1E4752" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 14. An ninh đa lớp & Riêng tư tuyệt đối */
export function IconHotelSecurity({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M32 12L48 18V31C48 41.5 40.8 48.8 32 52C23.2 48.8 16 41.5 16 31V18L32 12Z" fill="#E8A700" fillOpacity="0.18" stroke="#1E4752" strokeWidth="2" strokeLinejoin="round" />
      <path d="M25 31.5L30 36.5L39.5 26.5" stroke="#1E4752" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 15. Điểm cộng đặc quyền 5 sao */
export function IconHotelPlusPerks({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M14 42L18 22L27 31L32 18L37 31L46 22L50 42H14Z" fill="#E8A700" fillOpacity="0.25" stroke="#1E4752" strokeWidth="2" strokeLinejoin="round" />
      <rect x="14" y="45" width="36" height="5" rx="2" stroke="#1E4752" strokeWidth="2" />
      <circle cx="18" cy="18" r="2" fill="#1E4752" />
      <circle cx="32" cy="14" r="2.2" fill="#1E4752" />
      <circle cx="46" cy="18" r="2" fill="#1E4752" />
    </svg>
  );
}
/** 16. Giường ngủ Hoàng gia & Chăn lụa */
export function IconRoyalBed({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="18" width="36" height="16" rx="3" stroke="#1E4752" strokeWidth="2" />
      <rect x="18" y="24" width="11" height="7" rx="2" fill="#E8A700" fillOpacity="0.3" stroke="#1E4752" strokeWidth="1.8" />
      <rect x="35" y="24" width="11" height="7" rx="2" fill="#E8A700" fillOpacity="0.3" stroke="#1E4752" strokeWidth="1.8" />
      <rect x="10" y="33" width="44" height="12" rx="3" stroke="#1E4752" strokeWidth="2" />
      <path d="M10 38H54" stroke="#1E4752" strokeWidth="1.6" />
      <path d="M14 45V50" stroke="#1E4752" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M50 45V50" stroke="#1E4752" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M32 10L33.2 13.3L36.5 14.5L33.2 15.7L32 19L30.8 15.7L27.5 14.5L30.8 13.3L32 10Z" stroke="#1E4752" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** 17. Ban công Tầm nhìn Panorama hướng biển */
export function IconPanoramaBalcony({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="42" cy="22" r="6" fill="#E8A700" fillOpacity="0.35" stroke="#1E4752" strokeWidth="1.8" />
      <rect x="12" y="12" width="40" height="38" rx="3" stroke="#1E4752" strokeWidth="2" />
      <path d="M24 12V50" stroke="#1E4752" strokeWidth="1.8" />
      <path d="M12 36H52" stroke="#1E4752" strokeWidth="2" />
      <path d="M18 36V50M30 36V50M38 36V50M46 36V50" stroke="#1E4752" strokeWidth="1.6" />
      <path d="M26 29C29 27 32 27 35 29C38 31 41 31 44 29" stroke="#1E4752" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** 18. Phòng tắm Đá cẩm thạch & Bồn Jacuzzi */
export function IconMarbleJacuzzi({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="25" r="3.5" fill="#E8A700" fillOpacity="0.32" stroke="#1E4752" strokeWidth="1.6" />
      <circle cx="32" cy="23" r="4.5" fill="#E8A700" fillOpacity="0.32" stroke="#1E4752" strokeWidth="1.6" />
      <circle cx="40" cy="26" r="3" fill="#E8A700" fillOpacity="0.32" stroke="#1E4752" strokeWidth="1.6" />
      <path d="M14 31V18C14 14.6863 16.6863 12 20 12C22.8 12 25 13.8 25.5 16.5" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 31H54V37C54 43.6274 48.6274 49 42 49H22C15.3726 49 10 43.6274 10 37V31Z" stroke="#1E4752" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 49L15 53" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 49L49 53" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
/** 19. Công nghệ Smart Room & Điều khiển 1 chạm */
export function IconSmartRoomControl({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="16" width="40" height="32" rx="4" stroke="#1E4752" strokeWidth="2" />
      <circle cx="25" cy="28" r="5" fill="#E8A700" fillOpacity="0.32" stroke="#1E4752" strokeWidth="1.8" />
      <path d="M36 25H45" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 31H43" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 40H45" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="40" r="3" fill="#E8A700" stroke="#1E4752" strokeWidth="1.8" />
    </svg>
  );
}

/** 20. Quầy Minibar Rượu Vang & Trà Thượng Hạng (Matching Image 2's 3 Champagne Flutes Icon) */
export function IconMinibarChampagne({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M23 13V17M21 15H25" stroke="#1E4752" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M39 11V15M37 13H41" stroke="#1E4752" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="31" cy="14" r="1.3" fill="#1E4752" />
      <path d="M15 21H23L22 31C21.8 33.2 20.5 35 19 35C17.5 35 16.2 33.2 16 31L15 21Z" stroke="#1E4752" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M15.6 26H22.4L22 31C21.8 33 20.5 34.5 19 34.5C17.5 34.5 16.2 33 16 31L15.6 26Z" fill="#E8A700" fillOpacity="0.28" />
      <path d="M19 35V49" stroke="#1E4752" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M28 21H36L35 31C34.8 33.2 33.5 35 32 35C30.5 35 29.2 33.2 29 31L28 21Z" stroke="#1E4752" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M28.6 26H35.4L35 31C34.8 33 33.5 34.5 32 34.5C30.5 34.5 29.2 33 29 31L28.6 26Z" fill="#E8A700" fillOpacity="0.28" />
      <path d="M32 35V49" stroke="#1E4752" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M41 21H49L48 31C47.8 33.2 46.5 35 45 35C43.5 35 42.2 33.2 42 31L41 21Z" stroke="#1E4752" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M41.6 26H48.4L48 31C47.8 33 46.5 34.5 45 34.5C43.5 34.5 42.2 33 42 31L41.6 26Z" fill="#E8A700" fillOpacity="0.28" />
      <path d="M45 35V49" stroke="#1E4752" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M12 49H52" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** 21. Cách âm 3 lớp & Không khí tươi chuẩn y khoa */
export function IconSoundproofLuxury({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="32" r="10" fill="#E8A700" fillOpacity="0.25" stroke="#1E4752" strokeWidth="2" />
      <path d="M21 29L24 26L27 29M24 26V38" stroke="#1E4752" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 22C42 25 42 39 38 42" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 17C50 22 50 42 44 47" stroke="#1E4752" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 50H50" stroke="#1E4752" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

