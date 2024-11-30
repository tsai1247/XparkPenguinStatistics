// main.js

// 預設搜尋文字
const DEFAULT_SEARCH_TEXT = [
  "我要投【🅐 胖貢貢】#Xpark #企名大師就是我",
  "我要投【🅑 烏梅汁】#Xpark #企名大師就是我",
  "我要投【🅒 Tomorin】#Xpark #企名大師就是我",
  "我要投【🅓 燈】#Xpark #企名大師就是我",
  "我要投【🅔 碧天伴走】#Xpark #企名大師就是我",
];

// 當擴充功能按鈕被點擊時觸發
document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("searchButton");
  const resultDiv = document.getElementById("result");

  // 搜尋輸入框
  const searchInputs = [
    document.getElementById("searchText1"),
    document.getElementById("searchText2"),
    document.getElementById("searchText3"),
    document.getElementById("searchText4"),
    document.getElementById("searchText5"),
  ];

  // 恢復之前儲存的搜尋內容，或使用預設值
  chrome.storage.local.get("searchTexts", function (data) {
    // 如果之前沒有儲存的搜尋文字，或儲存的內容為空
    if (
      !data.searchTexts ||
      data.searchTexts.every((text) => text.trim() === "")
    ) {
      // 將第一個輸入框設為預設值
      searchInputs[0].value = DEFAULT_SEARCH_TEXT[0];
      searchInputs[1].value = DEFAULT_SEARCH_TEXT[1];
      searchInputs[2].value = DEFAULT_SEARCH_TEXT[2];
      searchInputs[3].value = DEFAULT_SEARCH_TEXT[3];
      searchInputs[4].value = DEFAULT_SEARCH_TEXT[4];

      // 儲存預設值
      const searchTexts = DEFAULT_SEARCH_TEXT;
      chrome.storage.local.set({ searchTexts: searchTexts });
    } else {
      // 使用儲存的搜尋文字
      searchInputs.forEach((input, index) => {
        input.value = data.searchTexts[index] || "";
      });
    }
  });

  // 監聽輸入框內容變化並儲存
  searchInputs.forEach((input, index) => {
    input.addEventListener("input", function () {
      // 儲存所有輸入框的內容
      const searchTexts = searchInputs.map((inp) => inp.value);
      chrome.storage.local.set({ searchTexts: searchTexts });
    });
  });

  searchButton.addEventListener("click", function () {
    // 收集五個搜尋輸入框的值
    const searchTexts = searchInputs
      .map((input) => input.value)
      .filter((text) => text.trim() !== ""); // 移除空值

    // 從當前頁面執行腳本
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: findMatchingDivs,
          args: [searchTexts],
        },
        handleResults
      );
    });
  });
});

// 在網頁上尋找符合條件的 div
function findMatchingDivs(searchTexts) {
  // 選擇所有符合特定屬性的 div
  const divs = document.querySelectorAll(
    'div[dir="auto"][style="text-align: start;"]'
  );

  // 計算每個搜尋文字的匹配數量
  const matchResults = searchTexts.map((searchText) => {
    const matchingDivs = Array.from(divs).filter((div) =>
      div.textContent.replace(" ", "").includes(searchText.replace(" ", ""))
    );
    return {
      searchText: searchText,
      count: matchingDivs.length,
    };
  });

  return {
    total: divs.length,
    matches: matchResults,
  };
}

// 處理搜尋結果
function handleResults(results) {
  if (results && results[0] && results[0].result) {
    const { total, matches } = results[0].result;
    const totalValid = matches.reduce((sum, cur) => sum + cur.count, 0);
    const resultDiv = document.getElementById("result");

    let resultHTML = `<p>有效留言數量: ${totalValid}</p>`;
    resultHTML += "<h3>搜尋結果：</h3>";

    matches.forEach((match, index) => {
      resultHTML += `<p>搜尋文字 ${index + 1}.： ${
        match.count
      } / ${totalValid}</p>
      「${match.searchText}」`;
    });

    resultDiv.innerHTML = resultHTML;
  }
}
