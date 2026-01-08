const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// CSV 데이터를 정교하게 파싱하는 함수 (데이터 유실 방지)
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
    const popup = document.getElementById("popup");
    const popupContent = document.getElementById("popupContent");

    if (!listEl) return;

    try {
        // 캐시를 무시하고 최신 데이터를 강제로 가져옴
        const res = await fetch(`${SHEET_URL}&t=${Date.now()}`);
        const text = await res.text();
        const rows = parseCSV(text);

        listEl.innerHTML = ""; 
        
        // 1번째 줄(헤더)은 제외하고 2번째 줄부터 반복
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            // [0]제목, [1]날짜, [2]카테고리, [3]내용, [4]문서링크(E열), [5]영상링크(F열)
            const [title, date, cat, content, docUrl, mediaUrl] = row;

            // 카테고리가 일치할 때만 리스트에 추가
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

                // 클릭 시 팝업 내용 구성
                div.onclick = () => {
                    let btnsHtml = "";
                    
                    // 문서 보기 버튼 (E열 데이터가 http로 시작할 때)
                    if (docUrl && docUrl.trim().startsWith("http")) {
                        btnsHtml += `<a href="${docUrl.trim()}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:#f0f0f0; text-align:center; padding:12px; text-decoration:none; color:black; border-radius:5px;">📄 문서 보기</a>`;
                    }

                    // 유튜브 영상 보기 버튼 (F열 데이터가 유튜브 링크일 때)
                    if (mediaUrl && (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be"))) {
                        btnsHtml += `<a href="${mediaUrl.trim()}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:#FF0000; color:white; text-align:center; padding:12px; text-decoration:none; font-weight:bold; border-radius:5px;">▶ 유튜브 영상 보기</a>`;
                    }

                    popupContent.innerHTML = `
                        <h2 style="margin-bottom:10px;">${title}</h2>
                        <p style="font-size:13px; color:#999; margin-bottom:20px;">${date}</p>
                        <div class="popup-body" style="white-space:pre-wrap; line-height:1.6;">${content}</div>
                        <div style="margin-top:25px; border-top:1px solid #eee; padding-top:15px;">
                            ${btnsHtml}
                        </div>
                    `;
                    popup.classList.remove("hidden");
                };
                listEl.appendChild(div);
            }
        }
    } catch (err) {
        console.error("데이터 로딩 중 오류:", err);
    }
}

// 팝업 닫기 기능
document.addEventListener("click", (e) => {
    const popup = document.getElementById("popup");
    if (e.target.id === "popupClose") {
        popup.classList.add("hidden");
    }
});
