const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLeQeFdWLt6yUX0daihRFirATwDLOS01O8G7U2NMlHVPdfAXEpD1Btp4VzmhxccXghSXawTgo9PUPS/pub?gid=0&single=true&output=csv";

/**
 * CSV 파서 (기본)
 */
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
      row.push(current.trim());
      current = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(current.trim());
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * 게시글 로드
 */
function loadPosts(category) {
  const listEl = document.getElementById("thread-list");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");
  const popupClose = document.getElementById("popupClose");

  fetch(SHEET_URL)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text).slice(1); // 헤더 제거
      listEl.innerHTML = "";

      let rendered = 0;

      rows.forEach(cols => {
        const title = (cols[0] || "").trim();
        const date = (cols[1] || "").trim();
        const content = (cols[2] || "").trim();
        const categoryValue = (cols[3] || "").trim().toLowerCase();

        // 필수 필드
        if (!title || !content) return;

        // 🔥 핵심: category가 없으면 통과
        if (category && categoryValue) {
          if (categoryValue !== category.toLowerCase()) return;
        }

        rendered++;

        const div = document.createElement("div");
        div.className = "thread";
        div.innerHTML = `
          <div class="thread-header">
            <span class="thread-title">${title}</span>
            <span class="thread-date">${date}</span>
          </div>
          <div class="thread-preview">${content}</div>
        `;

        div.onclick = () => {
          if (!popup) return;

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

      // 아무 것도 안 나올 때
      if (rendered === 0) {
        listEl.innerHTML = `<p style="opacity:.6">게시글이 없습니다.</p>`;
      }
    })
    .catch(err => {
      console.error(err);
      listEl.innerHTML = `<p style="color:red">데이터를 불러오지 못했습니다.</p>`;
    });

  if (popupClose) {
    popupClose.onclick = () => {
      popup.classList.add("hidden");
    };
  }
}
