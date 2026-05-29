<p align="center">
  <a href="https://github.com/chinese-poetry/chinese-poetry">
      <img src="https://avatars3.githubusercontent.com/u/30764933?s=200&v=4" alt="chinese-poetry">
  </a>
</p>

<h4 align="center">基於 https://github.com/chinese-poetry/chinese-poetry 的繁體版</h4>
<h2 align="center">chinese-poetry: 最全中文诗歌古典文集数据库的Web界面搜索</h2>
<p align="center">
  <a href="https://travis-ci.com/chinese-poetry/chinese-poetry" rel="nofollow">
    <img height="28px" alt="Build Status" src="https://img.shields.io/travis/chinese-poetry/chinese-poetry?style=for-the-badge" style="max-width:100%;">
  </a>
  <a href="https://github.com/chinese-poetry/chinese-poetry/blob/master/LICENSE">
    <img height="28px" alt="License" src="http://img.shields.io/badge/license-mit-blue.svg?style=for-the-badge" style="max-width:100%;">
  </a>
  <a href="https://github.com/chinese-poetry/chinese-poetry/graphs/contributors">
    <img height="28px" alt="Contributors" src="https://img.shields.io/github/contributors/chinese-poetry/chinese-poetry.svg?style=for-the-badge" style="max-width:100%;">
  </a>
  <a href="https://www.patreon.com/jackeygao" rel="nofollow">
    <img height="28px" alt="Patreon" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Djackeygao%26type%3Dpledges&style=for-the-badge" style="max-width:100%;">
  </a>
</p>


最全的中華古典文集數據庫，包含 5.5 萬首唐詩、26 萬首宋詩、2.1 萬首宋詞和其他古典文集。詩人包括唐宋兩朝近 1.4 萬古詩人，和兩宋時期 1.5 千古詞人。數據來源於互聯網。

**爲什麼要做這個倉庫?** 古詩是中華民族乃至全世界的瑰寶，我們應該傳承下去，雖然有古典文集，但大多數人並沒有擁有這些書籍。從某種意義上來說，這些龐大的文集離我們是有一定距離的。而電子版方便拷貝，所以此開源數據庫誕生了。此數據庫通過 JSON 格式分發，可以讓你很方便的開始你的項目。

古詩採集沒有記錄過程，因爲古詩數據龐大，目標網站有限制，採集過程經常中斷超過了一個星期。2017 年新加入全宋詞，[全宋詞爬取過程及數據分析](https://jackeygao.github.io/r/words/crawl-ci.html)。

## 高頻詞分析圖

<details open>
  <summary><b>宋詞受歡迎的詞牌名</b></summary>

<div align="center">
<img src="https://raw.githubusercontent.com/jackeygao/chinese-poetry/master/images/ci_rhythmic_topK.png" alt="兩宋喜歡的詞牌名">
</div>
</details>

<details>
  <summary><b>宋詞高頻詞</b></summary>
  <img src="https://raw.githubusercontent.com/jackeygao/chinese-poetry/master/images/ci_words_topK.png" alt="宋詞高頻詞" style="max-width:100%;">
</details>

<details>
  <summary><b>宋詞作者作品榜</b></summary>
  <img src="https://raw.githubusercontent.com/jackeygao/chinese-poetry/master/images/ci_author_topK.png" alt="宋詞作者作品榜" style="max-width:100%;">
</details>

<details>
  <summary><b>唐詩高頻詞</b></summary>
  <img src="https://raw.githubusercontent.com/jackeygao/chinese-poetry/master/images/tang_text_topK.png" alt="唐詩高頻詞" style="max-width:100%;">
</details>

<details>
  <summary><b>唐詩作者作品榜</b></summary>
  <img src="https://raw.githubusercontent.com/jackeygao/chinese-poetry/master/images/tang_author_topK.png" alt="唐詩作者作品榜" style="max-width:100%;">
</details>

<details>
  <summary><b>宋詩高頻詞</b></summary>
  <img src="https://raw.githubusercontent.com/jackeygao/chinese-poetry/master/images/song_text_topK.png" alt="宋詩高頻詞" style="max-width:100%;">
</details>

<details>
  <summary><b>宋詩作者作品榜</b></summary>
  <img src="https://raw.githubusercontent.com/jackeygao/chinese-poetry/master/images/song_author_topK.png" alt="宋詩作者作品榜" style="max-width:100%;">
</details>

## 數據集

- [唐詩宋詩](./全唐詩)
- [全宋詞](./宋詞)
- [五代·花間集](./五代詩詞/huajianji)
- [五代·南唐二主詞](./五代詩詞/nantang)
- [論語](./論語)
- [詩經](./詩經)
- [幽夢影](./幽夢影)
- [四書五經](./四書五經)
- [蒙學](./蒙學)
- [納蘭性德詩集](./納蘭性德)
- [御定全唐詩](./御定全唐詩)


## 貢獻

本項目目的是藉助技術來生成格式化(JSON)數據，讓開發者更方便快速的構建詩詞類應用程序。身單力薄，歡迎更多人來維護，你可以通過以下方法來參與貢獻：

- 直接提交 PR 或者通過 issue 討論來優化完善此數據庫，理論上古詩歌體非宗教類都歡迎加入，部分有爭議性的數據需要社區投票討論決定是否加入。關於詩句的糾錯在創建 PR 時請標明出處。更多規範請[參考貢獻規範文檔](https://github.com/chinese-poetry/chinese-poetry/wiki/%E5%8F%82%E4%B8%8E%E8%B4%A1%E7%8C%AE%E8%A7%84%E8%8C%83)。

- 如果你沒有辦法直接參與完善的過程，你也可以通過 「[愛發電贊助](https://afdian.net/a/chinese-poetry)」  「[Patreon 週期性贊助](https://www.patreon.com/jackeygao)」 的形式來持續幫助並激勵我去優化完善此數據庫。如果您不喜歡週期性贊助，你也可以通過「[支付寶](https://github.com/jackeyGao/JackeyGao.github.io/blob/master/static/images/alipay.png)」或者「[微信讚賞碼](https://github.com/jackeyGao/JackeyGao.github.io/blob/master/static/images/wechat.jpg)」進行一次性贊助(備註留下郵箱)。

- 如有建議或吐槽，歡迎聯繫我的郵箱 gaojunqi@outlook.com。

無論通過哪種形式貢獻最終都會使之變得更好！

### 贊助者

無

### 貢獻者

<p align="center">
<img src="https://opencollective.com/chinese-poetry/contributors.svg?width=890&button=false" alt="Contributors">
</p>

## 案例展示

<details>
  <summary>案例展示</summary>
  
- [中文詩歌主頁](https://chinese-poetry.github.io)是一個基於瀏覽器的詩詞網站，包含唐詩三百首、宋詞三百首等文集。
- [animalize](https://github.com/animalize) **/** [QuanTangshi](https://github.com/animalize/QuanTangshi)  *離線全唐詩 Android*
- [justdark](https://github.com/justdark) **/** [pytorch-poetry-gen](https://github.com/justdark/pytorch-poetry-gen)  *a char-RNN based on pytorch*
- [Clover27](https://github.com/Clover27) **/** [ancient-Chinese-poem-generator](https://github.com/Clover27/ancient-Chinese-poem-generator)  *Ancient-Chinese-Poem-Generator*
- [chinese-poetry](https://github.com/chinese-poetry) **/** [poetry-calendar](http://chinese-poetry.github.io/poetry-calendar/)  *詩詞周曆*
- [chenyuntc](https://github.com/chenyuntc) **/** [pytorch-book](https://github.com/chenyuntc/pytorch-book/blob/master/chapter9-神經網絡寫詩(CharRNN)/) *簡體唐詩生成(char-RNN)，可生成藏頭詩，自定義詩歌意境，前綴等。*
- [okcy1016](https://github.com/okcy1016) **/** [poetry-desktop](https://github.com/okcy1016/poetry-desktop/) *詩詞桌面*
- [huangjianke](https://github.com/huangjianke) **/** [weapp-poem](https://github.com/huangjianke/weapp-poem/) *詩詞墨客 小程序版*
- [漢字之美](https://hz.xusenlin.com/) *漢字之美是一個方便查詢的詩詞網站，簡潔乾淨，方便使用。*
- [PaddlePaddle](https://github.com/PaddlePaddle) **/** [PaddleNLP](https://github.com/PaddlePaddle/PaddleNLP#%E4%BA%A4%E4%BA%92%E5%BC%8Fnotebook%E6%95%99%E7%A8%8B) *基於ERNIE-GEN(Transformer)的深度學習詩詞生成，可自行修改邏輯來生成多種詩詞風格。*
- [Harold-y](https://github.com/Harold-y) **/** [chinese-poetry-db-web](https://github.com/Harold-y/chinese-poetry-db-web) *基於本倉庫的MySQL DB整合 + 詩詞Web端展示與檢索*
  
</details>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=chinese-poetry/chinese-poetry&type=Date)](https://star-history.com/#chinese-poetry/chinese-poetry&Date)

## Web 界面

- 訪問本倉庫內的靜態搜索頁面：`web/index.html`
- 本頁面支持按類別/朝代、作者、詩句進行搜索
- 本地運行方式：在倉庫根目錄執行 `python3 -m http.server 8000`，再打開 `http://localhost:8000/web/index.html`

## License

[MIT](https://github.com/chinese-poetry/chinese-poetry/blob/master/LICENSE) 許可證。
