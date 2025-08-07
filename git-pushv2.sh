#!/bin/zsh
# 推送到遠端，需輸入 commit 訊息

if [ -z "$1" ]; then
  echo "請輸入 commit 訊息："
  read commit_msg
else
  commit_msg="$1"
fi

git add .
git commit -m "$commit_msg"
git push
