const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

function loadPosts(category) {
  const listEl = document.getElementById("thread-list");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");

  fetch(`${SHEET_BASE_URL}&t=${Date.now()}`)
    .then(res => res.text())
    .then(text => {
      // 쉼표와 줄바꿈을 더 정확히 처리하는 정규식 기반 분할
      const rows = text.split(/\r?\n/).slice(1); 
      console.log("전체 로드된 행 수:", rows.length);
      
      listEl.innerHTML = "";

      rows.forEach((line) => {
        // 따옴표 안의 쉼표는 무시하고 나누기
        const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        if (!cols || cols.length < 3) return;

        const title = cols[0].replace(/^"|"$/g, '').trim();
        const date = cols[1].replace(/^"|"$/g, '').trim();
        const catValue = cols[2].replace(/^"|"$/g, '').trim();
        const preview = cols[3]?.replace(/^"|"$/g, '').trim() || "";
        const docUrl = cols[4]?.replace(/^"|"$/g, '').trim() || "";
        const mediaUrl = cols[5]?.replace(/^"|"$/g, '').trim() || "";

        // 카테고리 필터링 (대소문자 무시)
        if (catValue.toLowerCase() !== category.toLowerCase()) return;

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
          let buttons = "";
          if (docUrl.includes("http")) buttons += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-bottom:10px; background:#ddd; padding:10px; text-align:center;">📄 문서 보기</a>`;
          if (mediaUrl.includes("http")) buttons += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; background:red; color:white; padding:10px; text-align:center;">▶ 영상 보기</a>`;

          popupContent.innerHTML = `
            <h2 style="font-size:24px; margin-bottom:10px;">${title}</h2>
            <p style="color:#888; font-size:14px;">${date}</p>
            <div class="popup-body" style="margin-top:20px; border-top:1px solid #eee; pt:20px; line-height:1.8;">
              ${preview.replace(/\\n/g, "<br>")}
            </div>
            <div style="margin-top:30px;">${buttons}</div>
          `;
          popup.classList.remove("hidden");
        };
        listEl.appendChild(div);
      });
    });
}
