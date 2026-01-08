const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcX0j3_F8pyY_IJmdn1T7hvD5u8duo5MGUVmt_PJ0aYLaSVJN1_IwX5QWT1uMuAltdu34PtDgeCwDO/pub?output=csv";

async function loadPosts(category) {
    const listEl = document.getElementById("thread-list");
    if (!listEl) return;

    try {
        // 주소 끝에 랜덤 숫자를 붙여 구글 서버의 '옛날 데이터' 응답을 강제로 막음
        const res = await fetch(`${SHEET_URL}&cachebuster=${Math.random()}`);
        const text = await res.text();
        
        // 1. 시트 전체 데이터를 줄 단위로 쪼갬
        const rows = text.split(/\r?\n/);
        console.log("가져온 전체 줄 수:", rows.length);
        
        listEl.innerHTML = ""; 
        let count = 0;

        // 2. 두 번째 줄부터 끝까지 하나하나 검사
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;

            // 쉼표로 칸 나누기 (따옴표 고려하지 않은 가장 단순한 방식 - 오류 방지용)
            const cols = rows[i].split(",");
            const title = cols[0] ? cols[0].replace(/"/g, "") : "제목없음";
            const date = cols[1] ? cols[1].replace(/"/g, "") : "";
            const cat = cols[2] ? cols[2].replace(/"/g, "").trim() : "";
            const content = cols[3] ? cols[3].replace(/"/g, "") : "";

            // [핵심] 공백이고 뭐고 'record'라는 글자만 들어있으면 무조건 출력
            if (cat.includes(category)) {
                count++;
                const div = document.createElement("div");
                div.className = "thread";
                div.innerHTML = `
                    <div class="thread-header">
                        <span class="thread-title">${title}</span>
                        <span style="float:right; font-size:12px; color:#888;">${date}</span>
                    </div>
                    <div class="thread-preview">${content.substring(0, 50)}...</div>
                `;

                div.onclick = () => {
                    document.getElementById("popupContent").innerHTML = `
                        <h2>${title}</h2>
                        <p>${date}</p>
                        <div style="margin-top:20px; line-height:1.6;">${content}</div>
                    `;
                    document.getElementById("popup").classList.remove("hidden");
                };
                listEl.appendChild(div);
            }
        }

        // 만약 글이 하나만 나오면 브라우저가 경고창을 띄우게 함
        if (count < 2) {
            console.warn("데이터를 1개만 찾았습니다. 시트에서 '웹에 게시' 범위를 확인하세요.");
        }

    } catch (err) {
        alert("시트 로드 실패! 인터넷 연결이나 주소를 확인하세요.");
    }
}

// 팝업 닫기
document.addEventListener("click", (e) => {
    if (e.target.id === "popupClose") document.getElementById("popup").classList.add("hidden");
});
