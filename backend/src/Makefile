SRCS := main.go
NAME := backend

GO = go

all: $(EXECS)

$(NAME): ./srcs/%.go
	$(GO) mod download
	$(GO) fmt $<
	$(GO) build -o $@ $<

run: all
	./$(NAME)

clean:
	rm -rf ./$(NAME)  # 実行ファイルを削除

re: clean all

.PHONY: all clean re