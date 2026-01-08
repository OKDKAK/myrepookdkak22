const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// CSV를 글자 단위로 쪼개는 가장 정교한 엔진 (데이터 유실 0%)
function parseCSV(text) {
    const result = [];
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
                if (field || row.length > 0) {
                    row.push(field);
                    result.push(row);
                    field = ""; row = [];
                }
                if (char === '\r' && text[i+1] === '\n') i++;
            } else field += char;
        }
    }
    if (field || row.length > 0) { row.push(field); result.push(row); }
    return result;
}

async function loadPosts(category) {
    const listEl = document.getElementById("thread-list");
    if (!listEl) return;

    try {
        const res = await fetch(`${SHEET_URL}&t=${Date.now()}`);
        const text = await res.text();
        const rows = parseCSV(text);

        listEl.innerHTML = ""; 
        
        // i=1 부터 시작해서 첫 줄(이름표 줄)은 강제로 버립니다.
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const [title, date, cat, content, doc, media] = row;

            // 카테고리 비교 (앞뒤 공백 다 자르고 소문자로 통일해서 비교)
            if (cat && cat.trim().toLowerCase() === category.trim().toLowerCase()) {
                const div = document.createElement("div");
                div.className = "thread";
                div.innerHTML = `
                    <div class="thread-header">
                        <span class="thread-title">${title}</span>
                        <span style="float:right; font-size:12px; color:#888;">${date}</span>
                    </div>
                    <div class="thread-preview">${content || ""}</div>
                `;

                div.onclick = () => {
                    const popup = document.getElementById("popup");
                    const popupContent = document.getElementById("popupContent");
                    
                    let btns = "";
                    if (doc && doc.includes("http")) btns += `<a href="${doc}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:#f0f0f0; text-align:center; padding:10px;">📄 문서 보기</a>`;
                    if (media && media.includes("http")) btns += `<a href="${media}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:red; color:white; text-align:center; padding:10px;">▶ 영상 보기</a>`;

                    popupContent.innerHTML = `
                        <h2>${title}</h2>
                        <p class="popup-date">${date}</p>
                        <div class="popup-body" style="white-space:pre-wrap; margin-top:20px;">${content}</div>
                        <div style="margin-top:20px; border-top:1px solid #ddd; padding-top:15px;">${btns}</div>
                    `;
                    popup.classList.remove("hidden");
                };
                listEl.appendChild(div);
            }
        }
    } catch (err) {
        console.error("연동 실패!", err);
    }
}

// 팝업 닫기 기능
document.addEventListener("click", (e) => {
    if (e.target.id === "popupClose") document.getElementById("popup").classList.add("hidden");
});
