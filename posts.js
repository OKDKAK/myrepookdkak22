const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

function parseCSV(text) {
  const rows = [];
  // 줄바꿈이 어떻게 되어있든(윈도우/맥/리눅스) 다 잘라냅니다.
  const lines = text.split(/\r?\n/);
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // 따옴표 안의 쉼표는 무시하고 나누는 정교한 방식
    const cols = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
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

  // 캐시 방지용 타임스탬프 (시트 수정 즉시 반영용)
  const finalUrl = `${SHEET_BASE_URL}&t=${Date.now()}`;

  fetch(finalUrl)
    .then(res => res.text())
    .then(text => {
      const data = parseCSV(text);
      listEl.innerHTML = ""; // 기존 가짜 데이터 삭제

      data.forEach(row => {
        // 시트 순서: [0]제목, [1]날짜, [2]카테고리, [3]내용, [4]문서, [5]영상
        const [title, date, cat, content, docUrl, mediaUrl] = row;

        // 카테고리가 일치하는지 검사 (공백 제거)
        if (cat && cat.toLowerCase().trim() === category.toLowerCase()) {
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
              <div class="popup-body">${(content || "").replace(/\n/g, "<br>")}</div>
              <div style="margin-top:20px; border-top:1px solid #ddd; padding-top:20px;">
                ${linksHtml}
              </div>
            `;
            popup.classList.remove("hidden");
          };
          listEl.appendChild(div);
        }
      });
    });

  if (document.getElementById("popupClose")) {
    document.getElementById("popupClose").onclick = () => popup.classList.add("hidden");
  }
}
