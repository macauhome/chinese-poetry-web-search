const manifestUrl = './poetry-manifest.json';
const PAGE_SIZE = 120;
const BATCH_SIZE = 5;

const datasetSelect = document.getElementById('datasetSelect');
const dynastySelect = document.getElementById('dynastySelect');
const authorInput = document.getElementById('authorInput');
const textInput = document.getElementById('textInput');
const searchButton = document.getElementById('searchButton');
const resetButton = document.getElementById('resetButton');
const resultsEl = document.getElementById('results');
const resultCount = document.getElementById('resultCount');
const statusPanel = document.querySelector('.status-panel');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const paginationControls = document.getElementById('paginationControls');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

prevPageButton.addEventListener('click', () => gotoPage(appState.currentPage - 1));
nextPageButton.addEventListener('click', () => gotoPage(appState.currentPage + 1));

const appState = {
  manifest: null,
  fileCache: {},
  isSearching: false,
  currentResults: [],
  currentPage: 1,
  pageSize: PAGE_SIZE,
  totalPages: 0,
  currentScopeLabel: '',
};

window.addEventListener('load', init);

async function init() {
  if (!window.location.protocol.startsWith('http')) {
    resultsEl.innerHTML = '<div class="result-card">請通過 HTTP 服務器訪問此頁面，例如：<code>python3 -m http.server 8000</code>，然後打開 <code>http://localhost:8000/web/index.html</code>。</div>';
    resultCount.textContent = '頁面未通過 HTTP 訪問';
    setStatus('當前頁面爲本地文件打開，JSON 加載受限。', 0);
    return;
  }

  manifestSelectLoading();
  try {
    const manifest = await fetch(manifestUrl).then(r => {
      if (!r.ok) throw new Error(`manifest 加載失敗：${r.status}`);
      return r.json();
    });
    appState.manifest = manifest;
    renderSelects(manifest);
    setStatus(`已加載 ${manifest.datasets.length} 類別，${manifest.dynasties.length} 個朝代。輸入關鍵詞開始搜索。`, 0);
  } catch (error) {
    console.error(error);
    setStatus('無法加載詩詞目錄。請檢查 web/poetry-manifest.json 是否存在。', 0);
  }
}

function manifestSelectLoading() {
  datasetSelect.innerHTML = '<option>加載中…</option>';
  dynastySelect.innerHTML = '<option>加載中…</option>';
}

function renderSelects(manifest) {
  const datasets = manifest.datasets;
  datasetSelect.innerHTML = '';
  datasetSelect.append(createOption('', '全部類別'));
  datasets.forEach(ds => {
    datasetSelect.append(createOption(ds.id, `${ds.name} (${ds.dynasty})`));
  });

  dynastySelect.innerHTML = '';
  dynastySelect.append(createOption('', '全部朝代'));
  manifest.dynasties.forEach(dyn => dynastySelect.append(createOption(dyn, dyn)));

  searchButton.addEventListener('click', onSearch);
  resetButton.addEventListener('click', onReset);
  authorInput.addEventListener('keyup', onEnterSearch);
  textInput.addEventListener('keyup', onEnterSearch);
}

function createOption(value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  return option;
}

function onEnterSearch(event) {
  if (event.key === 'Enter') {
    onSearch();
  }
}

function onReset() {
  datasetSelect.value = '';
  dynastySelect.value = '';
  authorInput.value = '';
  textInput.value = '';
  resultsEl.innerHTML = '';
  resultCount.textContent = '尚未搜索';
  setStatus('搜索條件已重置。', 0);
}

function setStatus(message, ratio) {
  statusPanel.hidden = false;
  statusText.textContent = message;
  progressBar.style.width = `${Math.min(Math.max(ratio, 0), 1) * 100}%`;
}

async function onSearch() {
  if (appState.isSearching) return;
  if (!appState.manifest) return;

  const datasetId = datasetSelect.value;
  const dynasty = dynastySelect.value;
  const authorQuery = authorInput.value.trim().toLowerCase();
  const textQuery = textInput.value.trim().toLowerCase();

  const selectedDatasets = appState.manifest.datasets.filter(ds => {
    if (datasetId && ds.id !== datasetId) {
      return false;
    }
    if (dynasty && ds.dynasty !== dynasty) {
      return false;
    }
    return true;
  });

  const files = selectedDatasets.flatMap(ds => ds.files.map(path => ({ path, tag: ds.tag, dataset: ds.name, dynasty: ds.dynasty })));
  if (files.length === 0) {
    resultsEl.innerHTML = '<div class="result-card">未找到可搜索的文件，請檢查數據完整性。</div>';
    resultCount.textContent = '0 條結果';
    setStatus('未找到可搜索的文件。', 0);
    return;
  }

  const queryLabel = [datasetId || '全部類別', dynasty || '全部朝代'];
  resultCount.textContent = '搜索中…';
  resultsEl.innerHTML = '';
  appState.isSearching = true;
  appState.currentResults = [];
  appState.currentPage = 1;
  appState.totalPages = 0;

  let checked = 0;
  const results = [];

  try {
    setStatus(`正在搜索 ${files.length} 個文件，請稍候…`, 0);
    for (let index = 0; index < files.length; index += BATCH_SIZE) {
      const batch = files.slice(index, index + BATCH_SIZE);
      const promises = batch.map(file => searchFile(file, authorQuery, textQuery, results));
      await Promise.all(promises);
      checked += batch.length;
      const ratio = checked / files.length;
      setStatus(`已檢查 ${checked}/${files.length} 個文件，找到 ${results.length} 條匹配結果`, ratio);
    }

    renderSearchResults(results, queryLabel.join(' / '));
  } catch (error) {
    console.error(error);
    appendErrorCard(`搜索過程中出現錯誤：${error.message}`);
    setStatus('搜索失敗，請稍後重試。', 0);
  } finally {
    appState.isSearching = false;
  }
}

function searchByAuthor(authorName) {
  if (!authorName) return;
  datasetSelect.value = '';
  dynastySelect.value = '';
  authorInput.value = authorName;
  textInput.value = '';
  setStatus(`正在顯示作者「${authorName}」的全部作品…`, 0);
  onSearch();
}

async function searchFile(fileInfo, authorQuery, textQuery, results) {
  const cacheKey = fileInfo.path;
  let entries = appState.fileCache[cacheKey];
  if (!entries) {
    try {
      const fileUrl = makeUrlFromPath(fileInfo.path);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`狀態 ${response.status}`);
      }
      const data = await response.json();
      entries = Array.isArray(data) ? data : Object.values(data);
      appState.fileCache[cacheKey] = entries;
    } catch (error) {
      console.warn(error);
      appendErrorCard(`無法加載 ${fileInfo.path}：${error.message}`);
      return;
    }
  }

  const queries = { authorQuery, textQuery };
  for (const item of entries) {
    if (!item || typeof item !== 'object') continue;
    const author = (item.author || item.author_name || '').toString();
    const title = (item.title || item.name || '').toString();
    const contentArray = item.paragraphs || item.content || item.lines || [];
    const contentText = Array.isArray(contentArray) ? contentArray.join(' ') : contentArray.toString();

    const authorMatch = !queries.authorQuery || author.toLowerCase().includes(queries.authorQuery);
    const textMatch = !queries.textQuery || (`${title} ${contentText}`.toLowerCase().includes(queries.textQuery));

    if (authorMatch && textMatch) {
      results.push({
        title,
        author,
        content: contentArray,
        dataset: fileInfo.dataset,
        dynasty: fileInfo.dynasty,
      });
    }
  }
}

function makeUrlFromPath(path) {
  const encoded = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${window.location.origin}/${encoded}`;
}

function appendErrorCard(message) {
  const card = document.createElement('div');
  card.className = 'result-card';
  card.style.background = '#fff1f0';
  card.style.borderColor = 'rgba(244, 63, 94, .16)';
  card.innerHTML = `<strong>錯誤：</strong> ${message}`;
  resultsEl.append(card);
}

function renderSearchResults(results, scopeLabel) {
  appState.currentResults = results;
  appState.currentPage = 1;
  appState.totalPages = Math.max(1, Math.ceil(results.length / appState.pageSize));
  appState.currentScopeLabel = scopeLabel;
  renderCurrentPage();
}

function gotoPage(page) {
  if (page < 1 || page > appState.totalPages || appState.currentResults.length === 0) return;
  appState.currentPage = page;
  renderCurrentPage();
}

function renderCurrentPage() {
  if (appState.currentResults.length === 0) {
    resultsEl.innerHTML = '<div class="result-card">沒有找到匹配結果。請嘗試更改關鍵詞或選擇更少的類別。</div>';
    resultCount.textContent = '0 條結果';
    setStatus(`已完成搜索：${appState.currentScopeLabel}。`, 1);
    paginationControls.hidden = true;
    return;
  }

  const start = (appState.currentPage - 1) * appState.pageSize;
  const pageItems = appState.currentResults.slice(start, start + appState.pageSize);

  resultCount.textContent = `${appState.currentResults.length} 條結果，第 ${appState.currentPage}/${appState.totalPages} 頁`;
  setStatus(`已完成搜索：${appState.currentScopeLabel}。`, 1);

  resultsEl.innerHTML = '';
  pageItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'result-card';

    const title = document.createElement('h3');
    title.textContent = item.title || '無標題';
    card.append(title);

    const meta = document.createElement('div');
    meta.className = 'meta';

    const authorName = item.author || '作者未知';
    const authorLink = document.createElement('button');
    authorLink.type = 'button';
    authorLink.className = 'author-link';
    authorLink.textContent = authorName;
    authorLink.addEventListener('click', () => searchByAuthor(authorName));

    const infoText = document.createElement('span');
    infoText.textContent = `· ${item.dynasty || '未分類'} · ${item.dataset}`;

    meta.append(authorLink, infoText);
    card.append(meta);

    if (item.content && item.content.length) {
      const preview = document.createElement('p');
      preview.textContent = item.content.slice(0, 3).join(' ');
      card.append(preview);
    }

    resultsEl.append(card);
  });

  updatePaginationControls();
}

function updatePaginationControls() {
  if (appState.totalPages <= 1) {
    paginationControls.hidden = true;
    return;
  }

  paginationControls.hidden = false;
  prevPageButton.disabled = appState.currentPage === 1;
  nextPageButton.disabled = appState.currentPage === appState.totalPages;
  pageInfo.textContent = `第 ${appState.currentPage} / ${appState.totalPages} 頁`;
}
