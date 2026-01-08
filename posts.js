const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLeQeFdWLt6yUX0daihRFirATwDLOS01O8G7U2NMlHVPdfAXEpD1Btp4VzmhxccXghSXawTgo9PUPS/pub?gid=0&single=true&output=csv";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
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
      // 첫 줄(헤더) 제외하고 데이터 파싱
      const rows = parseCSV(text).slice(1);
      listEl.innerHTML = "";

      rows.forEach(cols => {
        // 시트 순서: title(0), date(1), category(2), preview(3)
        const title = cols[0]?.trim();
        const date = cols[1]?.trim();
        const categoryValue = cols[2]?.trim();
        const content = cols[3]?.trim();

        if (!title || !content) return;
        // 선택한 카테고리와 시트의 카테고리가 일치하는지 확인
        if (categoryValue !== category) return;

        const div = document.createElement("div");
        div.className = "thread";
        div.innerHTML = `
          <div class="thread-header">
            <span class="thread-title">${title}</span>
            <span class="thread-date">${date}</span>
          </div>
          <div class="thread-preview">${content}</div>
        `;

        // 클릭 시 팝업 표시
        div.onclick = () => {
          if (popupContent && popup) {
            popupContent.innerHTML = `
              <h2>${title}</h2>
              <p class="popup-date" style="color: #666; font-size: 0.9em;">${date}</p>
              <hr>
              <div class="popup-body" style="margin-top: 15px;">
                ${content.replace(/\n/g, "<br>")}
              </div>
            `;
            popup.classList.remove("hidden");
          }
        };

        listEl.appendChild(div);
      });
    })
    .catch(err => console.error("데이터 로드 실패:", err));

  if (popupClose) {
    popupClose.onclick = () => {
      popup.classList.add("hidden");
    };
  }
}
