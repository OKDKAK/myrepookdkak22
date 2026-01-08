const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLeQeFdWLt6yUX0daihRFirATwDLOS01O8G7U2NMlHVPdfAXEpD1Btp4VzmhxccXghSXawTgo9PUPS/pub?gid=0&single=true&output=csv";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = ""; // 이 변수가 빠져있어서 에러가 났을 겁니다!
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  row.push(current);
  rows.push(row);
  return rows;
}

function loadPosts(category) {
  const listEl = document.getElementById("thread-list");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");
  const popupClose = document.getElementById("popupClose");

  fetch(SHEET_URL)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text).slice(1); // 첫 줄 제외
      listEl.innerHTML = "";

      rows.forEach(cols => {
        // 시트 순서: 0:title, 1:date, 2:category, 3:preview
        const title = cols[0]?.trim();
        const date = cols[1]?.trim();
        const categoryValue = cols[2]?.trim();
        const content = cols[3]?.trim();

        // 카테고리 필터링 (대소문자 무관하게 비교)
        if (!title || categoryValue?.toLowerCase() !== category.toLowerCase()) return;

        const div = document.createElement("div");
        div.className = "thread"; // CSS의 .thread 스타일 적용
        div.innerHTML = `
          <div class="thread-header">
            <span class="thread-title">${title}</span>
            <span class="thread-date" style="float:right; font-size:12px; color:#666;">${date}</span>
          </div>
          <div class="thread-preview">${content}</div>
        `;

        div.onclick = () => {
          popupContent.innerHTML = `
            <h2>${title}</h2>
            <p class="popup-date">${date}</p>
            <div class="popup-body">
              ${content.replace(/\n/g, "<br>")}
            </div>
          `;
          popup.classList.remove("hidden");
        };

        listEl.appendChild(div);
      });
    })
    .catch(err => console.error("데이터 로드 실패:", err));

  if (popupClose) {
    popupClose.onclick = () => popup.classList.add("hidden");
  }
}
