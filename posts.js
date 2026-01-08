const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLeQeFdWLt6yUX0daihRFirATwDLOS01O8G7U2NMlHVPdfAXEpD1Btp4VzmhxccXghSXawTgo9PUPS/pub?gid=0&single=true&output=csv";

function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(row => row.split(",").map(v => v.trim()));
}

function loadPosts(category) {
  const listEl = document.getElementById("thread-list");

  fetch(SHEET_URL)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text);
      const header = rows[0];
      const data = rows.slice(1);

      // 🔥 header → index 매핑
      const idx = {
        title: header.indexOf("title"),
        date: header.indexOf("date"),
        content: header.indexOf("content"),
        category: header.indexOf("category"),
      };

      listEl.innerHTML = "";
      let rendered = 0;

      data.forEach(row => {
        const title = row[idx.title];
        const date = row[idx.date];
        const content = row[idx.content];
        const cat = (row[idx.category] || "").toLowerCase();

        if (!title || !content) return;
        if (category && cat && cat !== category.toLowerCase()) return;

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

        listEl.appendChild(div);
      });

      if (rendered === 0) {
        listEl.innerHTML = "<p>게시글이 없습니다.</p>";
      }
    });
}
