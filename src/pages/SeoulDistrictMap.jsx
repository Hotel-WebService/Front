import React, { useEffect } from "react";
import geojson from "../seoul_districts.json";

const { kakao } = window;

// onDistrictHover 콜백 prop 추가!
export default function SeoulDistrictMap({ onDistrictClick, onDistrictHover }) {
  useEffect(() => {
    const container = document.getElementById("map");
    if (!container) return;

    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 9,
    };
    const map = new kakao.maps.Map(container, options);

    const polygons = [];
    const districtPolygons = {};

    geojson.features.forEach((f) => {
      const name = f.properties.SIG_KOR_NM;
      const coords = f.geometry.coordinates;

      coords.forEach((polyCoords) => {
        const path = polyCoords.map(
          (pt) => new kakao.maps.LatLng(pt[1], pt[0])
        );
        const polygon = new kakao.maps.Polygon({
          map,
          path,
          strokeWeight: 2,
          strokeColor: "#004c80",
          fillColor: "#fff",
          fillOpacity: 0.6,
          clickable: true,
        });

        if (!districtPolygons[name]) districtPolygons[name] = [];
        districtPolygons[name].push(polygon);

        // 클릭 시 구 이름 콜백
        kakao.maps.event.addListener(polygon, "click", () => {
          onDistrictClick(name);
        });

        // hover: 색상 + 콜백
        kakao.maps.event.addListener(polygon, "mouseover", () => {
          districtPolygons[name].forEach((poly) =>
            poly.setOptions({ fillColor: "#90cdf4" })
          );
          // 👇 구에 마우스 올라오면 콜백 호출
          if (onDistrictHover) onDistrictHover(name);
        });
        kakao.maps.event.addListener(polygon, "mouseout", () => {
          districtPolygons[name].forEach((poly) =>
            poly.setOptions({ fillColor: "#fff" })
          );
          // 👇 구에서 마우스 빠지면 콜백 호출 (빈 문자열)
          if (onDistrictHover) onDistrictHover("");
        });

        polygons.push(polygon);
      });
    });

    return () => {
      polygons.forEach((poly) => poly.setMap(null));
    };
  }, [onDistrictClick, onDistrictHover]);

  return <div id="map" style={{ width: "100%", height: "100%" }} />;
}
