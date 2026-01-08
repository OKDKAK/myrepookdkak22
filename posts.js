const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLeQeFdWLt6yUX0daihRFirATwDLOS01O8G7U2NMlHVPdfAXEpD1Btp4VzmhxccXghSXawTgo9PUPS/pub?gid=0&single=true&output=csv";

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
  
  fetch(SHEET_URL)
    .then(res => res.text())
    .then(text => {
      // 1. CSV 파싱 후 첫 번째 헤더 줄 제외 
      const rows = parseCSV(text).slice(1);
      listEl.innerHTML = "";

      rows.forEach(cols => {
        // 2. 시트의 실제 순서에 맞게 변수 할당 
        // [0]title, [1]date, [2]category, [3]preview
        const title = cols[0]?.trim();
        const date = cols[1]?.trim();
        const categoryValue = cols[2]?.trim();
        const content = cols[3]?.trim();

        // 3. 데이터가 없거나 카테고리가 일치하지 않으면 건너뜀
        if (!title || !content) return;
        if (categoryValue !== category) return;

        // 4. 화면에 HTML 생성
        const div = document.createElement("div");
        div.className = "thread";
        div.innerHTML = `
          <div class="thread-header">
            <span class="thread-title">${title}</span>
            <span class="thread-date">${date}</span>
          </div>
          <div class="thread-preview">${content}</div>
        `;

        // 팝업 기능 (필요 시 활용)
        div.onclick = () => {
          const popup = document.getElementById("popup");
          const popupContent = document.getElementById("popupContent");
          if (popup && popupContent) {
            popupContent.innerHTML = `<h2>${title}</h2><p>${date}</p><hr><div>${content.replace(/\n/g, "<br>")}</div>`;
            popup.classList.remove("hidden");
          }
        };

        listEl.appendChild(div);
      });
    })
    .catch(err => console.error("데이터를 가져오는 중 오류 발생:", err));
}
