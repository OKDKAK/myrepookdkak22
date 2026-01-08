const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLeQeFdWLt6yUX0daihRFirATwDLOS01O8G7U2NMlHVPdfAXEpD1Btp4VzmhxccXghSXawTgo9PUPS/pub?gid=0&single=true&output=csv";

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
        // 시트의 실제 순서대로 데이터를 가져옵니다.
        const title = cols[0]?.trim();
        const date = cols[1]?.trim();
        const categoryValue = cols[2]?.trim();
        const preview = cols[3]?.trim();
        const docUrl = cols[4]?.trim();   // [4]번 칸: 문서 링크
        const mediaUrl = cols[5]?.trim(); // [5]번 칸: 유튜브 링크

        if (!title || categoryValue !== category) return;

        // 리스트 아이템 생성
        const div = document.createElement("div");
        div.className = "thread";
        div.innerHTML = `
          <div class="thread-header">
            <span class="thread-title">${title}</span>
            <span style="float:right; font-size:12px; color:#888;">${date}</span>
          </div>
          <div class="thread-preview">${preview}</div>
        `;

        // 클릭했을 때 오른쪽에서 튀어나올 팝업 내용 설정
        div.onclick = () => {
          let linksHtml = "";
          if (docUrl && docUrl.includes("http")) {
            linksHtml += `<p><a href="${docUrl}" target="_blank" class="nav-btn">📄 관련 문서 보기</a></p>`;
          }
          if (mediaUrl && mediaUrl.includes("http")) {
            linksHtml += `<p><a href="${mediaUrl}" target="_blank" class="nav-btn" style="color:red;">▶ 유튜브/미디어 보기</a></p>`;
          }

          popupContent.innerHTML = `
            <h2>${title}</h2>
            <p class="popup-date">${date}</p>
            <div class="popup-body">
              ${preview.replace(/\n/g, "<br>")}
              <div style="margin-top:40px; padding-top:20px; border-top:1px solid #ddd;">
                ${linksHtml}
              </div>
            </div>
          `;
          popup.classList.remove("hidden");
        };
        listEl.appendChild(div);
      });
    });
}
