# ベースイメージとして公式のGolangイメージを使用
FROM golang:1.20-alpine

# bashインストール
RUN apk add --no-cache bash

# 作業ディレクトリを設定
WORKDIR /go/src/app/src/data-access

COPY ./entry-point.sh /
RUN chmod +x /entry-point.sh

#CMD ["/entry-point.sh"]
