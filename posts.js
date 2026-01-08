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
      // 1. CSV 데이터 파싱 (첫 번째 헤더 줄 제외)
      const rows = parseCSV(text).slice(1);
      listEl.innerHTML = ""; // 기존 내용 초기화

      rows.forEach(cols => {
        // [0]title, [1]date, [2]category, [3]preview 순서 (CSV 기준)
        const title = cols[0]?.trim();
        const date = cols[1]?.trim();
        const categoryValue = cols[2]?.trim();
        const content = cols[3]?.trim();

        // 디버깅용: 데이터가 들어오는지 확인 (나중에 지우셔도 됩니다)
        console.log("불러온 데이터:", { title, categoryValue, content });

        // 데이터가 비어있거나 카테고리가 다르면 건너뜀
        if (!title || !categoryValue) return;
        if (categoryValue.toLowerCase() !== category.toLowerCase()) return;

        // 화면에 게시글 카드 생성
        const div = document.createElement("div");
        div.className = "thread";
        div.style.cursor = "pointer";
        div.innerHTML = `
          <div class="thread-header">
            <span class="thread-title" style="font-weight:bold;">${title}</span>
            <span class="thread-date" style="float:right; font-size:0.8em;">${date}</span>
          </div>
          <div class="thread-preview" style="margin-top:5px; color:#555;">${content}</div>
        `;

        // 클릭하면 팝업 띄우기
        div.onclick = () => {
          const popup = document.getElementById("popup");
          const popupContent = document.getElementById("popupContent");
          if (popup && popupContent) {
            popupContent.innerHTML = `
              <h2>${title}</h2>
              <p style="color:#888;">${date}</p>
              <hr>
              <div style="margin-top:15px; line-height:1.6;">${content.replace(/\n/g, "<br>")}</div>
            `;
            popup.style.display = "flex";
          }
        };

        listEl.appendChild(div);
      });
    })
    .catch(err => {
      console.error("데이터 로딩 에러:", err);
      listEl.innerHTML = "<p>데이터를 불러오는 데 실패했습니다.</p>";
    });
}
