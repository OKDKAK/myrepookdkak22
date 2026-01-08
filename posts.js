const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

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

  fetch(SHEET_URL)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text).slice(1);
      listEl.innerHTML = "";

      rows.forEach(cols => {
        // 시트 데이터 매칭 확인 
        const title = cols[0]?.trim();     // A열: 글 제목
        const date = cols[1]?.trim();      // B열: 2026-01-08
        const catValue = cols[2]?.trim();  // C열: record
        const preview = cols[3]?.trim();   // D열: 요약 2~3줄
        const docUrl = cols[4]?.trim();    // E열: Docs 링크
        const mediaUrl = cols[5]?.trim();  // F열: Drive/YouTube 링크

        if (catValue === category) {
          const div = document.createElement("div");
          div.className = "thread";
          div.innerHTML = `
            <div class="thread-header">
              <span class="thread-title" style="background:none;">${title}</span>
              <span style="float:right; font-size:12px; color:#888;">${date}</span>
            </div>
            <div class="thread-preview">${preview}</div>
          `;

          div.onclick = () => {
            // 버튼 생성 로직 추가 
            let linkButtons = "";
            if (docUrl && docUrl !== "Docs 링크") {
              linkButtons += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-bottom:10px; text-align:center; background:#eee;">📄 문서 보기</a>`;
            }
            if (mediaUrl && mediaUrl !== "Drive/YouTube 링크") {
              linkButtons += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; text-align:center; background:red; color:white;">▶ 유튜브/미디어 보기</a>`;
            }

            popupContent.innerHTML = `
              <h2>${title}</h2>
              <p class="popup-date">${date}</p>
              <div class="popup-body">${preview.replace(/\n/g, "<br>")}</div>
              <div class="popup-links" style="margin-top:20px; border-top:1px solid #ddd; padding-top:20px;">
                ${linkButtons}
              </div>
            `;
            popup.classList.remove("hidden");
          };
          listEl.appendChild(div);
        }
      });
    });
}
