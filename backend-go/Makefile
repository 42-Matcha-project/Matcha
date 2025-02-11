SRCS := ./srcs/main.go
NAME := backend

GO = go

all: $(NAME)

$(NAME): $(SRCS)
	- $(GO) mod download
	- $(GO) fmt $^
	- $(GO) build -o $@ $^

run: all
	./$(NAME)

clean:
	rm -f $(NAME)

re: clean all

.PHONY: all clean re run
