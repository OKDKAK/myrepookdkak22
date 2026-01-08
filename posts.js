const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

// 1. CSV를 완벽하게 쪼개는 로직 (데이터 유실 방지)
function parseCSV(text) {
    const rows = [];
    const lines = text.split(/\r?\n/);
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        if (cols) rows.push(cols.map(c => c.replace(/^"|"$/g, '').trim()));
    }
    return rows;
}

// 2. 게시글을 화면에 그리는 함수
function renderPost(listEl, row, category, popup, popupContent) {
    const [title, date, cat, content, docUrl, mediaUrl] = row;

    if (cat && cat.toLowerCase().trim() === category.toLowerCase().trim()) {
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
            let btns = "";
            if (docUrl && docUrl.includes("http")) btns += `<a href="${docUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:#f0f0f0;">📄 문서 보기</a>`;
            if (mediaUrl && mediaUrl.includes("http")) btns += `<a href="${mediaUrl}" target="_blank" class="nav-btn" style="display:block; margin-top:10px; background:red; color:white;">▶ 영상 보기</a>`;

            popupContent.innerHTML = `
                <h2>${title}</h2>
                <p class="popup-date">${date}</p>
                <div class="popup-body" style="white-space:pre-wrap;">${content}</div>
                <div style="margin-top:20px; border-top:1px solid #ddd; padding-top:15px;">${btns}</div>
            `;
            popup.classList.remove("hidden");
        };
        listEl.appendChild(div); // 하나씩 확실하게 추가
    }
}

// 3. 메인 로드 함수
function loadPosts(category) {
    const listEl = document.getElementById("thread-list");
    const popup = document.getElementById("popup");
    const popupContent = document.getElementById("popupContent");

    if (!listEl) return;

    fetch(`${SHEET_BASE_URL}&t=${Date.now()}`)
        .then(res => res.text())
        .then(csvText => {
            const data = parseCSV(csvText);
            listEl.innerHTML = ""; // 시작할 때 딱 한 번만 비움

            // 중요: 데이터 배열을 돌면서 하나씩 확실히 화면에 박음
            for (let i = 0; i < data.length; i++) {
                renderPost(listEl, data[i], category, popup, popupContent);
            }
        })
        .catch(err => console.error("데이터 로드 에러:", err));
}

// 팝업 닫기 기능은 별도로 즉시 실행
document.addEventListener("click", (e) => {
    if (e.target.id === "popupClose") {
        document.getElementById("popup").classList.add("hidden");
    }
});
