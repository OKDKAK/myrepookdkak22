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
      const rows = parseCSV(text).slice(1); // 첫 줄(헤더) 제외
      listEl.innerHTML = ""; 

      rows.forEach(cols => {
        // ★ 사용자님의 시트 순서에 정확히 맞춤 ★
        const title = cols[0]?.trim();    // 첫 번째: title
        const date = cols[1]?.trim();     // 두 번째: date
        const catValue = cols[2]?.trim(); // 세 번째: category
        const content = cols[3]?.trim();  // 네 번째: preview

        // 카테고리가 일치하는 데이터만 화면에 생성
        if (catValue === category) {
          const div = document.createElement("div");
          div.className = "thread";
          div.innerHTML = `
            <div class="thread-header">
              <span class="thread-title">${title}</span>
              <span style="float:right; font-size:12px; color:#888;">${date}</span>
            </div>
            <div class="thread-preview">${content}</div>
          `;

          div.onclick = () => {
            popupContent.innerHTML = `
              <h2>${title}</h2>
              <p class="popup-date">${date}</p>
              <div class="popup-body">${content.replace(/\n/g, "<br>")}</div>
            `;
            popup.classList.remove("hidden");
          };
          listEl.appendChild(div);
        }
      });
    });
}
