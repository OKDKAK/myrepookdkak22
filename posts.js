const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// CSV의 따옴표와 줄바꿈을 완벽하게 처리하는 함수
function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') { field += '"'; i++; }
            else if (char === '"') { inQuotes = false; }
            else { field += char; }
        } else {
            if (char === '"') { inQuotes = true; }
            else if (char === ',') { row.push(field); field = ""; }
            else if (char === '\r' || char === '\n') {
                if (field || row.length > 0) {
                    row.push(field);
                    rows.push(row);
                    field = "";
                    row = [];
                }
                if (char === '\r' && nextChar === '\n') i++; 
            } else { field += char; }
        }
    }
    if (field || row.length > 0) { row.push(field); rows.push(row); }
    return rows;
}

function loadPosts(category) {
    const listEl = document.getElementById("thread-list");
    const popup = document.getElementById("popup");
    const popupContent = document.getElementById("popupContent");

    // 캐시 방지 (수정 즉시 반영)
    const finalUrl = `${SHEET_BASE_URL}&t=${Date.now()}`;

    fetch(finalUrl)
        .then(res => res.text())
        .then(csvText => {
            const data = parseCSV(csvText).slice(1); // 헤더(제목줄) 제외
            listEl.innerHTML = ""; 
            
            let count = 0;
            data.forEach(cols => {
                const title = cols[0]?.trim();
                const date = cols[1]?.trim();
                const cat = cols[2]?.trim();
                const preview = cols[3]?.trim() || "";
                const docUrl = cols[4]?.trim() || "";
                const mediaUrl = cols[5]?.trim() || "";

                // 카테고리가 일치하는 모든 글을 가져옵니다.
                if (cat && cat.toLowerCase() === category.toLowerCase()) {
                    count++;
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
                        let btns = "";
                        if (docUrl.includes("http")) {
                            btns += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:#f0f0f0;">📄 문서 보기</a>`;
                        }
                        if (mediaUrl.includes("http")) {
                            btns += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:red; color:white;">▶ 유튜브/미디어 보기</a>`;
                        }

                        popupContent.innerHTML = `
                            <h2>${title}</h2>
                            <p class="popup-date">${date}</p>
                            <div class="popup-body">${preview.replace(/\n/g, "<br>")}</div>
                            <div style="margin-top:20px; border-top:1px solid #ddd; padding-top:15px;">${btns}</div>
                        `;
                        popup.classList.remove("hidden");
                    };
                    listEl.appendChild(div);
                }
            });
            console.log(`${category} 카테고리 글 ${count}개를 불러왔습니다.`);
        });
}
