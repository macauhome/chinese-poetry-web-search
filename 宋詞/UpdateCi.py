import json
import logging
import os
import re
from difflib import SequenceMatcher

import requests
from bs4 import BeautifulSoup
from bs4.element import NavigableString


def get_page_content(page: int) -> list:
    """ 獲取目錄頁每一頁的內容 """
    content = []
    r = requests.post("http://qsc.zww.cn/getdata.asp", data={
        "seektype": 2,
        "seekvalue": "",
        "pageno": page
    })
    r.encoding = "gbk"
    soup = BeautifulSoup(re.search(r"filllist\('·(.*?)'\);", r.text).group(1), features="lxml")
    for i, a in enumerate(soup.find_all(name="a")):
        if i % 2 == 0:
            content.append({
                "rhythmic": a.string.split("（")[0],
                "param": re.search(r"doseek2\((.*?)\);", a["onclick"]).group(1).split(",")
            })
        else:
            content[-1]["author"] = a.string
    for c in content:
        c["paragraphs"] = get_paragraphs(int(c["param"][0]), int(c["param"][1]))
        del c["param"]
    return content


def get_paragraphs(seek_type: int, seek_value: int) -> list:
    """ 獲取詞的內容段落 """
    paragraphs = []
    r = requests.post("http://qsc.zww.cn/getdata.asp", data={
        "seektype": seek_type,
        "seekvalue": seek_value,
        "pageno": 1
    })
    r.encoding = "gbk"
    soup = BeautifulSoup(re.search(r"fillbody\('(.*?)'\);", r.text).group(1), features="lxml")
    for child in soup.find(name="p", align=None).contents:
        if isinstance(child, NavigableString):
            paragraphs.append(child)
    return paragraphs


def get_all_page(temp_file: str):
    """ 爬取數據並保存至臨時文件 """
    for page in range(1, 1240):
        all_data.extend(get_page_content(page))
        logging.info("Success: save page {0}".format(page))
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(json.dumps(all_data, indent=2, ensure_ascii=False))


def only_text(text: str):
    """ 去除標點只保留文字 """
    return re.sub(r"[，。、《》…（）·・\s]", "", text)


def update_file_data(old_data: list, new_data: list):
    for i in range(len(old_data)):
        old_text = only_text("".join(old_data[i]["paragraphs"]))
        new_text = only_text("".join(new_data[start + i]["paragraphs"]))
        # 計算純文字的相似度
        ratio = SequenceMatcher(a=old_text, b=new_text).quick_ratio()
        if 0.9 <= ratio < 1.0:
            # 假定此範圍內說明缺字，需要更新
            old_data[i]["author"] = new_data[start + i]["author"]
            old_data[i]["paragraphs"] = new_data[start + i]["paragraphs"]
        elif ratio < 0.9:
            # 異常情況warning輸出，不更新
            logging.warning(old_text)
            logging.warning(new_text)
        else:
            old_data[i]["author"] = new_data[start + i]["author"]


char_dict = {
    "鵷": "鵷",
    "颭": "颭",
    "鷁": "鷁",
    "鴞": "鴞",
    "餖": "餖",
    "飣": "飣",
    "舃": "舄",
    "駸": "駸",
    "薄倖": "薄倖",
    "赬": "赬",
    "鷫鸘": "鷫鸘",
    "嶮": "嶮",
    "後": "後",
    "纇": "纇",
    "颸": "颸",
    "崑崙": "崑崙",
    "曨": "曨"
}


def correct(old_data: list):
    """ 部分繁體轉爲簡體 """
    for i in range(len(old_data)):
        for j in range(len(old_data[i]["paragraphs"])):
            for k, v in char_dict.items():
                if k in old_data[i]["paragraphs"][j]:
                    old_data[i]["paragraphs"][j] = old_data[i]["paragraphs"][j].replace(k, v)


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s - %(levelname)-9s %(filename)-15s[:%(lineno)d]\t%(message)s")
    temp_file_name = "all.json"
    # 臨時文件不存在則先爬取
    if not os.path.exists(temp_file_name):
        get_all_page(temp_file_name)
    # 讀取臨時文件
    with open("all.json", "r", encoding="utf-8") as f:
        all_data = json.load(f)
    # 遍歷當前目錄
    for file_name in os.listdir("./"):
        if re.match(r"ci\.song\.\d+\.json", file_name):
            # 每個文件開始的數據索引
            start = int(file_name.split(".")[2])
            with open(file_name, "r", encoding="utf-8") as f:
                file_data = json.load(f)
            update_file_data(file_data, all_data)
            correct(file_data)
            # 保存數據，原文件中逗號後有空格，這裏保持一致
            with open(file_name, "w", encoding="utf-8") as f:
                f.write(json.dumps(file_data, indent=2, ensure_ascii=False).replace(",", ", "))
                logging.info("Save " + file_name)
