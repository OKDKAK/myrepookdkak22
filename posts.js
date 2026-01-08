// 🔴 아래 주소가 사용자님의 시트 주소가 맞나요? 틀리면 무조건 바꿔야 합니다!
// 구글 시트 > 파일 > 공유 > 웹에 게시 > '시트1' > 'CSV' 선택 후 나온 주소여야 합니다.
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLeQeFdWLt6yUX0daihRFirATwDLOS01O8G7U2NMlHVPdfAXEpD1Btp4VzmhxccXghSXawTgo9PUPS/pub?gid=0&single=true&output=csv";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === "," && !inQuotes) { row.push(current); current = ""; }
    else if (char === "\n" && !inQuotes) { row.push(current); rows.push(row); row = []; current = ""; }
    else current += char;
  }
  row.push(current); rows.push(row);
  return rows;
}

function loadPosts(category) {
  const listEl = document.getElementById("thread-list");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");
  const popupClose = document.getElementById("popupClose");

  // 로딩 중 표시
  listEl.innerHTML = `<p style="padding:20px; color:#666;">데이터를 불러오는 중입니다...</p>`;

  fetch(SHEET_URL)
    .then(res => {
      if (!res.ok) throw new Error("네트워크 응답 없음");
      return res.text();
    })
    .then(text => {
      const rows = parseCSV(text).slice(1);
      listEl.innerHTML = ""; // 초기화

      let count = 0;

      rows.forEach(cols => {
        // 시트 칸 번호 매칭 (0부터 시작)
        const title = cols[0]?.trim();     // A열
        const date = cols[1]?.trim();      // B열
        const catValue = cols[2]?.trim();  // C열 (record)
        const preview = cols[3]?.trim();   // D열
        const docUrl = cols[4]?.trim();    // E열 (문서)
        const mediaUrl = cols[5]?.trim();  // F열 (유튜브/미디어)

        // 카테고리 검사 (대소문자 무시)
        if (!title || catValue?.toLowerCase() !== category.toLowerCase()) return;
        
        count++;

        // 리스트에 영상 유무 표시
        let badge = "";
        if (mediaUrl && mediaUrl.length > 5) {
          badge = `<span style="color:red; font-size:12px; margin-left:5px;">[▶영상]</span>`;
        }

        const div = document.createElement("div");
        div.className = "thread";
        div.innerHTML = `
          <div class="thread-header">
            <span class="thread-title">${title} ${badge}</span>
            <span style="float:right; font-size:12px; color:#888;">${date}</span>
          </div>
          <div class="thread-preview">${preview}</div>
        `;

        // 팝업 클릭 이벤트
        div.onclick = () => {
          let buttons = "";
          
          // 링크가 실제 주소(http)일 때만 버튼 생성
          if (docUrl && docUrl.includes("http")) {
             buttons += `<a href="${docUrl}" target="_blank" style="display:inline-block; margin-right:10px; padding:8px 15px; background:#eee; text-decoration:none; color:#333; border-radius:4px; font-weight:bold;">📄 문서 보기</a>`;
          }
          if (mediaUrl && mediaUrl.includes("http")) {
             buttons += `<a href="${mediaUrl}" target="_blank" style="display:inline-block; padding:8px 15px; background:#ff0000; text-decoration:none; color:white; border-radius:4px; font-weight:bold;">▶ 유튜브 바로가기</a>`;
          }

          popupContent.innerHTML = `
            <h2>${title}</h2>
            <p class="popup-date">${date}</p>
            <hr style="margin:10px 0; border:0; border-top:1px solid #ddd;">
            <div class="popup-body" style="min-height:100px;">
              ${preview.replace(/\n/g, "<br>")}
            </div>
            <div style="margin-top:30px; text-align:center;">
              ${buttons}
            </div>
          `;
          popup.classList.remove("hidden");
        };
        listEl.appendChild(div);
      });

      // 데이터가 없으면 경고
      if (count === 0) {
         listEl.innerHTML = `<p style="padding:20px; color:red; font-weight:bold;">⚠ 데이터 없음<br>시트의 C열(category)에 '${category}'라고 적힌 글이 하나도 없습니다.</p>`;
      }
    })
    .catch(err => {
      // 연결 실패 시 화면에 에러 표시
      listEl.innerHTML = `<div style="padding:20px; background:#xffcccc; color:red;">
        <h3>⚠ 시트 연동 실패</h3>
        <p>구글 시트 주소가 잘못되었거나 게시되지 않았습니다.</p>
        <p>에러 내용: ${err.message}</p>
      </div>`;
    });

  if (popupClose) popupClose.onclick = () => popup.classList.add("hidden");
}
