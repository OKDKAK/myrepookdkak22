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
  row.push(current);
  rows.push(row);
  return rows;
}

function loadPosts(category) {
  const listEl = document.getElementById("thread-list");
  fetch(SHEET_URL)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text).slice(1); // 헤더 제외 
      listEl.innerHTML = ""; 

      rows.forEach(cols => {
        // 시트 순서: 0:제목, 1:날짜, 2:카테고리, 3:내용
        const title = cols[0]?.trim() || "제목 없음";
        const date = cols[1]?.trim() || "";
        const categoryValue = cols[2]?.trim() || "";
        const content = cols[3]?.trim() || "내용이 없습니다.";

        // 카테고리가 일치하는지 확인 (대소문자 무시) 
        if (categoryValue.toLowerCase() !== category.toLowerCase()) return;

        const div = document.createElement("div");
        div.className = "thread"; // style.css의 디자인이 적용됨
        div.innerHTML = `
          <div class="thread-header" style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:5px;">
            <strong class="thread-title">${title}</strong>
            <span class="thread-date" style="font-size:0.8em; color:#888;">${date}</span>
          </div>
          <div class="thread-preview" style="padding-top:10px; color:#444;">${content}</div>
        `;

        // 클릭 시 팝업 열기 
        div.onclick = () => {
          const popup = document.getElementById("popup");
          document.getElementById("popupContent").innerHTML = `
            <h2 style="margin-bottom:5px;">${title}</h2>
            <small>${date}</small><hr>
            <div style="margin-top:15px;">${content.replace(/\n/g, "<br>")}</div>
          `;
          popup.style.display = "flex";
        };
        listEl.appendChild(div);
      });
    });
}
