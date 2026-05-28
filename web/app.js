const manifestUrl = './poetry-manifest.json';
const MAX_RESULTS = 120;
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

const appState = {
  manifest: null,
  fileCache: {},
  isSearching: false,
};

window.addEventListener('load', init);

async function init() {
  if (!window.location.protocol.startsWith('http')) {
    resultsEl.innerHTML = '<div class="result-card">请通过 HTTP 服务器访问此页面，例如：<code>python3 -m http.server 8000</code>，然后打开 <code>http://localhost:8000/web/index.html</code>。</div>';
    resultCount.textContent = '页面未通过 HTTP 访问';
    setStatus('当前页面为本地文件打开，JSON 加载受限。', 0);
    return;
  }

  manifestSelectLoading();
  try {
    const manifest = await fetch(manifestUrl).then(r => {
      if (!r.ok) throw new Error(`manifest 加载失败：${r.status}`);
      return r.json();
    });
    appState.manifest = manifest;
    renderSelects(manifest);
    setStatus(`已加载 ${manifest.datasets.length} 类别，${manifest.dynasties.length} 个朝代。输入关键词开始搜索。`, 0);
  } catch (error) {
    console.error(error);
    setStatus('无法加载诗词目录。请检查 web/poetry-manifest.json 是否存在。', 0);
  }
}

function manifestSelectLoading() {
  datasetSelect.innerHTML = '<option>加载中…</option>';
  dynastySelect.innerHTML = '<option>加载中…</option>';
}

function renderSelects(manifest) {
  const datasets = manifest.datasets;
  datasetSelect.innerHTML = '';
  datasetSelect.append(createOption('', '全部类别'));
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
  setStatus('搜索条件已重置。', 0);
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
    resultsEl.innerHTML = '<div class="result-card">未找到可搜索的文件，请检查数据完整性。</div>';
    resultCount.textContent = '0 条结果';
    setStatus('未找到可搜索的文件。', 0);
    return;
  }

  const queryLabel = [datasetId || '全部类别', dynasty || '全部朝代'];
  resultCount.textContent = '搜索中…';
  resultsEl.innerHTML = '';
  appState.isSearching = true;
  let count = 0;
  let checked = 0;
  const results = [];

  setStatus(`正在搜索 ${files.length} 个文件，请稍候…`, 0);
  for (let index = 0; index < files.length && results.length < MAX_RESULTS; index += BATCH_SIZE) {
    const batch = files.slice(index, index + BATCH_SIZE);
    const promises = batch.map(file => searchFile(file, authorQuery, textQuery, results, MAX_RESULTS));
    await Promise.all(promises);
    checked += batch.length;
    const ratio = checked / files.length;
    setStatus(`已检查 ${checked}/${files.length} 个文件，找到 ${results.length} 条匹配结果`, ratio);
  }

  appState.isSearching = false;
  renderSearchResults(results, queryLabel.join(' / '));
}

function searchByAuthor(authorName) {
  if (!authorName) return;
  datasetSelect.value = '';
  dynastySelect.value = '';
  authorInput.value = authorName;
  textInput.value = '';
  setStatus(`正在显示作者「${authorName}」的全部作品…`, 0);
  onSearch();
}

async function searchFile(fileInfo, authorQuery, textQuery, results, maxResults) {
  if (results.length >= maxResults) return;
  const cacheKey = fileInfo.path;
  let entries = appState.fileCache[cacheKey];
  if (!entries) {
    try {
      const fileUrl = makeUrlFromPath(fileInfo.path);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`状态 ${response.status}`);
      }
      const data = await response.json();
      entries = Array.isArray(data) ? data : Object.values(data);
      appState.fileCache[cacheKey] = entries;
    } catch (error) {
      console.warn(error);
      appendErrorCard(`无法加载 ${fileInfo.path}：${error.message}`);
      return;
    }
  }

  const queries = { authorQuery, textQuery };
  for (const item of entries) {
    if (results.length >= maxResults) break;
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
  card.innerHTML = `<strong>错误：</strong> ${message}`;
  resultsEl.append(card);
}

function renderSearchResults(results, scopeLabel) {
  if (results.length === 0) {
    resultsEl.innerHTML = '<div class="result-card">没有找到匹配结果。请尝试更改关键词或选择更少的类别。</div>';
    resultCount.textContent = '0 条结果';
    setStatus(`已完成搜索：${scopeLabel}。`, 1);
    return;
  }

  resultCount.textContent = `${results.length} 条结果（最多显示 ${MAX_RESULTS} 条）`;
  setStatus('搜索完成。', 1);

  resultsEl.innerHTML = '';
  results.slice(0, MAX_RESULTS).forEach(item => {
    const card = document.createElement('div');
    card.className = 'result-card';

    const title = document.createElement('h3');
    title.textContent = item.title || '无标题';
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
    infoText.textContent = `· ${item.dynasty || '未分类'} · ${item.dataset}`;

    meta.append(authorLink, infoText);
    card.append(meta);

    if (item.content && item.content.length) {
      const preview = document.createElement('p');
      preview.textContent = item.content.slice(0, 3).join(' ');
      card.append(preview);
    }

    resultsEl.append(card);
  });
}
