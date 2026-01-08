// 주소 끝에 ?t=${Date.now()}를 붙여서 캐시를 무력화하고 실시간 연동합니다.
const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === "," && !inQuotes) { row.push(current); current = ""; }
    else if (char === "\n" && !inQuotes) { row.push(current); rows.push(row); row = []; current = ""; }
    else current += char;
  }
  row.push(current); rows.push(row);
  return rows;
}

function loadPosts(category) {
  const listEl = document.getElementById("thread-list");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");

  // 실시간 갱신용 타임스탬프 추가
  const finalUrl = `${SHEET_BASE_URL}&t=${Date.now()}`;

  fetch(finalUrl)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text).slice(1);
      listEl.innerHTML = "";

      rows.forEach(cols => {
        const title = cols[0]?.trim();     // A: 제목
        const date = cols[1]?.trim();      // B: 날짜
        const catValue = cols[2]?.trim();  // C: 카테고리 (record 등)
        const preview = cols[3]?.trim();   // D: 요약
        const docUrl = cols[4]?.trim();    // E: 문서 링크
        const mediaUrl = cols[5]?.trim();  // F: 유튜브 링크

        // 카테고리가 일치하는 것만 출력
        if (!title || catValue !== category) return;

        const div = document.createElement("div");
        div.className = "thread";
        div.innerHTML = `
          <div class="thread-header">
            <span class="thread-title">${title}</span>
            <span style="float:right; font-size:12px; color:#888;">${date}</span>
          </div>
          <div class="thread-preview">${preview}</div>
        `;

        div.onclick = () => {
          let btns = "";
          // 실제 링크가 들어있을 때만 버튼 생성
          if (docUrl && docUrl.includes("http")) {
            btns += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:#f0f0f0;">📄 문서 보기</a>`;
          }
          if (mediaUrl && mediaUrl.includes("http")) {
            btns += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:red; color:white;">▶ 유튜브/미디어 보기</a>`;
          }

          popupContent.innerHTML = `
            <h2>${title}</h2>
            <p class="popup-date">${date}</p>
            <div class="popup-body">${preview.replace(/\n/g, "<br>")}</div>
            <div style="margin-top:20px; border-top:1px solid #ddd; padding-top:15px;">
              ${btns || "<p style='color:#ccc;'>첨부된 링크가 없습니다.</p>"}
            </div>
          `;
          popup.classList.remove("hidden");
        };
        listEl.appendChild(div);
      });
    });
}
