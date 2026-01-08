const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// CSV의 따옴표와 줄바꿈을 완벽히 해석하여 데이터 유실을 막는 엔진
function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (inQuotes) {
            if (char === '"' && text[i+1] === '"') { field += '"'; i++; }
            else if (char === '"') inQuotes = false;
            else field += char;
        } else {
            if (char === '"') inQuotes = true;
            else if (char === ',') { row.push(field); field = ""; }
            else if (char === '\r' || char === '\n') {
                if (field || row.length > 0) { row.push(field); rows.push(row); field = ""; row = []; }
                if (char === '\r' && text[i+1] === '\n') i++;
            } else field += char;
        }
    }
    if (field || row.length > 0) { row.push(field); rows.push(row); }
    return rows;
}

async function loadPosts(category) {
    const listEl = document.getElementById("thread-list");
    if (!listEl) return;

    // [중요] 캐시 무력화: 주소 뒤에 시간을 붙여 매번 새로운 데이터를 구글 서버에 강제로 요청합니다.
    const finalUrl = `${SHEET_BASE_URL}&v=${new Date().getTime()}`;

    try {
        const res = await fetch(finalUrl);
        const text = await res.text();
        const data = parseCSV(text);

        listEl.innerHTML = ""; // 기존 목록 초기화
        
        // 헤더(첫 줄)는 제외하고 두 번째 줄부터 끝까지 확인
        for (let i = 1; i < data.length; i++) {
            const cols = data[i];
            const [title, date, cat, content, docUrl, mediaUrl] = cols;

            // 카테고리가 정확히 일치하는 모든 행을 출력
            if (cat && cat.trim().toLowerCase() === category.toLowerCase()) {
                const thread = document.createElement("div");
                thread.className = "thread";
                thread.innerHTML = `
                    <div class="thread-header">
                        <span class="thread-title">${title}</span>
                        <span style="float:right; font-size:12px; color:#888;">${date}</span>
                    </div>
                    <div class="thread-preview">${content || ""}</div>
                `;

                thread.onclick = () => {
                    const popup = document.getElementById("popup");
                    const popupContent = document.getElementById("popupContent");
                    let btns = "";
                    if (docUrl && docUrl.includes("http")) btns += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:#f0f0f0; text-align:center; padding:10px;">📄 문서 보기</a>`;
                    if (mediaUrl && mediaUrl.includes("http")) btns += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:red; color:white; text-align:center; padding:10px;">▶ 영상 보기</a>`;

                    popupContent.innerHTML = `
                        <h2>${title}</h2>
                        <p class="popup-date">${date}</p>
                        <div class="popup-body" style="white-space:pre-wrap; margin-top:20px;">${content}</div>
                        <div style="margin-top:20px; border-top:1px solid #ddd; padding-top:15px;">${btns}</div>
                    `;
                    popup.classList.remove("hidden");
                };
                listEl.appendChild(thread);
            }
        }
    } catch (err) {
        console.error("데이터 로드 중 에러 발생:", err);
    }
}

// 팝업 닫기 기능 (공통)
document.addEventListener("click", (e) => {
    if (e.target.id === "popupClose") document.getElementById("popup").classList.add("hidden");
});
