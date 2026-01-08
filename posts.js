// 1. 최신 시트 주소 (반드시 ?output=csv 형식이여야 함)
const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// CSV를 정교하게 나누는 함수 (데이터 깨짐 방지)
function parseCSV(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (index === 0 || !line.trim()) return; // 헤더 제외
    // 쉼표로 나누되 따옴표 안의 쉼표는 무시하는 정규식
    const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if (cols) {
      rows.push(cols.map(c => c.replace(/^"|"$/g, '').trim()));
    }
  });
  return rows;
}

function loadPosts(category) {
  const listEl = document.getElementById("thread-list");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");

  // 실시간 연동을 위해 주소 뒤에 타임스탬프 강제 추가 (캐시 방지)
  const finalUrl = `${SHEET_BASE_URL}&t=${Date.now()}`;

  fetch(finalUrl)
    .then(res => res.text())
    .then(text => {
      const data = parseCSV(text);
      listEl.innerHTML = ""; // 기존 목록 초기화

      data.forEach(row => {
        // 시트 구조: 0:제목, 1:날짜, 2:카테고리, 3:내용, 4:문서링크, 5:유튜브링크
        const [title, date, cat, content, docUrl, mediaUrl] = row;

        // 카테고리가 일치하는 데이터만 화면에 그림
        if (cat && cat.toLowerCase() === category.toLowerCase()) {
          const div = document.createElement("div");
          div.className = "thread";
          div.innerHTML = `
            <div class="thread-header">
              <span class="thread-title">${title}</span>
              <span style="float:right; font-size:12px; color:#888;">${date}</span>
            </div>
            <div class="thread-preview">${content}</div>
          `;

          // 클릭 시 팝업에 시트의 모든 정보 연동
          div.onclick = () => {
            let linksHtml = "";
            if (docUrl && docUrl.startsWith("http")) {
              linksHtml += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-bottom:10px; background:#f0f0f0; padding:10px; text-align:center;">📄 관련 문서 보기</a>`;
            }
            if (mediaUrl && mediaUrl.startsWith("http")) {
              linksHtml += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; background:red; color:white; padding:10px; text-align:center;">▶ 영상 확인하기</a>`;
            }

            popupContent.innerHTML = `
              <h2 style="margin-top:0;">${title}</h2>
              <p style="font-size:12px; color:#888;">${date}</p>
              <div class="popup-body" style="margin:20px 0; line-height:1.6;">${content.replace(/\n/g, "<br>")}</div>
              <div style="border-top:1px solid #ddd; padding-top:20px;">${linksHtml}</div>
            `;
            popup.classList.remove("hidden");
          };
          listEl.appendChild(div);
        }
      });
    })
    .catch(err => {
      console.error("데이터 로드 실패:", err);
      listEl.innerHTML = "<p>데이터를 불러오는 데 실패했습니다.</p>";
    });

  const closeBtn = document.getElementById("popupClose");
  if (closeBtn) {
    closeBtn.onclick = () => popup.classList.add("hidden");
  }
}
