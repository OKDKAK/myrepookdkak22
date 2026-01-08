const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// CSV를 한 글자씩 검사해서 나누는 가장 정교한 방식
function parseCSV(text) {
    const result = [];
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
                    result.push(row);
                    field = "";
                    row = [];
                }
                if (char === '\r' && nextChar === '\n') i++; 
            } else { field += char; }
        }
    }
    if (field || row.length > 0) { row.push(field); result.push(row); }
    return result;
}

function loadPosts(category) {
    const listEl = document.getElementById("thread-list");
    const popup = document.getElementById("popup");
    const popupContent = document.getElementById("popupContent");

    // 캐시 방지용 타임스탬프 (이게 있어야 시트 수정이 바로 반영됨)
    const finalUrl = `${SHEET_BASE_URL}&t=${new Date().getTime()}`;

    fetch(finalUrl)
        .then(res => res.text())
        .then(csvText => {
            const allRows = parseCSV(csvText).slice(1); // 헤더 제외
            listEl.innerHTML = ""; 

            allRows.forEach(cols => {
                const title = cols[0]?.trim();
                const date = cols[1]?.trim();
                const cat = cols[2]?.trim();
                const preview = cols[3]?.trim() || "";
                const docUrl = cols[4]?.trim() || "";
                const mediaUrl = cols[5]?.trim() || "";

                // 카테고리 필터링 (오타 방지를 위해 앞뒤 공백 제거)
                if (cat && cat.toLowerCase() === category.toLowerCase()) {
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
        });
}
