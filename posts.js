const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLeQeFdWLt6yUX0daihRFirATwDLOS01O8G7U2NMlHVPdfAXEpD1Btp4VzmhxccXghSXawTgo9PUPS/pub?gid=0&single=true&output=csv";

function loadPosts() {
  const listEl = document.getElementById("thread-list");

  fetch(SHEET_URL)
    .then(res => res.text())
    .then(text => {
      listEl.innerHTML = "<pre>" + text + "</pre>";
    })
    .catch(err => {
      listEl.innerHTML = "ERROR: " + err;
    });
}
