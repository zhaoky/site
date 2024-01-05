#!/bin/bash

# 检查/demo config和/.vitepress/demo是否存在
if [ -d "./docs/demo" ] && [ -d "./config" ] && [ -d "./docs/.vitepress" ]; then
  # 使用cp命令复制文件夹
  cp -r ./docs/demo ./docs/.vitepress/demo
  cp -r ./config ./docs/.vitepress/config
else
  echo "Either ./docs/demo or config or ./docs/.vitepress does not exist."
fi
