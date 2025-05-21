import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 날짜 포맷: YYYY-MM-DD
  const today = new Date();
  const checkin = new Date(today);
  checkin.setDate(today.getDate() + 1);
  const checkout = new Date(today);
  checkout.setDate(today.getDate() + 2);
  const formatDate = (date) => date.toISOString().split('T')[0];

  // 기본 파라미터
  const params = {
    locationId: '3124',          // 서울 LocationId
    checkinDate: formatDate(checkin),
    checkoutDate: formatDate(checkout),
    adults: '1',
    currency: 'KRW',
    locale: 'ko_KR',
    language: 'ko_KR',
    regionId: '300000041',
    //   sortOrder: 'RECOMMENDED',   // 정렬방식
  };

  useEffect(() => {
    const fetchAllHotels = async () => {
      setLoading(true);
      setErrorMsg('');
      setHotels([]);

      let allHotels = [];
      let currentPage = 1;
      const maxPages = 5;     // 최대 5페이지(더 많이 원하면 숫자 증가, API 요금/속도 주의)
      const sizePerPage = 50; // 한 페이지당 최대 호텔 수 (API 문서 최대값 확인 필요)

      try {
        while (currentPage <= maxPages) {
          const response = await axios.get(
            'https://hotels-com6.p.rapidapi.com/hotels/search',
            {
              params: {
                ...params,
                pageNumber: currentPage,
                pageSize: sizePerPage,
              },
              headers: {
                'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
                'x-rapidapi-host': 'hotels-com6.p.rapidapi.com',
              },
            }
          );

          // 실제 구조에 따라 데이터 추출
          const hotelList = response.data?.data?.propertySearchListings || [];
          allHotels = allHotels.concat(hotelList);

          // 페이지에 호텔이 없으면 반복 종료
          if (hotelList.length < sizePerPage) {
            break;
          }

          currentPage++;
        }

        setHotels(allHotels);
        // 전체 응답(마지막) 콘솔 출력
        console.log('전체 호텔 수:', allHotels.length);
        console.log('마지막 API 응답:', allHotels);

      } catch (err) {
        setErrorMsg(
          'API 호출 오류: ' +
          (err.response?.data?.message ||
            err.message ||
            '알 수 없는 오류')
        );
      }
      setLoading(false);
    };

    fetchAllHotels();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: 20 }}>
      <h2>서울 호텔 목록 (총 {hotels.length}개)</h2>
      {loading && <div>로딩 중...</div>}
      {errorMsg && <div style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</div>}
      {!loading && hotels.length === 0 && <div>호텔 결과가 없습니다.</div>}
      <div style={{ display: 'grid', gap: 24 }}>
        {hotels.map((hotel) => {
          // 가격 추출
          const price = hotel.priceSection?.priceSummary?.options?.[0]?.displayPrice?.formatted || '-';
          const originPrice = hotel.priceSection?.priceSummary?.options?.[0]?.strikeOut?.formatted;
          // 이미지 (첫번째 이미지)
          const imageUrl = hotel.mediaSection?.gallery?.media?.[0]?.media?.url;
          // 평점
          const rating = hotel.summarySections?.[0]?.guestRatingSectionV2?.badge?.text;
          // 후기
          const reviewText = hotel.summarySections?.[0]?.guestRatingSectionV2?.phrases?.[1]?.phraseParts?.[0]?.text;

          return (
            <div key={hotel.id} style={{
              display: 'flex',
              gap: 16,
              border: '1px solid #eee',
              borderRadius: 12,
              padding: 18,
              alignItems: 'flex-start',
              background: '#fafbfc'
            }}>
              <img
                src={imageUrl}
                alt={hotel.headingSection?.heading}
                style={{ width: 140, height: 105, objectFit: 'cover', borderRadius: 8, background: '#ddd' }}
              />
              <div style={{ flex: 1 }}>
                <a
                  href={hotel.cardLink?.resource?.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: '#20247A', fontSize: 20, fontWeight: 600 }}
                >
                  {hotel.headingSection?.heading}
                </a>
                <div style={{ margin: '4px 0 0 0', color: '#222', fontSize: 16, fontWeight: 400 }}>
                  {hotel.headingSection?.messages?.[0]?.text}
                </div>
                <div style={{ marginTop: 6, fontSize: 15 }}>
                  {rating && <span>⭐ {rating}</span>}
                  {reviewText && <span style={{ marginLeft: 8, color: '#999' }}>{reviewText}</span>}
                </div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>
                  {price}
                  {originPrice && <span style={{ textDecoration: 'line-through', marginLeft: 8, color: '#aaa', fontWeight: 400 }}>{originPrice}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotelList;
