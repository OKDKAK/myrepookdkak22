const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// CSV 데이터를 훨씬 더 강력하게 분해하는 함수
function parseCSV(text) {
  const rows = [];
  // 줄바꿈 기호(\r\n, \n, \r) 종류에 상관없이 깔끔하게 한 줄씩 자릅니다.
  const lines = text.split(/\r?\n/);
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // 따옴표 안의 쉼표를 완벽하게 보호하며 칸을 나눕니다.
    const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if (cols) {
      rows.push(cols.map(c => c.replace(/^"|"$/g, '').trim()));
    }
  }
  return rows;
}

function loadPosts(category) {
  const listEl = document.getElementById("thread-list");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");

  // 캐시 방지를 위해 매번 고유 주소로 호출
  const finalUrl = `${SHEET_BASE_URL}&t=${new Date().getTime()}`;

  fetch(finalUrl)
    .then(res => res.text())
    .then(text => {
      const data = parseCSV(text);
      listEl.innerHTML = ""; // 기존 글 삭제

      data.forEach((row, index) => {
        // [0]제목, [1]날짜, [2]카테고리, [3]내용, [4]문서, [5]영상
        const [title, date, cat, content, docUrl, mediaUrl] = row;

        // 카테고리가 일치하는지 확인 (공백 제거 및 소문자 변환으로 정확도 상승)
        if (cat && cat.toLowerCase().trim() === category.toLowerCase().trim()) {
          const div = document.createElement("div");
          div.className = "thread";
          div.innerHTML = `
            <div class="thread-header">
              <span class="thread-title">${title}</span>
              <span style="float:right; font-size:12px; color:#888;">${date}</span>
            </div>
            <div class="thread-preview">${content || ""}</div>
          `;

          div.onclick = () => {
            let linksHtml = "";
            if (docUrl && docUrl.startsWith("http")) {
              linksHtml += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px;">📄 문서 보기</a>`;
            }
            if (mediaUrl && mediaUrl.startsWith("http")) {
              linksHtml += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; color:red;">▶ 영상 보기</a>`;
            }

            popupContent.innerHTML = `
              <h2>${title}</h2>
              <p class="popup-date">${date}</p>
              <div class="popup-body">${(content || "").replace(/\\n/g, "<br>").replace(/\n/g, "<br>")}</div>
              <div style="margin-top:20px; border-top:1px solid #ddd; padding-top:20px;">
                ${linksHtml}
              </div>
            `;
            popup.classList.remove("hidden");
          };
          listEl.appendChild(div);
        }
      });
    })
    .catch(err => console.error("데이터 로드 중 오류:", err));

  const closeBtn = document.getElementById("popupClose");
  if (closeBtn) {
    closeBtn.onclick = () => popup.classList.add("hidden");
  }
}
