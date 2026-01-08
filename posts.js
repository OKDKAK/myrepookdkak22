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
        // 시트의 실제 순서와 1:1 매칭 (0부터 시작)
        const title = cols[0]?.trim();    // 글 제목
        const date = cols[1]?.trim();     // 날짜
        const catValue = cols[2]?.trim(); // category (record 등)
        const preview = cols[3]?.trim();  // 요약 내용
        const docUrl = cols[4]?.trim();   // 문서 링크
        const mediaUrl = cols[5]?.trim(); // 유튜브 링크 (이게 중요!)

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
          // 유튜브 링크가 있으면 버튼을 만들고, 없으면 안 만듭니다.
          let mediaHtml = "";
          if (mediaUrl && mediaUrl.includes("http")) {
            mediaHtml = `<div style="margin-top:20px;"><a href="${mediaUrl}" target="_blank" class="nav-btn" style="color:red; border:1px solid red; padding:5px 10px; border-radius:4px;">▶ 유튜브 영상 보기</a></div>`;
          }

          popupContent.innerHTML = `
            <h2>${title}</h2>
            <p class="popup-date">${date}</p>
            <div class="popup-body">
              ${preview.replace(/\n/g, "<br>")}
              ${mediaHtml}
            </div>
          `;
          popup.classList.remove("hidden");
        };
        listEl.appendChild(div);
      });
    });

  document.getElementById("popupClose").onclick = () => popup.classList.add("hidden");
}
