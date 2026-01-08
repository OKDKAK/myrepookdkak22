const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLeQeFdWLt6yUX0daihRFirATwDLOS01O8G7U2NMlHVPdfAXEpD1Btp4VzmhxccXghSXawTgo9PUPS/pub?gid=0&single=true&output=csv";

/**
 * CSV 파서 (따옴표/줄바꿈 대응)
 */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (current || row.length) {
        row.push(current.trim());
        rows.push(row);
      }
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
 * 카테고리별 게시글 로드
 * category 예: "record", "design", "archive"
 */
function loadPosts(category) {
  const listEl = document.getElementById("thread-list");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");
  const popupClose = document.getElementById("popupClose");

  if (!listEl) {
    console.warn("thread-list element not found");
    return;
  }

  fetch(SHEET_URL)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch sheet");
      return res.text();
    })
    .then(text => {
      const rows = parseCSV(text);

      // 첫 줄 헤더 제거
      const dataRows = rows.slice(1);
      listEl.innerHTML = "";

      let hasPost = false;

      dataRows.forEach(cols => {
        const title = cols[0] || "";
        const date = cols[1] || "";
        const content = cols[2] || "";
        const categoryValue = (cols[3] || "").toLowerCase();

        // 필수값 체크
        if (!title || !content) return;

        // 카테고리 필터
        if (category && categoryValue !== category.toLowerCase()) return;

        hasPost = true;

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

      // 글 없을 때 안내
      if (!hasPost) {
        listEl.innerHTML = `<p style="opacity:.6">게시글이 없습니다.</p>`;
      }
    })
    .catch(err => {
      console.error("Sheet load error:", err);
      listEl.innerHTML = `<p style="color:red">데이터를 불러오지 못했습니다.</p>`;
    });

  if (popupClose) {
    popupClose.onclick = () => {
      popup.classList.add("hidden");
    };
  }
}
