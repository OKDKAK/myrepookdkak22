const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// 1. CSV 데이터 유실 없이 끝까지 읽어내는 함수
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
                if (field || row.length > 0) {
                    row.push(field);
                    rows.push(row);
                    field = ""; row = [];
                }
                if (char === '\r' && text[i+1] === '\n') i++;
            } else field += char;
        }
    }
    if (field || row.length > 0) { row.push(field); rows.push(row); }
    return rows;
}

// 2. 메인 실행 함수
async function loadPosts(category) {
    const listEl = document.getElementById("thread-list");
    const popup = document.getElementById("popup");
    const popupContent = document.getElementById("popupContent");

    if (!listEl) return;

    try {
        // 캐시를 무력화하고 구글 서버에서 직접 긁어옴
        const response = await fetch(`${SHEET_URL}&t=${Date.now()}`);
        const csvText = await response.text();
        const allData = parseCSV(csvText).slice(1); // 헤더 제외

        listEl.innerHTML = ""; // 기존 목록 비우기
        
        // 중요: 필터링된 모든 데이터를 화면에 추가
        allData.forEach(cols => {
            const [title, date, cat, content, docUrl, mediaUrl] = cols;

            // 카테고리 매칭 (공백 제거 후 비교)
            if (cat && cat.trim().toLowerCase() === category.toLowerCase()) {
                const threadDiv = document.createElement("div");
                threadDiv.className = "thread";
                threadDiv.innerHTML = `
                    <div class="thread-header">
                        <span class="thread-title">${title}</span>
                        <span style="float:right; font-size:12px; color:#888;">${date}</span>
                    </div>
                    <div class="thread-preview">${content || ""}</div>
                `;

                threadDiv.onclick = () => {
                    let links = "";
                    if (docUrl?.includes("http")) links += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-bottom:10px; background:#f0f0f0; text-align:center; padding:10px;">📄 문서 보기</a>`;
                    if (mediaUrl?.includes("http")) links += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; background:red; color:white; text-align:center; padding:10px;">▶ 영상 보기</a>`;

                    popupContent.innerHTML = `
                        <h2>${title}</h2>
                        <p class="popup-date">${date}</p>
                        <div class="popup-body" style="white-space:pre-wrap; margin-top:20px;">${content}</div>
                        <div style="margin-top:20px; border-top:1px solid #ddd; padding-top:15px;">${links}</div>
                    `;
                    popup.classList.remove("hidden");
                };
                listEl.appendChild(threadDiv); // 누락 없이 하나씩 추가
            }
        });
    } catch (e) {
        console.error("데이터 로딩 실패:", e);
    }
}

// 팝업 닫기 이벤트 (페이지 로드 시 한 번만 설정)
document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("popupClose");
    if (closeBtn) closeBtn.onclick = () => document.getElementById("popup").classList.add("hidden");
});
