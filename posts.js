const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// CSV의 복잡한 구조(따옴표, 줄바꿈)를 완벽하게 해석하는 함수
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

    // 캐시 방지용 타임스탬프 (이게 없으면 수정해도 옛날 데이터가 뜸)
    const finalUrl = `${SHEET_BASE_URL}&t=${new Date().getTime()}`;

    fetch(finalUrl)
        .then(res => res.text())
        .then(csvText => {
            const allRows = parseCSV(csvText).slice(1); // 첫 줄 헤더 제외
            listEl.innerHTML = ""; 

            allRows.forEach(cols => {
                const title = cols[0]?.trim();
                const date = cols[1]?.trim();
                const cat = cols[2]?.trim();
                const preview = cols[3]?.trim() || "";
                const docUrl = cols[4]?.trim() || "";
                const mediaUrl = cols[5]?.trim() || "";

                // 카테고리 필터링 (공백 무시)
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
                        // 링크가 있으면 버튼 생성 (현재 CSS 스타일 유지)
                        if (docUrl.startsWith("http")) {
                            btns += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; padding:10px; background:#f0f0f0; text-align:center;">📄 문서 보기</a>`;
                        }
                        if (mediaUrl.startsWith("http")) {
                            btns += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; padding:10px; background:red; color:white; text-align:center;">▶ 영상 보기</a>`;
                        }

                        popupContent.innerHTML = `
                            <h2>${title}</h2>
                            <p class="popup-date">${date}</p>
                            <div class="popup-body" style="white-space: pre-wrap; margin-top:20px;">${preview}</div>
                            <div style="margin-top:20px; border-top:1px solid #ddd; padding-top:15px;">${btns}</div>
                        `;
                        popup.classList.remove("hidden");
                    };
                    listEl.appendChild(div);
                }
            });
        })
        .catch(err => console.error("연동 실패:", err));

    // 팝업 닫기 이벤트
    const closeBtn = document.getElementById("popupClose");
    if (closeBtn) closeBtn.onclick = () => popup.classList.add("hidden");
}
